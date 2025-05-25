import { supabase } from './supabaseClient';
import { assistantService } from './assistantService';

// Interface para o resultado da geração de imagem
export interface ImageGenerationResult {
  success: boolean;
  imageUrls?: string[];
  error?: string;
  estimatedCredits?: number;
  processingTimeMs?: number;
}

// Interface para o contexto usado para melhorar o prompt
export interface PromptContext {
  livroId?: number;
  capituloId?: string;
  titulo?: string;
  descricao?: string; 
  genero?: string;
  personagens?: string;
  ambientacao?: string;
  texto?: string; // Texto selecionado ou do capítulo
  tipo: 'capa' | 'capitulo'; // Tipo de imagem a ser gerada
  autor?: string;
  palavrasChave?: string;
}

// Serviço para geração de imagens
// Função para estimar custo antes de gerar
export function estimateImageCost(quality: string = 'medium', sampleCount: number = 1): number {
  const costs = {
    low: 50,
    medium: 100,
    high: 200
  };
  
  return (costs[quality as keyof typeof costs] || 100) * sampleCount;
}

// Função para obter histórico de gerações
export async function getImageGenerationHistory(limit: number = 10) {
  const { data, error } = await supabase
    .from('image_generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
  
  return data || [];
}

// Função para obter estatísticas de uso
export async function getImageGenerationStats() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;
  
  const { data, error } = await supabase
    .from('user_image_generation_stats')
    .select('*')
    .eq('user_id', userData.user.id)
    .single();
    
  if (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return null;
  }
  
  return data;
}

export const imageService = {
  /**
   * Gera uma imagem usando a API OpenAI GPT-Image-1 através da Edge Function
   * 
   * @param prompt Descrição da imagem a ser gerada (pode ser vazio se useAI=true)
   * @param context Contexto do livro/capítulo para melhorar o prompt
   * @param sampleCount Número de imagens para gerar (1-4)
   * @param useAI Usar IA para melhorar ou gerar o prompt automaticamente
   */
  async generateImage(
    prompt: string,
    context?: PromptContext,
    sampleCount: number = 1,
    useAI: boolean = true
  ): Promise<ImageGenerationResult> {
    try {
      // Verificar se o prompt foi fornecido ou se devemos gerar um
      let finalPrompt = prompt;
      
      // Se useAI estiver ativado, melhorar ou gerar o prompt
      if (useAI) {
        finalPrompt = await this.generateEnhancedPrompt(prompt, context);
      }
      
      // Se ainda não tivermos um prompt, retornar erro
      if (!finalPrompt.trim()) {
        return {
          success: false,
          error: 'Não foi possível gerar um prompt. Por favor, forneça uma descrição para a imagem.'
        };
      }

      console.log('Gerando imagem com prompt:', finalPrompt);
      
      // Determinar tipo e qualidade baseado no contexto
      const type = context?.tipo === 'capa' ? 'book-cover' : 'landscape';
      const quality = context?.tipo === 'capa' ? 'high' : 'medium';
      
      // Chamar a Edge Function gerar-imagem
      const { data, error } = await supabase.functions.invoke('gerar-imagem', {
        body: {
          prompt: finalPrompt,
          sampleCount: Math.min(Math.max(sampleCount, 1), 4), // Limitar entre 1 e 4
          type: type,
          quality: quality
        }
      });
      
      if (error) {
        console.error('Erro ao chamar a Edge Function:', error);
        return {
          success: false,
          error: `Erro na geração da imagem: ${error.message || 'Erro desconhecido'}`
        };
      }
      
      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        return {
          success: true,
          imageUrls: data.imageUrls,
          estimatedCredits: data.estimatedCredits,
          processingTimeMs: data.processingTimeMs
        };
      } else {
        return {
          success: false,
          error: data.error || data.errors?.join(', ') || 'Não foi possível gerar as imagens. Tente novamente.'
        };
      }
    } catch (error: any) {
      console.error('Erro ao gerar imagem:', error);
      return {
        success: false,
        error: `Erro na geração da imagem: ${error.message || 'Erro desconhecido'}`
      };
    }
  },
  
  /**
   * Gera ou melhora um prompt usando IA, baseado no contexto
   */
  async generateEnhancedPrompt(
    userPrompt: string,
    context?: PromptContext
  ): Promise<string> {
    try {
      if (!context) {
        // Se não houver contexto, apenas retorne o prompt do usuário
        return userPrompt;
      }
      
      // Construir o prompt para a IA baseado no contexto
      let systemPrompt = '';
      let contextText = '';
      
      if (context.tipo === 'capa') {
        systemPrompt = `Crie um prompt detalhado para gerar uma imagem de capa para um livro. 
O prompt deve ser em português (para melhor compreensão do usuário) e deve descrever uma cena ou imagem impactante
que represente bem o livro, baseado nas informações fornecidas. Use linguagem detalhada e descritiva.
Adicione informações sobre estilo artístico, iluminação, composição e qualidade.
NÃO inclua texto, títulos ou palavras na imagem. Apenas elementos visuais.
O prompt não deve ter mais que 3 frases.
Destaque aspectos visuais que refletem o gênero literário e o tom da história.`;

        // Sempre incluir todos os campos, mesmo que vazios
        contextText += `Título do livro: ${context.titulo ?? ''}\n`;
        contextText += `Autor: ${context.autor ?? ''}\n`;
        contextText += `Gênero: ${context.genero ?? ''}\n`;
        contextText += `Sinopse: ${context.descricao ?? ''}\n`;
        contextText += `Personagens: ${context.personagens ?? ''}\n`;
        contextText += `Ambientação: ${context.ambientacao ?? ''}\n`;
        contextText += `Palavras-chave: ${context.palavrasChave ?? ''}\n`;
      } else {
        // Prompt para imagem de capítulo
        systemPrompt = `Crie um prompt detalhado para gerar uma imagem para ilustrar um capítulo ou cena de um livro.
O prompt deve ser em português (para melhor compreensão do usuário) e deve descrever uma cena específica
que ilustre o conteúdo, baseado nas informações fornecidas. Use linguagem detalhada e descritiva.
Adicione informações sobre estilo artístico, iluminação, composição e qualidade.
NÃO inclua texto, títulos ou palavras na imagem. Apenas elementos visuais.
O prompt não deve ter mais que 3 frases.
Enfatize elementos visuais que capturam o momento ou a emoção da cena.`;

        contextText += `Título do capítulo: ${context.titulo ?? ''}\n`;
        contextText += `Autor: ${context.autor ?? ''}\n`;
        contextText += `Texto selecionado: ${context.texto ?? ''}\n`;
        contextText += `Ambientação: ${context.ambientacao ?? ''}\n`;
        contextText += `Personagens envolvidos: ${context.personagens ?? ''}\n`;
        contextText += `Palavras-chave: ${context.palavrasChave ?? ''}\n`;
        contextText += `Gênero da obra: ${context.genero ?? ''}\n`;
      }
      
      // Se o usuário forneceu um prompt, incluir como referência
      if (userPrompt.trim()) {
        contextText += `\nDescrição fornecida pelo usuário: ${userPrompt}\n`;
      }
      
      // Preparar input para geração de prompt melhorado
      const input = `Por favor, crie um prompt detalhado para gerar uma imagem usando a API Google Imagen.
${contextText}
Use o contexto acima para criar um prompt detalhado, descritivo e visualmente impactante que represente bem a obra.
Leve em consideração todos os dados fornecidos, especialmente título, autor, gênero e elementos da história.
O prompt deve estar em português para melhor compreensão do usuário.`;      

      try {
        // Usar assistantService.custom para aproveitar o sistema de embeddings
        const data = await assistantService.custom({
          input,
          systemPrompt,
          includeEmbeddings: true,  // Ativar o uso de embeddings para melhorar o contexto
          maxEmbeddings: 5,  // Limitar a 5 embeddings mais relevantes
          embeddingFilter: context.livroId ? `livro_id:${context.livroId}` : null  // Filtrar por livro atual
        });
        
        // Extrair o texto da resposta
        const enhancedPrompt = data?.content?.[0]?.text || userPrompt || 'Uma imagem artística detalhada';
        console.log('Prompt melhorado gerado com embeddings:', enhancedPrompt);
        return enhancedPrompt;
      } catch (error) {
      
        console.error('Erro ao gerar prompt melhorado com embeddings:', error);
        // Se falhar a abordagem com embeddings, tentar usar a padrão sem embeddings
        try {
          const { data, error } = await supabase.functions.invoke('claude-embeddings', {
            body: {
              mode: "custom",
              input,
              context: {
                system_prompt: systemPrompt,
                include_embeddings: false
              },
              model: "claude-3-haiku-20240307",
              max_tokens: 300
            }
          });
          
          if (error) throw error;
          
          // Extrair o texto da resposta alternativa
          const enhancedPrompt = data?.content?.[0]?.text || userPrompt || 'Uma imagem artística detalhada';
          console.log('Prompt melhorado gerado pelo fallback:', enhancedPrompt);
          return enhancedPrompt;
        } catch (fallbackError) {
          console.error('Erro no fallback de geração de prompt:', fallbackError);
          return userPrompt || 'Uma imagem artística detalhada';
        }
      }
    } catch (error) {
      console.error('Erro ao gerar prompt melhorado:', error);
      // Em caso de erro, usar o prompt original
      return userPrompt || 'Uma imagem artística detalhada';
    }
  },
  
  /**
   * Registra a imagem usada na tabela imagens_geradas para evitar deleção pelo cron
   */
  async registerUsedImage(
    imageUrl: string,
    prompt: string,
    livroId?: number,
    revisedPrompt?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Extrair o path do storage da URL
      // URL formato: https://xxx.supabase.co/storage/v1/object/public/ai-generated-images/generated-images/generated-xxx.png
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts.length !== 2) {
        throw new Error('URL de imagem inválida');
      }
      
      const storagePath = urlParts[1]; // ai-generated-images/generated-images/generated-xxx.png
      
      const { data, error } = await supabase
        .from('imagens_geradas')
        .insert({
          prompt: prompt,
          revised_prompt: revisedPrompt || null,
          storage_path: storagePath,
          public_url: imageUrl,
          livro: livroId || null,
          status: 'ativo'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao registrar imagem usada:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Imagem registrada com sucesso:', data);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao registrar imagem:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Remove o registro da imagem quando ela é deletada
   */
  async unregisterImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('imagens_geradas')
        .update({ 
          status: 'deletado',
          deleted_at: new Date().toISOString()
        })
        .eq('public_url', imageUrl);
      
      if (error) {
        console.error('Erro ao marcar imagem como deletada:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao desregistrar imagem:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Salva a imagem gerada no banco de dados (mantido para compatibilidade)
   */
  async saveGeneratedImage(
    imageUrls: string[],
    prompt: string,
    context?: PromptContext
  ): Promise<void> {
    try {
      // Para cada imagem, registrar na tabela imagens_geradas
      for (const url of imageUrls) {
        await this.registerUsedImage(url, prompt, context?.livroId);
      }
      
      // Se for uma capa de livro, atualizar o campo capa do livro
      if (context?.tipo === 'capa' && context.livroId && imageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('Livros')
          .update({ capa: imageUrls[0] })
          .eq('id', context.livroId);
        
        if (updateError) {
          console.error('Erro ao atualizar capa do livro:', updateError);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar imagem gerada:', error);
    }
  },
  
  /**
   * Obtém as imagens geradas para um livro ou capítulo específico
   */
  async getGeneratedImages(
    livroId?: number,
    capituloId?: string,
    tipo?: 'capa' | 'capitulo' | 'outros'
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('imagens_geradas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (livroId) {
        query = query.eq('livro_id', livroId);
      }
      
      if (capituloId) {
        query = query.eq('capitulo_id', capituloId);
      }
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao obter imagens geradas:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao obter imagens geradas:', error);
      return [];
    }
  }
};