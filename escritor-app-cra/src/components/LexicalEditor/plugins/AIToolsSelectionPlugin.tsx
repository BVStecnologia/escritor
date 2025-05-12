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
  z-index: 100;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background: ${({ theme }) => theme.colors.primary + '10'};
  border: 1px solid ${({ theme }) => theme.colors.primary + '30'};
  padding: 4px;
  display: flex;
  gap: 2px;
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
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
            
            // Mostrar ferramentas com seleção menor (2 caracteres ao invés de 3)
            if (text && text.trim().length > 2) {
              // Obter posição da seleção
              const domSelection = window.getSelection();
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Encontrar o elemento do editor correto
                const editorEl = document.querySelector('.editor-input');
                if (!editorEl) return false;
                
                const editorRect = editorEl.getBoundingClientRect();
                
                // Calculamos a posição relativa ao centro da seleção, na parte inferior
                const relativeTop = rect.bottom - editorRect.top + 5; // Um pouco abaixo da seleção
                const relativeLeft = rect.left + (rect.width / 2) - editorRect.left;
                
                setPosition({
                  top: relativeTop + window.scrollY,
                  left: relativeLeft + window.scrollX
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
  
  // Modificar a função de ajuste de posição para ser mais precisa
  useEffect(() => {
    if (containerRef.current && isVisible) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      const editorEl = document.querySelector('.editor-input');
      if (!editorEl) return;
      
      const editorRect = editorEl.getBoundingClientRect();
      
      // Ajustar posição horizontal mantendo centralizado na seleção
      let adjustedLeft = position.left;
      
      // Garantir que não saia pela direita (descontando a centralização)
      if (adjustedLeft + (containerRect.width / 2) > editorRect.width - 10) {
        adjustedLeft = editorRect.width - (containerRect.width / 2) - 10;
      }
      
      // Garantir que não saia pela esquerda (descontando a centralização)
      if (adjustedLeft - (containerRect.width / 2) < 10) {
        adjustedLeft = (containerRect.width / 2) + 10;
      }
      
      // Ajustar posição vertical para ficar visível
      let adjustedTop = position.top;
      
      // Se estiver fora da área visível, colocar acima da seleção
      if (adjustedTop + containerRect.height > editorRect.height - 10) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          adjustedTop = rect.top - editorRect.top - containerRect.height - 5 + window.scrollY;
        }
      }
      
      // Aplicar ajustes
      container.style.left = `${adjustedLeft}px`;
      container.style.top = `${adjustedTop}px`;
    }
  }, [isVisible, position, containerRef]);
  
  const handleToolAction = (toolId: string) => {
    // Feedback visual para o usuário
    const originalText = selectedText;
    
    switch(toolId) {
      case 'rewrite':
        alert(`A ferramenta irá reescrever o texto: "${originalText.substring(0, 30)}${originalText.length > 30 ? '...' : ''}"`);
        break;
      case 'expand':
        alert(`A ferramenta irá expandir o texto: "${originalText.substring(0, 30)}${originalText.length > 30 ? '...' : ''}"`);
        break;
      case 'summarize':
        alert(`A ferramenta irá resumir o texto: "${originalText.substring(0, 30)}${originalText.length > 30 ? '...' : ''}"`);
        break;
    }
    
    // Aqui seria a implementação real da ação de IA
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