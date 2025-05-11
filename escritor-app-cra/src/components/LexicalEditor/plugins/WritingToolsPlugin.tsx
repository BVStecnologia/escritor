import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import styled from 'styled-components';

const WritingToolsContainer = styled.div`
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* Posicionamento dinâmico é definido via inline style */
`;

const LampIndicator = styled.div<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary + '20' : 'rgba(0,0,0,0.05)'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) =>
    $active ? '0 0 10px rgba(66, 135, 245, 0.5)' : 'none'};
  opacity: ${({ $active }) => $active ? 1 : 0.7}; /* Ícone mais visível quando ativo */

  &:hover {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const ToolsPopover = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 0; /* Alterado de right para left */
  top: 45px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  min-width: 250px;
`;

const ToolsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ToolItem = styled.li`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const ToolIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const ToolTitle = styled.div`
  font-weight: 500;
`;

const ToolDescription = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
`;

// Writing tools data
const WRITING_TOOLS = [
  {
    id: 'clarity',
    icon: '🔍',
    title: 'Clareza',
    description: 'Analisa a clareza da sua escrita e sugere melhorias'
  },
  {
    id: 'concision',
    icon: '✂️',
    title: 'Concisão',
    description: 'Sugere como tornar seu texto mais conciso e direto'
  },
  {
    id: 'grammar',
    icon: '📝',
    title: 'Gramática',
    description: 'Verifica e corrige problemas gramaticais'
  },
  {
    id: 'rhythm',
    icon: '🎵',
    title: 'Ritmo',
    description: 'Analisa o ritmo da sua narrativa'
  },
  {
    id: 'vocabulary',
    icon: '📚',
    title: 'Vocabulário',
    description: 'Sugere palavras alternativas para enriquecer seu texto'
  }
];

export const WritingToolsPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Monitor selection changes to determine if the lamp should be active
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            // Obter a posição do cursor ou da seleção
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();

              // Encontrar o editor-container para verificar margens
              const editorContainer = document.querySelector('.editor-input');
              let editorLeft = 0;

              if (editorContainer) {
                const editorRect = editorContainer.getBoundingClientRect();
                editorLeft = editorRect.left + window.scrollX;
              }

              // Calcular posição à esquerda do cursor, mas dentro do editor
              const lampWidth = 45; // Lâmpada + espaço
              const desiredLeft = rect.left + window.scrollX - lampWidth;
              // Garantir que a lâmpada não fique fora da margem esquerda do editor
              const safeLeft = Math.max(editorLeft + 10, desiredLeft);

              // Definir a posição baseada na seleção
              setPosition({
                top: rect.top + window.scrollY,
                left: safeLeft,
              });
            }

            // Verificar se há texto selecionado
            if (!selection.isCollapsed()) {
              const text = selection.getTextContent();
              if (text && text.length > 3) {
                setIsActive(true);
                setSelectedText(text);
                return false;
              }
            }
          }

          // Se não há seleção válida, desative a lâmpada
          setIsActive(false);
          setSelectedText('');
          setShowTools(false);
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  const toggleToolsPopover = () => {
    if (isActive) {
      setShowTools(!showTools);
    }
  };

  const handleToolSelect = (toolId: string) => {
    // In a real implementation, this would trigger the specific tool's logic
    // For now, we'll just show an alert with the selected tool and text
    alert(`Ferramenta "${toolId}" aplicada ao texto: "${selectedText}"`);
    setShowTools(false);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.writing-tools-container')) {
        setShowTools(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <WritingToolsContainer
      className="writing-tools-container"
      style={{ top: position.top, left: position.left }}
    >
      <LampIndicator
        $active={isActive}
        onClick={toggleToolsPopover}
        title="Ferramentas de escrita"
      >
        💡
      </LampIndicator>

      <ToolsPopover $visible={showTools}>
        <ToolsList>
          {WRITING_TOOLS.map((tool) => (
            <ToolItem
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
            >
              <ToolIcon>{tool.icon}</ToolIcon>
              <div>
                <ToolTitle>{tool.title}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
              </div>
            </ToolItem>
          ))}
        </ToolsList>
      </ToolsPopover>
    </WritingToolsContainer>
  );
};