/**
 * Utilitários para manipulação segura do editor via DOM APIs
 * Essas funções permitem interagir com o editor Lexical usando apenas DOM APIs
 * padrão, evitando interferir com o mecanismo de salvamento automático.
 */

// Função auxiliar para encontrar o primeiro nó de texto em um elemento
const findFirstTextNodeHelper = (element: Node): Text | null => {
  if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
    return element as Text;
  }
  
  let result: Text | null = null;
  const childNodes = element.childNodes;
  
  for (let i = 0; i < childNodes.length; i++) {
    result = findFirstTextNodeHelper(childNodes[i]);
    if (result) break;
  }
  
  return result;
};

// Função auxiliar para encontrar o primeiro nó de texto
const findFirstTextNode = (element: Node): Text | null => {
  if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
    return element as Text;
  }
  
  let result: Text | null = null;
  const childNodes = element.childNodes;
  
  for (let i = 0; i < childNodes.length; i++) {
    const textNode = findFirstTextNodeHelper(childNodes[i]);
    if (textNode) {
      result = textNode;
      break;
    }
  }
  
  return result;
};

/**
 * Insere texto na posição atual do cursor
 * @param text Texto a ser inserido
 * @returns boolean Indica se a operação foi bem-sucedida
 */
export const insertTextAtCursor = (text: string): boolean => {
  if (!text) return false;
  
  try {
    // Força o foco no editor primeiro
    const editorInput = document.querySelector('.editor-input');
    if (editorInput instanceof HTMLElement) {
      editorInput.focus();
      
      // Pequeno delay para garantir que o foco foi aplicado
      // e qualquer seleção foi estabelecida
      setTimeout(() => {
        console.log('Focus realizado no editor');
      }, 10);
    }
    
    // Verifica se há seleção no documento
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('insertTextAtCursor: Sem seleção ativa');
      
      // Criar uma nova seleção no início do editor se não houver seleção
      if (editorInput) {
        const newRange = document.createRange();
        newRange.setStart(editorInput, 0);
        newRange.setEnd(editorInput, 0);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
        
        if (!selection || selection.rangeCount === 0) {
          console.log('insertTextAtCursor: Não foi possível criar uma seleção');
          return false;
        }
      } else {
        return false;
      }
    }
    
    // Obtém o range atual
    const range = selection.getRangeAt(0);
    
    // Verificar se o range está em um elemento editável dentro do editor
    let container: Node | null = range.startContainer;
    let isInsideEditor = false;
    
    // Percorrer árvore DOM para verificar se estamos dentro do editor
    while (container) {
      if (container.nodeType === Node.ELEMENT_NODE) {
        const element = container as Element;
        if (element.classList && 
           (element.classList.contains('editor-input') || 
            element.classList.contains('editor-container'))) {
          isInsideEditor = true;
          break;
        }
      }
      container = container.parentNode as Node | null;
    }
    
    if (!isInsideEditor) {
      console.log('insertTextAtCursor: Cursor não está dentro do editor');
      
      // Forçar um novo foco no editor
      if (editorInput instanceof HTMLElement) {
        editorInput.focus();
        
        // Criar uma nova seleção no início do editor
        const newRange = document.createRange();
        try {
          // Tenta criar um range no início do conteúdo do editor
          const firstTextNode = findFirstTextNode(editorInput);
          if (firstTextNode) {
            newRange.setStart(firstTextNode, 0);
            newRange.setEnd(firstTextNode, 0);
          } else {
            // Fallback para o elemento editor
            newRange.setStart(editorInput, 0);
            newRange.setEnd(editorInput, 0);
          }
          
          selection?.removeAllRanges();
          selection?.addRange(newRange);
          
          console.log('Nova seleção criada no editor');
        } catch (e) {
          console.error('Erro ao criar nova seleção:', e);
          return false;
        }
      } else {
        return false;
      }
    }
    
    try {
      // Cria um nó de texto
      const textNode = document.createTextNode(text);
      
      // Deleta qualquer conteúdo selecionado e insere o novo texto
      range.deleteContents();
      range.insertNode(textNode);
      
      // Move o cursor para o final do texto inserido
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Dispara um evento de input para notificar mudanças
      // Isso é crucial para que o Lexical detecte a modificação
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
      });
      
      // Obtenha uma referência explícita para o editor
      const editorInput = document.querySelector('.editor-input');
      
      // Garanta que o evento vá direto para o editor, não para outro elemento
      if (editorInput) {
        editorInput.dispatchEvent(inputEvent);
        
        // Foque o editor novamente após a inserção
        if (editorInput instanceof HTMLElement) {
          editorInput.focus();
        }
      }
      
      // Fallback - dispare o evento também no elemento ativo, se houver
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== editorInput) {
        activeElement.dispatchEvent(inputEvent);
      }
      
      // Para garantir que a mudança seja detectada, adicione um timeout
      setTimeout(() => {
        if (editorInput instanceof HTMLElement) {
          // Simular um clique no editor para garantir foco
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          editorInput.dispatchEvent(clickEvent);
          
          // Foque o editor novamente
          editorInput.focus();
        }
      }, 10);
    } catch (error) {
      console.error("Erro ao inserir texto com DOM:", error);
      
      // Fallback - tentar inserir texto de forma mais simples
      try {
        document.execCommand('insertText', false, text);
      } catch (fallbackError) {
        console.error("Falha no fallback de inserção de texto:", fallbackError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inserir texto no cursor:', error);
    return false;
  }
};

/**
 * Substitui o texto selecionado
 * @param text Novo texto para substituir a seleção
 * @returns boolean Indica se a operação foi bem-sucedida
 */
export const replaceSelectedText = (text: string): boolean => {
  if (!text) return false;
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  
  // Verifica se há texto selecionado
  if (selection.toString().length === 0) return false;
  
  const range = selection.getRangeAt(0);
  
  // Cria um nó de texto
  const textNode = document.createTextNode(text);
  
  // Substitui o conteúdo selecionado
  range.deleteContents();
  range.insertNode(textNode);
  
  // Move o cursor para o final do texto inserido
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
  
  // Dispara um evento de input para notificar mudanças
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertReplacementText',
    data: text
  });
  
  const activeElement = document.activeElement;
  if (activeElement) {
    activeElement.dispatchEvent(inputEvent);
  }
  
  return true;
};

/**
 * Obtém o texto atualmente selecionado
 * @returns string Texto selecionado ou string vazia se não houver seleção
 */
export const getSelectedText = (): string => {
  const selection = window.getSelection();
  if (!selection) return '';
  
  return selection.toString();
};

/**
 * Obtém informações sobre a posição do cursor
 * @returns Objeto com posição do cursor e elemento pai
 */
export const getCursorPosition = (): { 
  x: number; 
  y: number; 
  height: number;
  parentElement: Element | null;
} | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  if (!rect) return null;
  
  return {
    x: rect.left,
    y: rect.bottom,
    height: rect.height,
    parentElement: range.startContainer.parentElement
  };
};

/**
 * Obtém o texto ao redor do cursor
 * @param charsBefore Número de caracteres antes do cursor
 * @param charsAfter Número de caracteres após o cursor
 * @returns Texto ao redor do cursor e a posição exata
 */
export const getTextAroundCursor = (
  charsBefore: number = 100, 
  charsAfter: number = 100
): { 
  text: string; 
  cursorOffset: number;
  fullText: string;
} | null => {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    
    // Clone o range para não modificar a seleção atual
    const beforeRange = range.cloneRange();
    
    // Obter texto antes do cursor de forma segura
    let beforeText = '';
    try {
      // Mova o início do range para trás de forma segura
      beforeRange.setStart(range.startContainer, 0);
      // Obtenha o texto antes do cursor (até charsBefore caracteres)
      beforeText = beforeRange.toString().slice(-charsBefore);
    } catch (e) {
      console.log('Erro ao obter texto antes do cursor, usando texto vazio', e);
    }
    
    // Obter texto após o cursor de forma segura
    let afterText = '';
    try {
      const afterRange = range.cloneRange();
      // Verificar se o container tem textContent antes de tentar acessar length
      const textContent = range.endContainer.textContent || '';
      const maxLen = Math.min(textContent.length, range.endOffset + charsAfter);
      
      // Definir o fim do range apenas se a posição for válida
      if (maxLen > range.endOffset) {
        afterRange.setEnd(range.endContainer, maxLen);
        // Obtenha o texto após o cursor (até charsAfter caracteres)
        afterText = afterRange.toString().substring(0, charsAfter);
      }
    } catch (e) {
      console.log('Erro ao obter texto após o cursor, usando texto vazio', e);
    }
    
    // Obtenha o deslocamento do cursor dentro do texto
    const cursorOffset = beforeText.length;
    
    // Obtenha o texto completo do elemento pai de forma segura
    let fullText = '';
    try {
      const parentElement = range.startContainer.parentElement;
      if (parentElement) {
        fullText = parentElement.textContent || '';
      }
    } catch (e) {
      console.log('Erro ao obter texto completo, usando texto vazio', e);
    }
    
    return {
      text: beforeText + afterText,
      cursorOffset,
      fullText
    };
  } catch (error) {
    console.error('Erro ao obter texto ao redor do cursor:', error);
    return {
      text: '',
      cursorOffset: 0,
      fullText: ''
    };
  }
};

/**
 * Verifica se o texto contém erros ortográficos marcados
 * @param element Elemento a ser verificado
 * @returns boolean Indica se há erros ortográficos
 */
export const hasSpellingErrors = (element: Element | null): boolean => {
  if (!element) return false;
  
  // Verifica se o próprio elemento tem a classe
  if (element.classList && element.classList.contains('spelling-error')) {
    return true;
  }
  
  // Verifica se algum elemento filho tem a classe
  return element.querySelector('.spelling-error') !== null;
};

/**
 * Obtém a posição relativa em relação a um elemento container
 * Útil para posicionar popups corretamente dentro do editor
 */
export const getRelativePosition = (
  rect: DOMRect, 
  containerElement: Element | null
): { x: number; y: number } => {
  if (!containerElement) {
    return { x: rect.left, y: rect.bottom };
  }
  
  const containerRect = containerElement.getBoundingClientRect();
  
  return {
    x: rect.left - containerRect.left,
    y: rect.bottom - containerRect.top
  };
};