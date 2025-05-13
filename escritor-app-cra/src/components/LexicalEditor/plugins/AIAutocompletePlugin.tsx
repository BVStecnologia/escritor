import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ENTER_COMMAND,
  TextNode
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { $getNodeByKey } from 'lexical';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import { assistantService } from '../../../services/assistantService';
import { Spinner } from '../../styled';

const SuggestionsContainer = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  max-width: 400px;
  z-index: 100;
  animation: fadeIn 0.15s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SuggestionItem = styled.div<{ $active: boolean }>`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.primary};
  font-size: 0.9rem;
  transition: all 0.1s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem 0.5rem 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.08)'};
  margin-bottom: 0.5rem;
`;

const KeyboardHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const KeyCaption = styled.span`
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 0.7rem;
  font-weight: 500;
`;

interface AIAutocompletePluginProps {
  livroId?: string;
  capituloId?: string;
}

export function AIAutocompletePlugin({ livroId, capituloId }: AIAutocompletePluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [anchor, setAnchor] = useState<{ x: number; y: number; nodeKey: string; offset: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Função debounceada para buscar sugestões do assistente
  const fetchSuggestions = useCallback(debounce(async (text: string, cursorPosition: number) => {
    // Necessário pelo menos 10 caracteres para fornecer contexto suficiente
    if (text.length < 10 || !anchor) return;
    
    try {
      setIsLoading(true);
      
      const response = await assistantService.autocomplete({
        input: text,
        cursorPosition,
        livroId,
        maxSuggestions: 3
      });
      
      if (response && response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        setSelectedIndex(0);
      } else {
        reset();
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      reset();
    } finally {
      setIsLoading(false);
    }
  }, 500), [anchor, livroId]);

  // Função para obter o texto ao redor do cursor
  const getTextAroundCursor = useCallback(() => {
    let text = '';
    let cursorPosition = 0;
    
    editor.update(() => {
      const selection = $getSelection();
      
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        
        // Se não for um nó de texto, não temos o que autocompletar
        if (!(node instanceof TextNode)) {
          return;
        }
        
        text = node.getTextContent();
        cursorPosition = selection.anchor.offset;
        
        // Armazenar a referência ao nó e offset para poder inserir texto depois
        setAnchor({
          x: 0, // Será calculado após a renderização
          y: 0, // Será calculado após a renderização
          nodeKey: node.getKey(),
          offset: cursorPosition
        });
        
        // Posicionar o popup de sugestões
        setTimeout(() => {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            const editorElement = document.querySelector('.editor-container');
            if (!editorElement) return;
            
            const editorRect = editorElement.getBoundingClientRect();
            
            setAnchor(prev => {
              if (!prev) return null;
              return {
                ...prev,
                x: rect.left - editorRect.left,
                y: rect.bottom - editorRect.top
              };
            });
          }
        }, 0);
        
        fetchSuggestions(text, cursorPosition);
      }
    });
  }, [editor, fetchSuggestions]);

  // Resetar o estado do autocomplete
  const reset = useCallback(() => {
    setSuggestions([]);
    setSelectedIndex(0);
    setAnchor(null);
  }, []);

  // Aplicar a sugestão selecionada
  const applySuggestion = useCallback((index = selectedIndex) => {
    const suggestion = suggestions[index];
    if (!suggestion || !anchor) return;
    
    editor.update(() => {
      const node = $getNodeByKey(anchor.nodeKey);
      if (!node || !(node instanceof TextNode)) return;
      
      const text = node.getTextContent();
      const prefix = text.substring(0, anchor.offset);
      const suffix = text.substring(anchor.offset);
      
      // Inserir a sugestão no cursor
      node.setTextContent(prefix + suggestion + suffix);
      
      // Mover o cursor para o final da sugestão inserida
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = $getNodeByKey(anchor.nodeKey);
        if (node) {
          selection.anchor.set(anchor.nodeKey, anchor.offset + suggestion.length, 'text');
          selection.focus.set(anchor.nodeKey, anchor.offset + suggestion.length, 'text');
        }
      }
    });
    
    reset();
  }, [suggestions, selectedIndex, anchor, editor, reset]);

  // Registrar os comandos do editor
  useEffect(() => {
    return mergeRegister(
      // Gatilho para verificar possibilidade de autocompletar
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            getTextAroundCursor();
          } else {
            reset();
          }
        });
      }),
      
      // Comandos de teclado para navegar nas sugestões
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => {
          if (suggestions.length > 0) {
            setSelectedIndex((prev) => (prev + 1) % suggestions.length);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      ),
      
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => {
          if (suggestions.length > 0) {
            setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      ),
      
      // Aplicar sugestão com Tab
      editor.registerCommand(
        KEY_TAB_COMMAND,
        () => {
          if (suggestions.length > 0) {
            applySuggestion();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      
      // Aplicar sugestão com Enter
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => {
          if (suggestions.length > 0) {
            applySuggestion();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      
      // Fechar sugestões com Escape
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (suggestions.length > 0) {
            reset();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_NORMAL
      )
    );
  }, [editor, getTextAroundCursor, reset, suggestions, applySuggestion]);

  // Ajustar posição do popup ao rolar ou redimensionar
  useEffect(() => {
    const handleScroll = () => {
      if (anchor && suggestions.length > 0) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          const editorElement = document.querySelector('.editor-container');
          if (!editorElement) return;
          
          const editorRect = editorElement.getBoundingClientRect();
          
          setAnchor(prev => {
            if (!prev) return null;
            return {
              ...prev,
              x: rect.left - editorRect.left,
              y: rect.bottom - editorRect.top
            };
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [anchor, suggestions.length]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        reset();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reset]);

  // Não renderizar se não há sugestões ou âncora
  if (!anchor || (suggestions.length === 0 && !isLoading)) {
    return null;
  }

  return (
    <SuggestionsContainer
      ref={containerRef}
      style={{
        top: anchor.y + 5,
        left: anchor.x,
      }}
    >
      <SuggestionHeader>
        <span>Sugestões</span>
        <KeyboardHint>
          <KeyCaption>Tab</KeyCaption> ou <KeyCaption>Enter</KeyCaption> para aplicar
        </KeyboardHint>
      </SuggestionHeader>
      
      {isLoading ? (
        <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Spinner size="small" />
          <span style={{ fontSize: '0.9rem' }}>Gerando sugestões...</span>
        </div>
      ) : (
        suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={index}
            $active={index === selectedIndex}
            onClick={() => applySuggestion(index)}
          >
            {suggestion}
          </SuggestionItem>
        ))
      )}
    </SuggestionsContainer>
  );
}