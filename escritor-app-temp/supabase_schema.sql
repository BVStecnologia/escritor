-- Create profiles table (extends the auth.users table)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create books table
CREATE TABLE public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  genre TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  total_words INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create books policies
CREATE POLICY "Users can view their own books" ON public.books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public books" ON public.books
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own books" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON public.books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON public.books
  FOR DELETE USING (auth.uid() = user_id);

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  word_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Create chapters policies
CREATE POLICY "Users can view their own chapters" ON public.chapters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view chapters of public books" ON public.chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = chapters.book_id AND books.is_public = true
    )
  );

CREATE POLICY "Users can create chapters in their own books" ON public.chapters
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_id AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own chapters" ON public.chapters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters" ON public.chapters
  FOR DELETE USING (auth.uid() = user_id);

-- Create embeddings table for RAG functionality
CREATE TABLE public.chapter_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  content_chunk TEXT NOT NULL,
  embedding VECTOR(1536), -- Using OpenAI's embedding size
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.chapter_embeddings ENABLE ROW LEVEL SECURITY;

-- Create embeddings policies
CREATE POLICY "Users can view their own chapter embeddings" ON public.chapter_embeddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chapters
      WHERE chapters.id = chapter_embeddings.chapter_id AND chapters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view embeddings of public books' chapters" ON public.chapter_embeddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chapters 
      JOIN public.books ON chapters.book_id = books.id
      WHERE chapters.id = chapter_embeddings.chapter_id AND books.is_public = true
    )
  );

-- Add function to update chapter word count
CREATE OR REPLACE FUNCTION public.update_chapter_word_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the word count
  NEW.word_count := array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for word count
CREATE TRIGGER update_chapter_word_count
BEFORE INSERT OR UPDATE ON public.chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_chapter_word_count();

-- Add function to update book total words
CREATE OR REPLACE FUNCTION public.update_book_word_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the book's total word count
  UPDATE public.books
  SET total_words = (
    SELECT COALESCE(SUM(word_count), 0)
    FROM public.chapters
    WHERE book_id = NEW.book_id
  )
  WHERE id = NEW.book_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for book word count
CREATE TRIGGER update_book_word_count
AFTER INSERT OR UPDATE OR DELETE ON public.chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_book_word_count();

-- Create function to search for chapters using embeddings (RAG)
CREATE OR REPLACE FUNCTION match_chapter_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  chapter_id UUID,
  content_chunk TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chapter_embeddings.id,
    chapter_embeddings.chapter_id,
    chapter_embeddings.content_chunk,
    1 - (chapter_embeddings.embedding <=> query_embedding) AS similarity
  FROM public.chapter_embeddings
  JOIN public.chapters ON chapter_embeddings.chapter_id = chapters.id
  JOIN public.books ON chapters.book_id = books.id
  WHERE books.user_id = match_user_id
  AND 1 - (chapter_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY chapter_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;