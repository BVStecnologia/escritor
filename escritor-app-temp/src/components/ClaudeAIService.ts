// Types for Claude AI integration
export type AIRequest = {
  mode: 'autocomplete' | 'generate_page' | 'writing_assistant' | 'creative_ideas' | 'search' | 'custom';
  input: string;
  context: {
    action?: string;
    chapter_id?: string;
    cursor_position?: number;
    max_suggestions?: number;
    user_id?: string | number;
    livro_id?: number;
    style?: string;
    page_length?: 'short' | 'medium' | 'long';
    focus_areas?: string[];
    idea_type?: 'plot_points' | 'characters' | 'settings' | 'dialogues';
    num_ideas?: number;
    detail_level?: 'low' | 'medium' | 'high';
    max_results?: number;
    system_prompt?: string;
    include_embeddings?: boolean;
    max_embeddings?: number;
    embedding_filter?: string;
  };
};

// Simulation function for the Claude AI service
export async function generateWithAI(request: AIRequest): Promise<any> {
  console.log('Simulating AI request:', request);
  
  // Add a delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Respond with dummy data based on the mode
  switch (request.mode) {
    case 'writing_assistant':
      return {
        result: `Texto melhorado: ${request.input}\n\nMelhorias aplicadas para tornar o texto mais envolvente e claro.`,
        action: request.context.action
      };
      
    case 'creative_ideas':
      return {
        ideas: [
          "Uma descoberta inesperada revela que o antagonista e o protagonista compartilham um passado em comum.",
          "Um objeto aparentemente insignificante mencionado no início da história torna-se crucial para a resolução.",
          "O aliado mais próximo do protagonista tem secretamente agendas duplas, reveladas apenas no momento crítico."
        ],
        result: "Ideias geradas com sucesso para enriquecer sua história."
      };
      
    case 'autocomplete':
      return {
        suggestions: [
          "e continuou seu caminho pela floresta densa.",
          "sem olhar para trás, sabendo que aquela decisão mudaria tudo.",
          "enquanto pensava nas consequências de suas ações anteriores."
        ],
        result: "e continuou seu caminho pela floresta densa."
      };
      
    default:
      return {
        result: "Resposta padrão do assistente AI. Este é um texto gerado para demonstração."
      };
  }
}