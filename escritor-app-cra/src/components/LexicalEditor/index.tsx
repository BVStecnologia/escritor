import React, { useState, useCallback, useEffect, useRef } from 'react';
import { $getRoot, $getSelection, EditorState, $isRangeSelection, $createRangeSelection, $setSelection, $createTextNode, $createParagraphNode } from 'lexical';
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { ToolbarWithModal } from './plugins/ToolbarPlugin';
import { AutoSavePlugin } from './plugins/AutoSavePlugin';
import { InitialContentPlugin } from './plugins/InitialContentPlugin';
// import { InsertContentPlugin } from './plugins/InsertContentPlugin';
import ImagePlugin, { ImageNode } from './plugins/ImagePlugin';
import { editorTheme } from './theme';
import styled from 'styled-components';

// Importar os plugins de IA reformulados usando DOM APIs
// import { AIAutocompletePlugin } from './plugins/AIAutocompletePlugin';
import { AutocompletePlugin } from './plugins/AutocompletePlugin';
import { AIToolsSelectionPlugin } from './plugins/AIToolsSelectionPlugin';
import { DOMSpellCheckPlugin } from './plugins/DOMSpellCheckPlugin';
import { ConsolidatedAutocompletePlugin } from './plugins/ConsolidatedAutocompletePlugin';

const EditorContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  
  /* Adicionar classe para seleção de elementos DOM mais fácil */
  &.editor-container {
    width: 100%;
    overflow-x: hidden; /* Prevenir barra de rolagem horizontal */
  }
`;

const EditorInner = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
`;

const ContentEditableWrapper = styled.div`
  min-height: 100%;
  padding: 2rem;
  position: relative;
  
  .editor-input {
    outline: none;
    min-height: 100%;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 1.125rem;
    line-height: 1.75;
    color: ${({ theme }) => theme.isDarkMode ? '#ffffff' : theme.colors.text.primary};
    position: relative;
    z-index: 1;
  }

  .editor-placeholder {
    position: absolute;
    top: 2rem;
    left: 2rem;
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-size: 1.125rem;
    pointer-events: none;
    user-select: none;
  }
`;

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  bookId?: string;
  chapterId?: string;
  onWordCountChanged?: (wordCount: number) => void;
  setSaveStatus?: (status: 'saving' | 'saved' | 'error' | 'unsaved') => void;
  pendingInsertContent?: string;
  onContentInserted?: () => void;
}

// Configuração inicial do editor
const initialConfig: InitialConfigType = {
  namespace: 'BookEditor',
  theme: editorTheme,
  onError: (error) => console.error(error),
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    LinkNode,
    ImageNode
  ]
};

// Componente simples para inserir conteúdo
const InsertContentComponent: React.FC<{ 
  pendingContent?: string; 
  onContentInserted?: () => void 
}> = ({ pendingContent, onContentInserted }) => {
  const [editor] = useLexicalComposerContext();
  const hasInsertedRef = useRef(false);
  
  useEffect(() => {
    if (pendingContent && editor && !hasInsertedRef.current) {
      console.log('InsertContentComponent: Tentando inserir conteúdo:', pendingContent);
      
      // Marcar como inserido para evitar duplicação
      hasInsertedRef.current = true;
      
      // Primeiro focar o editor
      editor.focus();
      
      // Aguardar um pequeno delay para garantir que o foco foi aplicado
      setTimeout(() => {
        editor.update(() => {
          const selection = $getSelection();
          console.log('InsertContentComponent: Seleção atual:', selection);
          
          if ($isRangeSelection(selection)) {
            // Se já houver uma seleção válida, inserir o texto
            console.log('InsertContentComponent: Inserindo texto na seleção existente');
            selection.insertText(pendingContent);
          } else {
            // Se não houver seleção, adicionar um novo parágrafo com o texto
            console.log('InsertContentComponent: Sem seleção, criando novo parágrafo');
            const root = $getRoot();
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(pendingContent);
            paragraph.append(textNode);
            root.append(paragraph);
            
            // Mover o cursor para o final do texto inserido
            const newSelection = $createRangeSelection();
            newSelection.anchor.set(textNode.getKey(), pendingContent.length, 'text');
            newSelection.focus.set(textNode.getKey(), pendingContent.length, 'text');
            $setSelection(newSelection);
          }
        });
        
        // Notificar que o conteúdo foi inserido
        console.log('InsertContentComponent: Notificando inserção completa');
        onContentInserted?.();
      }, 100);
    }
    
    // Reset quando o conteúdo mudar para vazio
    if (!pendingContent) {
      hasInsertedRef.current = false;
    }
  }, [pendingContent, editor, onContentInserted]);
  
  return null;
};

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  initialContent,
  onChange,
  bookId,
  chapterId,
  onWordCountChanged,
  setSaveStatus,
  pendingInsertContent,
  onContentInserted
}) => {
  // Função para calcular a contagem de palavras diretamente a partir do texto
  const calculateWordCount = useCallback((text: string): number => {
    return text.split(/\s+/).filter(Boolean).length;
  }, []);

  // Handler para mudanças no editor
  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const content = root.getTextContent();
      
      // Atualiza o conteúdo
      onChange?.(content);
      
      // Calcula e atualiza a contagem de palavras em tempo real
      if (onWordCountChanged) {
        const wordCount = calculateWordCount(content);
        onWordCountChanged(wordCount);
      }
    });
  }, [onChange, onWordCountChanged, calculateWordCount]);

  // Handler para mudanças no status de salvamento
  const handleStatusChange = useCallback((status: 'saving' | 'saved' | 'error' | 'unsaved') => {
    if (setSaveStatus) {
      setSaveStatus(status);
    }
  }, [setSaveStatus]);

  // Handler para mudanças na contagem de palavras do AutoSavePlugin
  const handleWordCountUpdate = useCallback((wordCount: number) => {
    if (onWordCountChanged) {
      onWordCountChanged(wordCount);
    }
  }, [onWordCountChanged]);
  
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContainer className="editor-container">
        <ToolbarWithModal bookId={bookId} />
        <EditorInner>
          <ContentEditableWrapper>
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Comece a escrever seu capítulo aqui...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </ContentEditableWrapper>
        </EditorInner>
        {/* Container fixo para popups do editor */}
        <div id="editor-popups" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10000 }} />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={handleChange} />
        <ListPlugin />
        <LinkPlugin />
        <ImagePlugin />
        <InitialContentPlugin initialContent={initialContent} />
        
        {/* Plugin para inserir conteúdo do assistente */}
        <InsertContentComponent 
          pendingContent={pendingInsertContent} 
          onContentInserted={onContentInserted} 
        />
        
        {/* Plugins de IA baseados em DOM */}
        {/* <AIAutocompletePlugin livroId={bookId} capituloId={chapterId} /> */}
        {/* <AutocompletePlugin /> */}
        <ConsolidatedAutocompletePlugin livroId={bookId} capituloId={chapterId} />
        <AIToolsSelectionPlugin livroId={bookId} capituloId={chapterId} />
        <DOMSpellCheckPlugin checkInterval={5000} />
        
        {bookId && chapterId && (
          <AutoSavePlugin 
            bookId={bookId} 
            chapterId={chapterId} 
            onStatusChange={handleStatusChange}
            onWordCountChanged={handleWordCountUpdate}
          />
        )}
      </EditorContainer>
    </LexicalComposer>
  );
};