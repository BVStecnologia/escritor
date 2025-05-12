import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import throttle from 'lodash/throttle';
import { 
  $getSelection, 
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextNode,
  $createTextNode
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
  transform: translateY(-5px); /* Deslocar ligeiramente para cima para ficar mais próximo da palavra */
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
  // Adicionando sugestões para as palavras com erro na imagem
  'gabina': ['gabinete', 'gabinha', 'cabina', 'gabrina', 'Sabina'],
  'histori': ['história', 'histórico', 'histórica', 'historiador'],
  'muiot': ['muito', 'muitos', 'mito', 'músico'],
  'divertid': ['divertido', 'divertida', 'divertidos', 'divertidas'],
  // Novas sugestões para palavras com erro
  'msotrar': ['mostrar', 'mostra', 'demonstrar', 'exibir'],
  'copreta': ['correta', 'completa', 'concreta', 'compacta'],
  'aslecionar': ['selecionar', 'acionar', 'assinalar', 'eleger'],
  'mia': ['minha', 'mais', 'mia', 'miar'],
  'loge': ['longe', 'logo', 'lógica', 'loja'],
  'invex': ['invés', 'inverso', 'inveja', 'inves'],
  'unica': ['única', 'unica', 'unicidade', 'unidade'],
  'interi': ['inteira', 'inteiro', 'interior', 'interim'],
  'linah': ['linha', 'linear', 'linhagem', 'linhas']
};

export const AutocompletePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const throttledUpdateRef = useRef<any>(null);
  const currentMisspelledElementRef = useRef<HTMLElement | null>(null);

  // Função para verificar se uma palavra está mal escrita
  const checkSpellingError = (word: string): boolean => {
    // Lista simplificada de verificação - uma implementação real usaria uma biblioteca ou API
    const commonWords = [
      'a', 'e', 'i', 'o', 'u', 'de', 'da', 'do', 'em', 'no', 'na', 'para', 
      'com', 'por', 'que', 'se', 'um', 'uma', 'os', 'as', 'era', 'vez', 
      'muito', 'pouco', 'quase', 'sempre', 'nunca', 'história', 'cidade',
      'texto', 'palavra', 'exemplo', 'capítulo', 'livro', 'personagem'
    ];
    
    // Se a palavra estiver na lista de palavras comuns, está correta
    if (commonWords.includes(word.toLowerCase())) {
      return false;
    }
    
    // Se a palavra for um prefixo conhecido em nosso dicionário
    return Object.keys(WRITING_SUGGESTIONS).some(prefix => 
      word.toLowerCase().includes(prefix.toLowerCase())
    );
  }

  // Função melhorada para detectar palavras individuais com erros
  const handleSelectionChange = useCallback(() => {
    const checkTextAndUpdateSuggestions = () => {
      editor.update(() => {
        const selection = $getSelection();
        
        // Manter a verificação de seleção válida
        if (!$isRangeSelection(selection)) {
          setIsVisible(false);
          return;
        }

        // Obter o texto selecionado
        const selectedText = selection.getTextContent().trim();
        
        // Verificar seleção única e específica com mínimo de 2 caracteres
        if (selectedText && selectedText.length >= 2) {
          // Verificar se é uma única palavra (sem espaços)
          const isWord = !selectedText.includes(' ');
          const wordToCheck = isWord ? selectedText : selectedText.split(/\s+/)[0];
          
          if (wordToCheck.length >= 2) {
            // Verificar se a palavra selecionada tem erro ortográfico
            const hasError = checkSpellingError(wordToCheck);

            // Procurar sugestões para a palavra
            let foundSuggestions: string[] = [];
            
            Object.entries(WRITING_SUGGESTIONS).forEach(([prefix, words]) => {
              // Verificar se o prefixo está contido na palavra
              if (wordToCheck.toLowerCase().includes(prefix.toLowerCase())) {
                foundSuggestions = [...foundSuggestions, ...words];
              }
            });
            
            if (foundSuggestions.length > 0) {
              setSuggestions(foundSuggestions);
              setActiveIndex(0);
              
              // Limpar a referência do elemento atual com erro
              currentMisspelledElementRef.current = null;
              
              // Posicionar o menu próximo da palavra selecionada
              requestAnimationFrame(() => {
                const domSelection = window.getSelection();
                if (domSelection && domSelection.rangeCount > 0) {
                  const range = domSelection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  
                  // Encontrar o elemento do editor
                  const editorEl = document.querySelector('.editor-input');
                  if (!editorEl) return;
                  
                  const editorRect = editorEl.getBoundingClientRect();
                  
                  // Posicionar diretamente abaixo da palavra
                  setPosition({
                    top: rect.bottom - editorRect.top + window.scrollY,
                    left: rect.left - editorRect.left + window.scrollX
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
        } else {
          setIsVisible(false);
        }
      });
    };

    // Cancelar throttle anterior se existir
    if (throttledUpdateRef.current) {
      throttledUpdateRef.current.cancel();
    }

    // Criar novo throttle com atraso reduzido para 150ms
    throttledUpdateRef.current = throttle(checkTextAndUpdateSuggestions, 150);
    
    // Executar
    throttledUpdateRef.current();
  }, [editor]);

  // Adicionar listener para cliques em palavras com erro ortográfico
  useEffect(() => {
    const handleSpellingErrorClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      
      // Verificar se o elemento clicado tem a classe de erro ortográfico
      // ou se é filho de um elemento com erro
      const spellingErrorElement = target.classList?.contains('spelling-error') 
        ? target 
        : target.closest('.spelling-error');
      
      if (spellingErrorElement) {
        // Salvar referência ao elemento com erro
        currentMisspelledElementRef.current = spellingErrorElement as HTMLElement;
        
        // Obter o texto da palavra com erro
        const word = spellingErrorElement.textContent?.trim() || '';
        
        if (word) {
          // Encontrar sugestões para esta palavra
          let foundSuggestions: string[] = [];
          
          Object.entries(WRITING_SUGGESTIONS).forEach(([prefix, words]) => {
            if (word.toLowerCase().includes(prefix.toLowerCase())) {
              foundSuggestions = [...foundSuggestions, ...words];
            }
          });
          
          if (foundSuggestions.length > 0) {
            setSuggestions(foundSuggestions);
            setActiveIndex(0);
            
            // Posicionar o menu próximo da palavra clicada
            const rect = spellingErrorElement.getBoundingClientRect();
            
            // Encontrar o elemento do editor
            const editorEl = document.querySelector('.editor-input');
            if (!editorEl) return;
            
            const editorRect = editorEl.getBoundingClientRect();
            
            // Posicionar abaixo da palavra
            setPosition({
              top: rect.bottom - editorRect.top + window.scrollY,
              left: rect.left - editorRect.left + window.scrollX
            });
            
            setIsVisible(true);
            mouseEvent.preventDefault(); // Evitar que a seleção seja perdida
            mouseEvent.stopPropagation(); // Parar propagação do evento
          }
        }
      }
    };
    
    // Adicionar listener ao editor
    const editorElement = document.querySelector('.editor-input');
    if (editorElement) {
      editorElement.addEventListener('click', handleSpellingErrorClick);
    }
    
    return () => {
      if (editorElement) {
        editorElement.removeEventListener('click', handleSpellingErrorClick);
      }
    };
  }, []);

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
    // Primeiro, vamos tentar obter o elemento com erro que foi clicado
    if (currentMisspelledElementRef.current) {
      const misspelledElement = currentMisspelledElementRef.current;
      
      // Abordagem direta: substitua o conteúdo do elemento
      editor.update(() => {
        try {
          // 1. Se estamos lidando com um span específico com classe spelling-error
          if (misspelledElement.classList.contains('spelling-error')) {
            // Criar uma seleção para esta palavra
            const selection = window.getSelection();
            if (selection) {
              // Limpar qualquer seleção existente
              selection.removeAllRanges();
              
              // Criar um range que seleciona exatamente a palavra com erro
              const range = document.createRange();
              range.selectNode(misspelledElement);
              selection.addRange(range);
              
              // Agora que a palavra com erro está selecionada, podemos substituí-la
              const editorSelection = $getSelection();
              if ($isRangeSelection(editorSelection)) {
                // Substituir a palavra selecionada com a sugestão
                editorSelection.insertText(suggestion);
                
                // Remover a marca de erro do elemento pai
                const parentNode = misspelledElement.parentElement;
                if (parentNode) {
                  parentNode.setAttribute('data-spell-checked', 'false');
                }
              }
            }
          } 
          // 2. Fallback: se estamos lidando com um nó de texto completo
          else {
            const nodeKey = misspelledElement.getAttribute('data-lexical-node-key');
            if (nodeKey) {
              // Tentar encontrar a palavra incorreta no texto
              const oldText = misspelledElement.textContent || '';
              
              // Modificar diretamente o DOM, depois deixar o Lexical sincronizar
              // Isso é mais direto para o usuário
              const badWordPattern = new RegExp(Object.keys(WRITING_SUGGESTIONS).join('|'), 'i');
              const match = oldText.match(badWordPattern);
              
              if (match) {
                const badWord = match[0];
                const correctedText = oldText.replace(badWord, suggestion);
                
                // Criar uma seleção para esta palavra
                const selection = window.getSelection();
                if (selection) {
                  // Limpar qualquer seleção existente
                  selection.removeAllRanges();
                  
                  // Criar um range que seleciona todo o texto (depois vamos refinar)
                  const range = document.createRange();
                  range.selectNodeContents(misspelledElement);
                  
                  // Ajustar os limites para selecionar apenas a palavra com erro
                  const startOffset = oldText.indexOf(badWord);
                  if (startOffset >= 0) {
                    range.setStart(misspelledElement.firstChild!, startOffset);
                    range.setEnd(misspelledElement.firstChild!, startOffset + badWord.length);
                  }
                  
                  selection.addRange(range);
                  
                  // Agora que a palavra está selecionada, podemos substituí-la
                  document.execCommand('insertText', false, suggestion);
                }
              }
            }
          }
        } catch (error) {
          console.error('Erro ao substituir palavra:', error);
          
          // Fallback: usar a abordagem simples
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(suggestion);
          }
        }
      });
      
      // Limpar a referência e esconder as sugestões
      currentMisspelledElementRef.current = null;
      setIsVisible(false);
      return;
    }

    // Caso padrão: usar a seleção atual para substituir o texto
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(suggestion);
        setIsVisible(false);
      }
    });
  };

  // Navegação pelo teclado
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

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (throttledUpdateRef.current) {
        throttledUpdateRef.current.cancel();
      }
    };
  }, []);

  // Ajustar posição do menu para evitar que saia dos limites da tela
  useEffect(() => {
    if (isVisible && autocompleteRef.current) {
      const popover = autocompleteRef.current;
      const editorEl = document.querySelector('.editor-input');
      
      if (editorEl) {
        const editorRect = editorEl.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        
        // Verificar se está saindo pela direita
        const rightEdge = position.left + popoverRect.width;
        if (rightEdge > editorRect.width - 20) {
          const newLeft = Math.max(20, editorRect.width - 20 - popoverRect.width);
          popover.style.left = `${newLeft}px`;
        }
      }
    }
  }, [isVisible, position]);

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