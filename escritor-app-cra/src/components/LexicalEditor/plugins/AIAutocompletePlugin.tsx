import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ENTER_COMMAND,
  $getSelection,
  $isRangeSelection,
  createCommand,
  LexicalCommand,
  $getRoot
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import { assistantService } from '../../../services/assistantService';
import { Spinner } from '../../styled';

// Comando customizado para inserir a sugestão
export const INSERT_AUTOCOMPLETE_COMMAND: LexicalCommand<string> = createCommand();

const SuggestionsContainer = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  max-width: 300px;
  width: max-content;
  overflow: hidden;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  
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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRootElementRef = useRef<HTMLElement | null>(null);

  // Obter referência ao elemento raiz do editor
  useEffect(() => {
    editorRootElementRef.current = editor.getRootElement();
  }, [editor]);

  // Função para resetar o estado do autocomplete
  const reset = useCallback(() => {
    setSuggestions([]);
    setSelectedIndex(0);
    setPosition(null);
  }, []);

  // Função para atualizar a posição do popup de sugestões
  const updatePosition = useCallback(() => {
    // Se não temos um editor root element, não podemos posicionar
    if (!editorRootElementRef.current) return;

    // Obter a seleção atual
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) return;

    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Obter dimensões do editor
    const editorRect = editorRootElementRef.current.getBoundingClientRect();
    
    // Posição abaixo do cursor
    const x = rect.left - editorRect.left;
    const y = rect.bottom - editorRect.top;
    
    setPosition({ x, y });
  }, []);

  // Função para buscar sugestões do assistente
  const fetchSuggestions = useCallback(
    debounce(async (text: string, position: number) => {
      // Necessário pelo menos 10 caracteres para fornecer contexto suficiente
      if (text.length < 10) {
        reset();
        return;
      }
      
      try {
        setIsLoading(true);
        
        const response = await assistantService.autocomplete({
          input: text,
          cursorPosition: position,
          livroId,
          maxSuggestions: 3
        });
        
        if (response && response.suggestions && response.suggestions.length > 0) {
          // Filtrar sugestões indesejadas
          const filteredSuggestions = response.suggestions.filter((sugg: string) => {
            const lowercaseSugg = sugg.toLowerCase().trim();
            return !lowercaseSugg.startsWith("baseado") && 
                   !lowercaseSugg.startsWith("com base") &&
                   !lowercaseSugg.startsWith("de acordo");
          });
          
          // Se ainda tiver sugestões após filtro
          if (filteredSuggestions.length > 0) {
            setSuggestions(filteredSuggestions);
            setSelectedIndex(0);
            
            // Atualizar posição após receber sugestões
            updatePosition();
          } else {
            reset();
          }
        } else {
          reset();
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        reset();
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [livroId, reset, updatePosition]
  );

  // Monitor de alterações no texto
  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Obter o texto atual ao redor do cursor
          // Para um contexto completo, pegamos todo o conteúdo do editor
          const root = $getRoot();
          const text = root.getTextContent();
          const cursorOffset = selection.anchor.offset;
          
          // Verificar se houve mudança no texto ou posição
          if (
            text !== currentText || 
            cursorOffset !== cursorPosition
          ) {
            setCurrentText(text);
            setCursorPosition(cursorOffset);
            
            // Apenas buscar sugestões se o texto for suficientemente grande
            if (text.length >= 10) {
              fetchSuggestions(text, cursorOffset);
            } else {
              reset();
            }
          }
        } else {
          // Se não há seleção ou não está colapsada, reset
          reset();
        }
      });
    });
    
    return updateListener;
  }, [editor, fetchSuggestions, reset, currentText, cursorPosition]);

  // Registrar comando para inserir sugestão
  useEffect(() => {
    return editor.registerCommand(
      INSERT_AUTOCOMPLETE_COMMAND,
      (payload: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(payload);
          }
        });
        reset();
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor, reset]);

  // Registrar comandos de teclado
  useEffect(() => {
    return mergeRegister(
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
      
      editor.registerCommand(
        KEY_TAB_COMMAND,
        () => {
          if (suggestions.length > 0) {
            editor.dispatchCommand(INSERT_AUTOCOMPLETE_COMMAND, suggestions[selectedIndex]);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => {
          if (suggestions.length > 0) {
            editor.dispatchCommand(INSERT_AUTOCOMPLETE_COMMAND, suggestions[selectedIndex]);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      
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
  }, [editor, reset, suggestions, selectedIndex]);

  // Ajustar posição do popup ao rolar ou redimensionar
  useEffect(() => {
    const handleLayoutChange = () => {
      if (suggestions.length > 0) {
        updatePosition();
      }
    };
    
    window.addEventListener('scroll', handleLayoutChange, true);
    window.addEventListener('resize', handleLayoutChange);
    
    return () => {
      window.removeEventListener('scroll', handleLayoutChange, true);
      window.removeEventListener('resize', handleLayoutChange);
    };
  }, [suggestions.length, updatePosition]);

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

  // Não renderizar se não há sugestões ou posição
  if (!position || (suggestions.length === 0 && !isLoading)) {
    return null;
  }

  // Manipulador de clique em sugestão
  const handleSuggestionClick = (suggestion: string) => {
    editor.dispatchCommand(INSERT_AUTOCOMPLETE_COMMAND, suggestion);
  };

  return (
    <SuggestionsContainer
      ref={containerRef}
      style={{
        top: position.y + 5,
        left: position.x,
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
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </SuggestionItem>
        ))
      )}
    </SuggestionsContainer>
  );
}