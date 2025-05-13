import React, { useCallback, useState, useEffect } from 'react';
import { $getRoot, $getSelection, EditorState } from 'lexical';
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

import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { AutoSavePlugin } from './plugins/AutoSavePlugin';
import ImagePlugin, { ImageNode } from './plugins/ImagePlugin';
import { editorTheme } from './theme';
import styled from 'styled-components';

// Importar os plugins refatorados
import { AIAutocompletePlugin } from './plugins/AIAutocompletePlugin';
import { AIToolsSelectionPlugin } from './plugins/AIToolsSelectionPlugin';
import { DOMSpellCheckPlugin } from './plugins/DOMSpellCheckPlugin';
import { FloatingSaveStatus } from './FloatingSaveStatus';

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

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  initialContent,
  onChange,
  bookId,
  chapterId,
  onWordCountChanged,
  setSaveStatus
}) => {
  const [saveStatusInternal, setSaveStatusInternal] = useState<'saving' | 'saved' | 'error' | 'unsaved'>('saved');
  const [isOnline, setIsOnline] = useState(true);
  
  // Observador de status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    setSaveStatusInternal(status);
    if (setSaveStatus) {
      setSaveStatus(status);
    }
  }, [setSaveStatus]);
  
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContainer className="editor-container">
        <ToolbarPlugin />
        <EditorInner>
          <ContentEditableWrapper>
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Comece a escrever seu capítulo aqui...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </ContentEditableWrapper>
        </EditorInner>
        
        {/* Plugins básicos */}
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={handleChange} />
        <ListPlugin />
        <LinkPlugin />
        <ImagePlugin />
        
        {/* Plugins de IA refatorados */}
        <AIAutocompletePlugin livroId={bookId} capituloId={chapterId} />
        <AIToolsSelectionPlugin livroId={bookId} capituloId={chapterId} />
        <DOMSpellCheckPlugin checkInterval={5000} />
        
        {/* Plugin de salvamento automático */}
        {bookId && chapterId && (
          <AutoSavePlugin 
            bookId={bookId} 
            chapterId={chapterId} 
            onStatusChange={handleStatusChange}
            onWordCountChanged={onWordCountChanged}
          />
        )}
        
        {/* Indicador de salvamento */}
        <FloatingSaveStatus saveStatus={saveStatusInternal} isOnline={isOnline} />
      </EditorContainer>
    </LexicalComposer>
  );
};