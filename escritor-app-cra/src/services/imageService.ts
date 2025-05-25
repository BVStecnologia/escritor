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
      
      // TEMPORÁRIO: Adicionar informação de proporção ao prompt para forçar geração correta
      let adjustedPrompt = finalPrompt;
      if (context?.tipo === 'capa') {
        adjustedPrompt = `${finalPrompt}. IMPORTANT: Generate in portrait/vertical format for book cover, 2:3 aspect ratio`;
      }
      
      // Chamar a Edge Function gerar_imagem
      const { data, error } = await supabase.functions.invoke('gerar_imagem', {
        body: {
          prompt: adjustedPrompt,
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
        systemPrompt = `Create a detailed prompt for generating a professional book cover image. 
The prompt should use English commands but keep the title and author name in Portuguese as provided.
IMPORTANT: The image MUST include:
- The title "${context.titulo}" prominently displayed and clearly legible
- The author name "${context.autor}" in smaller size
- Design appropriate for the ${context.genero || 'book'} genre
Use detailed language about artistic style, lighting, composition and typography.
The prompt should be no more than 3 sentences.
Describe a professional editorial book cover with clear text hierarchy.`;

        // Sempre incluir todos os campos, mesmo que vazios
        contextText += `Título do livro: ${context.titulo ?? ''}\n`;
        contextText += `Autor: ${context.autor ?? ''}\n`;
        contextText += `Gênero: ${context.genero ?? ''}\n`;
        contextText += `Sinopse: ${context.descricao ?? ''}\n`;
        contextText += `Personagens: ${context.personagens ?? ''}\n`;
        contextText += `Ambientação: ${context.ambientacao ?? ''}\n`;
        contextText += `Palavras-chave: ${context.palavrasChave ?? ''}\n`;
      } else {
        // Prompt para imagem de capítulo - SEM TEXTO
        systemPrompt = `Create a detailed prompt for generating an artistic illustration for a book chapter.
The prompt should use English commands and describe a specific visual scene
that illustrates the content based on the provided information. Use detailed and descriptive language.
Add information about artistic style, lighting, composition and atmosphere.
IMPORTANT: DO NOT include any text in the image. Only visual elements.
The prompt should be no more than 3 sentences.
Emphasize visual elements that capture the moment, emotion and atmosphere of the scene.`;

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
      const input = `Please create a detailed prompt for generating an image using OpenAI GPT-Image-1 API.
${contextText}
Use the context above to create a detailed, descriptive and visually impactful prompt.
${context.tipo === 'capa' ? 
  `IMPORTANT: The prompt MUST specify that the title "${context.titulo}" and author "${context.autor}" appear clearly on the book cover. Keep these texts in Portuguese.` : 
  'IMPORTANT: The prompt should NOT include any text in the image, only visual elements.'}
Consider all provided data to create an appropriate composition.
The prompt should use English for commands and descriptions, but keep any book titles or author names in Portuguese.`;      

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