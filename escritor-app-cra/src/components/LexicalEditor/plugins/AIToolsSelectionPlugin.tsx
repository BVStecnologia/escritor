import React, { useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import styled from 'styled-components';

const AIToolsContainer = styled.div`
  position: absolute;
  z-index: 50;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  padding: 4px;
  display: flex;
  gap: 4px;
`;

const ToolButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
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

export const AIToolsSelectionPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();
          
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            const text = selection.getTextContent();
            
            // Mostrar ferramentas apenas se tiver selecionado texto significativo
            if (text && text.trim().length > 3) {
              // Obter posição da seleção
              const domSelection = window.getSelection();
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Posicionar acima da seleção
                setPosition({
                  top: rect.top + window.scrollY - 45, // 45px acima
                  left: rect.left + window.scrollX + (rect.width / 2) // Centralizado
                });
                
                setSelectedText(text);
                setIsVisible(true);
                return false;
              }
            }
          }
          
          // Esconder se não há seleção válida
          setIsVisible(false);
          setSelectedText('');
          return false;
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  
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
  
  const handleToolAction = (toolId: string) => {
    // Implementar ações de IA aqui
    alert(`Ferramenta de IA "${toolId}" aplicada ao texto: "${selectedText}"`);
    setIsVisible(false);
  };
  
  if (!isVisible) {
    return null;
  }
  
  // Ajustar posição para centralizar no elemento pai
  const adjustedLeft = containerRef.current 
    ? position.left - (containerRef.current.offsetWidth / 2) 
    : position.left;
  
  return (
    <AIToolsContainer 
      ref={containerRef}
      style={{ 
        top: position.top, 
        left: adjustedLeft
      }}
    >
      {AI_TOOLS.map(tool => (
        <ToolButton 
          key={tool.id}
          onClick={() => handleToolAction(tool.id)}
          title={tool.label}
        >
          {tool.icon} {tool.label}
        </ToolButton>
      ))}
    </AIToolsContainer>
  );
};