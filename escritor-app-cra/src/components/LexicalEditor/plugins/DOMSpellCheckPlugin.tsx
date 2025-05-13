import React, { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  TextNode,
  NodeKey,
  createCommand,
  LexicalCommand
} from 'lexical';
import styled from 'styled-components';

// Comando para aplicar a correção ortográfica
export const APPLY_SPELLING_CORRECTION: LexicalCommand<{nodeKey: NodeKey, correction: string}> = createCommand();

const SuggestionsPopup = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  width: 200px;
  z-index: 100;
  animation: fadeIn 0.15s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SuggestionItem = styled.div`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.1s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// Lista básica de palavras para correção ortográfica
const COMMON_MISSPELLINGS: Record<string, string[]> = {
  'concerteza': ['com certeza'],
  'enterpretar': ['interpretar'],
  'excessao': ['exceção'],
  'excecao': ['exceção'],
  'excessões': ['exceções'],
  'excecoes': ['exceções'],
  'exitação': ['hesitação'],
  'exitacao': ['hesitação'],
  'exitar': ['hesitar'],
  // ... adicionar mais palavras conforme necessário
};

interface DOMSpellCheckPluginProps {
  checkInterval?: number;
}

export const DOMSpellCheckPlugin: React.FC<DOMSpellCheckPluginProps> = ({ checkInterval = 3000 }) => {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [activeNodeKey, setActiveNodeKey] = useState<NodeKey | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const editorRootRef = useRef<HTMLElement | null>(null);
  
  // Obter referência ao elemento raiz do editor
  useEffect(() => {
    editorRootRef.current = editor.getRootElement();
  }, [editor]);
  
  // Registrar comando para aplicar correção
  useEffect(() => {
    return editor.registerCommand(
      APPLY_SPELLING_CORRECTION,
      (payload) => {
        const { nodeKey, correction } = payload;
        
        editor.update(() => {
          const node = editor.getNodeByKey(nodeKey);
          if (node instanceof TextNode) {
            node.setTextContent(correction);
          }
        });
        
        // Reset popup
        setSuggestions([]);
        setSelectedWord('');
        setActiveNodeKey(null);
        setPopupPosition(null);
        
        return true;
      },
      1
    );
  }, [editor]);
  
  // Verificar ortografia periodicamente
  useEffect(() => {
    const checkSpelling = () => {
      editor.update(() => {
        const root = $getRoot();
        const textNodes: TextNode[] = [];
        
        // Coletar todos os nós de texto
        const collectTextNodes = (node: any) => {
          if (node instanceof TextNode) {
            textNodes.push(node);
          }
          
          const children = node.getChildren();
          if (children.length > 0) {
            children.forEach(collectTextNodes);
          }
        };
        
        collectTextNodes(root);
        
        // Verificar cada nó de texto
        textNodes.forEach(node => {
          const text = node.getTextContent();
          const nodeKey = node.getKey();
          
          // Dividir em palavras e verificar cada uma
          const words = text.split(/\b/);
          
          words.forEach(word => {
            const normalizedWord = word.toLowerCase().trim();
            
            // Verificar se a palavra está na lista de erros comuns
            if (COMMON_MISSPELLINGS[normalizedWord]) {
              // Marcar o nó como tendo erro
              node.setFormat(node.getFormat() | 0x8000); // Usar um bit alto para marcar erro
              
              // Podemos implementar uma visualização do erro
              // usando css personalizado baseado no formato
            }
          });
        });
      });
    };
    
    // Verificar ortografia inicialmente
    checkSpelling();
    
    // Configurar verificação periódica
    const interval = setInterval(checkSpelling, checkInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [editor, checkInterval]);
  
  // Adicionar listener para clique em palavras
  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editorRoot = editorRootRef.current;
      
      if (!editorRoot || !editorRoot.contains(target)) return;
      
      editor.update(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const node = selection.anchor.getNode();
          
          if (node instanceof TextNode) {
            const text = node.getTextContent();
            const offset = selection.anchor.offset;
            
            // Pegar a palavra no offset atual
            const wordBefore = text.slice(0, offset).match(/\w+$/);
            const wordAfter = text.slice(offset).match(/^\w+/);
            
            let currentWord = '';
            let wordStart = offset;
            
            if (wordBefore) {
              currentWord = wordBefore[0];
              wordStart = offset - currentWord.length;
            }
            
            if (wordAfter) {
              currentWord += wordAfter[0];
            }
            
            // Verificar se a palavra tem erro ortográfico
            const normalizedWord = currentWord.toLowerCase();
            if (COMMON_MISSPELLINGS[normalizedWord]) {
              // Obter sugestões
              const possibleCorrections = COMMON_MISSPELLINGS[normalizedWord];
              
              // Mostrar popup com sugestões
              setSuggestions(possibleCorrections);
              setSelectedWord(currentWord);
              setActiveNodeKey(node.getKey());
              
              // Posicionar o popup
              const range = selection.getTextContent().length;
              const domSelection = window.getSelection();
              
              if (domSelection && domSelection.rangeCount > 0) {
                const domRange = domSelection.getRangeAt(0);
                const rect = domRange.getBoundingClientRect();
                
                if (editorRoot) {
                  const editorRect = editorRoot.getBoundingClientRect();
                  
                  setPopupPosition({
                    top: rect.bottom - editorRect.top,
                    left: rect.left - editorRect.left
                  });
                }
              }
            } else {
              // Resetar popup se não houver erro
              setSuggestions([]);
              setSelectedWord('');
              setActiveNodeKey(null);
              setPopupPosition(null);
            }
          }
        }
      });
    };
    
    const editorRoot = editorRootRef.current;
    if (editorRoot) {
      editorRoot.addEventListener('click', handleEditorClick);
    }
    
    return () => {
      if (editorRoot) {
        editorRoot.removeEventListener('click', handleEditorClick);
      }
    };
  }, [editor]);
  
  // Fechar popup ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setSelectedWord('');
        setActiveNodeKey(null);
        setPopupPosition(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Aplicar correção
  const applySuggestion = (suggestion: string) => {
    if (activeNodeKey) {
      editor.dispatchCommand(APPLY_SPELLING_CORRECTION, {
        nodeKey: activeNodeKey,
        correction: suggestion
      });
    }
  };
  
  // Não renderizar se não houver sugestões ou posição
  if (!popupPosition || suggestions.length === 0) {
    return null;
  }
  
  return (
    <SuggestionsPopup
      ref={popupRef}
      style={{
        top: popupPosition.top + 5,
        left: popupPosition.left
      }}
    >
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={index}
          onClick={() => applySuggestion(suggestion)}
        >
          {suggestion}
        </SuggestionItem>
      ))}
    </SuggestionsPopup>
  );
};