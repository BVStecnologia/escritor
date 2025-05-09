-- Supabase Schema para Escritor App

-- Configuração de Segurança RLS (Row Level Security)
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Perfil de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Configurar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Livros/Projetos
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  genre TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'published')),
  is_public BOOLEAN DEFAULT FALSE,
  words_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Configurar RLS para books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios livros"
ON public.books
FOR SELECT
USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Usuários podem inserir seus próprios livros"
ON public.books
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios livros"
ON public.books
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios livros"
ON public.books
FOR DELETE
USING (auth.uid() = user_id);

-- Capítulos
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES public.books ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  words_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Configurar RLS para chapters
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios capítulos"
ON public.chapters
FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.books 
  WHERE public.books.id = public.chapters.book_id 
  AND public.books.is_public = TRUE
));

CREATE POLICY "Usuários podem inserir seus próprios capítulos"
ON public.chapters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios capítulos"
ON public.chapters
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios capítulos"
ON public.chapters
FOR DELETE
USING (auth.uid() = user_id);

-- Notas e Pesquisas
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Configurar RLS para notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notas"
ON public.notes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias notas"
ON public.notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notas"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias notas"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- Personagens
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  bio TEXT,
  traits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Configurar RLS para characters
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios personagens"
ON public.characters
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios personagens"
ON public.characters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios personagens"
ON public.characters
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios personagens"
ON public.characters
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('America/Sao_Paulo'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_chapters_updated_at
BEFORE UPDATE ON public.chapters
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_characters_updated_at
BEFORE UPDATE ON public.characters
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Trigger para criar perfil automaticamente ao criar um novo usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();