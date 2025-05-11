import { supabase } from './supabaseClient';
import { Livro } from '../types/livro';

// Serviço para interagir com as tabelas existentes no Supabase
// Adaptaremos este serviço para corresponder à sua estrutura de banco de dados existente

export interface Capitulo {
  id: string;
  created_at: string;
  titulo: string;
  texto?: string;        // Campo para armazenar o conteúdo do capítulo
  conteudo?: string;     // Campo mantido para compatibilidade com código existente
  livro_id: number;
  email_user?: string;
  last_edit?: string;    // Timestamp da última edição
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
  id: number;
  created_at: string;
  nome?: string;
  Sobrenome?: string;
  Tema?: string;
  palavras?: number;
  email?: string;
  user?: string;
  biografia?: string;
  site?: string;
  generoPreferido?: string;
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
        .order('updated_at', { ascending: false, nullsFirst: false })
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
  async criarLivro(livroData: { titulo: string, autor?: string, sinopse?: string, genero?: string }) {
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
          email_user: email,
          sinopse: livroData.sinopse || '',
          genero: livroData.genero || ''
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
   * Alias para getCapitulos para consistência de nomenclatura
   */
  async getCapitulosPorLivroId(livroId: number) {
    return this.getCapitulos(livroId);
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

      console.log('Criando capítulo:', capituloData);

      // Criar objeto de dados para inserção
      const newChapter = {
        titulo: capituloData.titulo,
        texto: capituloData.conteudo || '',  // Usar o campo 'texto' correto
        livro_id: livroId,
        email_user: email,
        last_edit: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('Capitulo')
        .insert([newChapter])
        .select();

      if (error) {
        console.error('Erro ao criar capítulo no Supabase:', error);
        throw error;
      }

      console.log('Capítulo criado com sucesso:', data);
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
      console.log('Atualizando capítulo:', id, capituloData);

      // Cria objeto de atualização
      const updateData: any = {};

      // Se tiver título, inclui no objeto de atualização
      if (capituloData.titulo !== undefined) {
        updateData.titulo = capituloData.titulo;
      }

      // Se tiver conteúdo, coloca na coluna 'texto' (não 'conteudo')
      if (capituloData.conteudo !== undefined) {
        updateData.texto = capituloData.conteudo;
      }

      // Adiciona timestamp de última edição
      updateData.last_edit = new Date().toISOString();

      const { data, error } = await supabase
        .from('Capitulo')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar capítulo no Supabase:', error);
        throw error;
      }

      console.log('Capítulo atualizado com sucesso:', data);
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
        .from('User')
        .select('*')
        .eq('user', user.id)
        .single();

      if (error) {
        // Se o usuário não foi encontrado, podemos criá-lo
        if (error.code === 'PGRST116') {
          return this.criarPerfilUsuario();
        }
        throw error;
      }

      return data as Usuario;
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      throw error;
    }
  },

  /**
   * Criar o perfil do usuário
   */
  async criarPerfilUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Criando perfil para o usuário:', user.id);

      const { data, error } = await supabase
        .from('User')
        .insert([{
          user: user.id,
          email: user.email,
          nome: user.user_metadata?.nome || '',
          Sobrenome: user.user_metadata?.sobrenome || '',
          Tema: 'claro',
          palavras: 0,
          generoPreferido: ''
        }])
        .select();

      if (error) {
        console.error('Erro ao criar perfil no Supabase:', error);
        throw error;
      }

      console.log('Perfil criado com sucesso:', data);
      return data[0] as Usuario;
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      throw error;
    }
  },

  /**
   * Atualizar o perfil do usuário
   */
  async atualizarPerfilUsuario(perfilData: { nome?: string, biografia?: string, site?: string, Sobrenome?: string, Tema?: string, generoPreferido?: string }) {
    try {
      console.log('Atualizando perfil do usuário:', perfilData);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Adaptação dos campos para a nova estrutura
      const dadosAtualizados: any = {};

      if (perfilData.nome !== undefined) dadosAtualizados.nome = perfilData.nome;
      if (perfilData.biografia !== undefined) dadosAtualizados.biografia = perfilData.biografia;
      if (perfilData.site !== undefined) dadosAtualizados.site = perfilData.site;
      if (perfilData.Sobrenome !== undefined) dadosAtualizados.Sobrenome = perfilData.Sobrenome;
      if (perfilData.Tema !== undefined) dadosAtualizados.Tema = perfilData.Tema;
      if (perfilData.generoPreferido !== undefined) {
        console.log('Atualizando gênero preferido para:', perfilData.generoPreferido);
        dadosAtualizados.generoPreferido = perfilData.generoPreferido;
      }

      console.log('Dados a serem atualizados:', dadosAtualizados);

      const { data, error } = await supabase
        .from('User')
        .update(dadosAtualizados)
        .eq('user', user.id)
        .select();

      if (error) {
        console.error('Erro ao atualizar dados no Supabase:', error);
        throw error;
      }

      console.log('Perfil atualizado com sucesso:', data);
      return data[0] as Usuario;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      throw error;
    }
  },

  /**
   * Atualizar contagem de palavras do usuário
   */
  async atualizarPalavrasUsuario(palavras: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('User')
        .update({ palavras })
        .eq('user', user.id)
        .select();

      if (error) throw error;
      return data[0] as Usuario;
    } catch (error) {
      console.error('Erro ao atualizar palavras do usuário:', error);
      throw error;
    }
  },

  /**
   * Atualizar updated_at de um livro
   */
  async atualizarUpdatedAtLivro(id: number) {
    try {
      const { error } = await supabase
        .from('Livros')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar updated_at do livro ${id}:`, error);
      throw error;
    }
  }
};