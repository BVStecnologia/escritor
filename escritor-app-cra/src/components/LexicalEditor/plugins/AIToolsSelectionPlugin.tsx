import React, { useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection,
  $setSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
  RangeSelection
} from 'lexical';
import styled from 'styled-components';
import { assistantService } from '../../../services/assistantService';
import { Spinner } from '../../styled';
import { setSelectionToolsVisible, canShowSelectionTools } from './sharedPluginState';

// Comando personalizado para aplicar resultado da IA
const APPLY_AI_RESULT_COMMAND: LexicalCommand<{text: string, savedSelection: RangeSelection}> = createCommand();

const AIToolsContainer = styled.div`
  transition: all 0.3s ease-in-out;
  position: absolute;
  z-index: 100;
  border-radius: 8px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.colors.shadow || 'rgba(0, 0, 0, 0.2)'};
  background: ${({ theme }) => theme.colors.background.paper + '95'};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0, 0, 0, 0.1)'};
  padding: 4px;
  display: flex;
  gap: 2px;
  min-width: 480px;
  transform: translateX(-50%);
  margin-top: 5px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.15s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(5px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

const ToolButton = styled.button`
  background: ${({ theme }) => theme.colors.background.paper + '90'};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 4px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 3px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  transition: all 0.15s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '20'};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
    box-shadow: 0 2px 5px ${({ theme }) => theme.colors.shadow || 'rgba(0, 0, 0, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Ferramentas de IA disponíveis na seleção
const AI_TOOLS = [
  {
    id: 'rewrite',
    icon: '✍️',
    label: 'Reescrever'
  },
  {
    id: 'expand',
    icon: '🔍',
    label: 'Expandir'
  },
  {
    id: 'summarize',
    icon: '📝',
    label: 'Resumir'
  }
];

const ResultContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper + '95'};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  padding: 12px;
  width: 400px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 16px ${({ theme }) => theme.colors.shadow || 'rgba(0, 0, 0, 0.2)'};
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  gap: 8px;
`;

interface ActionButtonProps {
  color?: 'primary' | 'error' | 'success' | 'warning';
}

const ActionButton = styled.button<ActionButtonProps & { style?: React.CSSProperties }>`
  background: ${({ theme, color }) => {
    if (!color) return theme.colors.primary;
    switch(color) {
      case 'error': return theme.colors.error || '#ef4444';
      case 'success': return theme.colors.success || '#10b981';
      case 'warning': return theme.colors.warning || '#f59e0b';
      case 'primary': 
      default: return theme.colors.primary;
    }
  }};
  color: ${({ theme }) => theme.colors.text.light || 'white'};
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadow || 'rgba(0, 0, 0, 0.2)'};
  }
`;

interface AIToolsSelectionPluginProps {
  livroId?: string;
  capituloId?: string;
}

export const AIToolsSelectionPlugin = ({
  livroId,
  capituloId
}: AIToolsSelectionPluginProps = {}) => {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  
  // Função para atualizar a visibilidade e notificar o estado compartilhado
  const updateVisibility = (visible: boolean) => {
    setIsVisible(visible);
    setSelectionToolsVisible(visible);
  };
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRootRef = useRef<HTMLElement | null>(null);
  
  // Estados para gerenciar o processamento da IA
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [currentTool, setCurrentTool] = useState('');
  const [showOriginalResult, setShowOriginalResult] = useState(false);
  const [savedSelection, setSavedSelection] = useState<RangeSelection | null>(null);
  
  // Obter referência ao elemento raiz do editor
  useEffect(() => {
    editorRootRef.current = editor.getRootElement();
  }, [editor]);
  
  // Registrar comando para aplicar resultado da IA
  useEffect(() => {
    return editor.registerCommand(
      APPLY_AI_RESULT_COMMAND,
      (payload: {text: string, savedSelection: RangeSelection}) => {
        console.log('APPLY_AI_RESULT_COMMAND recebido:', payload);
        
        editor.update(() => {
          try {
            // Usar a seleção salva em vez da seleção atual
            if (payload.savedSelection) {
              console.log('Usando seleção salva');
              // Restaurar a seleção salva
              $setSelection(payload.savedSelection);
              // Inserir o texto
              payload.savedSelection.insertText(payload.text);
              console.log('Texto inserido com sucesso');
            } else {
              console.log('Usando seleção atual (fallback)');
              // Fallback para seleção atual
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertText(payload.text);
                console.log('Texto inserido via fallback');
              } else {
                console.error('Nenhuma seleção válida encontrada');
              }
            }
          } catch (error) {
            console.error('Erro ao inserir texto:', error);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  
  // Monitor de mudanças na seleção
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();
          
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            const text = selection.getTextContent();
            
            // Verificar se a seleção tem pelo menos 3 palavras e conteúdo válido
            if (text && text.trim().length > 10) { // Requer pelo menos alguns caracteres
              // Contar palavras de forma mais rigorosa
              const words = text.trim().split(/\s+/).filter(word => word.length > 0);
              const wordCount = words.length;
              
              // Verificar se há pelo menos 3 palavras significativas
              if (wordCount < 3) {
                updateVisibility(false);
                return false;
              }
              
              // Verificar estado compartilhado para exclusão mútua
              if (!canShowSelectionTools()) {
                return false;
              }
              
              // Se o editor root element não existir, não podemos posicionar
              if (!editorRootRef.current) {
                updateVisibility(false);
                return false;
              }
              
              // Posicionar o menu na parte inferior da seleção
              const domSelection = window.getSelection();
              if (!domSelection || domSelection.rangeCount === 0) return false;
              
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              
              const editorRect = editorRootRef.current.getBoundingClientRect();
              
              // Forçar posicionamento ABAIXO da seleção
              // Obtemos a altura da linha a partir do estilo computado
              const computedStyle = window.getComputedStyle(editorRootRef.current);
              const lineHeight = parseInt(computedStyle.lineHeight) || 24;
              
              // Calculamos a posição abaixo da seleção com base na parte inferior da seleção
              // 1. rect.bottom é a coordenada Y da parte inferior da seleção
              // 2. editorRect.top é a coordenada Y do topo do editor
              // 3. Subtraindo, obtemos a posição relativa ao editor
              // 4. Adicionamos o scrollY para ajustar ao scroll da página
              // 5. Adicionamos lineHeight para ficar exatamente uma linha abaixo da seleção
              
              // Posicionamento aprimorado para garantir que fique exatamente uma linha abaixo
              const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
              const newTop = rect.bottom - editorRect.top + scrollY + lineHeight;
              let newLeft = rect.left + (rect.width / 2) - editorRect.left;
              const toolWidth = 480;
              if (newLeft + (toolWidth / 2) > editorRect.width - 20) {
                newLeft = editorRect.width - (toolWidth / 2) - 20;
              }
              if (newLeft - (toolWidth / 2) < 20) {
                newLeft = (toolWidth / 2) + 20;
              }
              setPosition({
                top: newTop,
                left: newLeft
              });
              
              setSelectedText(text);
              updateVisibility(true);
              return true;
            }
          }
          
          // Se não há seleção válida, esconder
          updateVisibility(false);
          setSelectedText('');
          return false;
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  
  // Vamos remover esse ajuste de posição por manipulação direta do DOM, 
  // pois está conflitando com os outros mecanismos de posicionamento
  
  // Esconder quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        updateVisibility(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para filtrar comentários e metadados do texto da IA
  const filterAiContent = (content: string): string => {
    if (!content) return '';
    
    try {
      console.log('Filtrando conteúdo:', content);
      
      // Primeiro, vamos dividir o conteúdo em linhas
      const lines = content.split('\n');
      const resultLines: string[] = [];
      let foundSeparator = false;
      
      // Padrões de linhas que indicam início de comentários/análise
      const commentPatterns = [
        /^#{1,3}\s*(Comentários|Observações|Análise|Sugestões|Notas)/i,
        /^\*{3,}/,
        /^-{3,}/,
        /^(Comentários|Observações|Análise|Sugestões|Notas):/i,
        /^\*\*(Comentários|Observações|Análise|Sugestões|Notas)/i
      ];
      
      // Padrões de cabeçalhos a remover (mas continuar processando)
      const headerPatterns = [
        /^#\s*Texto\s+(Expandido|Revisado|Reescrito):?\s*$/i,
        /^Texto\s+(Expandido|Revisado|Reescrito):?\s*$/i,
        /^🔍.*$/
      ];
      
      for (const line of lines) {
        // Se encontrou um separador de comentários, parar
        if (commentPatterns.some(pattern => pattern.test(line.trim()))) {
          foundSeparator = true;
          break;
        }
        
        // Pular cabeçalhos
        if (headerPatterns.some(pattern => pattern.test(line.trim()))) {
          continue;
        }
        
        // Se a linha tem conteúdo válido, adicionar
        if (line.trim() || resultLines.length > 0) {
          resultLines.push(line);
        }
      }
      
      // Juntar as linhas e limpar espaços extras
      let mainContent = resultLines.join('\n').trim();
      
      // Se ainda contém estruturas de comentário no meio do texto, tentar uma abordagem diferente
      if (!foundSeparator && mainContent.includes('**') && mainContent.includes(':')) {
        // Procurar por parágrafos que parecem ser o texto principal (sem formatação especial)
        const paragraphs = mainContent.split(/\n\n+/);
        const mainParagraphs = paragraphs.filter(para => {
          // Excluir parágrafos que parecem ser comentários ou metadados
          return !para.match(/^[\*\-#]/) && 
                 !para.includes('**Comentários') && 
                 !para.includes('**Observações') &&
                 !para.includes('**Análise') &&
                 para.length > 30;
        });
        
        if (mainParagraphs.length > 0) {
          mainContent = mainParagraphs.join('\n\n');
        }
      }
      
      console.log('Conteúdo filtrado:', mainContent);
      
      // Se após a filtragem ficou vazio ou muito curto, retornar o original
      if (!mainContent || mainContent.length < 20) {
        console.warn('Filtragem resultou em conteúdo muito curto, retornando original');
        return content;
      }
      
      return mainContent;
    } catch (error) {
      console.error("Erro ao filtrar conteúdo da IA:", error);
      // Em caso de erro, retornar o conteúdo original
      return content;
    }
  };

  // Função para aplicar o resultado da IA
  const applyAiResult = () => {
    // Por padrão, sempre filtrar o conteúdo para remover comentários
    let contentToInsert = filterAiContent(aiResult);
    
    // Se o usuário escolheu ver original, usar o conteúdo completo
    if (showOriginalResult) {
      contentToInsert = aiResult;
    }
    
    console.log('Aplicando resultado da IA:');
    console.log('- Conteúdo original:', aiResult);
    console.log('- Conteúdo filtrado:', filterAiContent(aiResult));
    console.log('- Conteúdo a inserir:', contentToInsert);
    console.log('- Modo original ativo:', showOriginalResult);
    
    if (!contentToInsert || contentToInsert.trim() === '') {
      console.error('Conteúdo vazio, não será inserido');
      alert('O conteúdo filtrado está vazio. Tente usar "Ver original" antes de aplicar.');
      return;
    }
    
    editor.dispatchCommand(APPLY_AI_RESULT_COMMAND, {
      text: contentToInsert,
      savedSelection: savedSelection!
    });
    setShowResult(false);
    setAiResult('');
    setCurrentTool('');
    setSavedSelection(null);
    setShowOriginalResult(false);
  };

  // Função para cancelar e limpar os resultados
  const cancelAiResult = () => {
    setShowResult(false);
    setAiResult('');
    setCurrentTool('');
    setShowOriginalResult(false);
    setSavedSelection(null);
  };
  
  // Função para alternar entre versão filtrada e original
  const toggleOriginalResult = () => {
    setShowOriginalResult(!showOriginalResult);
  };

  const handleToolAction = async (toolId: string) => {
    // Guarda o texto original
    const originalText = selectedText;
    setCurrentTool(toolId);
    setIsLoading(true);
    setShowResult(true); // Mostrar o modal imediatamente
    
    // Salvar a seleção atual antes de processar
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setSavedSelection(selection.clone());
      }
    });
    
    try {
      let result;
      
      switch(toolId) {
        case 'rewrite':
          result = await assistantService.writingAssistant({
            input: originalText,
            action: 'rewrite',
            focusAreas: ['clarity', 'engagement'],
            livroId,
            capituloId
          });
          break;
        case 'expand':
          result = await assistantService.writingAssistant({
            input: originalText,
            action: 'improve',
            focusAreas: ['engagement', 'flow'],
            livroId,
            capituloId
          });
          break;
        case 'summarize':
          result = await assistantService.custom({
            input: `Resumir o seguinte texto, mantendo apenas as informações mais importantes: ${originalText}`,
            systemPrompt: "Você é um assistente de escrita especializado em criar resumos concisos. Crie um resumo que mantenha apenas os pontos principais do texto original, reduzindo significativamente o tamanho sem perder as informações essenciais."
          });
          break;
      }
      
      // Extrair conteúdo da resposta
      console.log('Resposta da IA:', result);
      let responseContent = '';
      
      // Tentar extrair conteúdo de várias formas possíveis
      if (result) {
        if (typeof result === 'string') {
          responseContent = result;
        } else if (result.content) {
          if (typeof result.content === 'string') {
            responseContent = result.content;
          } else if (Array.isArray(result.content)) {
            // Formato Claude API v1
            const textContent = result.content.find((item: any) => item.type === 'text');
            if (textContent && textContent.text) {
              responseContent = textContent.text;
            } else if (result.content[0] && typeof result.content[0] === 'string') {
              responseContent = result.content[0];
            }
          }
        } else if (result.text) {
          responseContent = result.text;
        } else if (result.message) {
          responseContent = result.message;
        } else if (result.revised_text) {
          responseContent = result.revised_text;
        } else if (result.response) {
          responseContent = result.response;
        } else if (result.output) {
          responseContent = result.output;
        } else if (result.data) {
          if (typeof result.data === 'string') {
            responseContent = result.data;
          } else if (result.data.content) {
            responseContent = result.data.content;
          }
        }
      }
      
      console.log('Conteúdo extraído:', responseContent);
      
      if (responseContent) {
        setAiResult(responseContent);
        setShowResult(true);
      } else {
        console.error('Não foi possível extrair conteúdo da resposta:', result);
        // Tentar usar o resultado como string diretamente
        const fallbackContent = JSON.stringify(result);
        setAiResult(`Resposta recebida: ${fallbackContent}`);
        setShowResult(true);
      }
    } catch (error) {
      console.error(`Erro ao processar ação ${toolId}:`, error);
      setAiResult('Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      setShowResult(true);
    } finally {
      setIsLoading(false);
      updateVisibility(false);
    }
  };
  
  // Não renderizar se não estiver visível e não estiver mostrando resultados
  if (!isVisible && !showResult && !isLoading) {
    return null;
  }
  
  // Se estiver mostrando resultado ou carregando, não verificar canShowSelectionTools
  if ((showResult || isLoading) && !canShowSelectionTools()) {
    // Permitir mostrar o resultado mesmo se canShowSelectionTools retornar false
  } else if (!showResult && !isLoading && !canShowSelectionTools()) {
    return null;
  }
  
  // Renderizar resultado da IA
  if (showResult || isLoading) {
    return (
      <AIToolsContainer 
        ref={containerRef}
        style={{ 
          top: position.top, 
          left: position.left,
          width: '400px',
          transform: 'translateX(-50%)', // Centralizar
          zIndex: 9999 // Garantir que fique acima de outros elementos
        }}
      >
        <ResultContainer style={{ width: '100%' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', width: '100%' }}>
            {currentTool === 'rewrite' && '✍️ Texto Reescrito'}
            {currentTool === 'expand' && '🔍 Texto Expandido'}
            {currentTool === 'summarize' && '📝 Resumo'}
          </div>
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '100px',
              fontSize: '14px',
              color: '#666'
            }}>
              <Spinner size="small" style={{ marginRight: '10px' }} />
              Processando seu texto...
            </div>
          ) : (
            <div style={{ 
              fontSize: '13px', 
              lineHeight: '1.4', 
              whiteSpace: 'pre-wrap',
              width: '100%',
              minHeight: '50px',
              padding: '10px',
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              {aiResult || 'Nenhum conteúdo gerado. Por favor, tente novamente.'}
            </div>
          )}
          {!isLoading && (
            <ButtonRow style={{ width: '100%', justifyContent: 'space-between', marginTop: '10px' }}>
              <div>
                {aiResult && (
                  <ActionButton 
                    onClick={toggleOriginalResult} 
                    color={showOriginalResult ? "primary" : "warning"}
                    style={{ marginRight: '5px' }}
                  >
                    {showOriginalResult ? "Ver filtrado" : "Ver original"}
                  </ActionButton>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <ActionButton onClick={cancelAiResult} color="error">
                  Cancelar
                </ActionButton>
                {aiResult && (
                  <ActionButton onClick={applyAiResult}>
                    Aplicar
                  </ActionButton>
                )}
              </div>
            </ButtonRow>
          )}
        </ResultContainer>
      </AIToolsContainer>
    );
  }
  
  // Renderizar menu de ferramentas
  return (
    <AIToolsContainer 
      ref={containerRef}
      style={{ 
        top: position.top, 
        left: position.left,
        zIndex: 9999 // Garantir que fique acima de outros elementos
      }}
    >
      {isLoading ? (
        <ToolButton disabled>
          <Spinner size="small" /> Processando...
        </ToolButton>
      ) : (
        AI_TOOLS.map(tool => (
          <ToolButton 
            key={tool.id}
            onClick={() => handleToolAction(tool.id)}
            title={tool.label}
          >
            {tool.icon} {tool.label}
          </ToolButton>
        ))
      )}
    </AIToolsContainer>
  );
};