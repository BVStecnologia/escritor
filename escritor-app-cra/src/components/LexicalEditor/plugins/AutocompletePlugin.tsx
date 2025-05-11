import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import throttle from 'lodash/throttle';
import { 
  $getSelection, 
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import styled from 'styled-components';

const AutocompleteContainer = styled.div<{ $visible: boolean }>`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  max-width: 300px;
  z-index: 100;
  padding: 0.5rem;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
`;

const SuggestionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SuggestionItem = styled.li<{ $active: boolean }>`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ $active, theme }) => 
    $active ? theme.colors.primary : theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

// Mock autocomplete suggestions
const WRITING_SUGGESTIONS = {
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
};

export const AutocompletePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const throttledUpdateRef = useRef<any>(null);

  // Versão corrigida da função handleSelectionChange para evitar problemas com o estado do editor
  const handleSelectionChange = useCallback(() => {
    // Função que será executada dentro do contexto do editor
    const checkTextAndUpdateSuggestions = () => {
      editor.update(() => {
        const selection = $getSelection();
        
        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
          setIsVisible(false);
          return;
        }
        
        const selectedText = selection.getTextContent();
        if (selectedText && selectedText.length >= 3) {
          // Check for matching prefixes in our suggestion database
          let foundSuggestions: string[] = [];
          
          Object.entries(WRITING_SUGGESTIONS).forEach(([prefix, words]) => {
            if (selectedText.toLowerCase().includes(prefix.toLowerCase())) {
              foundSuggestions = [...foundSuggestions, ...words];
            }
          });
          
          if (foundSuggestions.length > 0) {
            setSuggestions(foundSuggestions);
            setActiveIndex(0);
            
            // Atrasamos o cálculo de posição para reduzir reflows
            requestAnimationFrame(() => {
              // Position the autocomplete menu near the selection
              const domSelection = window.getSelection();
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                setPosition({
                  top: rect.bottom + window.scrollY + 10,
                  left: rect.left + window.scrollX,
                });
                
                setIsVisible(true);
              }
            });
          } else {
            setIsVisible(false);
          }
        } else {
          setIsVisible(false);
        }
      });
    };

    // Se já existir um throttle, cancelamos
    if (throttledUpdateRef.current) {
      throttledUpdateRef.current.cancel();
    }

    // Criamos uma nova função throttled
    throttledUpdateRef.current = throttle(checkTextAndUpdateSuggestions, 200);
    
    // Executamos a função
    throttledUpdateRef.current();
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        handleSelectionChange();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, handleSelectionChange]);

  const handleSuggestionClick = (suggestion: string) => {
    editor.update(() => {
      const selection = $getSelection();
      
      if ($isRangeSelection(selection)) {
        selection.insertText(suggestion);
        setIsVisible(false);
      }
    });
  };

  // Handle keyboard navigation for suggestions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          if (suggestions.length > 0) {
            e.preventDefault();
            handleSuggestionClick(suggestions[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsVisible(false);
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, suggestions, activeIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Limpar o throttle ao desmontar o componente
      if (throttledUpdateRef.current) {
        throttledUpdateRef.current.cancel();
      }
    };
  }, []);

  return (
    <AutocompleteContainer
      ref={autocompleteRef}
      style={{ top: position.top, left: position.left }}
      $visible={isVisible}
    >
      <SuggestionList>
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={index}
            $active={index === activeIndex}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </SuggestionItem>
        ))}
      </SuggestionList>
    </AutocompleteContainer>
  );
};