import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  TextNode, 
  $createTextNode,
  $isTextNode,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  ElementNode
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { 
  COMMAND_PRIORITY_LOW,
  createCommand
} from 'lexical';
import { WRITING_SUGGESTIONS } from './AutocompletePlugin';

// Lista simplificada de palavras comuns para verificação ortográfica
const COMMON_WORDS = [
  'a', 'e', 'i', 'o', 'u', 'de', 'da', 'do', 'em', 'no', 'na', 'para', 
  'com', 'por', 'que', 'se', 'um', 'uma', 'os', 'as', 'era', 'vez', 
  'muito', 'pouco', 'quase', 'sempre', 'nunca', 'história', 'cidade',
  'texto', 'palavra', 'exemplo', 'capítulo', 'livro', 'personagem', 'foi', 'tem'
];

// Palavras com erro ortográfico conhecidas - derivadas das chaves de WRITING_SUGGESTIONS
const MISSPELLED_WORDS = Object.keys(WRITING_SUGGESTIONS);

// Adicionando dinamicamente novas palavras ao dicionário
const addWordToDictionary = (word: string, suggestions: string[]) => {
  if (!WRITING_SUGGESTIONS[word]) {
    // @ts-ignore - Isso é seguro pois estamos apenas adicionando novas entradas
    WRITING_SUGGESTIONS[word] = suggestions;
  }
};

// Função para verificar se uma palavra é potencialmente incorreta
function hasPotentialSpellingError(word: string): boolean {
  if (word.length <= 2) return false;
  
  // Remover pontuação
  const cleanWord = word.toLowerCase().replace(/[.,;:!?"'()\-]/g, '');
  
  // Se for uma palavra comum, não é erro
  if (COMMON_WORDS.includes(cleanWord)) {
    return false;
  }
  
  // Verificação direta contra o dicionário expandido
  if (WRITING_SUGGESTIONS[cleanWord]) {
    return true;
  }
  
  // Verificar se a palavra está na lista de palavras incorretas
  // ou se contém algum prefixo conhecido de erro
  const hasKnownError = MISSPELLED_WORDS.some(badWord => 
    cleanWord === badWord || cleanWord.includes(badWord)
  );
  
  // Se não está no dicionário, mas tem pelo menos 4 caracteres,
  // vamos considerá-la como potencial erro e criar sugestões genéricas
  if (!hasKnownError && cleanWord.length >= 4 && !COMMON_WORDS.includes(cleanWord)) {
    // Criar sugestões básicas
    const suggestions = [
      cleanWord.slice(0, -1), // Remover última letra 
      cleanWord + 's', // Plural
      cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1), // Capitalizar
      cleanWord + 'mente' // Adicionar sufixo comum
    ];
    
    // Adicionar ao dicionário
    addWordToDictionary(cleanWord, suggestions);
    
    return true;
  }
  
  return hasKnownError;
}

// Comando personalizado para marcar palavras com erro
export const MARK_SPELLING_ERROR = createCommand('MARK_SPELLING_ERROR');

export const SpellCheckPlugin = () => {
  const [editor] = useLexicalComposerContext();
  
  // Função auxiliar para marcar visualmente uma palavra com erro
  const markSpellingError = (domElement: HTMLElement | null, word: string) => {
    if (!domElement) return;
    
    // Verificar se o elemento contém texto
    const textContent = domElement.textContent;
    if (!textContent) return;
    
    // Não fazer nada se o elemento já foi processado
    if (domElement.getAttribute('data-spell-checked') === 'true') return;
    
    // Marcar o elemento como processado para evitar reprocessamento
    domElement.setAttribute('data-spell-checked', 'true');
    
    // Verificar se a palavra está no conteúdo do texto
    if (textContent.includes(word)) {
      // Precisamos usar a abordagem de criar um novo elemento HTML
      // para marcar apenas a palavra específica, não todo o texto
      let newHTML = '';
      let currentIndex = 0;
      
      // Usamos uma expressão regular mais robusta para identificar a palavra com limites de palavra
      // Isso evita que prefixos ou partes da palavra sejam marcados incorretamente
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape RegExp special chars
      const wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'g');
      let match;
      
      while ((match = wordRegex.exec(textContent)) !== null) {
        // Texto antes da palavra com erro
        newHTML += textContent.substring(currentIndex, match.index);
        
        // Encontrar sugestões para esta palavra
        let suggestions: string[] = [];
        const wordLower = word.toLowerCase();
        
        if (WRITING_SUGGESTIONS[wordLower]) {
          suggestions = WRITING_SUGGESTIONS[wordLower];
        } else {
          // Criar sugestões genéricas se não existirem
          suggestions = [
            wordLower.slice(0, -1),
            wordLower + 's',
            wordLower.charAt(0).toUpperCase() + wordLower.slice(1),
            wordLower + 'mente'
          ];
          addWordToDictionary(wordLower, suggestions);
        }
        
        // A palavra com erro, envolvida em um span com a classe de erro
        // Adicionar atributo data-word para ajudar na identificação posterior
        // E atributo data-suggestions com as sugestões em JSON
        newHTML += `<span class="spelling-error" 
          data-lexical-node-key="${domElement.getAttribute('data-lexical-node-key')}" 
          data-word="${word}" 
          data-suggestions='${JSON.stringify(suggestions)}'>${word}</span>`;
        
        // Atualizar o índice atual
        currentIndex = match.index + word.length;
      }
      
      // Adicionar o restante do texto após a última ocorrência
      newHTML += textContent.substring(currentIndex);
      
      // Substituir o HTML do elemento
      domElement.innerHTML = newHTML;
    }
  };
  
  useEffect(() => {
    // Transformador que examina TextNodes em busca de erros ortográficos
    const textNodeTransformer = (node: TextNode) => {
      // Verifica cada palavra no texto
      const text = node.getTextContent();
      
      // Dividir o texto em palavras usando limites de palavra
      const words = text.split(/\b/);
      
      // Verificar cada palavra individualmente
      for (const word of words) {
        // Pular palavras vazias, muito curtas ou sem letras
        if (!word || word.length <= 2 || !/[a-zA-Z]/.test(word)) continue;
        
        // Verificar se a palavra tem erro ortográfico
        if (hasPotentialSpellingError(word)) {
          // Obter o DOM element para esta palavra
          setTimeout(() => {
            try {
              const nodeKey = node.getKey();
              const domElement = editor.getElementByKey(nodeKey);
              
              if (domElement) {
                markSpellingError(domElement, word);
              }
            } catch (e) {
              console.error('Erro ao marcar palavra com erro ortográfico:', e);
            }
          }, 0);
        }
      }
    };
    
    // Registrar transformador para TextNodes
    const removeTransform = editor.registerNodeTransform(TextNode, textNodeTransformer);
    
    // Observador de mutação para lidar com elementos dinâmicos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // Verificar novos nós adicionados
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.classList.contains('spelling-error')) {
                // Garantir que o atributo data-spell-checked está definido
                element.setAttribute('data-spell-checked', 'true');
              }
            }
          });
        }
      });
    });

    // Iniciar observação do editor
    const editorElement = document.querySelector('.editor-input');
    if (editorElement) {
      observer.observe(editorElement, { childList: true, subtree: true });
    }
    
    return () => {
      removeTransform();
      observer.disconnect();
    };
  }, [editor]);

  return null;
};

export default SpellCheckPlugin; 