import React, { useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand
} from 'lexical';
import styled from 'styled-components';
import { assistantService } from '../../../services/assistantService';
import { Spinner } from '../../styled';

// Comando personalizado para aplicar resultado da IA
const APPLY_AI_RESULT_COMMAND: LexicalCommand<string> = createCommand();

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
  min-width: 360px;
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
  width: 300px;
  max-height: 250px;
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

const ActionButton = styled.button<ActionButtonProps>`
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRootRef = useRef<HTMLElement | null>(null);
  
  // Estados para gerenciar o processamento da IA
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [currentTool, setCurrentTool] = useState('');
  
  // Obter referência ao elemento raiz do editor
  useEffect(() => {
    editorRootRef.current = editor.getRootElement();
  }, [editor]);
  
  // Registrar comando para aplicar resultado da IA
  useEffect(() => {
    return editor.registerCommand(
      APPLY_AI_RESULT_COMMAND,
      (payload: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(payload);
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
            
            // Verificar se a seleção tem pelo menos 3 palavras
            if (text && text.trim().length > 2) {
              const wordCount = text.trim().split(/\s+/).length;
              
              if (wordCount < 3) {
                setIsVisible(false);
                return false;
              }
              
              // Se o editor root element não existir, não podemos posicionar
              if (!editorRootRef.current) {
                setIsVisible(false);
                return false;
              }
              
              // Posicionar o menu na parte inferior da seleção
              const domSelection = window.getSelection();
              if (!domSelection || domSelection.rangeCount === 0) return false;
              
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              
              const editorRect = editorRootRef.current.getBoundingClientRect();
              
              // Posicionar no centro e abaixo da seleção
              const newTop = rect.bottom - editorRect.top + 10; // Um pouco abaixo da seleção
              let newLeft = rect.left + (rect.width / 2) - editorRect.left;
              const toolWidth = 360;
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
              setIsVisible(true);
              return true;
            }
          }
          
          // Se não há seleção válida, esconder
          setIsVisible(false);
          setSelectedText('');
          return false;
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  
  // Ajustar posição do menu
  useEffect(() => {
    if (containerRef.current && isVisible && editorRootRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const editorRect = editorRootRef.current.getBoundingClientRect();
      let adjustedLeft = position.left;
      if (adjustedLeft + (containerRect.width / 2) > editorRect.width - 10) {
        adjustedLeft = editorRect.width - (containerRect.width / 2) - 10;
      }
      if (adjustedLeft - (containerRect.width / 2) < 10) {
        adjustedLeft = (containerRect.width / 2) + 10;
      }
      let adjustedTop = position.top;
      if (adjustedTop + containerRect.height > editorRect.height - 10) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          adjustedTop = rect.top - editorRect.top - containerRect.height - 5 + window.scrollY;
        }
      }
      adjustedTop = Math.max(10, adjustedTop);
      container.style.left = `${adjustedLeft}px`;
      container.style.top = `${adjustedTop}px`;
    }
  }, [isVisible, position, containerRef]);
  
  // Esconder quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para aplicar o resultado da IA
  const applyAiResult = () => {
    editor.dispatchCommand(APPLY_AI_RESULT_COMMAND, aiResult);
    setShowResult(false);
    setAiResult('');
    setCurrentTool('');
  };

  // Função para cancelar e limpar os resultados
  const cancelAiResult = () => {
    setShowResult(false);
    setAiResult('');
    setCurrentTool('');
  };

  const handleToolAction = async (toolId: string) => {
    // Guarda o texto original
    const originalText = selectedText;
    setCurrentTool(toolId);
    setIsLoading(true);
    
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
      let responseContent = '';
      
      if (result && result.content && Array.isArray(result.content)) {
        // Formato Claude API v1
        const textContent = result.content.find((item: { type: string; text?: string }) => item.type === 'text');
        if (textContent && textContent.text) {
          responseContent = textContent.text;
        }
      } else if (result && typeof result === 'string') {
        responseContent = result;
      } else if (result && result.text) {
        responseContent = result.text;
      } else if (result && result.message) {
        responseContent = result.message;
      } else if (result && result.content) {
        responseContent = result.content;
      } else if (result && result.revised_text) {
        responseContent = result.revised_text;
      }
      
      if (responseContent) {
        setAiResult(responseContent);
        setShowResult(true);
      } else {
        throw new Error('Resposta inválida do assistente');
      }
    } catch (error) {
      console.error(`Erro ao processar ação ${toolId}:`, error);
      setAiResult('Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      setShowResult(true);
    } finally {
      setIsLoading(false);
      setIsVisible(false);
    }
  };
  
  // Não renderizar se não estiver visível e não estiver mostrando resultados
  if (!isVisible && !showResult) {
    return null;
  }
  
  // Renderizar resultado da IA
  if (showResult) {
    return (
      <AIToolsContainer 
        ref={containerRef}
        style={{ 
          top: position.top, 
          left: position.left,
          width: '300px',
          transform: 'translateX(-50%)' // Centralizar
        }}
      >
        <ResultContainer>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            {currentTool === 'rewrite' && '✍️ Texto Reescrito'}
            {currentTool === 'expand' && '🔍 Texto Expandido'}
            {currentTool === 'summarize' && '📝 Resumo'}
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
            {aiResult}
          </div>
          <ButtonRow>
            <ActionButton onClick={cancelAiResult} color="error">
              Cancelar
            </ActionButton>
            <ActionButton onClick={applyAiResult}>
              Aplicar
            </ActionButton>
          </ButtonRow>
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
        left: position.left
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