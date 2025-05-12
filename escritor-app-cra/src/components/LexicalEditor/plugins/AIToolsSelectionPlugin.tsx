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
                
                // Encontrar o elemento do editor correto
                // Primeiro tentamos encontrar o contêiner do editor específico
                const editorEl = document.querySelector('.editor-input');
                if (!editorEl) return false;
                
                const editorRect = editorEl.getBoundingClientRect();
                
                // Calculamos a posição relativa ao editor
                const relativeTop = rect.top - editorRect.top;
                const relativeLeft = rect.left - editorRect.left;
                
                // Posicionamos dentro dos limites do editor
                // Deixar espaço da ferramenta no topo da seleção
                setPosition({
                  top: Math.max(relativeTop + window.scrollY - 50, 10),
                  left: relativeLeft + (rect.width / 2) + window.scrollX
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
  
  // Ajustar posição para garantir que não fique cortada nas bordas
  useEffect(() => {
    if (containerRef.current && isVisible) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Encontrar o elemento pai mais próximo com posição relativa
      // Isso pode ser o ContentEditableWrapper ou EditorInner
      const editorEl = document.querySelector('.editor-input');
      if (!editorEl) return;
      
      const editorRect = editorEl.getBoundingClientRect();
      
      // Ajustar posição horizontal para ficar dentro do editor
      let adjustedLeft = position.left - (containerRect.width / 2);
      
      // Garantir que não saia pela direita
      if (adjustedLeft + containerRect.width > editorRect.width - 20) {
        adjustedLeft = editorRect.width - containerRect.width - 20;
      }
      
      // Garantir que não saia pela esquerda
      if (adjustedLeft < 20) {
        adjustedLeft = 20;
      }
      
      // Ajustar posição vertical
      let adjustedTop = position.top;
      
      // Se estiver muito no topo
      if (adjustedTop < 10) {
        // Tentar posicionar abaixo da seleção
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const relativeBottom = rect.bottom - editorRect.top;
          adjustedTop = relativeBottom + window.scrollY + 10;
        }
      }
      
      // Aplicar ajustes
      container.style.left = `${adjustedLeft}px`;
      container.style.top = `${adjustedTop}px`;
    }
  }, [isVisible, position, containerRef]);
  
  const handleToolAction = (toolId: string) => {
    // Implementar ações de IA aqui
    alert(`Ferramenta de IA "${toolId}" aplicada ao texto: "${selectedText}"`);
    setIsVisible(false);
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <AIToolsContainer 
      ref={containerRef}
      style={{ 
        top: position.top, 
        left: position.left
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