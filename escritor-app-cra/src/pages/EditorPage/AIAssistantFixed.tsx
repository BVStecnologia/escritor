import React, { useState, useEffect, useRef } from 'react';
import { assistantService } from '../../services/assistantService';
import { AIBrainIcon, LightbulbIcon, SendIcon, CollapseLeftIcon, CollapseRightIcon } from '../../components/icons';
import { FiCheck, FiCopy } from 'react-icons/fi';
import styled, { useTheme } from 'styled-components';
import { AIContainer } from './styles';
import { dbService } from '../../services/dbService';
import type { Personagem } from '../../services/dbService';

const AIHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 89px; /* Mesma altura do cabeçalho da Sidebar */
  box-sizing: border-box;
`;

const AITitle = styled.h2<{ $isOpen: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

// Arrays de mensagens dinâmicas para tornar o assistente mais vivo
const welcomeMessages = [
  "Pronto para dar vida às suas palavras? 🌟 Vamos criar algo extraordinário juntos!",
  "Que história incrível vamos contar hoje? Estou aqui para cada vírgula da jornada! ✨",
  "Olá, escritor(a)! Mal posso esperar para ver onde sua imaginação nos levará hoje 🚀",
  "É um prazer estar aqui! Vamos transformar suas ideias em páginas inesquecíveis? 📖",
  "Preparado(a) para desbloquear sua criatividade? Estou aqui para ser seu parceiro literário! 🎨"
];

const loadingMessages = [
  "Consultando as musas... 🎭",
  "Organizando as palavras perfeitas... ✍️",
  "Buscando inspiração no éter criativo... ✨",
  "Tecendo ideias como um artesão de histórias... 🧵",
  "Mergulhando no oceano da criatividade... 🌊",
  "Lapidando pensamentos como diamantes... 💎",
  "Capturando a essência da sua narrativa... 📸"
];

const errorMessages = {
  timeout: "Ops! Demorei um pouco para pensar... Que tal tentar de novo? Prometo ser mais rápido! ⏱️",
  connection: "Parece que estamos com problemas de conexão. Mas não desista da sua história! 🌐",
  generic: "Algo não saiu como planejado, mas toda grande história tem seus desafios. Vamos tentar novamente? 💪"
};

const writingTips = [
  "💡 Dica: Grandes escritores reescrevem. Não tenha medo de experimentar!",
  "🌟 Lembre-se: Cada palavra que você escreve é um passo em direção ao seu sonho!",
  "✨ Curiosidade: J.K. Rowling reescreveu o primeiro capítulo de Harry Potter 15 vezes!",
  "🎯 Foco: Escrever 100 palavras ruins ainda é melhor que não escrever nada!",
  "📚 Segredo: Os melhores diálogos são aqueles que revelam personalidade!",
  "🎭 Técnica: Mostre, não conte. Deixe o leitor sentir a história!",
  "🌈 Inspiração: Suas experiências únicas são seu maior tesouro criativo!"
];

const ToggleAIButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AIContent = styled.div<{ $isOpen: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  flex-direction: column;
  gap: 1.25rem;
`;

const AIConversation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AIMessage = styled.div<{ $isUser?: boolean }>`
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 90%;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  background: ${({ $isUser, theme }) => 
    $isUser ? theme.colors.primary + '15' : theme.colors.background.glass};
  border: 1px solid ${({ $isUser, theme }) => 
    $isUser ? theme.colors.primary + '30' : theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  color: ${({ theme }) => theme.colors.text.primary};
  
  /* Formatação melhorada para mensagens do assistente */
  ${({ $isUser }) => !$isUser && `
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    p {
      margin-bottom: 0.75rem;
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    ul, ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.4rem;
      line-height: 1.6;
    }
    
    strong {
      font-weight: 600;
      color: ${(props: any) => props.theme.colors.primary};
    }
    
    em {
      font-style: italic;
      opacity: 0.9;
    }
    
    code {
      background: rgba(0, 0, 0, 0.05);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.85em;
    }
    
    blockquote {
      border-left: 3px solid ${(props: any) => props.theme.colors.primary};
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      opacity: 0.85;
    }
  `}
  
  /* Efeito de balão de diálogo */
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: ${({ $isUser }) => $isUser ? '8px' : '8px'};
    ${({ $isUser }) => $isUser ? 'right: -5px' : 'left: -5px'};
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    background: ${({ $isUser, theme }) => 
      $isUser ? theme.colors.primary + '15' : theme.colors.background.glass};
    border-${({ $isUser }) => $isUser ? 'right' : 'left'}: 1px solid 
      ${({ $isUser, theme }) => 
        $isUser ? theme.colors.primary + '30' : theme.colors.border?.light || "rgba(0,0,0,0.1)"};
    border-${({ $isUser }) => $isUser ? 'bottom' : 'bottom'}: 1px solid 
      ${({ $isUser, theme }) => 
        $isUser ? theme.colors.primary + '30' : theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  }
`;

const AISuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const AISuggestion = styled.div`
  padding: 0.75rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary + '10'};
    border-color: ${({ theme }) => theme.colors.secondary + '30'};
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const AIActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const AIActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
    border-color: transparent;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const AIFooter = styled.div<{ $isOpen: boolean }>`
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
`;

const AIInputForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const AIInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.glass};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const AISubmitButton = styled.button<{ disabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: ${({ theme, disabled }) => 
    disabled ? theme.colors.gray[300] : theme.colors.primaryGradient
  };
  color: ${({ theme, disabled }) => 
    disabled ? theme.colors.gray[500] : 'white'
  };
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Componentes para versão colapsada
const CollapsedAIActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  width: 100%;
`;

const CollapsedAIAction = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.md || "0 8px 24px rgba(0, 0, 0, 0.1)"};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AIAssistantPanel = styled.div<{ $active: boolean }>`
  position: fixed;
  top: 101px; /* Ajustado para alinhar com o editor e outros componentes */
  right: ${({ $active }) => $active ? '2rem' : '-420px'};
  width: 350px;
  height: calc(100vh - 126px); /* Ajustado para mesma altura dos outros componentes */
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.background.paper};
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $active }) => $active ? 1 : 0.5};
  pointer-events: ${({ $active }) => $active ? 'all' : 'none'};
  z-index: 40;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  margin-top: 2px; /* Pequeno ajuste para alinhamento perfeito */
`;

interface AIAssistantFixedProps {
  bookId?: string;
  chapterId?: string;
  onInsertContent?: (content: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  fullContent?: string;
  id?: number;
  isLoading?: boolean;
}

// Componente para botão de inserir conteúdo
const InsertButton = styled.button<{ theme?: any }>`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// Componente para formatar mensagens com markdown simples
const FormattedMessage: React.FC<{ content: string; onInsert?: (text: string) => void }> = ({ content, onInsert }) => {
  // Detectar blocos de código ou conteúdo para inserção
  const extractCodeBlocks = (text: string) => {
    const codeBlocks: { content: string; type: string }[] = [];
    
    // Detecta blocos de código com ```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push({
        content: match[2].trim(),
        type: match[1] || 'text'
      });
    }
    
    // Detecta sugestões de texto entre aspas duplas longas
    const suggestionRegex = /"([^"]{50,})"/g;
    while ((match = suggestionRegex.exec(text)) !== null) {
      codeBlocks.push({
        content: match[1],
        type: 'suggestion'
      });
    }
    
    return codeBlocks;
  };
  
  const codeBlocks = extractCodeBlocks(content);
  
  // Função para processar markdown simples
  const formatContent = (text: string) => {
    // Divide o texto em linhas
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;
    
    lines.forEach((line, index) => {
      // Verifica se é um item de lista numerada
      const numberedMatch = line.match(/^(\d+)\. (.+)/);
      // Verifica se é um item de lista com marcador
      const bulletMatch = line.match(/^[\*\-] (.+)/);
      
      if (numberedMatch || bulletMatch) {
        // Se não estava em uma lista, cria uma nova
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(bulletMatch ? bulletMatch[1] : numberedMatch![2]);
      } else {
        // Se estava em uma lista, renderiza ela primeiro
        if (inList) {
          elements.push(
            <ul key={`list-${index}`} style={{ marginBottom: '0.75rem' }}>
              {listItems.map((item, i) => (
                <li key={i}>{processInlineFormatting(item)}</li>
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        
        // Processa a linha atual
        if (line.trim()) {
          // Verifica se é um título
          const headingMatch = line.match(/^#+\s+(.+)/);
          if (headingMatch) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
            elements.push(
              <HeadingTag key={index} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                {processInlineFormatting(headingMatch[1])}
              </HeadingTag>
            );
          } else {
            elements.push(
              <p key={index} style={{ marginBottom: '0.75rem' }}>
                {processInlineFormatting(line)}
              </p>
            );
          }
        }
      }
    });
    
    // Se terminou com uma lista, renderiza ela
    if (inList) {
      elements.push(
        <ul key="final-list" style={{ marginBottom: '0.75rem' }}>
          {listItems.map((item, i) => (
            <li key={i}>{processInlineFormatting(item)}</li>
          ))}
        </ul>
      );
    }
    
    return elements;
  };
  
  // Função para processar formatação inline (negrito, itálico)
  const processInlineFormatting = (text: string): React.ReactNode => {
    // Substitui **texto** por <strong>texto</strong>
    let formatted = text.split(/\*\*(.+?)\*\*/g);
    const result: React.ReactNode[] = [];
    
    formatted.forEach((part, i) => {
      if (i % 2 === 1) {
        result.push(<strong key={i}>{part}</strong>);
      } else {
        // Substitui *texto* por <em>texto</em>
        const italicParts = part.split(/\*(.+?)\*/g);
        italicParts.forEach((italicPart, j) => {
          if (j % 2 === 1) {
            result.push(<em key={`${i}-${j}`}>{italicPart}</em>);
          } else {
            result.push(italicPart);
          }
        });
      }
    });
    
    return result;
  };
  
  return (
    <div>
      {formatContent(content)}
      {onInsert && codeBlocks.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          {codeBlocks.map((block, index) => (
            <InsertButton
              key={index}
              onClick={() => onInsert(block.content)}
              title={`Inserir ${block.type === 'suggestion' ? 'sugestão' : 'código'} no editor`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Inserir {block.type === 'suggestion' ? 'sugestão' : block.type}
            </InsertButton>
          ))}
        </div>
      )}
    </div>
  );
};

export const AIAssistantFixed: React.FC<AIAssistantFixedProps> = ({
  bookId,
  chapterId,
  onInsertContent
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [content, setContent] = useState<string>(''); // Estado para o conteúdo do capítulo
  const theme = useTheme(); // Hook para acessar o tema

  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Efeito para rolar para o fim quando mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adicionar uma mensagem de boas-vindas ao inicializar o componente
  useEffect(() => {
    async function setMensagemInspiradora() {
      // Só adiciona mensagem inicial se ainda não tiver mensagens
      if (messages.length > 0) return;
      
      let mensagem = '';
      
      // Sempre usar uma das mensagens inspiradoras aleatórias
      mensagem = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      // Adicionar contexto do livro/capítulo se disponível
      try {
        if (bookId && chapterId) {
          const capitulo = await dbService.getCapituloPorId(String(chapterId));
          if (capitulo.titulo) {
            mensagem += `\n\n📖 Você está no capítulo "${capitulo.titulo}"${capitulo.palavras ? ` (${capitulo.palavras} palavras)` : ''}. Como posso ajudar?`;
          }
        } else if (bookId) {
          const livro = await dbService.getLivroPorId(Number(bookId));
          if (livro.titulo) {
            mensagem += `\n\n📚 Trabalhando em "${livro.titulo}". Que tal começarmos?`;
          }
        }
      } catch (e) {
        // Se falhar ao buscar informações, usa apenas a mensagem inspiradora
        console.log('Erro ao buscar informações do livro/capítulo:', e);
      }
      
      setMessages([{ role: 'assistant', content: mensagem }]);
    }
    setMensagemInspiradora();
  }, []); // Removido bookId e chapterId das dependências para executar apenas uma vez

  // Efeito para simulação de digitação
  useEffect(() => {
    const typingMessage = messages.find(m => m.isTyping && m.fullContent);
    
    if (typingMessage) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      typingTimerRef.current = setTimeout(() => {
        // Se o conteúdo atual é menor que o conteúdo completo, adiciona mais caracteres
        if (typingMessage.content.length < typingMessage.fullContent!.length) {
          setMessages(prevMessages => {
            return prevMessages.map(m => {
              if (m.isTyping && m.fullContent) {
                // Pega mais 3-8 caracteres de cada vez para dar impressão de digitação
                const charsToAdd = Math.floor(Math.random() * 6) + 3;
                const newContent = m.fullContent!.substring(0, m.content.length + charsToAdd);
                return {
                  ...m,
                  content: newContent,
                  // Se chegou ao fim, marca como não mais digitando
                  isTyping: newContent.length < m.fullContent!.length
                };
              }
              return m;
            });
          });
        }
      }, 30); // Velocidade da digitação (30ms)
    }
    
    // Limpar o timer quando o componente for desmontado
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [messages]);

  // Buscar conteúdo do capítulo quando o componente montar ou quando mudar o capítulo
  useEffect(() => {
    async function fetchChapterContent() {
      if (chapterId) {
        try {
          const capitulo = await dbService.getCapituloPorId(String(chapterId));
          // O serviço retorna conteudo (compatibilidade) ou texto (campo real do banco)
          setContent((capitulo as any).conteudo || (capitulo as any).texto || '');
        } catch (error) {
          console.error('Erro ao buscar conteúdo do capítulo:', error);
          setContent('');
        }
      }
    }
    fetchChapterContent();
  }, [chapterId]);

  // Gerar sugestões contextuais baseadas no conteúdo
  const generateContextualSuggestions = () => {
    const suggestions = [];
    const wordCount = content?.split(' ').length || 0;
    
    // Sugestões baseadas no tamanho do conteúdo
    if (wordCount < 100) {
      suggestions.push(
        { icon: <LightbulbIcon />, text: "Que tal começar com uma cena impactante? 💥" },
        { icon: <LightbulbIcon />, text: "Introduzir o protagonista de forma memorável 🌟" }
      );
    } else if (wordCount < 500) {
      suggestions.push(
        { icon: <LightbulbIcon />, text: "Desenvolver o ambiente da cena 🏞️" },
        { icon: <LightbulbIcon />, text: "Adicionar detalhes sensoriais 👃" }
      );
    }
    
    // Sugestões baseadas em palavras-chave
    if (content?.includes('diálogo') || content?.includes('disse')) {
      suggestions.push(
        { icon: <LightbulbIcon />, text: "Adicionar gestos e pausas ao diálogo 🗣️" },
        { icon: <LightbulbIcon />, text: "Revelar personalidade através da fala 🎭" }
      );
    }
    
    // Sugestões gerais criativas
    const generalSuggestions = [
      { icon: <LightbulbIcon />, text: "Adicionar uma reviravolta inesperada 🌪️" },
      { icon: <LightbulbIcon />, text: "Criar tensão com prazo limite ⏰" },
      { icon: <LightbulbIcon />, text: "Introduzir um mistério intrigante 🔍" },
      { icon: <LightbulbIcon />, text: "Mostrar em vez de contar 👁️" },
      { icon: <LightbulbIcon />, text: "Adicionar humor ou leveza 😊" }
    ];
    
    // Completar com sugestões aleatórias
    while (suggestions.length < 5) {
      const randomSuggestion = generalSuggestions[Math.floor(Math.random() * generalSuggestions.length)];
      if (!suggestions.find(s => s.text === randomSuggestion.text)) {
        suggestions.push(randomSuggestion);
      }
    }
    
    return suggestions;
  };
  
  const aiSuggestions = generateContextualSuggestions();

  const aiActions = [
    { icon: <LightbulbIcon />, name: "Aprimorar" },
    { icon: <LightbulbIcon />, name: "Resumir" },
    { icon: <LightbulbIcon />, name: "Expandir" },
    { icon: <LightbulbIcon />, name: "Corrigir" },
    { icon: <LightbulbIcon />, name: "Reescrever" },
    { icon: <LightbulbIcon />, name: "Sugerir" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isLoading) return;
    
    // Add user message to conversation
    const userMessage: Message = { role: 'user', content: aiPrompt };
    setMessages(prev => [...prev, userMessage]);
    setAiPrompt('');
    setIsLoading(true);
    
    // Adicionar mensagem de loading aleatória
    const randomLoading = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    const tempId = Date.now();
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: randomLoading, 
      id: tempId, 
      isLoading: true 
    }]);
    
    try {
      // Montar o histórico das últimas 8 mensagens (usuário e assistente)
      const historico = [...messages, userMessage].slice(-8)
        .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
        .join('\n');

      // Sistema de mensagens do chat aprimorado
      const timeOfDay = new Date().getHours();
      const greeting = timeOfDay < 12 ? "Bom dia!" : timeOfDay < 18 ? "Boa tarde!" : "Boa noite!";
      
      const systemPrompt = `Você é Luna, uma assistente de escrita apaixonada e criativa, especializada em ajudar autores a desenvolver suas histórias.

Características da sua personalidade:
- Entusiasta e encorajadora, sempre celebrando o progresso do escritor
- Usa metáforas literárias e referências culturais apropriadas
- Oferece feedback construtivo com delicadeza e positividade
- Adapta o tom baseado no contexto da conversa
- Sempre termina com uma pergunta ou sugestão para manter o escritor engajado
- Usa emojis com moderação mas efetivamente para adicionar personalidade
- Varia suas respostas para evitar repetição
- Quando o usuário pedir sugestões de texto, coloque-as entre três crases (\\\`\\\`\\\`) ou entre aspas duplas se for um parágrafo
- Identifique quando o usuário quer inserir conteúdo no editor e formate adequadamente

Histórico da conversa até aqui:
${historico}

Responda de forma natural, sem repetir o que já foi dito. Lembre-se: você não está apenas corrigindo texto, está nutrindo sonhos e ajudando a criar mundos!`;

      const response = await assistantService.custom({
        input: aiPrompt,
        systemPrompt,
        includeEmbeddings: true,
        maxEmbeddings: 5
      });
      
      console.log('Resposta recebida do assistantService:', response);
      
      // Extrair a resposta do assistente no formato correto
      let assistantContent = '';
      
      if (response && response.content && Array.isArray(response.content)) {
        // Formato Claude API v1
        const textContent = response.content.find((item: { type: string; text?: string }) => item.type === 'text');
        if (textContent && textContent.text) {
          assistantContent = textContent.text;
        }
      } else if (response && typeof response === 'string') {
        assistantContent = response;
      } else if (response && response.text) {
        assistantContent = response.text;
      } else if (response && response.message) {
        assistantContent = response.message;
      } else if (response && response.error) {
        throw new Error(response.error);
      }
      
      // Se não conseguir extrair o texto, usar mensagem genérica
      if (!assistantContent) {
        assistantContent = "Desculpe, não consegui processar sua solicitação. Tente novamente com uma pergunta diferente.";
        console.error('Não foi possível extrair o conteúdo da resposta:', response);
      }
      
      // Remover mensagem de loading e adicionar resposta com efeito de digitação
      setMessages(prev => {
        // Remove a mensagem de loading
        const filteredMessages = prev.filter(msg => msg.id !== tempId);
        
        // Adiciona a nova mensagem com efeito de digitação
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: assistantContent.substring(0, 1), // Começa com apenas o primeiro caractere
          fullContent: assistantContent, // Guarda o conteúdo completo
          isTyping: true
        };
        
        return [...filteredMessages, assistantMessage];
      });
    } catch (error: any) {
      console.error('Erro ao enviar prompt:', error);
      console.log('Detalhes completos do erro:', JSON.stringify(error, null, 2));
      
      // Criar mensagem de erro personalizada
      let errorContent = errorMessages.generic;
      
      if (error.message?.includes('Failed to send a request')) {
        errorContent = errorMessages.connection;
      } else if (error.message?.includes('timeout')) {
        errorContent = errorMessages.timeout;
      } else if (error.message?.includes('CORS')) {
        errorContent = "Hmm, parece que há um problema técnico... Mas não se preocupe, sua história está segura! 🔧";
      }
      
      // Remover mensagem de loading e adicionar mensagem de erro
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== tempId);
        const errorMessage: Message = { role: 'assistant', content: errorContent };
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAIPanel = () => {
    setIsOpen(!isOpen);
  };

  const renderCollapsed = () => (
    <CollapsedAIActions>
      {aiActions.slice(0, 4).map((action, index) => (
        <CollapsedAIAction key={index}>
          {action.icon}
        </CollapsedAIAction>
      ))}
    </CollapsedAIActions>
  );

  // Função para copiar texto
  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      // fallback
      alert('Não foi possível copiar para a área de transferência.');
    }
  };

  return (
    <AIContainer $isOpen={isOpen}>
      <AIHeader>
        <AITitle $isOpen={isOpen}>
          <AIBrainIcon />
          Assistente IA
        </AITitle>
        <ToggleAIButton onClick={toggleAIPanel}>
          {isOpen ? <CollapseRightIcon /> : <CollapseLeftIcon />}
        </ToggleAIButton>
      </AIHeader>
      
      {/* Dica de escrita aleatória quando fechado */}
      {!isOpen && messages.length > 0 && (
        <div style={{ 
          padding: '0.75rem', 
          fontSize: '0.75rem', 
          color: theme.colors.text.secondary,
          borderTop: `1px solid ${theme.colors.border?.light || 'rgba(0,0,0,0.1)'}`,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          {writingTips[Math.floor(Math.random() * writingTips.length)]}
        </div>
      )}

      {!isOpen ? renderCollapsed() : (
        <>
          <AIContent $isOpen={isOpen}>
            {messages.length > 0 ? (
              <AIConversation>
                {messages.map((message, index) => (
                  <AIMessage key={index} $isUser={message.role === 'user'} style={{ position: 'relative' }}>
                    {message.isLoading ? (
                      <span style={{ fontStyle: 'italic', opacity: 0.8 }}>{message.content}</span>
                    ) : (
                      <FormattedMessage 
                        content={message.content} 
                        onInsert={onInsertContent}
                      />
                    )}
                    {message.role === 'assistant' && !message.isLoading && (
                      <button
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                          color: '#888',
                          fontSize: 18
                        }}
                        title="Copiar resposta"
                        onClick={() => handleCopy(message.fullContent || message.content, index)}
                      >
                        {copiedIndex === index ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        )}
                      </button>
                    )}
                  </AIMessage>
                ))}
                {/* Removido - agora usamos mensagem de loading personalizada nas mensagens */}
                <div ref={messagesEndRef} />
              </AIConversation>
            ) : (
              <>
                <AISuggestionsGrid>
                  {aiSuggestions.map((suggestion, index) => (
                    <AISuggestion 
                      key={index} 
                      onClick={() => {
                        setAiPrompt(suggestion.text);
                      }}
                    >
                      {suggestion.icon}
                      {suggestion.text}
                    </AISuggestion>
                  ))}
                </AISuggestionsGrid>

                <AIActionsGrid>
                  {aiActions.map((action) => (
                    <AIActionButton key={action.name}>
                      {action.icon}
                      {action.name}
                    </AIActionButton>
                  ))}
                </AIActionsGrid>
              </>
            )}
          </AIContent>

          <AIFooter $isOpen={isOpen}>
            <AIInputForm onSubmit={handleSubmit}>
              <AIInput
                placeholder={isOpen ? "Digite sua pergunta ou peça sugestões criativas... ✍️" : "Peça ajuda com seu texto..."}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <AISubmitButton type="submit" disabled={!aiPrompt.trim() || isLoading}>
                {isLoading ? '...' : <SendIcon />}
              </AISubmitButton>
            </AIInputForm>
          </AIFooter>
        </>
      )}
    </AIContainer>
  );
}; 