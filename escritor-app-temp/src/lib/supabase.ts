import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These will be replaced with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key';

// Durante o desenvolvimento, podemos simular o Supabase se as credenciais não estiverem disponíveis
const isDevelopment = import.meta.env.DEV;

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export type Livro = {
  id: number;
  created_at: string;
  "Nome do livro": string | null;
  "Autor": string | null;
  email_user: string | null;
};

export type Capitulo = {
  id: number;
  created_at: string;
  texto: string | null;
  livro_id: number;
  titulo: string | null;
};

export type Embedding = {
  id: number;
  created_at: string;
  content: string;
  embedding: any; // Vector type
  origem_id: number;
  tipo_origem: string;
};

// Type-safe API calls

/**
 * Authentication functions
 */
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getUser: async () => {
    return await supabase.auth.getUser();
  },
  
  getSession: async () => {
    return await supabase.auth.getSession();
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

/**
 * Books API functions
 */
export const livrosAPI = {
  getAll: async (userEmail: string) => {
    return await supabase
      .from('Livros')
      .select('*')
      .eq('email_user', userEmail);
  },
  
  getById: async (id: number) => {
    return await supabase
      .from('Livros')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  create: async (livro: Omit<Livro, 'id' | 'created_at'>) => {
    return await supabase
      .from('Livros')
      .insert(livro)
      .select()
      .single();
  },
  
  update: async (id: number, livro: Partial<Omit<Livro, 'id' | 'created_at'>>) => {
    return await supabase
      .from('Livros')
      .update(livro)
      .eq('id', id)
      .select()
      .single();
  },
  
  delete: async (id: number) => {
    return await supabase
      .from('Livros')
      .delete()
      .eq('id', id);
  }
};

/**
 * Chapters API functions
 */
export const capitulosAPI = {
  getAllByLivro: async (livroId: number) => {
    return await supabase
      .from('Capitulo')
      .select('*')
      .eq('livro_id', livroId)
      .order('id', { ascending: true });
  },
  
  getById: async (id: number) => {
    return await supabase
      .from('Capitulo')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  create: async (capitulo: Omit<Capitulo, 'id' | 'created_at'>) => {
    return await supabase
      .from('Capitulo')
      .insert(capitulo)
      .select()
      .single();
  },
  
  update: async (id: number, capitulo: Partial<Omit<Capitulo, 'id' | 'created_at'>>) => {
    return await supabase
      .from('Capitulo')
      .update(capitulo)
      .eq('id', id)
      .select()
      .single();
  },
  
  delete: async (id: number) => {
    return await supabase
      .from('Capitulo')
      .delete()
      .eq('id', id);
  }
};

/**
 * AI features using Edge Functions
 */
export const aiAPI = {
  // Autocomplete mode
  autocomplete: async (input: string, cursorPosition: number, maxSuggestions: number = 3, userId?: string, livroId?: number) => {
    return await supabase.functions.invoke('claude-ai', {
      body: {
        mode: 'autocomplete',
        input,
        context: {
          cursor_position: cursorPosition,
          max_suggestions: maxSuggestions,
          user_id: userId,
          livro_id: livroId
        }
      }
    });
  },
  
  // Generate page mode
  generatePage: async (input: string, style: string, pageLength: 'short' | 'medium' | 'long' = 'medium', livroId?: number, capituloId?: number) => {
    return await supabase.functions.invoke('claude-ai', {
      body: {
        mode: 'generate_page',
        input,
        context: {
          style,
          livro_id: livroId,
          capitulo_id: capituloId,
          page_length: pageLength
        }
      }
    });
  },
  
  // Writing assistant mode
  writingAssistant: async (input: string, action: string, focusAreas?: string[], livroId?: number, capituloId?: number) => {
    return await supabase.functions.invoke('claude-ai', {
      body: {
        mode: 'writing_assistant',
        input,
        context: {
          action,
          focus_areas: focusAreas,
          livro_id: livroId,
          capitulo_id: capituloId
        }
      }
    });
  },
  
  // Creative ideas mode
  creativeIdeas: async (input: string, ideaType: 'plot_points' | 'characters' | 'settings' | 'dialogues', numIdeas: number = 3, livroId?: number, capituloId?: number) => {
    return await supabase.functions.invoke('claude-ai', {
      body: {
        mode: 'creative_ideas',
        input,
        context: {
          idea_type: ideaType,
          num_ideas: numIdeas,
          livro_id: livroId,
          capitulo_id: capituloId
        }
      }
    });
  },
  
  // Search mode
  search: async (input: string, detailLevel: 'low' | 'medium' | 'high' = 'medium', maxResults: number = 5) => {
    return await supabase.functions.invoke('claude-ai', {
      body: {
        mode: 'search',
        input,
        context: {
          detail_level: detailLevel,
          max_results: maxResults
        }
      }
    });
  },
  
  // Custom mode
  custom: async (input: string, systemPrompt?: string, includeEmbeddings: boolean = true, maxEmbeddings: number = 3, embeddingFilter?: string) => {
    return await supabase.functions.invoke('claude-ai', {
      body: {
        mode: 'custom',
        input,
        context: {
          system_prompt: systemPrompt,
          include_embeddings: includeEmbeddings,
          max_embeddings: maxEmbeddings,
          embedding_filter: embeddingFilter
        }
      }
    });
  },
  
  // Generate image using the edge function
  generateImage: async (prompt: string) => {
    return await supabase.functions.invoke('gerar_imagem', {
      body: {
        prompt
      }
    });
  }
};