import { supabase } from './supabaseClient';

interface AutocompleteOptions {
  input: string;
  cursorPosition: number;
  maxSuggestions?: number;
  livroId?: string;
}

interface GeneratePageOptions {
  input: string;
  style?: 'informative' | 'creative' | 'technical' | 'narrative';
  livroId?: string;
  capituloId?: string;
  pageLength?: 'short' | 'medium' | 'long';
}

interface WritingAssistantOptions {
  input: string;
  action: 'improve' | 'edit' | 'feedback' | 'rewrite';
  focusAreas?: ('clarity' | 'engagement' | 'grammar' | 'style' | 'flow')[];
  livroId?: string;
  capituloId?: string;
}

interface CreativeIdeasOptions {
  input: string;
  ideaType: 'plot_points' | 'characters' | 'settings' | 'conflicts' | 'resolutions';
  numIdeas?: number;
  livroId?: string;
  capituloId?: string;
}

interface SearchOptions {
  input: string;
  detailLevel?: 'low' | 'medium' | 'high';
  maxResults?: number;
}

interface CustomOptions {
  input: string;
  systemPrompt?: string;
  includeEmbeddings?: boolean;
  maxEmbeddings?: number;
  embeddingFilter?: string;
}

// Serviço para integração com a Claude AI através das Edge Functions do Supabase
export const assistantService = {
  /**
   * Autocompletar - fornece sugestões de continuação de texto
   */
  async autocomplete({
    input,
    cursorPosition,
    maxSuggestions = 3,
    livroId
  }: AutocompleteOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
        body: {
          mode: 'autocomplete',
          input,
          context: {
            cursor_position: cursorPosition,
            max_suggestions: maxSuggestions,
            livro_id: livroId
          }
        }
      });

      if (error) {
        console.error('Erro na função de autocomplete:', error);
        throw new Error('Erro ao gerar sugestões. Tente novamente.');
      }

      if (!data) {
        throw new Error('Não foi possível obter resposta do assistente.');
      }

      return data;
    } catch (error) {
      console.error('Erro ao usar autocomplete:', error);
      throw error;
    }
  },
  
  /**
   * Geração de Página - cria uma página completa com base em descrição
   */
  async generatePage({
    input,
    style = 'narrative',
    livroId,
    capituloId,
    pageLength = 'medium'
  }: GeneratePageOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
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
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao gerar página:', error);
      throw error;
    }
  },
  
  /**
   * Assistente de Escrita - melhora, edita ou fornece feedback sobre texto
   */
  async writingAssistant({
    input,
    action,
    focusAreas = ['clarity', 'engagement'],
    livroId,
    capituloId
  }: WritingAssistantOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
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

      if (error) {
        console.error('Erro na função de assistência à escrita:', error);
        throw new Error('Erro ao gerar sugestões. Tente novamente.');
      }

      if (!data) {
        throw new Error('Não foi possível obter resposta do assistente.');
      }

      return data;
    } catch (error) {
      console.error('Erro ao usar assistente de escrita:', error);
      throw error;
    }
  },
  
  /**
   * Ideias Criativas - gera ideias para enriquecer suas histórias
   */
  async creativeIdeas({
    input,
    ideaType,
    numIdeas = 3,
    livroId,
    capituloId
  }: CreativeIdeasOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
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

      if (error) {
        console.error('Erro na função de ideias criativas:', error);
        throw new Error('Erro ao gerar sugestões. Tente novamente.');
      }

      if (!data) {
        throw new Error('Não foi possível obter resposta do assistente.');
      }

      return data;
    } catch (error) {
      console.error('Erro ao gerar ideias criativas:', error);
      throw error;
    }
  },
  
  /**
   * Busca - pesquisa e analisa conteúdo relevante
   */
  async search({
    input,
    detailLevel = 'medium',
    maxResults = 5
  }: SearchOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
        body: {
          mode: 'search',
          input,
          context: {
            detail_level: detailLevel,
            max_results: maxResults
          }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao realizar busca:', error);
      throw error;
    }
  },
  
  /**
   * Personalizado - permite interações flexíveis com o Claude
   */
  async custom({
    input,
    systemPrompt,
    includeEmbeddings = true,
    maxEmbeddings = 3,
    embeddingFilter
  }: CustomOptions) {
    try {
      const requestBody = {
        mode: 'custom',
        input,
        context: {
          system_prompt: systemPrompt,
          include_embeddings: includeEmbeddings,
          max_embeddings: maxEmbeddings,
          embedding_filter: embeddingFilter
        }
      };
      
      console.log('Enviando para claude-embeddings:', JSON.stringify(requestBody, null, 2));
      
      // Verificar se o Supabase está inicializado corretamente
      if (!supabase || !supabase.functions) {
        throw new Error('Cliente Supabase não inicializado corretamente');
      }
      
      // Versão direta com fetch - provavelmente mais confiável em alguns casos
      console.log('Tentando fetch direto para a edge function');
      try {
        const directResponse = await fetch('https://vuyjxxtxwweeobeyfkzr.supabase.co/functions/v1/claude-embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eWp4eHR4d3dlZW9iZXlma3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzYxODcsImV4cCI6MjA2MjIxMjE4N30.hcOHnocR9B4ogqt94ugJQw_mC1g40D3ZM7j_lJjuotU'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!directResponse.ok) {
          console.error(`Fetch retornou status ${directResponse.status}. Tentando conexão via SDK...`);
          throw new Error(`HTTP error: ${directResponse.status}`);
        }
        
        const directData = await directResponse.json();
        console.log('Resposta direta via fetch:', directData);
        return directData;
      } catch (fetchError) {
        console.warn('Erro ao tentar fetch direto, tentando via SDK:', fetchError);
        // Continuar com o método do SDK se o fetch falhar
      }
      
      // Continuar com o método do SDK
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
        body: requestBody
      });
      
      if (error) {
        console.error('Erro na resposta da função Edge:', error);
        throw error;
      }
      
      console.log('Resposta da API claude-embeddings:', data);
      return data;
    } catch (error) {
      console.error('Erro ao usar modo personalizado:', error);
      throw error;
    }
  }
};