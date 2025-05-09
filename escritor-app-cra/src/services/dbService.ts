import { supabase } from './supabaseClient';

// Serviço para interagir com as tabelas existentes no Supabase
// Adaptaremos este serviço para corresponder à sua estrutura de banco de dados existente

export interface Livro {
  id: number;
  created_at: string;
  "Nome do livro": string;
  "Autor"?: string;
  email_user?: string;
}

export interface Capitulo {
  id: string;
  created_at: string;
  titulo: string;
  conteudo?: string;
  livro_id: number;
  email_user?: string;
}

export interface Personagem {
  id: string;
  nome: string;
  descricao?: string;
  biografia?: string;
  caracteristicas?: any;
  livro_id: string;
  usuario_id: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Nota {
  id: string;
  titulo: string;
  conteudo?: string;
  tags?: string[];
  livro_id?: string;
  usuario_id: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Usuario {
  id: string;
  nome?: string;
  avatar_url?: string;
  site?: string;
  bio?: string;
  criado_em: string;
  atualizado_em: string;
}

export const dbService = {
  /**
   * Obter todos os livros do usuário atual
   */
  async getLivros() {
    try {
      console.log('Buscando livros do usuário...');
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      console.log('Email do usuário atual:', email);

      if (!email) {
        throw new Error('Usuário não tem email registrado');
      }

      const { data, error } = await supabase
        .from('Livros')
        .select('*')
        .eq('email_user', email)
        .order('created_at', { ascending: false });

      console.log('Dados retornados:', data);

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      return data as Livro[];
    } catch (error) {
      console.error('Erro ao obter livros:', error);
      throw error;
    }
  },
  
  /**
   * Obter um livro específico por ID
   */
  async getLivroPorId(id: number) {
    try {
      const { data, error } = await supabase
        .from('Livros')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Livro;
    } catch (error) {
      console.error(`Erro ao obter livro ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Criar um novo livro
   */
  async criarLivro(livroData: { titulo: string, autor?: string }) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      console.log('Criando livro para usuário:', email);

      if (!email) {
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }

      // Verificar a sessão para garantir que o usuário está logado
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const { data, error } = await supabase
        .from('Livros')
        .insert([{
          "Nome do livro": livroData.titulo,
          "Autor": livroData.autor || userData?.user?.user_metadata?.name || 'Autor desconhecido',
          email_user: email
        }])
        .select();

      console.log('Resultado da inserção:', data, error);

      if (error) throw error;
      return data[0] as Livro;
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      throw error;
    }
  },
  
  /**
   * Atualizar um livro existente
   */
  async atualizarLivro(id: number, livroData: { titulo?: string, autor?: string }) {
    try {
      const { data, error } = await supabase
        .from('Livros')
        .update({
          "Nome do livro": livroData.titulo,
          "Autor": livroData.autor
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0] as Livro;
    } catch (error) {
      console.error(`Erro ao atualizar livro ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Excluir um livro
   */
  async excluirLivro(id: number) {
    try {
      const { error } = await supabase
        .from('Livros')
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
  async getCapitulos(livroId: number) {
    try {
      const { data, error } = await supabase
        .from('Capitulo')
        .select('*')
        .eq('livro_id', livroId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Capitulo[];
    } catch (error) {
      console.error(`Erro ao obter capítulos do livro ${livroId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obter um capítulo específico por ID
   */
  async getCapituloPorId(id: string) {
    try {
      const { data, error } = await supabase
        .from('Capitulo')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Capitulo;
    } catch (error) {
      console.error(`Erro ao obter capítulo ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Criar um novo capítulo
   */
  async criarCapitulo(livroId: number, capituloData: { titulo: string, conteudo?: string }) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;

      if (!email) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('Capitulo')
        .insert([{
          titulo: capituloData.titulo,
          conteudo: capituloData.conteudo || '',
          livro_id: livroId,
          email_user: email
        }])
        .select();
      
      if (error) throw error;
      return data[0] as Capitulo;
    } catch (error) {
      console.error(`Erro ao criar capítulo no livro ${livroId}:`, error);
      throw error;
    }
  },
  
  /**
   * Atualizar um capítulo existente
   */
  async atualizarCapitulo(id: string, capituloData: { titulo?: string, conteudo?: string }) {
    try {
      const { data, error } = await supabase
        .from('Capitulo')
        .update({
          titulo: capituloData.titulo,
          conteudo: capituloData.conteudo
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0] as Capitulo;
    } catch (error) {
      console.error(`Erro ao atualizar capítulo ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Excluir um capítulo
   */
  async excluirCapitulo(id: string) {
    try {
      const { error } = await supabase
        .from('Capitulo')
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
   * Obter todos os personagens de um livro
   */
  async getPersonagens(livroId: string) {
    try {
      const { data, error } = await supabase
        .from('Personagem')
        .select('*')
        .eq('livro_id', livroId)
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return data as Personagem[];
    } catch (error) {
      console.error(`Erro ao obter personagens do livro ${livroId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obter todas as notas do usuário
   */
  async getNotas(livroId?: string) {
    try {
      let query = supabase
        .from('Nota')
        .select('*')
        .order('atualizado_em', { ascending: false });
      
      if (livroId) {
        query = query.eq('livro_id', livroId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Nota[];
    } catch (error) {
      console.error('Erro ao obter notas:', error);
      throw error;
    }
  },
  
  /**
   * Obter o perfil do usuário atual
   */
  async getPerfilUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('Usuario')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Usuario;
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      throw error;
    }
  },
  
  /**
   * Atualizar o perfil do usuário
   */
  async atualizarPerfilUsuario(perfilData: Partial<Usuario>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('Usuario')
        .update(perfilData)
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      return data[0] as Usuario;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      throw error;
    }
  }
};