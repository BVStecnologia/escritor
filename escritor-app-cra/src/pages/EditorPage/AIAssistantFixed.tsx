import React, { useState, useEffect, useRef } from 'react';
import { assistantService } from '../../services/assistantService';
import { AIBrainIcon, LightbulbIcon, SendIcon, CollapseLeftIcon, CollapseRightIcon } from '../../components/icons';
import { FiCheck, FiCopy } from 'react-icons/fi';
import styled from 'styled-components';
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
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 90%;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  background: ${({ $isUser, theme }) => 
    $isUser ? theme.colors.primary + '15' : theme.colors.background.glass};
  border: 1px solid ${({ $isUser, theme }) => 
    $isUser ? theme.colors.primary + '30' : theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  color: ${({ theme }) => theme.colors.text.primary};
  
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
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  fullContent?: string;
}

export const AIAssistantFixed: React.FC<AIAssistantFixedProps> = ({
  bookId,
  chapterId
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
      let mensagem = '';
      try {
        if (bookId) {
          const livro = await dbService.getLivroPorId(Number(bookId));
          let infoLivro = '';
          if (livro.sinopse) infoLivro += `\nSinopse: ${livro.sinopse}`;
          if (livro.genero) infoLivro += `\nGênero: ${livro.genero}`;
          if (livro.ambientacao) infoLivro += `\nAmbiente: ${livro.ambientacao}`;
          if (livro.palavras_chave) infoLivro += `\nPalavras-chave: ${livro.palavras_chave}`;
          let personagens: Personagem[] = [];
          try {
            personagens = await dbService.getPersonagens(String(livro.id));
          } catch {}
          if (personagens && personagens.length > 0) {
            const nomes = personagens.slice(0, 3).map(p => p.nome).join(', ');
            infoLivro += `\nPersonagens principais: ${nomes}${personagens.length > 3 ? ' e outros' : ''}`;
          }
          let notas = [];
          try {
            notas = await dbService.getNotas(String(livro.id));
          } catch {}
          if (chapterId) {
            const capitulo = await dbService.getCapituloPorId(String(chapterId));
            mensagem = `Pronto para continuar sua jornada em "${capitulo.titulo}"? Este é o capítulo ${capitulo.ordem || ''}${capitulo.palavras ? `, com ${capitulo.palavras} palavras` : ''}. Lembre-se: cada capítulo é uma nova oportunidade para surpreender o leitor.\n${infoLivro}`;
          } else {
            mensagem = `Bem-vindo ao seu livro "${livro.titulo || livro["Nome do livro"]}"!${infoLivro}\n${notas.length > 0 ? `Você tem ${notas.length} anotações para este livro.` : ''}\nComece a escrever sua história, ou peça sugestões criativas para dar o pontapé inicial!`;
          }
        } else {
          mensagem = 'Olá! Sou seu assistente de escrita. Como posso ajudar com seu livro hoje? Você pode me pedir ideias, sugestões, revisão ou inspiração para começar.';
        }
      } catch (e) {
        mensagem = 'Olá! Sou seu assistente de escrita. Como posso ajudar com seu livro hoje?';
      }
      setMessages([{ role: 'assistant', content: mensagem }]);
    }
    setMensagemInspiradora();
  }, [bookId, chapterId]);

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

  const aiSuggestions = [
    { icon: <LightbulbIcon />, text: "Melhorar a descrição desta cena" },
    { icon: <LightbulbIcon />, text: "Adicionar mais diálogo" },
    { icon: <LightbulbIcon />, text: "Desenvolver conflito" },
    { icon: <LightbulbIcon />, text: "Expandir caracterização" },
    { icon: <LightbulbIcon />, text: "Revisar ritmo narrativo" }
  ];

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
    
    try {
      // Montar o histórico das últimas 8 mensagens (usuário e assistente)
      const historico = [...messages, userMessage].slice(-8)
        .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
        .join('\n');

      const systemPrompt = `Você é um assistente de escrita criativa especializado em ajudar autores a melhorarem seus textos.\nSeja conciso, específico e útil.\n\nHistórico da conversa até aqui:\n${historico}\n\nResponda de forma natural, sem repetir o que já foi dito.`;

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
      
      // Iniciar com apenas os primeiros caracteres e definir isTyping como true
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: assistantContent.substring(0, 1), // Começa com apenas o primeiro caractere
        fullContent: assistantContent, // Guarda o conteúdo completo
        isTyping: true
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erro ao enviar prompt:', error);
      console.log('Detalhes completos do erro:', JSON.stringify(error, null, 2));
      
      // Criar mensagem de erro mais amigável
      let errorContent = 'Desculpe, não foi possível obter resposta do assistente. ';
      
      if (error.message?.includes('Failed to send a request')) {
        errorContent += 'Não foi possível conectar com o serviço de IA. Por favor, verifique sua conexão com a internet e tente novamente.';
      } else if (error.message?.includes('timeout')) {
        errorContent += 'O tempo de resposta esgotou. O serviço pode estar sobrecarregado no momento. Tente novamente mais tarde.';
      } else if (error.message?.includes('CORS')) {
        errorContent += 'Erro de permissão de acesso ao servidor. Entre em contato com o suporte.';
      } else if (error instanceof Error) {
        errorContent += error.message;
      }
      
      const errorMessage: Message = { role: 'assistant', content: errorContent };
      setMessages(prev => [...prev, errorMessage]);
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

      {!isOpen ? renderCollapsed() : (
        <>
          <AIContent $isOpen={isOpen}>
            {messages.length > 0 ? (
              <AIConversation>
                {messages.map((message, index) => (
                  <AIMessage key={index} $isUser={message.role === 'user'} style={{ position: 'relative' }}>
                    {message.content}
                    {message.role === 'assistant' && (
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
                {isLoading && (
                  <AIMessage>
                    Pensando...
                  </AIMessage>
                )}
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
                placeholder="Peça ajuda com seu texto..."
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