import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { WRITING_SUGGESTIONS } from './AutocompletePlugin';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';

interface DOMSpellCheckPluginProps {
  checkInterval?: number;
}

// Container para o popup de dicionário com suporte a tema claro/escuro
const DictionaryPopup = styled.div<{ isDarkMode: boolean }>`
  position: fixed; /* Usar fixed para evitar problemas de posicionamento */
  z-index: 9999;
  background: ${({ isDarkMode }) => isDarkMode ? '#2D3748' : 'white'};
  border: 1px solid ${({ isDarkMode }) => isDarkMode ? '#4A5568' : '#ddd'};
  border-radius: 8px;
  box-shadow: 0 2px 15px ${({ isDarkMode }) => isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
  padding: 0.75rem;
  width: 220px;
  max-height: 200px;
  overflow-y: auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  color: ${({ isDarkMode }) => isDarkMode ? '#E2E8F0' : '#333'};
`;

const PopupTitle = styled.div<{ isDarkMode: boolean }>`
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ isDarkMode }) => isDarkMode ? '#4A5568' : '#eee'};
  color: ${({ isDarkMode }) => isDarkMode ? '#E2E8F0' : '#333'};
`;

const SuggestionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SuggestionItem = styled.li<{ isDarkMode: boolean }>`
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 2px;
  color: ${({ isDarkMode }) => isDarkMode ? '#E2E8F0' : '#333'};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isDarkMode }) => isDarkMode ? '#4A5568' : '#f0f0f0'};
    transform: translateX(2px);
  }
`;

// Função auxiliar para normalizar uma palavra para comparação
const normalizeWord = (word: string): string => {
  return word.toLowerCase()
    .trim()
    .normalize("NFD")  // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, ""); // Remover diacríticos
};

// Encontrar sugestões para uma palavra - versão aprimorada
const findDictionarySuggestions = (word: string): string[] => {
  if (!word || word.length < 2) return [];
  
  // Palavra original
  const originalWord = word.trim();
  // Versão normalizada para comparação
  const wordNorm = normalizeWord(originalWord);
  // Resultado final
  let suggestions: string[] = [];
  
  // 1. Sempre incluir a própria palavra nas sugestões
  suggestions.push(originalWord);
  
  // 2. Versão com primeira letra maiúscula se a palavra for toda minúscula
  if (originalWord === originalWord.toLowerCase() && originalWord.length > 1) {
    suggestions.push(originalWord.charAt(0).toUpperCase() + originalWord.slice(1));
  }
  
  // 3. Verificar correspondência direta no dicionário (não sensível a maiúsculas/minúsculas)
  Object.keys(WRITING_SUGGESTIONS).forEach(key => {
    const keyNorm = normalizeWord(key);
    
    // Correspondência exata da chave
    if (keyNorm === wordNorm) {
      suggestions = [...suggestions, ...WRITING_SUGGESTIONS[key]];
    }
    
    // A palavra começa com a chave
    else if (wordNorm.startsWith(keyNorm) && keyNorm.length >= 3) {
      suggestions = [...suggestions, ...WRITING_SUGGESTIONS[key]];
    }
    
    // A chave começa com a palavra
    else if (keyNorm.startsWith(wordNorm) && wordNorm.length >= 3) {
      suggestions = [...suggestions, ...WRITING_SUGGESTIONS[key]];
    }
  });
  
  // 4. Se ainda não temos muitas sugestões, verificar por similaridade
  if (suggestions.length < 3) {
    Object.keys(WRITING_SUGGESTIONS).forEach(key => {
      const keyNorm = normalizeWord(key);
      
      // Verificar similaridade fonética/ortográfica
      let similarity = 0;
      const minLength = Math.min(keyNorm.length, wordNorm.length);
      
      // Contar caracteres idênticos na mesma posição
      for (let i = 0; i < minLength; i++) {
        if (keyNorm[i] === wordNorm[i]) similarity++;
      }
      
      // Normalizar pontuação
      similarity = similarity / Math.max(keyNorm.length, wordNorm.length);
      
      // Muito similar (limiar mais baixo para agarrar mais palavras)
      if (similarity > 0.3) {
        // Prevenção de adicionar duplicatas
        WRITING_SUGGESTIONS[key].forEach(sugg => {
          if (!suggestions.includes(sugg)) {
            suggestions.push(sugg);
          }
        });
      }
    });
  }
  
  // 5. Gerar variações básicas para garantir sugestões suficientes
  if (suggestions.length < 2) {
    // Plural
    if (!originalWord.endsWith('s')) suggestions.push(originalWord + 's');
    
    // Variações de gênero
    if (originalWord.endsWith('o')) {
      suggestions.push(originalWord.slice(0, -1) + 'a');
    } else if (originalWord.endsWith('a')) {
      suggestions.push(originalWord.slice(0, -1) + 'o');
    }
  }
  
  // 6. Deduplica e limita o resultado
  const uniqueSuggestions: string[] = [];
  // Manter a palavra original no topo
  if (originalWord && !uniqueSuggestions.includes(originalWord)) {
    uniqueSuggestions.push(originalWord);
  }
  
  // Adicionar o resto
  suggestions.forEach(suggestion => {
    if (!uniqueSuggestions.includes(suggestion)) {
      uniqueSuggestions.push(suggestion);
    }
  });
  
  // Limitar a 5 sugestões
  return uniqueSuggestions.slice(0, 5);
};

export const DOMSpellCheckPlugin: React.FC<DOMSpellCheckPluginProps> = ({ checkInterval = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme(); // Obter o estado do tema
  const [editor] = useLexicalComposerContext(); // Obter o contexto do editor Lexical
  
  // Função de depuração para mostrar qual parte do código está sendo executada
  const logDebug = (message: string) => {
    console.log(`[DictPlugin] ${message}`);
  };
  
  // Função para lidar com duplo clique em qualquer palavra no editor
  const handleDoubleClick = useCallback((e: Event) => {
    logDebug("Detectou duplo clique");
    
    // Usar setTimeout para garantir que a seleção esteja completa
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        logDebug("Sem seleção válida");
        return;
      }
      
      const word = selection.toString().trim();
      if (!word || word.length < 1) {
        logDebug(`Palavra muito curta ou vazia: "${word}"`);
        return;
      }
      
      logDebug(`Palavra selecionada: "${word}"`);
      
      // Sempre mostrar o popup de dicionário, independentemente da palavra
      // Isso tornará o dicionário útil para qualquer seleção
      
      // Encontrar sugestões para a palavra, ou apenas criar sugestões básicas
      let foundSuggestions = findDictionarySuggestions(word);
      
      // Se não encontrou sugestões, gerar algumas básicas para garantir
      // que o dicionário funcione para palavras novas também
      if (foundSuggestions.length === 0) {
        // Criar algumas sugestões padrão
        foundSuggestions = [
          word, // A própria palavra
          word.charAt(0).toUpperCase() + word.slice(1), // Capitalizada
          word + 's', // Plural
          word.endsWith('s') ? word.slice(0, -1) : word, // Singular/plural
          word.endsWith('r') ? word.slice(0, -1) + 'ndo' : word // Gerúndio ou outra variação
        ];
      }
      
      logDebug(`Encontrou ${foundSuggestions.length} sugestões`);
      
      // Posicionar o popup próximo à palavra
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Usar posição absoluta ajustada para visibilidade
      const newPosition = {
        top: rect.bottom + window.scrollY + 10, // Adicionar margem de 10px abaixo
        left: Math.max(10, rect.left + window.scrollX) // Garantir que não fique muito à esquerda
      };
      
      logDebug(`Posicionando popup em [${newPosition.top}, ${newPosition.left}]`);
      
      setPosition(newPosition);
      setSelectedWord(word);
      setSuggestions(foundSuggestions);
      setIsVisible(true);
    }, 50); // Pequeno delay para garantir que a seleção esteja completa
  }, []);
  
  // Função para aplicar a sugestão selecionada
  const applySuggestion = useCallback((suggestion: string) => {
    logDebug(`Aplicando sugestão: "${suggestion}"`);
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Primeiro selecionamos novamente a palavra que o usuário clicou duas vezes
    // para garantir que ela ainda está selecionada
    if (selectedWord) {
      // Usar diretamente a API do Lexical para aplicar a sugestão
      editor.update(() => {
        const lexicalSelection = $getSelection();
        
        if (lexicalSelection) {
          // Se tivermos um texto selecionado, o substituímos pela sugestão
          if (lexicalSelection.getTextContent() === selectedWord) {
            // O texto selecionado no Lexical corresponde à nossa palavra
            lexicalSelection.insertText(suggestion);
          } else {
            // Tentar aplicar direto no DOM como fallback
            try {
              document.execCommand('insertText', false, suggestion);
            } catch (e) {
              logDebug(`Erro ao aplicar sugestão via execCommand: ${e}`);
              
              // Segundo fallback usando o DOM diretamente
              selection.deleteFromDocument();
              const range = selection.getRangeAt(0);
              const textNode = document.createTextNode(suggestion);
              range.insertNode(textNode);
            }
          }
        } else {
          // Fallback usando DOM
          try {
            // Tentar aplicar direto no DOM
            document.execCommand('insertText', false, suggestion);
          } catch (e) {
            logDebug(`Erro ao aplicar sugestão: ${e}`);
            
            // Fallback final
            selection.deleteFromDocument();
            const range = selection.getRangeAt(0);
            const textNode = document.createTextNode(suggestion);
            range.insertNode(textNode);
          }
        }
      });
    } else {
      // Fallback se não temos a palavra original
      try {
        document.execCommand('insertText', false, suggestion);
      } catch (e) {
        logDebug(`Erro ao aplicar sugestão: ${e}`);
        
        // Último recurso
        selection.deleteFromDocument();
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(suggestion);
        range.insertNode(textNode);
      }
    }
    
    // Fechar o popup
    setIsVisible(false);
  }, [editor, selectedWord]);
  
  // Fechar o popup ao clicar fora
  const handleClickOutside = useCallback((e: Event) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      setIsVisible(false);
    }
  }, []);
  
  // Expandir dicionário com mais palavras comuns em português
  useEffect(() => {
    // Adicionar mais palavras ao dicionário para aumentar a cobertura
    const additionalWords = {
      // Palavras básicas do português
      'a': ['a', 'as', 'à', 'ao', 'aos', 'aqui', 'ali'],
      'o': ['o', 'os', 'onde', 'outro', 'outros', 'ora'],
      'e': ['e', 'em', 'este', 'essa', 'ele', 'ela', 'eles', 'elas'],
      'de': ['de', 'do', 'da', 'dos', 'das', 'desde', 'dentro'],
      'para': ['para', 'por', 'pelo', 'pela', 'pelos', 'pelas'],
      'com': ['com', 'como', 'comigo', 'conosco', 'comunicar'],
      'que': ['que', 'quem', 'quando', 'quanto', 'qual', 'quase'],
      'muito': ['muito', 'muita', 'muitos', 'muitas', 'mais'],
      'pouco': ['pouco', 'pouca', 'poucos', 'poucas', 'pequeno'],
      
      // Termos literários
      'text': ['texto', 'textos', 'textual', 'textuais', 'contextualizar'],
      'livr': ['livro', 'livros', 'livraria', 'livreto', 'livrar'],
      'pagin': ['página', 'páginas', 'paginação', 'paginar', 'paginado'],
      'escrit': ['escrita', 'escritor', 'escritora', 'escritório', 'escrito'],
      'edit': ['editar', 'editora', 'edição', 'editável', 'editorial'],
      'public': ['publicar', 'publicação', 'público', 'publicidade', 'publicado'],
      'autor': ['autor', 'autora', 'autoral', 'autoria', 'autorizar'],
      'leitor': ['leitor', 'leitora', 'leitura', 'leitores', 'ler'],
      'revist': ['revista', 'revisão', 'revistar', 'revisor', 'revisar'],
      'poema': ['poema', 'poemas', 'poesia', 'poético', 'poeta'],
      'verso': ['verso', 'versos', 'versículo', 'versado', 'versão'],
      'estrofe': ['estrofe', 'estrofes', 'estrófico', 'estrofado', 'estrutura'],
      
      // Palavras frequentes em textos
      'hist': ['história', 'histórico', 'históricos', 'historiografia'],
      'narr': ['narração', 'narrativa', 'narrador', 'narrar', 'narrativo'],
      'temp': ['tempo', 'tempos', 'temporal', 'temporada', 'temperatura'],
      'espaç': ['espaço', 'espaços', 'espacial', 'espacionamento'],
      'personag': ['personagem', 'personagens', 'personificar', 'personalidade'],
      'dialog': ['diálogo', 'dialogar', 'diálogos', 'dialógico', 'dialética'],
      'descre': ['descrever', 'descrição', 'descritivo', 'descrito', 'descritiva'],
      'sentim': ['sentimento', 'sentir', 'sentimentos', 'sentimental', 'sentido'],
      'moment': ['momento', 'momentos', 'momentâneo', 'monumental', 'momentoso'],
      'vida': ['vida', 'vidas', 'vivência', 'viver', 'vivido'],
      'mort': ['morte', 'morto', 'morta', 'morrer', 'mortal'],
      'amor': ['amor', 'amoroso', 'amores', 'amoroso', 'amante'],
      
      // Palavras exemplo vistas na imagem
      'chegava': ['chegava', 'chegavam', 'chegar', 'chegada', 'chegarei'],
      'folha': ['folha', 'folhas', 'folhagem', 'folhear', 'folheto'],
      'dourada': ['dourada', 'dourado', 'douradas', 'dourados', 'dourar'],
      'memória': ['memória', 'memórias', 'memorial', 'memorioso', 'memorável'],
      'infância': ['infância', 'infantil', 'infante', 'infância', 'infantilidade'],
      'coração': ['coração', 'corações', 'coração', 'cardiaco', 'corajoso']
    };
    
    // Adicionar ao dicionário existente
    Object.entries(additionalWords).forEach(([key, values]) => {
      if (!WRITING_SUGGESTIONS[key]) {
        // @ts-ignore - É seguro adicionar ao dicionário
        WRITING_SUGGESTIONS[key] = values;
      } else {
        // Adicionar novas sugestões sem duplicação
        values.forEach(val => {
          if (!WRITING_SUGGESTIONS[key].includes(val)) {
            WRITING_SUGGESTIONS[key].push(val);
          }
        });
      }
    });
    
    // Adicionar sugestões específicas para cada palavra visível na imagem exemplo
    const specificWords = {
      'ola': ['olá', 'ola', 'oi', 'olá!', 'oi!'],
      'chegava': ['chegava', 'chegar', 'chegada', 'chegando', 'chegaram'],
      'suas': ['suas', 'seus', 'sua', 'seu', 'nossa'],
      'folhas': ['folhas', 'folha', 'folhagem', 'folhetos', 'folheados'],
      'douradas': ['douradas', 'dourada', 'dourados', 'dourado', 'ouro'],
      'trazendo': ['trazendo', 'trazer', 'traz', 'trouxe', 'trago'],
      'memórias': ['memórias', 'memória', 'recordações', 'lembranças', 'reminiscências'],
      'infância': ['infância', 'infantil', 'criança', 'meninice', 'juventude'],
      'muito': ['muito', 'muitos', 'bastante', 'demasiado', 'imensamente'],
      'estavam': ['estavam', 'estava', 'estiveram', 'estariam', 'estivesse'],
      'adormecidas': ['adormecidas', 'adormecida', 'dormindo', 'dormentes', 'adormecidos'],
      'coração': ['coração', 'peito', 'alma', 'âmago', 'íntimo'],
      'maravilhoso': ['maravilhoso', 'maravilha', 'extraordinário', 'fantástico', 'espetacular'],
      'poder': ['poder', 'capacidade', 'aptidão', 'potência', 'força'],
      'compartilhar': ['compartilhar', 'dividir', 'partilhar', 'repartir', 'distribuir'],
      'estas': ['estas', 'essas', 'aquelas', 'tais', 'semelhantes'],
      'espero': ['espero', 'esperança', 'aguardo', 'expectativa', 'aspiração'],
      'aberto': ['aberto', 'receptivo', 'acessível', 'disponível', 'exposto'],
      'novas': ['novas', 'recentes', 'atuais', 'modernas', 'contemporâneas'],
      'possibilidades': ['possibilidades', 'oportunidades', 'chances', 'opções', 'alternativas'],
      'sonhos': ['sonhos', 'devaneios', 'aspirações', 'desejos', 'esperanças']
    };
    
    // Adicionar ao dicionário
    Object.entries(specificWords).forEach(([key, values]) => {
      // @ts-ignore - É seguro adicionar ao dicionário
      WRITING_SUGGESTIONS[key] = values;
    });
  }, []);

  // Adicionar event listeners
  useEffect(() => {
    logDebug("Plugin inicializado");
    
    const handleDblClick = (e: Event) => {
      logDebug("Handler dblclick chamado");
      handleDoubleClick(e);
    };
    
    const handleOutsideClick = (e: Event) => {
      handleClickOutside(e);
    };
    
    // Tentar vários seletores para capturar o duplo clique no editor
    const editorSelectors = [
      '.editor-input', 
      '.ContentEditable__root',
      '[contenteditable=true]',
      '.editor-container',
      '.lexical-editor',
      '.LexicalEditor-root'
    ];
    
    // Adicionar com um pequeno atraso para garantir que o editor está totalmente carregado
    setTimeout(() => {
      // Registrar listener no documento principal
      document.addEventListener('dblclick', handleDblClick);
      
      // Adicionar a cada elemento do editor
      editorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          logDebug(`Seletor não encontrado: ${selector}`);
        }
        
        elements.forEach(el => {
          logDebug(`Adicionando listener em ${selector}`);
          el.addEventListener('dblclick', handleDblClick);
        });
      });
      
      // Listener para clicar fora
      document.addEventListener('mousedown', handleOutsideClick);
    }, 1000); // Pequeno delay para garantir que o editor está carregado
    
    // Limpar ao desmontar
    return () => {
      document.removeEventListener('dblclick', handleDblClick);
      
      editorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.removeEventListener('dblclick', handleDblClick);
        });
      });
      
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleDoubleClick, handleClickOutside]);
  
  // Renderizar o popup de dicionário usando portal para evitar problemas de z-index
  return isVisible ? (
    // Criar um portal para renderizar o popup no corpo do documento
    // para evitar problemas com z-index e posicionamento
    ReactDOM.createPortal(
      <DictionaryPopup 
        ref={popupRef}
        isDarkMode={isDarkMode}
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px` 
        }}
      >
        <PopupTitle isDarkMode={isDarkMode}>Sugestões do dicionário:</PopupTitle>
        <SuggestionList>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem 
              key={index}
              isDarkMode={isDarkMode}
              onClick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionList>
      </DictionaryPopup>,
      document.body // Renderizar diretamente no corpo do documento
    )
  ) : null;
};