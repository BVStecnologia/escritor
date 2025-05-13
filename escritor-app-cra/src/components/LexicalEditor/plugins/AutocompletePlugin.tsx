import React, { useEffect, useState, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import throttle from 'lodash/throttle';
import { 
  $getSelection, 
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextNode,
  $createTextNode,
  $isTextNode
} from 'lexical';
import styled from 'styled-components';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

const AutocompleteContainer = styled.div<{ $visible: boolean }>`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 230px;
  z-index: 999;
  padding: 0.5rem;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  max-height: 300px;
  overflow-y: auto;
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
  class-name: 'suggestion-item';

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

// Adicionar tipagem para o dicionário de sugestões
interface WritingSuggestions {
  [key: string]: string[];
}

// Dicionário mais abrangente de sugestões em português
export const WRITING_SUGGESTIONS: WritingSuggestions = {
  // Sugestões básicas para escrita em português
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
  
  // Palavras específicas que foram destacadas na imagem
  'gabinha': ['menina', 'garota', 'garotinha', 'menininha', 'criança'],
  'indigena': ['indígena', 'índia', 'nativa', 'aborígene', 'autóctone'],
  'linda': ['linda', 'bela', 'bonita', 'formosa', 'bela'],
  'historia': ['história', 'conto', 'estória', 'narrativa', 'relato'],
  
  // Palavras básicas frequentemente mal escritas em português
  'tbm': ['também', 'tampouco', 'todavia', 'timbó'],
  'pq': ['porque', 'porquê', 'por que', 'porventura'],
  'vc': ['você', 'vocês', 'vice', 'vácuo'],
  'msm': ['mesmo', 'mesma', 'mesmos', 'mesmas'],
  'qdo': ['quando', 'quanto', 'querendo', 'quedando'],
  'oq': ['o que', 'o quê', 'ou que', 'okay'],
  'nd': ['nada', 'nodo', 'nádega', 'nédio'],
  'qm': ['quem', 'quão', 'quiasmo', 'queima'],
  'cmg': ['comigo', 'consigo', 'comungo', 'comando'],
  'fds': ['fim de semana', 'fundo', 'fundos', 'fundação'],
  
  // Adicionando sugestões para as palavras com erro na imagem
  'gabina': ['gabinete', 'cabine', 'cabina', 'garota', 'menina'],
  'histori': ['história', 'histórico', 'histórica', 'historiador'],
  'muiot': ['muito', 'muitos', 'mito', 'mútuo'],
  'divertid': ['divertido', 'divertida', 'divertidos', 'divertidas'],
  
  // Palavras problemáticas mencionadas pelo usuário
  'msotrar': ['mostrar', 'mostra', 'demonstrar', 'exibir'],
  'copreta': ['correta', 'completa', 'concreta', 'compacta'],
  'aslecionar': ['selecionar', 'acionar', 'assinalar', 'eleger'],
  'mia': ['minha', 'mais', 'mia', 'miar'],
  'loge': ['longe', 'logo', 'lógica', 'loja'],
  'invex': ['invés', 'inverso', 'inveja', 'inves'],
  'unica': ['única', 'unica', 'unicidade', 'unidade'],
  'interi': ['inteira', 'inteiro', 'interior', 'interim'],
  'linah': ['linha', 'linear', 'linhagem', 'linhas'],
  'resndo': ['refazer', 'resolvendo', 'rescaldo', 'resíduo'],
  'undo': ['desfazer', 'undoso', 'unidade', 'unificado'],
  'refazer': ['refazer', 'refaça', 'repetir', 'recomeçar'],
  'desfazer': ['desfazer', 'desfeito', 'desfaz', 'desfeita'],
  
  // Palavras comumente digitadas erradas em português
  'concerteza': ['com certeza', 'concerto', 'certeza', 'conserto'],
  'agente': ['a gente', 'agente', 'agência', 'agenciar'],
  'derrepente': ['de repente', 'repentino', 'rapidamente', 'subitamente'],
  'envez': ['em vez', 'invés', 'em verso', 'em vês'],
  'maisculo': ['maiúsculo', 'músculo', 'minúsculo', 'máximo'],
  'obiter': ['obter', 'objetivo', 'obliterar', 'habituar'],
  'asim': ['assim', 'asneira', 'assinar', 'assinalar'],
  'seje': ['seja', 'seje', 'segue', 'sege'],
  'cabeçario': ['cabeçalho', 'cabeceira', 'cabeção', 'cabeceiro'],
  'excessao': ['exceção', 'excesso', 'excepcional', 'excessivo'],
  'previlegio': ['privilégio', 'previsto', 'previsível', 'previamente'],
  'compania': ['companhia', 'campanha', 'campina', 'campânula'],
  'exato': ['exato', 'exata', 'extrato', 'êxtase'],
  'apartir': ['a partir', 'apartar', 'aparecer', 'apanhar'],
  'dezde': ['desde', 'dez de', 'deste', 'donde'],
  'iorgute': ['iogurte', 'ioruba', 'iota', 'iodo'],
  'nao': ['não', 'nove', 'novo', 'nau'],
  'qualqer': ['qualquer', 'qualidade', 'qual', 'quebrar'],
  'necesario': ['necessário', 'necessária', 'necessitar', 'necrósico'],
};

// Adiciona palavras novas ao dicionário de WRITING_SUGGESTIONS
const addToSuggestions = (word: string, suggestions: string[]) => {
  if (!WRITING_SUGGESTIONS[word]) {
    WRITING_SUGGESTIONS[word] = suggestions;
  } else {
    // Adicionar novas sugestões sem duplicar
    suggestions.forEach(suggestion => {
      if (!WRITING_SUGGESTIONS[word].includes(suggestion)) {
        WRITING_SUGGESTIONS[word].push(suggestion);
      }
    });
  }
};

// Função para verificar se uma palavra está mal escrita
const checkSpellingError = (word: string): boolean => {
  if (word.length <= 2) return false;
  
  // Remover pontuação para verificação mais precisa
  const cleanWord = word.toLowerCase().replace(/[.,;:!?"'()\-]/g, '');
  
  // Lista simplificada de verificação - mesma do SpellCheckPlugin
  const commonWords = [
    'a', 'e', 'i', 'o', 'u', 'de', 'da', 'do', 'em', 'no', 'na', 'para', 
    'com', 'por', 'que', 'se', 'um', 'uma', 'os', 'as', 'era', 'vez', 
    'muito', 'pouco', 'quase', 'sempre', 'nunca', 'história', 'cidade',
    'texto', 'palavra', 'exemplo', 'capítulo', 'livro', 'personagem', 'foi', 'tem'
  ];
  
  // Se a palavra estiver na lista de palavras comuns, está correta
  if (commonWords.includes(cleanWord)) {
    return false;
  }
  
  // Verificar correspondência exata primeiro
  if (WRITING_SUGGESTIONS[cleanWord]) {
    return true;
  }
  
  // Depois verificar se contém algum prefixo conhecido
  const hasPrefix = Object.keys(WRITING_SUGGESTIONS).some(prefix => 
    cleanWord.includes(prefix.toLowerCase())
  );
  
  // Se não encontrou um prefixo, mas a palavra não é comum,
  // vamos considerá-la como potencial erro e criar sugestões
  if (!hasPrefix && !commonWords.includes(cleanWord) && cleanWord.length >= 3) {
    // Criar sugestões básicas removendo ou modificando letras
    const suggestions = [
      cleanWord.slice(0, -1), // Remover última letra
      cleanWord + 's', // Adicionar s (plural)
      cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1), // Capitalizar
      cleanWord + 'mente' // Adicionar sufixo comum
    ];
    
    // Adicionar ao dicionário para uso futuro
    addToSuggestions(cleanWord, suggestions);
    
    return true;
  }
  
  return hasPrefix;
};

// Função para encontrar sugestões relevantes para uma palavra
const findRelevantSuggestions = (word: string): string[] => {
  if (!word || word.length < 2) return [];
  
  const wordLower = word.toLowerCase().trim();
  let suggestions: string[] = [];
  
  // 1. Verificar correspondência exata no dicionário
  if (WRITING_SUGGESTIONS[wordLower]) {
    return WRITING_SUGGESTIONS[wordLower];
  }
  
  // 2. Verificar palavras similares - começando pelo começo da palavra
  // Primeiro verificamos prefixos mais longos (mais relevante)
  const prefixMatches: {prefix: string, score: number}[] = [];
  
  Object.keys(WRITING_SUGGESTIONS).forEach(key => {
    // Verificar se a palavra começa com esse prefixo
    if (wordLower.startsWith(key)) {
      prefixMatches.push({
        prefix: key,
        score: key.length // quanto mais longo o prefixo, maior a relevância
      });
    }
    // Ou se o prefixo começa com essa palavra
    else if (key.startsWith(wordLower)) {
      prefixMatches.push({
        prefix: key,
        score: wordLower.length * 0.8 // um pouco menos relevante
      });
    }
  });
  
  // Ordenar por score de relevância e usar o melhor
  if (prefixMatches.length > 0) {
    prefixMatches.sort((a, b) => b.score - a.score);
    // Usar as sugestões do prefixo mais relevante
    suggestions = [...WRITING_SUGGESTIONS[prefixMatches[0].prefix]];
  }
  
  // 3. Se ainda não encontrou, verificar cada palavra para similaridade
  if (suggestions.length === 0) {
    // Encontrar a melhor correspondência por similaridade
    let bestMatch = '';
    let highestSimilarity = 0;
    
    Object.keys(WRITING_SUGGESTIONS).forEach(key => {
      // Calcula um score de similaridade simples
      let similarity = 0;
      const minLength = Math.min(key.length, wordLower.length);
      
      // Contar caracteres em comum na mesma posição
      for (let i = 0; i < minLength; i++) {
        if (key[i] === wordLower[i]) {
          similarity++;
        }
      }
      
      // Normalizar score
      similarity = similarity / Math.max(key.length, wordLower.length);
      
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = key;
      }
    });
    
    // Se encontrou uma correspondência com pelo menos 40% de similaridade
    if (highestSimilarity >= 0.4 && bestMatch) {
      suggestions = [...WRITING_SUGGESTIONS[bestMatch]];
    }
  }
  
  // 4. Se ainda não tem sugestões, gerar algumas básicas
  if (suggestions.length === 0) {
    suggestions = [
      wordLower.slice(0, -1), // Remover última letra
      wordLower + 's', // Plural
      wordLower.charAt(0).toUpperCase() + wordLower.slice(1), // Capitalizar
      wordLower + 'mente' // Adicionar sufixo comum
    ];
    
    // Adicionar ao dicionário para uso futuro
    addToSuggestions(wordLower, suggestions);
  }
  
  return suggestions;
};

export const AutocompletePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const throttledUpdateRef = useRef<any>(null);
  const currentMisspelledElementRef = useRef<HTMLElement | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Referência para o timeout de exibição
  const editorRootRef = useRef<HTMLElement | null>(null);

  // Função para atrasar a exibição do autocomplete
  const showWithDelay = (newSuggestions: string[], positionData?: { top: number, left: number }) => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    setIsVisible(false);
    setSuggestions(newSuggestions);
    setActiveIndex(0);
    if (positionData) {
      setPosition(positionData);
    }
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      showTimeoutRef.current = null;
    }, 300);
  };
  
  // Obter referência ao elemento raiz do editor
  useEffect(() => {
    editorRootRef.current = editor.getRootElement();
  }, [editor]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  // Função para verificar se uma palavra está mal escrita
  const checkSpellingError = (word: string): boolean => {
    if (word.length <= 2) return false;
    
    // Remover pontuação para verificação mais precisa
    const cleanWord = word.toLowerCase().replace(/[.,;:!?"'()\-]/g, '');
    
    // Lista simplificada de verificação - mesma do SpellCheckPlugin
    const commonWords = [
      'a', 'e', 'i', 'o', 'u', 'de', 'da', 'do', 'em', 'no', 'na', 'para', 
      'com', 'por', 'que', 'se', 'um', 'uma', 'os', 'as', 'era', 'vez', 
      'muito', 'pouco', 'quase', 'sempre', 'nunca', 'história', 'cidade',
      'texto', 'palavra', 'exemplo', 'capítulo', 'livro', 'personagem', 'foi', 'tem'
    ];
    
    // Se a palavra estiver na lista de palavras comuns, está correta
    if (commonWords.includes(cleanWord)) {
      return false;
    }
    
    // Verificar correspondência exata primeiro
    if (WRITING_SUGGESTIONS[cleanWord]) {
      return true;
    }
    
    // Depois verificar se contém algum prefixo conhecido
    return Object.keys(WRITING_SUGGESTIONS).some(prefix => 
      cleanWord.includes(prefix.toLowerCase())
    );
  }

  // Função melhorada para detectar palavras individuais com erros
  const handleSelectionChange = useCallback(() => {
    const checkTextAndUpdateSuggestions = () => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setIsVisible(false);
          return;
        }
        const selectedText = selection.getTextContent().trim();
        const isWord = !selectedText.includes(' ');
        if (!isWord || selectedText.length < 2) {
          setIsVisible(false);
          return;
        }
        const hasError = checkSpellingError(selectedText);
        let foundSuggestions = findRelevantSuggestions(selectedText);
        if (foundSuggestions.length > 0) {
          const uniqueSuggestions = Array.from(new Set(foundSuggestions)).slice(0, 5);
          setSuggestions(uniqueSuggestions);
          
          // Calcular posição baseada na seleção atual
          const domSelection = window.getSelection();
          if (!domSelection || domSelection.rangeCount === 0) {
            setIsVisible(true); // Mostrar mesmo sem posição precisa
            return;
          }
          
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          const editorEl = document.querySelector('.editor-input');
          if (!editorEl) {
            setIsVisible(true); // Mostrar mesmo sem referência do editor
            return;
          }
          
          const editorRect = editorEl.getBoundingClientRect();
          const menuWidth = 230;
          
          let menuLeft = rect.left - editorRect.left + window.scrollX;
          if (menuLeft + menuWidth > editorRect.width - 20) {
            menuLeft = Math.max(20, rect.left - editorRect.left - menuWidth + window.scrollX);
          }
          
          const positionData = {
            top: rect.bottom - editorRect.top + window.scrollY + 8,
            left: menuLeft
          };
          
          setPosition(positionData);
          setIsVisible(true);
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
        // Verificar se há texto selecionado no editor
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            setIsVisible(false);
            return;
          }
          // Verificar se é uma palavra única (sem espaços)
          const word = spellingErrorElement.textContent?.trim() || '';
          if (!word || word.includes(' ')) {
            setIsVisible(false);
            return;
          }
          // Salvar referência ao elemento com erro
          currentMisspelledElementRef.current = spellingErrorElement as HTMLElement;
          // Obter o texto da palavra com erro - usar o atributo data-word se disponível
          const errorWord = (spellingErrorElement as HTMLElement).getAttribute('data-word');
          if (word) {
            // Usar sugestões pré-computadas do atributo data-suggestions, se disponível
            let foundSuggestions: string[] = [];
            try {
              // Tentar obter sugestões do atributo data-suggestions
              const suggestionsAttr = (spellingErrorElement as HTMLElement).getAttribute('data-suggestions');
              if (suggestionsAttr) {
                foundSuggestions = JSON.parse(suggestionsAttr);
              } 
            } catch (error) {
              console.log('Erro ao obter sugestões do atributo:', error);
            }
            // Se não existirem sugestões no atributo, usar nosso algoritmo aprimorado
            if (foundSuggestions.length === 0) {
              foundSuggestions = findRelevantSuggestions(word);
            }
            if (foundSuggestions.length > 0) {
              // Eliminar duplicatas e limitar a 5 sugestões
              const uniqueSuggestions = Array.from(new Set(foundSuggestions)).slice(0, 5);
              // Posicionar o menu próximo da palavra clicada
              const rect = (spellingErrorElement as HTMLElement).getBoundingClientRect();
              const editorEl = document.querySelector('.editor-input');
              if (!editorEl) return;
              const editorRect = editorEl.getBoundingClientRect();
              const menuWidth = 220;
              let menuLeft = rect.left - editorRect.left + window.scrollX;
              if (menuLeft + menuWidth > editorRect.width - 20) {
                menuLeft = Math.max(20, rect.left - editorRect.left - menuWidth + window.scrollX);
              }
              const positionData = {
                top: rect.bottom - editorRect.top + window.scrollY + 30,
                left: menuLeft
              };
              setPosition(positionData);
              showWithDelay(uniqueSuggestions);
            }
          }
        });
      }
    };
    
    // Anexar o listener ao documento
    document.addEventListener('click', handleSpellingErrorClick);
    
    // Limpar ao desmontar
    return () => {
      document.removeEventListener('click', handleSpellingErrorClick);
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

  // Função para lidar com cliques em sugestões
  const handleSuggestionClick = (suggestion: string) => {
    // Se tiver um elemento com erro, substituímos o texto diretamente nele
    if (currentMisspelledElementRef.current) {
      const misspelledElement = currentMisspelledElementRef.current;
      const word = misspelledElement.getAttribute('data-word') || misspelledElement.textContent || '';
      
      if (word) {
        // Métodos de manipulação do editor
        editor.update(() => {
          // Em vez de tentar usar o nó diretamente, vamos usar a seleção atual ou criar uma
          const selection = $getSelection();
          
          if (selection && $isRangeSelection(selection)) {
            selection.insertText(suggestion);
          }
        });
      }
    } else {
      // Caso não tenha um elemento específico, inserir no cursor
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Se há uma seleção, substituir pelo texto sugerido
          selection.insertText(suggestion);
        }
      });
    }
    
    // Limpar e esconder o menu
    setIsVisible(false);
    currentMisspelledElementRef.current = null;
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

  // Posicionar container baseado nas coordenadas calculadas
  useEffect(() => {
    if (autocompleteRef.current && isVisible) {
      autocompleteRef.current.style.top = `${position.top}px`;
      autocompleteRef.current.style.left = `${position.left}px`;
    }
  }, [isVisible, position]);
  
  return (
    <AutocompleteContainer
      ref={autocompleteRef}
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