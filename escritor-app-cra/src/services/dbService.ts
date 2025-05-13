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
  palavras?: number;
  ordem?: number;        // Campo para controlar a ordem dos capítulos
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

export interface CapituloData {
  titulo?: string;
  conteudo?: string;
  customData?: {
    palavras?: number;
    [key: string]: any;
  };
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
  async criarLivro(livroData: { 
    titulo: string, 
    autor?: string, 
    sinopse?: string, 
    genero?: string, 
    personagens?: string, 
    ambientacao?: string,
    palavras_chave?: string 
  }) {
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
          autor: livroData.autor || userData?.user?.user_metadata?.name || 'Autor desconhecido',
          email_user: email,
          sinopse: livroData.sinopse || '',
          genero: livroData.genero || '',
          personagens: livroData.personagens || '',
          ambientacao: livroData.ambientacao || '',
          palavras_chave: livroData.palavras_chave || ''
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
  async atualizarLivro(id: number, livroData: { 
    titulo?: string, 
    autor?: string, 
    sinopse?: string, 
    genero?: string,
    personagens?: string,
    ambientacao?: string,
    palavras_chave?: string 
  }) {
    try {
      const { data, error } = await supabase
        .from('Livros')
        .update({
          "Nome do livro": livroData.titulo,
          "Autor": livroData.autor,
          sinopse: livroData.sinopse,
          genero: livroData.genero,
          personagens: livroData.personagens,
          ambientacao: livroData.ambientacao,
          palavras_chave: livroData.palavras_chave
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
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Capitulo[];
    } catch (error) {
      console.error(`Erro ao obter capítulos do livro ${livroId}:`, error);
      throw error;
    }
  },

  /**
   * Obter o último capítulo editado de um livro
   */
  async getUltimoCapituloEditado(livroId: number) {
    try {
      const { data, error } = await supabase
        .from('Capitulo')
        .select('*')
        .eq('livro_id', livroId)
        .order('last_edit', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0] as Capitulo;
      }
      
      // Se não encontrar por last_edit, tenta buscar o primeiro por ordem
      const { data: dataByOrder, error: errorByOrder } = await supabase
        .from('Capitulo')
        .select('*')
        .eq('livro_id', livroId)
        .order('ordem', { ascending: true })
        .limit(1);
        
      if (errorByOrder) throw errorByOrder;
      
      return dataByOrder && dataByOrder.length > 0 ? dataByOrder[0] as Capitulo : null;
    } catch (error) {
      console.error(`Erro ao obter último capítulo editado do livro ${livroId}:`, error);
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
      console.log('Obtendo capítulo por ID:', id);
      
      const { data, error } = await supabase
        .from('Capitulo')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Garantir que o conteúdo seja preservado exatamente como está no banco
      if (data) {
        console.log('Capítulo encontrado:', {
          id: data.id,
          titulo: data.titulo,
          conteudoInicial: data.texto ? `${data.texto.substring(0, 50)}...` : 'vazio'
        });
        
        // Manter o texto original como conteúdo para compatibilidade
        if (data.texto) {
          data.conteudo = data.texto;
        }
      }
      
      return data as Capitulo;
    } catch (error) {
      console.error(`Erro ao obter capítulo ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Criar um novo capítulo
   */
  async criarCapitulo(livroId: number, capituloData: CapituloData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;

      if (!email) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Criando capítulo:', capituloData);

      // Calcular número de palavras
      const texto = capituloData.conteudo || '';
      let palavras = texto.split(/\s+/).filter(Boolean).length;
      
      // Se tiver customData com palavras, usa essa contagem
      if (capituloData.customData?.palavras !== undefined) {
        palavras = capituloData.customData.palavras;
        console.log('Usando contagem de palavras do customData:', palavras);
      }

      // Buscar a maior ordem atual
      const { data: existingChapters, error: chaptersError } = await supabase
        .from('Capitulo')
        .select('ordem')
        .eq('livro_id', livroId)
        .order('ordem', { ascending: false })
        .limit(1);

      if (chaptersError) {
        console.error('Erro ao buscar capítulos existentes:', chaptersError);
        throw chaptersError;
      }

      // Definir a ordem como a maior existente + 1 ou 1 se for o primeiro capítulo
      const nextOrder = existingChapters.length > 0 && existingChapters[0].ordem 
        ? existingChapters[0].ordem + 1 
        : 1;

      // Criar objeto de dados para inserção
      const newChapter = {
        titulo: capituloData.titulo,
        texto,
        livro_id: livroId,
        last_edit: new Date().toTimeString().split(' ')[0],
        palavras,
        ordem: nextOrder
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
 async atualizarCapitulo(id: string | number, capituloData: CapituloData) {
  try {
    // Não convertemos o ID para número, mantemos o formato original
    console.log('===== FUNÇÃO atualizarCapitulo CHAMADA =====');
    console.log('Parâmetros recebidos:', {
      id,
      idType: typeof id,
      capituloData,
      titulo: capituloData.titulo,
      tituloType: typeof capituloData.titulo
    });

    // Cria objeto de atualização
    const updateData: any = {};

    // Se tiver título, inclui no objeto de atualização
    if (capituloData.titulo !== undefined) {
      console.log('Atualizando título para:', {
        titulo: capituloData.titulo,
        tipo: typeof capituloData.titulo
      });
      updateData.titulo = capituloData.titulo;
    }

    // Se tiver conteúdo, coloca na coluna 'texto' (não 'conteudo')
    if (capituloData.conteudo !== undefined) {
      console.log('Atualizando conteúdo');
      
      // Verificar se o conteúdo está em formato válido antes de salvar
      // Isto evita problemas ao carregar o conteúdo posteriormente
      const conteudoValidado = this.validarConteudoEditor(capituloData.conteudo);
      updateData.texto = conteudoValidado;
      
      // Se não tiver customData.palavras, calcula a partir do conteúdo
      if (!capituloData.customData?.palavras) {
        // Calcular número de palavras a partir do texto extraído
        try {
          // Tentar extrair texto do JSON se for um objeto Lexical válido
          let textoPlano = '';
          const conteudoObj = JSON.parse(conteudoValidado);
          
          // Extrair texto dos nós (simplificado)
          if (conteudoObj && conteudoObj.root && conteudoObj.root.children) {
            textoPlano = this.extrairTextoDeNos(conteudoObj.root.children);
          }
          
          updateData.palavras = textoPlano.split(/\s+/).filter(Boolean).length;
        } catch (e) {
          // Se falhar, usar método simples
          updateData.palavras = conteudoValidado.split(/\s+/).filter(Boolean).length;
        }
      }
    }
    
    // Se tiver customData com palavras, usa essa contagem
    if (capituloData.customData?.palavras !== undefined) {
      updateData.palavras = capituloData.customData.palavras;
      console.log('Usando contagem de palavras do customData:', updateData.palavras);
    }

    // Adiciona horário de última edição (HH:MM:SS)
    const now = new Date();
    updateData.last_edit = now.toTimeString().split(' ')[0];

    console.log('Dados a serem enviados para atualização:', {
      id,
      updateData: JSON.stringify(updateData)
    });

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
    
    // Retornar com o campo conteudo para manter compatibilidade
    const result = data[0];
    if (result && result.texto) {
      result.conteudo = result.texto;
    }
    
    console.log('===== FUNÇÃO atualizarCapitulo CONCLUÍDA =====');
    return result as Capitulo;
  } catch (error) {
    console.error(`Erro ao atualizar capítulo ${id}:`, error);
    throw error;
  }
},
  
  /**
   * Função auxiliar para validar o conteúdo do editor antes de salvar
   * Garante que o conteúdo esteja em um formato que o editor possa carregar posteriormente
   */
  validarConteudoEditor(conteudo: string): string {
    try {
      // Se já for um objeto, converter para string JSON
      if (typeof conteudo === 'object') {
        return JSON.stringify(conteudo);
      }
      
      // Verificar se é uma string JSON válida
      const trimmed = conteudo.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        // Verificar se é um objeto Lexical válido
        const parsed = JSON.parse(trimmed);
        
        // Verificar estrutura mínima esperada
        if (parsed && parsed.root) {
          return trimmed; // Formato válido
        } else {
          console.warn('Conteúdo JSON não possui estrutura Lexical válida');
          // Retornar um documento Lexical vazio válido
          return JSON.stringify({
            "root": {
              "children": [
                {
                  "children": [],
                  "direction": null,
                  "format": "",
                  "indent": 0,
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "root",
              "version": 1
            }
          });
        }
      }
      
      // Se não for um JSON, retornar como está (pode ser texto simples)
      return conteudo;
    } catch (error) {
      console.error('Erro ao validar conteúdo do editor:', error);
      // Retornar um documento Lexical vazio válido em caso de erro
      return JSON.stringify({
        "root": {
          "children": [
            {
              "children": [],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1
        }
      });
    }
  },
  
  /**
   * Função auxiliar para extrair texto plano de nós do Lexical
   */
  extrairTextoDeNos(nos: any[]): string {
    if (!Array.isArray(nos)) return '';
    
    return nos.map(no => {
      // Extrair texto deste nó
      let texto = '';
      
      // Se for um nó de texto
      if (no.type === 'text' && typeof no.text === 'string') {
        texto += no.text;
      }
      
      // Se tiver filhos, extrair texto recursivamente
      if (Array.isArray(no.children) && no.children.length > 0) {
        texto += this.extrairTextoDeNos(no.children);
      }
      
      return texto;
    }).join(' ');
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
  },

  /**
   * Atualiza a ordem dos capítulos após reordenação
   */
  async atualizarOrdemCapitulos(capitulos: { id: string, ordem: number }[]) {
    try {
      // Atualizar cada capítulo com sua nova ordem
      const promises = capitulos.map(({ id, ordem }) => 
        supabase
          .from('Capitulo')
          .update({ ordem })
          .eq('id', id)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar ordem dos capítulos:', error);
      throw error;
    }
  },

  /**
   * Atualizar apenas o título de um capítulo
   */
  async atualizarTituloCapitulo(id: string, novoTitulo: string) {
    try {
      console.log('===== FUNÇÃO atualizarTituloCapitulo CHAMADA =====');
      console.log(`Atualizando título do capítulo ${id} para: "${novoTitulo}"`);
      
      // Chamada direta ao Supabase para atualizar apenas o título
      const { data, error } = await supabase
        .from('Capitulo')
        .update({ titulo: novoTitulo })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar título no Supabase:', error);
        throw error;
      }
      
      console.log('Resultado da atualização:', data);
      console.log('===== FUNÇÃO atualizarTituloCapitulo CONCLUÍDA =====');
      
      return data[0] as Capitulo;
    } catch (error) {
      console.error(`Erro ao atualizar título do capítulo ${id}:`, error);
      throw error;
    }
  }
};