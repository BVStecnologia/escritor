// Tipos para a integração com a API do Claude AI
export type AIRequest = {
  mode: 'autocomplete' | 'generate_page' | 'writing_assistant' | 'creative_ideas' | 'search' | 'custom';
  input: string;
  context: {
    action?: string;
    chapter_id?: string;
    cursor_position?: number;
    max_suggestions?: number;
    user_id?: string | number;
    livro_id?: string | number;
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

type AutocompleteResponse = {
  input_text: string;
  cursor_position: number;
  suggestions: string[];
};

type GeneratePageResponse = {
  prompt: string;
  style: string;
  page_length: string;
  content: string;
};

type WritingAssistantResponse = {
  original_text: string;
  action: string;
  focus_areas?: string[];
  result: string;
};

type CreativeIdeasResponse = {
  prompt: string;
  idea_type: string;
  num_ideas: number;
  ideas: string[];
};

type SearchResponse = {
  query: string;
  detail_level: string;
  raw_results: Array<{
    id: number;
    tipo: string;
    conteudo: string;
    similaridade: number;
  }>;
  analysis: string;
};

type CustomResponse = {
  result: string;
};

export type AIResponse = Partial<
  AutocompleteResponse &
  GeneratePageResponse &
  WritingAssistantResponse &
  CreativeIdeasResponse &
  SearchResponse &
  CustomResponse
>;

// Simulação da chamada da API - em produção, isso seria uma chamada fetch real
export async function generateWithAI(request: AIRequest): Promise<AIResponse> {
  console.log('Sending request to AI service:', request);
  
  // Simular tempo de resposta da API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let response: AIResponse = {};
  
  switch (request.mode) {
    case 'autocomplete':
      response = simulateAutocomplete(request);
      break;
    case 'generate_page':
      response = simulateGeneratePage(request);
      break;
    case 'writing_assistant':
      response = simulateWritingAssistant(request);
      break;
    case 'creative_ideas':
      response = simulateCreativeIdeas(request);
      break;
    case 'search':
      response = simulateSearch(request);
      break;
    case 'custom':
      response = simulateCustom(request);
      break;
  }
  
  console.log('AI service response:', response);
  return response;
}

// Simulações para cada modo - em produção, estas seriam chamadas reais à API
function simulateAutocomplete(request: AIRequest): AIResponse {
  const cursorPosition = request.context.cursor_position || request.input.length;
  const maxSuggestions = request.context.max_suggestions || 3;
  
  const suggestions = [
    "e continuou seu caminho pela floresta densa. Os raios de sol mal conseguiam penetrar através das folhas.",
    "sem olhar para trás, sabendo que aquela decisão mudaria tudo em sua vida.",
    "enquanto pensava nas consequências de suas ações anteriores. Nada poderia prepará-lo para o que viria a seguir."
  ].slice(0, maxSuggestions);
  
  return {
    input_text: request.input,
    cursor_position: cursorPosition,
    suggestions,
    result: suggestions[0]
  };
}

function simulateGeneratePage(request: AIRequest): AIResponse {
  const style = request.context.style || 'informative';
  const pageLength = request.context.page_length || 'medium';
  
  let content = '';
  
  switch (style) {
    case 'informative':
      content = "O sol se punha no horizonte, tingindo o céu com tons de laranja e rosa. Maria observava da janela de seu apartamento, pensativa. Os últimos meses haviam sido difíceis, mas finalmente ela começava a ver uma luz no fim do túnel. Sua nova posição na empresa lhe dava mais responsabilidades, mas também mais liberdade para implementar as mudanças que acreditava serem necessárias.\n\nEnquanto tomava seu chá, repassava mentalmente os pontos que precisaria abordar na reunião do dia seguinte. Era sua chance de mostrar seu valor e garantir que o projeto seguisse na direção certa. Precisava ser assertiva, mas também diplomática. Alguns dos membros mais antigos da equipe ainda resistiam às suas ideias, vendo-a como jovem demais ou inexperiente.";
      break;
    case 'narrative':
      content = "As sombras dançavam nas paredes enquanto Carlos avançava pelo corredor estreito. O rangido do piso de madeira sob seus pés parecia ensurdecedor no silêncio da antiga mansão. A cada passo, sentia que os olhos dos retratos na parede o seguiam, julgando sua intrusão. Uma gota de suor escorreu por sua têmpora.\n\n\"Não há nada aqui\", sussurrou para si mesmo, tentando acalmar os batimentos acelerados de seu coração. \"Apenas uma casa velha e vazia.\"\n\nMas então, um som. Suave a princípio, quase imperceptível. Um cantarolar distante, vindo de algum lugar à frente. A melodia era estranhamente familiar, como uma canção de ninar que sua avó costumava cantar.";
      break;
    default:
      content = "O capítulo começa com uma descrição detalhada do ambiente, estabelecendo o tom e a atmosfera. As personagens são apresentadas em situações que revelam aspectos de suas personalidades. O conflito central é sutilmente introduzido através de diálogos e pequenas ações que mostram as tensões existentes. No desenvolvimento, vemos como cada personagem reage de maneira única aos eventos, baseado em suas experiências passadas e motivações atuais. O clímax do capítulo ocorre quando uma revelação importante muda a percepção que tínhamos sobre a situação inicial.";
  }
  
  if (pageLength === 'short') {
    content = content.split('\n\n')[0];
  } else if (pageLength === 'long') {
    content += "\n\n" + content + "\n\n" + content.split('\n\n')[0];
  }
  
  return {
    prompt: request.input,
    style,
    page_length: pageLength,
    content,
    result: content
  };
}

function simulateWritingAssistant(request: AIRequest): AIResponse {
  const action = request.context.action || 'improve';
  const focusAreas = request.context.focus_areas || ['clarity', 'engagement'];
  
  let result = '';
  const originalText = request.input;
  
  switch (action) {
    case 'improve':
      result = originalText
        .replace(/simplesmente/g, 'efetivamente')
        .replace(/muito/g, 'significativamente')
        .replace(/legal/g, 'fascinante')
        .replace(/bom/g, 'excepcional')
        .replace(/ruim/g, 'preocupante')
        .replace(/triste/g, 'melancólico');
      
      if (result === originalText) {
        result = originalText + "\n\nEste texto foi aprimorado com um vocabulário mais rico e preciso, mantendo a essência da mensagem original mas elevando seu impacto.";
      }
      break;
    case 'simplify':
      result = originalText
        .replace(/no entanto/g, 'mas')
        .replace(/efetivamente/g, 'bem')
        .replace(/mediante/g, 'por')
        .replace(/conforme anteriormente mencionado/g, 'como já falei')
        .replace(/subsequente/g, 'seguinte');
      
      if (result === originalText) {
        result = originalText + "\n\nEste texto foi simplificado para usar palavras mais diretas e estruturas de frases menos complexas, tornando-o mais acessível.";
      }
      break;
    case 'expand':
      const sentences = originalText.split(/\.|\?|\!/);
      result = sentences.map(s => {
        if (s.trim().length > 3) {
          return s + (Math.random() > 0.5 ? 
            ', revelando nuances até então imperceptíveis' : 
            ', o que demonstra a complexidade da situação');
        }
        return s;
      }).join('. ');
      
      result += "\n\nO texto foi expandido com descrições mais detalhadas e contextualizações adicionais que enriquecem a narrativa.";
      break;
    case 'professional':
      result = originalText
        .replace(/acho que/g, 'considero que')
        .replace(/tipo/g, 'especificamente')
        .replace(/legal/g, 'adequado')
        .replace(/muito/g, 'consideravelmente')
        .replace(/na real/g, 'na realidade');
      
      result += "\n\nO texto foi reformulado para adotar um tom mais profissional e formal, adequado para contextos corporativos ou acadêmicos.";
      break;
    case 'creative':
      const creativeAdditions = [
        ' como estrelas dançando no céu noturno',
        ' atravessando o véu da percepção comum',
        ' desenhando novos horizontes na imaginação',
        ' como sussurros entre as folhas de outono'
      ];
      
      result = originalText + "\n\n" + originalText.split('.')[0] + 
        creativeAdditions[Math.floor(Math.random() * creativeAdditions.length)] + '.';
      
      result += "\n\nO texto foi enriquecido com elementos poéticos e metáforas que ampliam sua dimensão criativa e impacto emocional.";
      break;
    case 'grammar':
      // Simulação simples de correção gramatical
      result = originalText
        .replace(/nao /g, 'não ')
        .replace(/nao\./g, 'não.')
        .replace(/voce/g, 'você')
        .replace(/esta /g, 'está ')
        .replace(/tambem/g, 'também')
        .replace(/ja /g, 'já ')
        .replace(/obrigatorio/g, 'obrigatório')
        .replace(/mais /g, 'mas ')
        .replace(/ si /g, ' se ')
        .replace(/concerteza/g, 'com certeza');
      
      if (result === originalText) {
        result = "O texto não apresenta erros gramaticais evidentes. Continua como está:\n\n" + originalText;
      } else {
        result = "Texto com correções gramaticais:\n\n" + result;
      }
      break;
  }
  
  return {
    original_text: originalText,
    action,
    focus_areas: focusAreas,
    result
  };
}

function simulateCreativeIdeas(request: AIRequest): AIResponse {
  const ideaType = request.context.idea_type || 'plot_points';
  const numIdeas = request.context.num_ideas || 3;
  
  let ideas: string[] = [];
  
  switch (ideaType) {
    case 'plot_points':
      ideas = [
        "Uma descoberta inesperada revela que o antagonista e o protagonista compartilham um passado em comum que ambos haviam esquecido.",
        "Um objeto aparentemente insignificante mencionado no início da história torna-se crucial para a resolução do conflito principal.",
        "O aliado mais próximo do protagonista tem secretamente agendas duplas, reveladas apenas quando ambos se encontram em perigo mortal.",
        "Uma profecia antiga mal interpretada leva todos os personagens a agirem de maneira equivocada, criando consequências inesperadas.",
        "Um fenômeno natural raro força os personagens a mudarem completamente seus planos e improvisar soluções criativas."
      ];
      break;
    case 'characters':
      ideas = [
        "Uma bibliotecária aposentada que possui memória fotográfica e usa esse talento para resolver crimes locais sem sair de casa.",
        "Um chef renomado que perdeu o sentido do paladar e agora cria pratos baseando-se apenas em memórias e reações emocionais.",
        "Um adolescente que descobriu ter a habilidade de escutar pensamentos, mas apenas aqueles em idiomas que não compreende.",
        "Uma executiva bem-sucedida que leva uma vida dupla como grafiteira anônima, cujas obras começam a ganhar notoriedade.",
        "Um idoso que começou a vivenciar memórias que não são suas, levando-o a questionar sua própria identidade."
      ];
      break;
    case 'settings':
      ideas = [
        "Uma cidade futurista construída verticalmente nas copas de árvores gigantes, onde o status social é determinado pela altura em que se vive.",
        "Um arquipélago onde cada ilha tem um microclima e cultura próprios, conectados por pontes que só aparecem em determinadas fases da lua.",
        "Um deserto onde as dunas mudam de formato conforme as histórias contadas pelos viajantes, revelando caminhos ou oásis ocultos.",
        "Uma metrópole subterrânea iluminada por fungos bioluminescentes, onde os habitantes desenvolveram um sistema social baseado em trocas de luz.",
        "Um pequeno vilarejo onde os sonhos dos moradores se manifestam fisicamente durante o amanhecer, criando um cenário surreal que precisa ser navegado com cuidado."
      ];
      break;
    case 'dialogues':
      ideas = [
        "\"Você sempre soube que este dia chegaria, não é?\" ela perguntou, girando a antiga chave entre os dedos. \"Eu sabia que chegaria, mas esperava não estar vivo para vê-lo,\" ele respondeu, olhando pela janela.",
        "\"Existem três tipos de verdades neste mundo,\" o mentor explicou, \"aquelas que você conta aos outros, aquelas que conta a si mesmo, e aquelas que nem ousa sussurrar no escuro.\"",
        "\"Se pudesse voltar atrás, você faria tudo diferente?\" \"Não,\" ele respondeu sem hesitar. \"Faria exatamente o mesmo, mas desta vez apreciaria cada momento.\"",
        "\"Dizem que você pode prever o futuro,\" ela comentou casualmente. \"Não exatamente,\" ele sorriu. \"Eu apenas aprendi a criar futuros tão inevitáveis que parecem predestinados.\"",
        "\"Você acha que somos os últimos?\" perguntou a criança, observando o céu avermelhado. O velho suspirou, \"Não somos os últimos de uma espécie, pequena. Somos os primeiros de algo novo.\""
      ];
      break;
  }
  
  return {
    prompt: request.input,
    idea_type: ideaType,
    num_ideas: numIdeas,
    ideas: ideas.slice(0, numIdeas),
    result: ideas.slice(0, numIdeas).join("\n\n")
  };
}

function simulateSearch(request: AIRequest): AIResponse {
  const detailLevel = request.context.detail_level || 'medium';
  const maxResults = request.context.max_results || 3;
  
  const mockResults = [
    {
      id: 123,
      tipo: 'capitulo',
      conteudo: 'Este capítulo introduz o protagonista e seu conflito principal...',
      similaridade: 0.92
    },
    {
      id: 456,
      tipo: 'personagem',
      conteudo: 'Maria é uma mulher de 35 anos que trabalha como cientista...',
      similaridade: 0.85
    },
    {
      id: 789,
      tipo: 'cenario',
      conteudo: 'A cidade de Nova Aurora foi construída após o Grande Colapso...',
      similaridade: 0.78
    },
    {
      id: 234,
      tipo: 'nota',
      conteudo: 'Lembrar de desenvolver melhor a relação entre os personagens X e Y...',
      similaridade: 0.75
    },
    {
      id: 567,
      tipo: 'referencia',
      conteudo: 'Artigo científico sobre o fenômeno descrito no capítulo 7...',
      similaridade: 0.70
    }
  ].slice(0, maxResults);
  
  let analysis = '';
  
  switch (detailLevel) {
    case 'low':
      analysis = `Encontrados ${mockResults.length} resultados relevantes para sua busca. O resultado com maior relevância pertence à categoria ${mockResults[0].tipo}.`;
      break;
    case 'medium':
      analysis = `Sua busca retornou ${mockResults.length} resultados. O item mais relevante é um ${mockResults[0].tipo} com similaridade de ${mockResults[0].similaridade * 100}%. Os resultados abrangem categorias como ${mockResults.map(r => r.tipo).join(', ')}. Recomendo verificar principalmente o primeiro resultado para obter a informação mais precisa relacionada à sua busca.`;
      break;
    case 'high':
      analysis = `Análise detalhada dos ${mockResults.length} resultados:\n\n`;
      mockResults.forEach((result, index) => {
        analysis += `${index + 1}. ${result.tipo.toUpperCase()} (similaridade: ${result.similaridade * 100}%): ${result.conteudo.substring(0, 100)}...\n`;
        analysis += `   Relevância: ${result.similaridade > 0.9 ? 'Muito alta' : result.similaridade > 0.8 ? 'Alta' : result.similaridade > 0.7 ? 'Média' : 'Baixa'}\n`;
        analysis += `   Recomendação: ${result.similaridade > 0.8 ? 'Examine com atenção' : 'Pode conter informações úteis'}\n\n`;
      });
      analysis += `Conclusão: Os resultados indicam que as informações mais relevantes para sua busca estão concentradas em ${mockResults[0].tipo}s. A similaridade média de ${(mockResults.reduce((acc, curr) => acc + curr.similaridade, 0) / mockResults.length * 100).toFixed(1)}% sugere uma boa correspondência com sua consulta original.`;
      break;
  }
  
  return {
    query: request.input,
    detail_level: detailLevel,
    raw_results: mockResults,
    analysis,
    result: analysis
  };
}

function simulateCustom(request: AIRequest): AIResponse {
  // Processamento personalizado simulado
  const input = request.input;
  const includeEmbeddings = request.context.include_embeddings || false;
  
  let result = `Resposta personalizada para: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`;
  
  if (includeEmbeddings) {
    result += "\n\nDados de embeddings incorporados na resposta, permitindo análise contextual aprimorada.";
  }
  
  if (request.context.system_prompt) {
    result += `\n\nComportamento do assistente definido como: "${request.context.system_prompt?.substring(0, 50)}${request.context.system_prompt && request.context.system_prompt.length > 50 ? '...' : ''}"`;
  }
  
  return {
    result
  };
}