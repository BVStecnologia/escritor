import { supabase } from './supabaseClient';

// Interface para o resultado da geração de imagem
export interface ImageGenerationResult {
  success: boolean;
  imageUrls?: string[];
  error?: string;
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
export const imageService = {
  /**
   * Gera uma imagem usando a API Google Imagen através da Edge Function
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
      
      // Chamar a Edge Function para gerar a imagem
      // A chave da API é gerenciada de forma segura pela função edge
      const { data, error } = await supabase.functions.invoke('Gera_imagem_goolgea', {
        body: JSON.stringify({
          prompt: finalPrompt,
          sampleCount: Math.min(Math.max(sampleCount, 1), 4) // Limitar entre 1 e 4
        })
      });
      
      if (error) {
        console.error('Erro ao chamar a Edge Function:', error);
        return {
          success: false,
          error: `Erro na geração da imagem: ${error.message || 'Erro desconhecido'}`
        };
      }
      
      // Não salvamos mais automaticamente, apenas retornamos o resultado
      // O salvamento será feito quando o usuário confirmar a imagem
      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        return {
          success: true,
          imageUrls: data.imageUrls
        };
      } else if (data.warning) {
        // Erro parcial (não conseguiu salvar no Storage, mas temos as imagens)
        console.warn('Aviso na geração de imagem:', data.warning);
        
        return {
          success: true,
          imageUrls: data.images || [],
          error: 'As imagens foram geradas mas não foram salvas corretamente.'
        };
      } else {
        return {
          success: false,
          error: 'Não foi possível gerar as imagens. Tente novamente.'
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
      
      // Chamar a edge function do Claude para gerar o prompt melhorado
      const { data, error } = await supabase.functions.invoke('claude-embeddings', {
        body: {
          mode: "custom",
          input: `Por favor, crie um prompt detalhado para gerar uma imagem usando a API Google Imagen.
${contextText}
Use o contexto acima para criar um prompt detalhado, descritivo e visualmente impactante que represente bem a obra.
Leve em consideração todos os dados fornecidos, especialmente título, autor, gênero e elementos da história.
O prompt deve estar em português para melhor compreensão do usuário.`,
          context: {
            system_prompt: systemPrompt,
            include_embeddings: false
          },
          model: "claude-3-haiku-20240307",
          max_tokens: 300
        }
      });
      
      if (error) {
        console.error('Erro ao gerar prompt melhorado:', error);
        // Se falhar, retornar o prompt original do usuário
        return userPrompt || 'Uma imagem artística detalhada';
      }
      
      // Extrair o texto da resposta
      const enhancedPrompt = data?.content?.[0]?.text || userPrompt || 'Uma imagem artística detalhada';
      
      console.log('Prompt melhorado gerado:', enhancedPrompt);
      return enhancedPrompt;
    } catch (error) {
      console.error('Erro ao gerar prompt melhorado:', error);
      // Em caso de erro, usar o prompt original
      return userPrompt || 'Uma imagem artística detalhada';
    }
  },
  
  /**
   * Salva a imagem gerada no banco de dados
   */
  async saveGeneratedImage(
    imageUrls: string[],
    prompt: string,
    context?: PromptContext
  ): Promise<void> {
    try {
      // Obter usuário atual
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        console.error('Usuário não autenticado ao salvar imagem gerada');
        return;
      }
      
      // Criar registros para cada imagem gerada
      const records = imageUrls.map(url => ({
        url: url,
        prompt: prompt,
        livro_id: context?.livroId || null,
        capitulo_id: context?.capituloId || null,
        tipo: context?.tipo || 'outros',
        usuario_id: userId,
        metadata: {
          titulo: context?.titulo,
          descricao: context?.descricao,
          genero: context?.genero
        }
      }));
      
      // Inserir na tabela imagens_geradas
      const { error } = await supabase
        .from('imagens_geradas')
        .insert(records);
      
      if (error) {
        console.error('Erro ao salvar imagens geradas:', error);
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