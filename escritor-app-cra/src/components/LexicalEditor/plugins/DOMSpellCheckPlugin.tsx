import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { replaceSelectedText } from '../../../utils/domEditorUtils';
import { $getNodeByKey, TextNode } from 'lexical';

// Lista básica de palavras para correção ortográfica (apenas para exemplo)
// Em um ambiente de produção, deveria usar um dicionário mais completo
// ou um serviço de correção ortográfica
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
  'fascinacao': ['fascinação'],
  'frustacao': ['frustração'],
  'geito': ['jeito'],
  'hestiar': ['hesitar'],
  'iorgute': ['iogurte'],
  'linguiça': ['linguiça'],
  'linguica': ['linguiça'],
  'mau educado': ['mal-educado'],
  'mau humorado': ['mal-humorado'],
  'mui': ['muito'],
  'nóis': ['nós'],
  'obiter': ['obter'],
  'preciza': ['precisa'],
  'pre-conceito': ['preconceito'],
  'pre conceito': ['preconceito'],
  'previlégio': ['privilégio'],
  'privilégio': ['privilégio'],
  'regosijo': ['regozijo'],
  'rijido': ['rígido'],
  'rigido': ['rígido'],
  'rubrica': ['rubrica'],
  'sastisfação': ['satisfação'],
  'satisfacao': ['satisfação'],
  'supertição': ['superstição'],
  'supreendente': ['surpreendente'],
  'surpriendente': ['surpreendente'],
  'têxtil': ['têxtil'],
  'textil': ['têxtil']
};

interface DOMSpellCheckPluginProps {
  checkInterval?: number;
}

// Estilo para palavras com erro ortográfico
const spellCheckStyles = `
  .spelling-error {
    text-decoration: wavy underline #ef4444;
    text-decoration-thickness: 2px;
    cursor: pointer;
    padding: 0 2px;
    border-radius: 2px;
  }
  
  .spelling-error:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

// Container para o menu de sugestões
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

export const DOMSpellCheckPlugin: React.FC<DOMSpellCheckPluginProps> = ({ checkInterval = 3000 }) => {
  const [editor] = useLexicalComposerContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Função para aplicar estilos CSS para o editor
  useEffect(() => {
    // Injetar estilos CSS para erros ortográficos
    const styleEl = document.createElement('style');
    styleEl.innerHTML = spellCheckStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      // Limpar os estilos ao desmontar
      document.head.removeChild(styleEl);
    };
  }, []);

  // Função para verificar a ortografia do texto
  const checkSpelling = useCallback(() => {
    // Obter o conteúdo do editor
    const editorElement = document.querySelector('.editor-container');
    if (!editorElement) return;
    
    // Remover marcações anteriores
    const oldMarkedWords = editorElement.querySelectorAll('.spelling-error');
    oldMarkedWords.forEach(el => {
      // Preservar o texto mas remover a marcação
      const text = el.textContent || '';
      el.replaceWith(document.createTextNode(text));
    });
    
    // Obter todo o conteúdo textual
    const textNodes = getTextNodes(editorElement);
    
    // Verificar cada nó de texto
    textNodes.forEach(node => {
      const text = node.nodeValue || '';
      
      // Verificar se o nó está dentro de algum componente da interface (como menus, popups, etc.)
      // para evitar verificação ortográfica em elementos da UI
      let isInUIComponent = false;
      let parent = node.parentNode;
      while (parent) {
        if (parent instanceof Element) {
          // Lista de classes que identificam componentes de interface onde não devemos 
          // mostrar sublinhados vermelhos
          const uiClasses = [
            'AIToolsContainer', 
            'SuggestionsContainer',
            'spelling-error',
            'ResultContainer',
            'SuggestionItem',
            'ButtonRow',
            'ActionButton',
            'ToolButton'
          ];
          
          // Verificar se o elemento tem alguma das classes de UI
          const classList = Array.from(parent.classList || []);
          if (uiClasses.some(cls => classList.includes(cls) || 
              parent instanceof Element && parent.getAttribute('style')?.includes('position: absolute'))) {
            isInUIComponent = true;
            break;
          }
        }
        parent = parent.parentNode;
      }
      
      // Pular se estiver em um componente de UI
      if (isInUIComponent) return;
      
      // Obter as palavras do texto
      const words = text.split(/\s+/);
      
      // Verificar cada palavra
      words.forEach(word => {
        // Ignorar palavras vazias ou muito curtas
        if (!word || word.length < 3) return;
        
        // Normalizar a palavra para verificação
        const normalizedWord = word.toLowerCase().trim()
          .replace(/[.,;:!?()[\]{}"""'']/g, '');
        
        // Verificar se a palavra está errada
        if (COMMON_MISSPELLINGS[normalizedWord] || 
            (normalizedWord.length > 5 && Math.random() < 0.05)) { // Simular verificação aleatória para demonstração
          
          try {
            // Escapar caracteres especiais de expressões regulares
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Substituir a palavra com o span marcado
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
            const parentNode = node.parentNode;
            
            if (parentNode && parentNode.nodeType === Node.ELEMENT_NODE) {
              const element = parentNode as HTMLElement;
              const innerHTML = element.innerHTML;
              const newInnerHTML = innerHTML.replace(regex, `<span class="spelling-error" data-word="${word}">${word}</span>`);
              if (innerHTML !== newInnerHTML) {
                element.innerHTML = newInnerHTML;
              }
            }
          } catch (error) {
            console.error('Erro ao criar regex para verificação ortográfica:', error);
          }
        }
      });
    });
    
    // Adicionar listeners nos elementos marcados
    addSpellingErrorListeners();
  }, []);

  // Função de utilidade para obter todos os nós de texto de um elemento
  const getTextNodes = (node: Node): Text[] => {
    const textNodes: Text[] = [];
    
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    } else {
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        textNodes.push(...getTextNodes(childNodes[i]));
      }
    }
    
    return textNodes;
  };

  // Função para adicionar event listeners em palavras com erro
  const addSpellingErrorListeners = () => {
    const spellingErrors = document.querySelectorAll('.spelling-error');
    
    spellingErrors.forEach(element => {
      // Remover listeners antigos
      element.removeEventListener('click', handleSpellingErrorClick);
      
      // Adicionar novo listener
      element.addEventListener('click', handleSpellingErrorClick);
    });
  };

  // Handler para click em palavras com erro
  const handleSpellingErrorClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const word = target.dataset.word || target.textContent || '';
    const rect = target.getBoundingClientRect();
    
    // Obter sugestões para a palavra
    const normalizedWord = word.toLowerCase().trim()
      .replace(/[.,;:!?()[\]{}"""'']/g, '');
    
    let possibleSuggestions = COMMON_MISSPELLINGS[normalizedWord] || [];
    
    // Se não temos sugestões específicas, criar algumas baseadas em regras simples
    if (possibleSuggestions.length === 0) {
      try {
        // Para demo, criar algumas sugestões simples com tratamento de erro
        const suggestions = [];
        
        // Capitalizada
        suggestions.push(word.charAt(0).toUpperCase() + word.slice(1));
        
        try {
          // Adicionando hífen (com verificação de segurança)
          suggestions.push(word.replace(/([aei])([aei])/g, '$1-$2'));
        } catch (e) {
          console.error('Erro na regex de hífen:', e);
        }
        
        // Versão no plural
        suggestions.push(word + 's');
        
        try {
          // Pluralizar palavras com "ção"
          if (word.includes('ção')) {
            suggestions.push(word.replace(/ção/g, 'ções'));
          }
        } catch (e) {
          console.error('Erro na regex de ção:', e);
        }
        
        try {
          // Duplicar consoantes (com verificação de segurança)
          suggestions.push(word.replace(/([aeiou])([^aeiou])/g, '$1$2$2'));
        } catch (e) {
          console.error('Erro na regex de duplicação:', e);
        }
        
        // Filtrar sugestões válidas e remover a própria palavra
        possibleSuggestions = suggestions
          .filter(suggestion => suggestion && suggestion !== word);
      } catch (error) {
        console.error('Erro ao gerar sugestões:', error);
        possibleSuggestions = [word + '?']; // Fallback simples
      }
    }
    
    // Mostrar menu de sugestões
    setSuggestions(possibleSuggestions);
    setSelectedWord(word);
    
    // Posicionar popup de sugestões
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
      const editorRect = editorContainer.getBoundingClientRect();
      
      setPopupPosition({
        top: rect.bottom - editorRect.top,
        left: rect.left - editorRect.left
      });
    }
  };

  // Lidar com clique em uma sugestão
  const handleSuggestionClick = (suggestion: string) => {
    // Criar seleção na palavra com erro
    const spellingErrors = document.querySelectorAll('.spelling-error');
    let targetElement: Element | null = null;
    
    spellingErrors.forEach(el => {
      if (el.textContent === selectedWord) {
        targetElement = el;
      }
    });
    
    if (targetElement) {
      // Selecionar a palavra
      const range = document.createRange();
      range.selectNodeContents(targetElement);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Substituir com a sugestão
        replaceSelectedText(suggestion);
      }
    }
    
    // Limpar sugestões
    setSuggestions([]);
    setPopupPosition(null);
  };

  // Esconder o popup quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setPopupPosition(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Verificar ortografia periodicamente
  useEffect(() => {
    const debouncedSpellCheck = debounce(checkSpelling, 1000);
    
    // Verificar ortografia quando o editor mudar
    const observer = new MutationObserver((mutations) => {
      // Não responder a mudanças feitas pela própria verificação ortográfica
      const isSpellCheckChange = mutations.some(mutation => 
        mutation.target.nodeType === Node.ELEMENT_NODE &&
        (mutation.target as Element).classList.contains('spelling-error')
      );
      
      if (!isSpellCheckChange) {
        debouncedSpellCheck();
      }
    });
    
    const editorElement = document.querySelector('.editor-container');
    if (editorElement) {
      observer.observe(editorElement, { 
        childList: true, 
        subtree: true, 
        characterData: true 
      });
      
      // Verificação inicial
      checkSpelling();
      
      // Verificação periódica
      const interval = setInterval(checkSpelling, checkInterval);
      
      return () => {
        observer.disconnect();
        clearInterval(interval);
        debouncedSpellCheck.cancel();
      };
    }
  }, [checkSpelling, checkInterval]);

  // Renderizar apenas o popup de sugestões quando necessário
  return popupPosition ? (
    <SuggestionsPopup 
      ref={popupRef}
      style={{ 
        top: popupPosition.top, 
        left: popupPosition.left 
      }}
    >
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={index}
          onClick={() => handleSuggestionClick(suggestion)}
        >
          {suggestion}
        </SuggestionItem>
      ))}
    </SuggestionsPopup>
  ) : null;
}