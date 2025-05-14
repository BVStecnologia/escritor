import React, { useCallback, useEffect, useRef, useReducer } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  createCommand,
  LexicalCommand,
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ENTER_COMMAND,
  $getRoot,
  TextNode
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
import { setAutocompleteVisible, canShowAutocomplete } from './sharedPluginState';
import { useTheme } from '../../../contexts/ThemeContext';

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
  min-width: 400px;
  max-width: 600px;
  width: ${({ $width }) => $width}px;
  z-index: 9999;
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => $visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)'};
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
  anchor: { nodeKey: string; offset: number; wordStartOffset?: number } | null;
  isLoading: boolean;
  mode: 'ia' | 'local' | null;
};

type AutocompleteAction =
  | { type: 'SHOW_SUGGESTIONS'; payload: { suggestions: string[]; position: { top: number; left: number; width: number }; anchor: { nodeKey: string; offset: number; wordStartOffset?: number }; mode: 'ia' | 'local' } }
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
      // Notificar o estado compartilhado
      setAutocompleteVisible(true);
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

// Utilitários de capitalização centralizada
// Esta função determina se o texto na posição atual deve ser capitalizado
const shouldCapitalizeText = (text: string, position: number): boolean => {
  // Início de texto sempre capitaliza
  if (position === 0) return true;
  
  // Verificar o texto antes da posição atual (sem trim!)
  const textBefore = text.substring(0, position);
  
  // Padrão exato: ponto/exclamação/interrogação seguido por espaço(s)
  return /[.!?]\s+$/.test(textBefore);
};

// Função para aplicar capitalização se necessário
const capitalizeIfNeeded = (text: string, shouldCapitalize: boolean): string => {
  if (shouldCapitalize && text.length > 0) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
};

// Comando Lexical customizado
const SHOW_AUTOCOMPLETE_COMMAND = createCommand<void>();

export function ConsolidatedAutocompletePlugin({ livroId, capituloId }: ConsolidatedAutocompletePluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [currentText, setCurrentText] = React.useState<string>('');
  const [cursorPosition, setCursorPosition] = React.useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const { isDarkMode } = useTheme(); // Obter o estado do tema

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
    // Notificar o estado compartilhado que o autocomplete não está mais visível
    setAutocompleteVisible(false);
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
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    
    // Localizar o container de popups (o elemento pai onde o popup será renderizado)
    const popupsContainer = document.getElementById('editor-popups');
    
    if (popupsContainer) {
      // Quando renderizamos no container de popups, precisamos converter as coordenadas
      // para serem relativas a este container
      const popupsRect = popupsContainer.getBoundingClientRect();
      
      // Posição abaixo do texto, considerando o scrollY
      // Queremos que o popup apareça ABAIXO do texto, nunca acima
      // Mas NÃO adicionamos lineHeight extra para evitar o salto quando o usuário interage
      let top = rect.bottom - popupsRect.top + scrollY + 8; // Apenas um pequeno espaçamento fixo
      let left = rect.left - popupsRect.left;
      
      // Garantir largura mínima do popup
      const width = Math.max(480, rect.width * 1.5);
      
      // Verificar se o popup sairia pela direita e ajustar
      if (left + width > popupsRect.width) {
        left = Math.max(10, popupsRect.width - width - 10);
      }
      
      // Evitar que saia pela esquerda
      left = Math.max(10, left);
      
      return { top, left, width };
    } else {
      // Fallback: calcular posição relativa ao editor se o container de popups não existe
      // Garantir que fique abaixo do texto com espaçamento consistente
      let top = rect.bottom - editorRect.top + scrollY + 8; // Mesmo espaçamento fixo que acima
      let left = rect.left - editorRect.left;
      
      // Verificar se o popup sairia pela direita e ajustar
      const width = Math.max(480, rect.width * 1.5);
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
  const showSuggestions = useCallback((suggestions: string[], anchor: { nodeKey: string; offset: number; wordStartOffset?: number }, mode: 'ia' | 'local') => {
    const pos = calculatePosition();
    if (pos) {
      dispatch({ type: 'SHOW_SUGGESTIONS', payload: { suggestions, position: pos, anchor, mode } });
    }
  }, [calculatePosition]);

  // Debounced autocomplete IA (sem delay extra)
  const debouncedGetSuggestions = useCallback(
    debounce((text: string, cursorPosition: number, anchor: { nodeKey: string; offset: number; wordStartOffset?: number }) => {
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
              // Mostrar sugestões como estão - a capitalização será aplicada na função applySuggestion
              editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                
                // Mostrar sugestões - a capitalização ocorrerá na aplicação
                const domSelection = window.getSelection();
                if (!domSelection || domSelection.rangeCount === 0) return;
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                showSuggestions(filteredSuggestions, anchor, 'ia');
              });
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
    throttle((word: string, anchor: { nodeKey: string; offset: number; wordStartOffset?: number }) => {
      if (!word || word.length < 2) {
        reset();
        return;
      }
      const suggestions = findRelevantSuggestions(word);
      if (suggestions.length > 0) {
        // Mostrar as sugestões como estão - a capitalização será aplicada na função applySuggestion
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          
          const domSelection = window.getSelection();
          if (!domSelection || domSelection.rangeCount === 0) return;
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          showSuggestions(suggestions, anchor, 'local');
        });
      } else {
        reset();
      }
    }, 200),
    [reset, showSuggestions, editor]
  );

  // Função para aplicar sugestão
  const applySuggestion = useCallback((suggestion: string, index = selectedIndex) => {
    if (!suggestion || !anchor) return;
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      
      // Obter nó atual e texto
      const node = selection.anchor.getNode();
      if (!node.getTextContent) return;
      
      const text = node.getTextContent();
      const cursorOffset = selection.anchor.offset;
      
      // Usar o startPos da âncora se disponível, senão calcular
      let startPos = anchor.wordStartOffset !== undefined 
        ? anchor.wordStartOffset 
        : (() => {
            // Calcular como fallback
            let pos = cursorOffset;
            while (pos > 0 && !/\s/.test(text.charAt(pos - 1))) {
              pos--;
            }
            return pos;
          })();
      
      // Obter a palavra parcial atual que o usuário já digitou
      const currentWordPart = text.substring(startPos, cursorOffset);
      
      // Usar a função utilitária centralizada para verificar se devemos capitalizar
      const needsCapitalization = shouldCapitalizeText(text, startPos);
      
      // Logs de depuração
      console.log("Debug capitalização:", {
        startPos,
        textBeforeEnd: text.substring(0, startPos).slice(-10), // Últimos 10 caracteres antes da posição
        needsCapitalization
      });
      
      // Aplicar capitalização usando o utilitário centralizado
      const finalSuggestion = capitalizeIfNeeded(suggestion, needsCapitalization);
      
      // Log para debug (remover em produção)
      console.log('Autocomplete debug:', {
        textBefore: text.substring(Math.max(0, startPos - 10), startPos), // Últimos 10 caracteres antes da posição
        needsCapitalization,
        originalSuggestion: suggestion,
        finalSuggestion,
        currentWordPart
      });
      
      if (needsCapitalization) {
        console.log('Capitalizando sugestão:', suggestion, '→', finalSuggestion);
      }
      
      // Se a sugestão já inclui o que o usuário digitou, remover a palavra parcial primeiro
      if (currentWordPart.length > 0) {
        // Mover o cursor para o início da palavra 
        const node = selection.anchor.getNode();
        
        // Verificar se é um TextNode antes de usar setTextNodeRange
        if ($isTextNode(node)) {
          // Temos que atualizar tanto anchor quanto focus para o início da palavra
          selection.setTextNodeRange(node, startPos, node, startPos);
          
          // Remover caracteres (palavra parcial atual)
          for (let i = 0; i < currentWordPart.length; i++) {
            selection.deleteCharacter(false); // false = deletar para frente
          }
        } else {
          // Se não for um TextNode, apenas inserir no ponto atual
          // Isso é raro, mas pode acontecer se o cursor estiver em um nó de elemento
          console.warn('Autocomplete: não é possível remover texto parcial, o nó não é um TextNode');
        }
      }
      
      // Inserir a sugestão completa (possivelmente capitalizada)
      selection.insertText(finalSuggestion);
      
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
        
        // Verificação rigorosa: autocomplete só aparece quando NÃO há texto selecionado
        // Usamos isCollapsed para verificar se há texto selecionado (collapsed = sem seleção)
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Verificar se não há seleção global no documento também
          const domSelection = window.getSelection();
          if (domSelection && domSelection.toString().trim().length > 0) {
            // Há texto selecionado no DOM, esconder autocomplete
            reset();
            return;
          }
          
          const root = $getRoot();
          const text = root.getTextContent();
          const cursorOffset = selection.anchor.offset;
          if (text !== currentText || cursorOffset !== cursorPosition) {
            setCurrentText(text);
            setCursorPosition(cursorOffset);
            if (text.length >= 10) {
              // Para IA autocomplete também incluímos o início da palavra atual
              // Calcular onde começa a palavra atual
              const node = selection.anchor.getNode();
              const nodeText = node.getTextContent && node.getTextContent() || '';
              let startPos = cursorOffset;
              while (startPos > 0 && !/\s/.test(nodeText.charAt(startPos - 1))) {
                startPos--;
              }
              
              const anchor = { 
                nodeKey: selection.anchor.key, 
                offset: selection.anchor.offset,
                wordStartOffset: startPos
              };
              debouncedGetSuggestions(text, cursorOffset, anchor);
            } else {
              reset();
            }
          }
        } else {
          // Se há texto selecionado ou não é uma range selection, esconder autocomplete
          reset();
        }
      });
    });
    return updateListener;
  }, [editor, debouncedGetSuggestions, reset, currentText, cursorPosition]);

  // Monitor de seleção para autocomplete local
  useEffect(() => {
    const handleSelectionChange = () => {
      // Verificar primeiro se há qualquer seleção global no DOM
      const domSelection = window.getSelection();
      if (domSelection && domSelection.toString().trim().length > 0) {
        // Há texto selecionado no DOM, esconder autocomplete imediatamente
        reset();
        return;
      }
      
      editor.update(() => {
        const selection = $getSelection();
        // Verifica se a seleção está colapsada (cursor sem texto selecionado) e é uma range selection
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // O texto "selecionado" aqui é na verdade a palavra atual onde o cursor está
          const currentNode = selection.anchor.getNode();
          if (currentNode.getTextContent) {
            // Verificação adicional: garantir que não há texto selecionado em outro lugar
            if (document.getSelection()?.toString().trim()) {
              reset();
              return;
            }
            
            const nodeText = currentNode.getTextContent();
            const cursorOffset = selection.anchor.offset;
            
            // Tenta encontrar a palavra atual onde o cursor está posicionado
            let startPos = cursorOffset;
            while (startPos > 0 && !/\s/.test(nodeText.charAt(startPos - 1))) {
              startPos--;
            }
            
            const currentWord = nodeText.substring(startPos, cursorOffset).trim();
            
            if (currentWord && currentWord.length >= 2 && currentWord.length < 10) {
              // Incluir o offset do início da palavra na âncora para referência posterior
              const anchor = { 
                nodeKey: selection.anchor.key, 
                offset: selection.anchor.offset,
                wordStartOffset: startPos 
              };
              fetchSuggestionsLocal(currentWord, anchor);
            }
          }
        } else {
          // Se há texto selecionado, esconder o autocomplete
          reset();
        }
      });
    };
    
    // Usar evento 'selectionchange' para detectar quando o usuário seleciona texto
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Adicionar também verificação ao pressionar mouse para detectar seleções rapidamente
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        reset();
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor, fetchSuggestionsLocal, reset]);

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
    // Verificar estado compartilhado para garantir exclusão mútua
    if (!canShowAutocomplete()) {
      // Se o menu de seleção está visível, não mostrar o autocomplete
      return null;
    }
    
    // Verificar se há texto selecionado antes de renderizar
    const domSelection = window.getSelection();
    if (domSelection && domSelection.toString().trim().length > 0) {
      // Se há qualquer texto selecionado, não renderizar o autocomplete
      return null;
    }
    
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
          zIndex: 9998, // Usar z-index menor que as ferramentas de seleção (9999)
          minWidth: 480,
          padding: 12,
          borderRadius: 6,
          boxShadow: isDarkMode 
            ? '0 4px 16px rgba(0,0,0,0.4)' 
            : '0 4px 16px rgba(0,0,0,0.2)',
          background: isDarkMode 
            ? 'rgba(24, 26, 32, 0.95)' // Tema escuro: contraste escuro semi-transparente
            : 'rgba(255, 255, 255, 0.95)', // Tema claro: fundo branco semi-transparente
          color: isDarkMode ? '#fff' : '#212529', // Texto branco no tema escuro, escuro no tema claro
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
                background: index === selectedIndex 
                  ? isDarkMode ? '#2D3748' : '#E2E8F0' // Cor de seleção para tema escuro/claro
                  : 'transparent',
                cursor: 'pointer',
                marginBottom: 2,
                fontWeight: index === selectedIndex ? 700 : 400,
                transition: 'all 0.15s ease',
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