import { supabase } from './supabaseClient';

export interface Book {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  genre?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
  is_public: boolean;
  words_count: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content?: string;
  order_index: number;
  words_count: number;
  created_at: string;
  updated_at: string;
}

export interface BookFormData {
  title: string;
  description?: string;
  cover_image?: string;
  genre?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'published';
  is_public?: boolean;
}

export interface ChapterFormData {
  title: string;
  content?: string;
  order_index: number;
}

export const booksService = {
  /**
   * Obter todos os livros do usuário atual
   */
  async getBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Book[];
    } catch (error) {
      console.error('Erro ao obter livros:', error);
      throw error;
    }
  },
  
  /**
   * Obter um livro específico por ID
   */
  async getBookById(id: string) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Book;
    } catch (error) {
      console.error(`Erro ao obter livro ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Criar um novo livro
   */
  async createBook(bookData: BookFormData) {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          ...bookData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();
      
      if (error) throw error;
      return data[0] as Book;
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      throw error;
    }
  },
  
  /**
   * Atualizar um livro existente
   */
  async updateBook(id: string, bookData: Partial<BookFormData>) {
    try {
      const { data, error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0] as Book;
    } catch (error) {
      console.error(`Erro ao atualizar livro ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Excluir um livro
   */
  async deleteBook(id: string) {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao excluir livro ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Obter todos os capítulos de um livro
   */
  async getChapters(bookId: string) {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Chapter[];
    } catch (error) {
      console.error(`Erro ao obter capítulos do livro ${bookId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obter um capítulo específico por ID
   */
  async getChapterById(id: string) {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Chapter;
    } catch (error) {
      console.error(`Erro ao obter capítulo ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Criar um novo capítulo
   */
  async createChapter(bookId: string, chapterData: ChapterFormData) {
    try {
      // Calcular contagem de palavras, se o conteúdo estiver presente
      const wordsCount = chapterData.content ? 
        chapterData.content.split(/\s+/).filter(word => word.length > 0).length : 0;
      
      const { data, error } = await supabase
        .from('chapters')
        .insert([{
          ...chapterData,
          book_id: bookId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          words_count: wordsCount
        }])
        .select();
      
      if (error) throw error;
      return data[0] as Chapter;
    } catch (error) {
      console.error(`Erro ao criar capítulo no livro ${bookId}:`, error);
      throw error;
    }
  },
  
  /**
   * Atualizar um capítulo existente
   */
  async updateChapter(id: string, chapterData: Partial<ChapterFormData>) {
    try {
      // Atualizar contagem de palavras, se o conteúdo estiver presente
      let updatedData: any = { ...chapterData };

      if (chapterData.content !== undefined) {
        const wordsCount = chapterData.content
          .split(/\s+/)
          .filter(word => word.length > 0)
          .length;

        updatedData.words_count = wordsCount;
      }

      const { data, error } = await supabase
        .from('chapters')
        .update(updatedData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0] as Chapter;
    } catch (error) {
      console.error(`Erro ao atualizar capítulo ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Excluir um capítulo
   */
  async deleteChapter(id: string) {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao excluir capítulo ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Reordenar capítulos
   */
  async reorderChapters(bookId: string, chapterIds: string[]) {
    try {
      // Obter o usuário atual primeiro
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Convertemos os IDs e suas novas posições em atualizações
      const updates = chapterIds.map((id, index) => ({
        id,
        order_index: index + 1, // começamos com 1 como o primeiro índice
        book_id: bookId, // Incluímos para garantir que o RLS permita a atualização
        user_id: user.id // Necessário para RLS
      }));

      // Atualizamos todos os capítulos de uma só vez
      const { error } = await supabase.from('chapters').upsert(updates);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao reordenar capítulos do livro ${bookId}:`, error);
      throw error;
    }
  }
};