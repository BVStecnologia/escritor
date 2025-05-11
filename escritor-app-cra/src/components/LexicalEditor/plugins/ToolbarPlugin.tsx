import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import debounce from 'lodash/debounce';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  $getRoot,
  $isElementNode,
  UNDO_COMMAND,
  REDO_COMMAND
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from '@lexical/list';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType
} from '@lexical/rich-text';
import {
  $createQuoteNode,
  $isQuoteNode
} from '@lexical/rich-text';
import {
  TOGGLE_LINK_COMMAND,
  $isLinkNode
} from '@lexical/link';
import styled from 'styled-components';

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  background: ${({ theme }) => theme.colors.background.paper};
  gap: 0.5rem;
`;

const ToolbarSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-right: 0.75rem;
  padding-right: 0.75rem;
  border-right: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};

  &:last-child {
    border-right: none;
  }
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0 8px;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  margin: 0 4px;
`;

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<'paragraph' | HeadingTagType | 'quote'>('paragraph');
  const [isLink, setIsLink] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const debouncedUpdateRef = useRef<any>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      const anchorNode = selection.anchor.getNode();
      let element = anchorNode;

      // Verificar com segurança se podemos obter o elemento de nível superior
      try {
        if (anchorNode.getKey() !== 'root') {
          element = anchorNode.getTopLevelElementOrThrow();
        }
      } catch (error) {
        // Falha silenciosa, mantenha o nó de âncora
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      // Find nearest parent list element mais segura
      let parentList = element;
      try {
        if ($isListNode(element)) {
          parentList = element;
        } else if (anchorNode.getKey() !== 'root') {
          const parent = anchorNode.getParent();
          if (parent && parent.getKey() !== 'root') {
            parentList = parent.getTopLevelElementOrThrow();
          }
        }
      } catch (error) {
        // Falha silenciosa
      }

      setIsBulletList(
        $isListNode(parentList) && parentList.getListType() === 'bullet'
      );
      setIsNumberedList(
        $isListNode(parentList) && parentList.getListType() === 'number'
      );

      // Check if it's a link com verificação segura
      const parent = anchorNode.getParent();
      setIsLink(
        $isLinkNode(anchorNode) ||
        (parent ? $isLinkNode(parent) : false)
      );

      if (elementDOM !== null) {
        if ($isHeadingNode(element)) {
          const tag = element.getTag();
          setBlockType(tag);
        } else if ($isQuoteNode(element)) {
          setBlockType('quote');
        } else {
          setBlockType('paragraph');
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    // Função para criar o debounce
    const createDebouncedUpdate = () => {
      if (debouncedUpdateRef.current) {
        debouncedUpdateRef.current.cancel();
      }
      
      // Criar um novo debounce que atualiza a barra de ferramentas
      const debouncedFn = debounce(() => {
        try {
          updateToolbar();
        } catch (error) {
          console.error('Erro ao atualizar toolbar:', error);
        }
      }, 200);
      
      debouncedUpdateRef.current = debouncedFn;
      return debouncedFn;
    };
    
    // Criar o debounce inicial
    const debouncedUpdate = createDebouncedUpdate();
    
    // Registrar listener para atualizações do editor
    const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        debouncedUpdate();
      });
    });
    
    // Limpar na desmontagem
    return () => {
      unregisterListener();
      if (debouncedUpdateRef.current) {
        debouncedUpdateRef.current.cancel();
      }
    };
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType === headingSize) {
      // Convert heading to paragraph if already this heading type
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isHeadingNode(parent)) {
              const paragraphNode = $createParagraphNode();
              parent.replace(paragraphNode);
              paragraphNode.append(node);
            }
          });
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isElementNode(parent)) {
              const headingNode = $createHeadingNode(headingSize);
              parent.replace(headingNode);
              headingNode.append(node);
            }
          });
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType === 'quote') {
      // Remove quote formatting
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isQuoteNode(parent)) {
              const paragraphNode = $createParagraphNode();
              parent.replace(paragraphNode);
              paragraphNode.append(node);
            }
          });
        }
      });
    } else {
      // Apply quote formatting
      // Vamos criar manualmente um QuoteNode ao invés de usar o comando
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isElementNode(parent)) {
              const quoteNode = $createQuoteNode();
              parent.replace(quoteNode);
              quoteNode.append(node);
            }
          });
        }
      });
    }
  };

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt('Enter URL');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL');
    if (url) {
      // Usamos um evento personalizado já que não podemos importar o comando diretamente
      // Isso será capturado pelo plugin de imagem
      const insertImageEvent = new CustomEvent('lexical-insert-image', {
        detail: { src: url, altText: 'Image' }
      });
      window.dispatchEvent(insertImageEvent);
    }
  };

  return (
    <Toolbar>
      <ToolbarSection>
        <ToolButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Desfazer"
        >
          ↩️
        </ToolButton>
        <ToolButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Refazer"
        >
          ↪️
        </ToolButton>
        <ToolButton
          $active={isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          title="Bold"
        >
          <strong>B</strong>
        </ToolButton>
        <ToolButton
          $active={isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          title="Italic"
        >
          <em>I</em>
        </ToolButton>
        <ToolButton
          $active={isUnderline}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          title="Underline"
        >
          <u>U</u>
        </ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <ToolButton
          $active={blockType === 'h1'}
          onClick={() => formatHeading('h1')}
          title="Heading 1"
        >
          H1
        </ToolButton>
        <ToolButton
          $active={blockType === 'h2'}
          onClick={() => formatHeading('h2')}
          title="Heading 2"
        >
          H2
        </ToolButton>
        <ToolButton
          $active={blockType === 'h3'}
          onClick={() => formatHeading('h3')}
          title="Heading 3"
        >
          H3
        </ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <ToolButton
          $active={isBulletList}
          onClick={() => {
            if (isBulletList) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
          }}
          title="Bullet List"
        >
          • Lista
        </ToolButton>
        <ToolButton
          $active={isNumberedList}
          onClick={() => {
            if (isNumberedList) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
          }}
          title="Numbered List"
        >
          1. Lista
        </ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <ToolButton
          $active={blockType === 'quote'}
          onClick={formatQuote}
          title="Quote"
        >
          "Citação"
        </ToolButton>
        <ToolButton
          $active={isLink}
          onClick={insertLink}
          title="Link"
        >
          🔗 Link
        </ToolButton>
        <ToolButton
          onClick={insertImage}
          title="Image"
        >
          🖼️ Imagem
        </ToolButton>
      </ToolbarSection>
    </Toolbar>
  );
};