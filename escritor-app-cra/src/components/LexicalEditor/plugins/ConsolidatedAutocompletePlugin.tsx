import React, { useCallback, useEffect, useRef, useReducer } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  createCommand,
  LexicalCommand,
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ENTER_COMMAND,
  $getRoot
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { Spinner } from '../../styled';
import { assistantService } from '../../../services/assistantService';
import { createPortal } from 'react-dom';
import { editorTheme } from '../theme';
import './ConsolidatedAutocompletePlugin.css'; // Para os estilos globais de spelling-error e suggestions-container

// Dicionário e utilitários do autocomplete local
// Copiado/adaptado do AutocompletePlugin
const WRITING_SUGGESTIONS: { [key: string]: string[] } = {
  'personag': ['personagem', 'personagens', 'personagem principal', 'personagens secundários'],
  'histor': ['história', 'histórico', 'histórias', 'histórica'],
  'cap': ['capítulo', 'capitulo', 'capítulos', 'capital'],
  'tram': ['trama', 'tramoia', 'tramway', 'tramar'],
  'cen': ['cena', 'cenário', 'centro', 'cênico'],
  'desc': ['descrever', 'descrição', 'descobrir', 'descida'],
  'narr': ['narrador', 'narração', 'narrativa', 'narrar'],
  'dialo': ['diálogo', 'dialogar', 'dialógico', 'dialogo'],
  'confl': ['conflito', 'conflituoso', 'confluência', 'conflagração'],
  'desf': ['desfecho', 'desfeito', 'desfazer', 'desfechar'],
  'prot': ['protagonista', 'protótipo', 'proteção', 'protocolo'],
  'antag': ['antagonista', 'antagonismo', 'antagonizar', 'antagonístico'],
  'amb': ['ambiente', 'ambiental', 'ambientação', 'ambivalência'],
  'cli': ['clímax', 'cliente', 'clima', 'clique'],
  'temp': ['tempo', 'temporada', 'tempestade', 'temperatura'],
  'esp': ['espaço', 'espelho', 'espada', 'especialista'],
  'est': ['estilo', 'estrutura', 'estória', 'estância'],
  'met': ['metáfora', 'método', 'metal', 'metabolismo'],
  'sim': ['símbolo', 'simples', 'similar', 'similaridade'],
  'fig': ['figura', 'figurativo', 'figurino', 'figuração'],
  // ... (demais sugestões do plugin original)
};

const addToSuggestions = (word: string, suggestions: string[]) => {
  if (!WRITING_SUGGESTIONS[word]) {
    WRITING_SUGGESTIONS[word] = suggestions;
  } else {
    suggestions.forEach(suggestion => {
      if (!WRITING_SUGGESTIONS[word].includes(suggestion)) {
        WRITING_SUGGESTIONS[word].push(suggestion);
      }
    });
  }
};

const findRelevantSuggestions = (word: string): string[] => {
  if (!word || word.length < 2) return [];
  const wordLower = word.toLowerCase().trim();
  let suggestions: string[] = [];
  if (WRITING_SUGGESTIONS[wordLower]) {
    return WRITING_SUGGESTIONS[wordLower];
  }
  const prefixMatches: {prefix: string, score: number}[] = [];
  Object.keys(WRITING_SUGGESTIONS).forEach(key => {
    if (wordLower.startsWith(key)) {
      prefixMatches.push({ prefix: key, score: key.length });
    } else if (key.startsWith(wordLower)) {
      prefixMatches.push({ prefix: key, score: wordLower.length * 0.8 });
    }
  });
  if (prefixMatches.length > 0) {
    prefixMatches.sort((a, b) => b.score - a.score);
    suggestions = [...WRITING_SUGGESTIONS[prefixMatches[0].prefix]];
  }
  if (suggestions.length === 0) {
    let bestMatch = '';
    let highestSimilarity = 0;
    Object.keys(WRITING_SUGGESTIONS).forEach(key => {
      let similarity = 0;
      const minLength = Math.min(key.length, wordLower.length);
      for (let i = 0; i < minLength; i++) {
        if (key[i] === wordLower[i]) similarity++;
      }
      similarity = similarity / Math.max(key.length, wordLower.length);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = key;
      }
    });
    if (highestSimilarity >= 0.4 && bestMatch) {
      suggestions = [...WRITING_SUGGESTIONS[bestMatch]];
    }
  }
  if (suggestions.length === 0) {
    suggestions = [
      wordLower.slice(0, -1),
      wordLower + 's',
      wordLower.charAt(0).toUpperCase() + wordLower.slice(1),
      wordLower + 'mente'
    ];
    addToSuggestions(wordLower, suggestions);
  }
  return suggestions;
};

// Comando customizado para inserir sugestão
export const INSERT_AUTOCOMPLETE_COMMAND: LexicalCommand<string> = createCommand();

// Novo spinner visual para autocomplete
const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Transição suave para o container
const SuggestionsContainer = styled.div<{ $visible: boolean; $width: number }>`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  min-width: 250px;
  max-width: 500px;
  width: ${({ $width }) => $width}px;
  z-index: 9999;
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => $visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)'};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  overflow: hidden;
`;

const SuggestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  font-size: 0.85rem;
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

const SuggestionItem = styled.div<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '25' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.15s ease;
  margin-bottom: 2px;
  font-family: inherit;
  &:hover {
    background: ${({ theme }) => theme.colors.primary + '15'};
    transform: translateX(2px);
  }
`;

interface ConsolidatedAutocompletePluginProps {
  livroId?: string;
  capituloId?: string;
}

// Tipos para o estado e ações do autocomplete
type AutocompleteState = {
  isVisible: boolean;
  suggestions: string[];
  selectedIndex: number;
  position: { top: number; left: number; width: number };
  anchor: { nodeKey: string; offset: number } | null;
  isLoading: boolean;
  mode: 'ia' | 'local' | null;
};

type AutocompleteAction =
  | { type: 'SHOW_SUGGESTIONS'; payload: { suggestions: string[]; position: { top: number; left: number; width: number }; anchor: { nodeKey: string; offset: number }; mode: 'ia' | 'local' } }
  | { type: 'HIDE_SUGGESTIONS' }
  | { type: 'SELECT_SUGGESTION'; payload: number }
  | { type: 'UPDATE_POSITION'; payload: { top: number; left: number; width: number } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialAutocompleteState: AutocompleteState = {
  isVisible: false,
  suggestions: [],
  selectedIndex: 0,
  position: { top: 0, left: 0, width: 300 },
  anchor: null,
  isLoading: false,
  mode: null,
};

const autocompleteReducer = (state: AutocompleteState, action: AutocompleteAction): AutocompleteState => {
  switch (action.type) {
    case 'SHOW_SUGGESTIONS':
      return {
        ...state,
        isVisible: true,
        suggestions: action.payload.suggestions,
        position: action.payload.position,
        anchor: action.payload.anchor,
        selectedIndex: 0,
        mode: action.payload.mode,
      };
    case 'HIDE_SUGGESTIONS':
      return {
        ...state,
        isVisible: false,
        suggestions: [],
        anchor: null,
        isLoading: false,
        mode: null,
      };
    case 'SELECT_SUGGESTION':
      return {
        ...state,
        selectedIndex: action.payload,
      };
    case 'UPDATE_POSITION':
      return {
        ...state,
        position: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Comando Lexical customizado
const SHOW_AUTOCOMPLETE_COMMAND = createCommand<void>();

export function ConsolidatedAutocompletePlugin({ livroId, capituloId }: ConsolidatedAutocompletePluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [currentText, setCurrentText] = React.useState<string>('');
  const [cursorPosition, setCursorPosition] = React.useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const [state, dispatch] = useReducer(autocompleteReducer, initialAutocompleteState);
  const { isVisible, suggestions, selectedIndex, position, anchor, isLoading, mode } = state;

  // Criar e limpar o container do portal
  useEffect(() => {
    const portalContainer = document.createElement('div');
    portalContainer.className = 'autocomplete-portal-container';
    document.body.appendChild(portalContainer);
    portalRef.current = portalContainer;
    return () => {
      if (portalRef.current && document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current);
      }
      portalRef.current = null;
    };
  }, []);

  // Função robusta para obter texto ao redor do cursor
  const getTextAroundCursor = useCallback(() => {
    try {
      let text = '';
      let cursorPosition = 0;
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const node = selection.anchor.getNode();
        if (!(node instanceof window.Text)) return;
        text = node.textContent || '';
        cursorPosition = selection.anchor.offset;
      });
      return { text, cursorPosition };
    } catch (error) {
      console.error('Erro ao obter texto ao redor do cursor:', error);
      return { text: '', cursorPosition: 0 };
    }
  }, [editor]);

  // Função para resetar o estado do autocomplete
  const reset = useCallback(() => {
    dispatch({ type: 'HIDE_SUGGESTIONS' });
  }, []);

  // Função para calcular a posição absoluta dentro do editor
  const calculatePosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorElement = document.querySelector('.editor-input');
    if (!editorElement) return null;
    const editorRect = editorElement.getBoundingClientRect();
    
    // Obter a altura da linha para garantir que o menu fique abaixo do texto
    const lineHeight = parseFloat(window.getComputedStyle(editorElement).lineHeight) || 24;
    
    // Localizar o container de popups (o elemento pai onde o popup será renderizado)
    const popupsContainer = document.getElementById('editor-popups');
    
    if (popupsContainer) {
      // Quando renderizamos no container de popups, precisamos converter as coordenadas
      // para serem relativas a este container
      const popupsRect = popupsContainer.getBoundingClientRect();
      
      // Posição abaixo do texto, considerando o scrollY
      let top = rect.bottom - popupsRect.top + window.scrollY + 8; // 8px de espaço
      let left = rect.left - popupsRect.left;
      
      // Garantir largura mínima do popup
      const width = Math.max(350, rect.width * 1.5);
      
      // Verificar se o popup sairia pela direita e ajustar
      if (left + width > popupsRect.width) {
        left = Math.max(10, popupsRect.width - width - 10);
      }
      
      // Evitar que saia pela esquerda
      left = Math.max(10, left);
      
      return { top, left, width };
    } else {
      // Fallback: calcular posição relativa ao editor se o container de popups não existe
      let top = rect.bottom - editorRect.top + window.scrollY + lineHeight;
      let left = rect.left - editorRect.left;
      
      // Verificar se o popup sairia pela direita e ajustar
      const width = Math.max(350, rect.width * 1.5);
      if (left + width > editorRect.width) {
        left = Math.max(10, editorRect.width - width - 10);
      }
      
      // Evitar que saia pela esquerda
      left = Math.max(10, left);
      
      return { top, left, width };
    }
  };

  // Atualizar a função updatePosition para usar handlePositioning
  const updatePosition = useCallback(() => {
    if (!isVisible) return;
    const pos = calculatePosition();
    if (pos) {
      dispatch({ type: 'UPDATE_POSITION', payload: pos });
    }
  }, [calculatePosition, isVisible]);

  // Atualizar showSuggestions para usar handlePositioning
  const showSuggestions = useCallback((suggestions: string[], anchor: { nodeKey: string; offset: number }, mode: 'ia' | 'local') => {
    const pos = calculatePosition();
    if (pos) {
      dispatch({ type: 'SHOW_SUGGESTIONS', payload: { suggestions, position: pos, anchor, mode } });
    }
  }, [calculatePosition]);

  // Debounced autocomplete IA (sem delay extra)
  const debouncedGetSuggestions = useCallback(
    debounce((text: string, cursorPosition: number, anchor: { nodeKey: string; offset: number }) => {
      if (text.length < 10) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      assistantService.autocomplete({
        input: text,
        cursorPosition,
        livroId,
        maxSuggestions: 3
      })
        .then(response => {
          if (response?.suggestions?.length > 0) {
            // Filtrar comentários explicativos das sugestões
            const filteredSuggestions = response.suggestions.filter((suggestion: string) => {
              const lowerSuggestion = suggestion.toLowerCase();
              
              // Padrões que indicam comentários em vez de sugestões reais
              const commentPatterns = [
                "baseado no seu texto",
                "posso oferecer",
                "sugestões:",
                "continuações naturais",
                "aqui estão",
                "baseado na sua escrita",
                "baseado no contexto",
                "algumas opções",
                "algumas sugestões",
                "algumas ideias",
                "algumas possibilidades",
                "começando com",
                "para continuar"
              ];
              
              // Verificar se é um comentário comparando com os padrões
              const isComment = commentPatterns.some(pattern => 
                lowerSuggestion.includes(pattern)
              );
              
              // Verificar se a sugestão está no formato de meta-comentário
              const isMetaComment = 
                lowerSuggestion.length > 30 && // Comentários tendem a ser longos
                (lowerSuggestion.includes(":") || // Contém dois-pontos indicando explicação
                 lowerSuggestion.startsWith("para ") || // Começa com instruções
                 /^[a-z]+ (como|que|para|sobre)/.test(lowerSuggestion)); // Padrões explicativos
              
              // Retornar apenas sugestões reais (não comentários)
              return !isComment && !isMetaComment;
            });
            
            // Só mostrar se houver sugestões reais após a filtragem
            if (filteredSuggestions.length > 0) {
              const selection = window.getSelection();
              if (!selection || selection.rangeCount === 0) return;
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              showSuggestions(filteredSuggestions, anchor, 'ia');
            }
          }
        })
        .catch(error => {
          console.error('Erro ao buscar sugestões:', error);
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    }, 300),
    [showSuggestions, livroId]
  );

  // Sugestão local (dicionário)
  const fetchSuggestionsLocal = useCallback(
    throttle((word: string, anchor: { nodeKey: string; offset: number }) => {
      if (!word || word.length < 2) {
        reset();
        return;
      }
      const found = findRelevantSuggestions(word);
      if (found.length > 0) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showSuggestions(found, anchor, 'local');
      } else {
        reset();
      }
    }, 200),
    [reset, showSuggestions]
  );

  // Função para aplicar sugestão
  const applySuggestion = useCallback((suggestion: string, index = selectedIndex) => {
    if (!suggestion || !anchor) return;
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      selection.deleteCharacter(false);
      selection.insertText(suggestion);
      setTimeout(() => {
        editor.focus();
      }, 0);
    });
    reset();
  }, [editor, anchor, selectedIndex, reset]);

  // Monitor de alterações no texto para autocomplete IA
  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const root = $getRoot();
          const text = root.getTextContent();
          const cursorOffset = selection.anchor.offset;
          if (text !== currentText || cursorOffset !== cursorPosition) {
            setCurrentText(text);
            setCursorPosition(cursorOffset);
            if (text.length >= 10) {
              const anchor = { nodeKey: selection.anchor.key, offset: selection.anchor.offset };
              debouncedGetSuggestions(text, cursorOffset, anchor);
            } else {
              reset();
            }
          }
        } else {
          reset();
        }
      });
    });
    return updateListener;
  }, [editor, debouncedGetSuggestions, reset, currentText, cursorPosition]);

  // Monitor de seleção para autocomplete local
  useEffect(() => {
    const handleSelectionChange = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const selectedText = selection.getTextContent().trim();
          const isWord = !selectedText.includes(' ');
          if (isWord && selectedText.length >= 2 && selectedText.length < 10) {
            const anchor = { nodeKey: selection.anchor.key, offset: selection.anchor.offset };
            fetchSuggestionsLocal(selectedText, anchor);
          }
        }
      });
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editor, fetchSuggestionsLocal]);

  // Event listener global para navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'SELECT_SUGGESTION', payload: (selectedIndex + 1) % suggestions.length });
          break;
        case 'ArrowUp':
          e.preventDefault();
          dispatch({ type: 'SELECT_SUGGESTION', payload: (selectedIndex - 1 + suggestions.length) % suggestions.length });
          break;
        case 'Tab':
        case 'Enter':
          if (suggestions.length > 0) {
            e.preventDefault();
            applySuggestion(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          reset();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, suggestions, selectedIndex, applySuggestion, reset]);

  // Clique fora robusto (ignora editor)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('.editor-input')
      ) {
        reset();
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [reset]);

  // Reposicionamento em resize/scroll
  useEffect(() => {
    const updateSuggestionPosition = () => {
      if (!state.isVisible || !state.anchor) return;
      updatePosition();
    };
    window.addEventListener('resize', updateSuggestionPosition);
    window.addEventListener('scroll', updateSuggestionPosition, true);
    return () => {
      window.removeEventListener('resize', updateSuggestionPosition);
      window.removeEventListener('scroll', updateSuggestionPosition, true);
    };
  }, [state.isVisible, state.anchor, updatePosition]);

  // Comando Lexical customizado
  useEffect(() => {
    return editor.registerCommand(
      SHOW_AUTOCOMPLETE_COMMAND,
      () => {
        getTextAroundCursor();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, getTextAroundCursor]);

  // Manipulador de clique em sugestão
  const handleSuggestionClick = (suggestion: string, index: number) => {
    applySuggestion(suggestion, index);
  };

  // Renderização usando portal para o container de popups
  const renderSuggestions = () => {
    const position = calculatePosition();
    if (!position || !isVisible || suggestions.length === 0) {
      return null;
    }

    // Encontrar o container de popups designado ou usar o body como fallback
    const popupsContainer = document.getElementById('editor-popups') || document.body;
    
    return createPortal(
      <div
        className="suggestions-container"
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          zIndex: 9999,
          minWidth: 350,
          padding: 12,
          borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          background: 'rgba(24, 26, 32, 0.95)', // contraste escuro semi-transparente
          color: '#fff',
          pointerEvents: 'auto', // Importante: permite interação com o popup
        }}
      >
        <div className="suggestions-header" style={{ fontWeight: 600, marginBottom: 8 }}>
          Sugestões de autocompletar
        </div>
        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item${index === selectedIndex ? ' active' : ''}`}
              style={{
                padding: '10px 16px',
                borderRadius: 4,
                background: index === selectedIndex ? '#2D3748' : 'transparent',
                cursor: 'pointer',
                marginBottom: 2,
                fontWeight: index === selectedIndex ? 700 : 400,
              }}
              onClick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      </div>,
      popupsContainer
    );
  };

  return renderSuggestions();
} 