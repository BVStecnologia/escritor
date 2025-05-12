import React, { useEffect, useRef } from 'react';
import { $getRoot, $getSelection, EditorState, $createParagraphNode, $createTextNode } from 'lexical';
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
import { $isRangeSelection } from 'lexical';

import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { AutoSavePlugin } from './plugins/AutoSavePlugin';
import ImagePlugin, { ImageNode } from './plugins/ImagePlugin';
import { AutocompletePlugin } from './plugins/AutocompletePlugin';
import { AIToolsSelectionPlugin } from './plugins/AIToolsSelectionPlugin';
import { editorTheme } from './theme';
import styled from 'styled-components';

const EditorContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
`;

const EditorInner = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
`;

const ContentEditableWrapper = styled.div`
  min-height: 100%;
  padding: 2rem;

  .editor-input {
    outline: none;
    min-height: 100%;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 1.125rem;
    line-height: 1.75;
    color: ${({ theme }) => theme.colors.text.primary};
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

  /* Estilos específicos para os headings no editor */
  .editor-heading-h1 {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: ${({ theme }) => theme.fonts.heading};
    line-height: 1.2;
  }

  .editor-heading-h2 {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
    font-family: ${({ theme }) => theme.fonts.heading};
    line-height: 1.3;
  }

  .editor-heading-h3 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-family: ${({ theme }) => theme.fonts.heading};
    line-height: 1.4;
  }
`;

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  bookId?: string;
  chapterId?: string;
  setSaveStatus?: (status: 'saving' | 'saved' | 'idle') => void;
  onWordCountChanged?: (wordCount: number) => void;
}

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

// Plugin para inicializar o editor com conteúdo
function InitialContentPlugin({ initialContent, chapterId }: { initialContent?: string, chapterId?: string }) {
  const [editor] = useLexicalComposerContext();
  const lastChapterId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!initialContent) return;
    if (lastChapterId.current === chapterId) return; // Só atualiza se mudou de capítulo

    editor.update(() => {
      try {
        // Tenta importar o conteúdo formatado (JSON)
        const json = JSON.parse(initialContent);
        editor.setEditorState(editor.parseEditorState(json));
      } catch (e) {
        // Se não for JSON válido, cai no fallback de texto puro
        const root = $getRoot();
        root.clear();
        const paragraphs = initialContent.split('\n').filter(Boolean);
        if (paragraphs.length === 0) {
          const paragraph = $createParagraphNode();
          root.append(paragraph);
        } else {
          paragraphs.forEach(text => {
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(text));
            root.append(paragraph);
          });
        }
      }
    });

    lastChapterId.current = chapterId;
  }, [editor, initialContent, chapterId]);

  return null;
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  initialContent,
  onChange,
  bookId,
  chapterId,
  setSaveStatus,
  onWordCountChanged
}) => {
  // Throttled handleChange para reduzir a frequência de atualizações
  const handleChange = React.useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const content = root.getTextContent();

      // Usar um timeout para evitar múltiplas atualizações em sequência
      setTimeout(() => {
        onChange?.(content);
      }, 50);
    });
  }, [onChange]);

  // Removida a chave dinâmica que estava causando recriação do editor
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContainer>
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
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialContentPlugin
          initialContent={initialContent}
          chapterId={chapterId}
        />
        <ListPlugin />
        <LinkPlugin />
        <ImagePlugin />
        <AutocompletePlugin />
        <AIToolsSelectionPlugin />
        {/* AutoSavePlugin com callback de contagem de palavras */}
        {bookId && chapterId && (
          <AutoSavePlugin 
            bookId={bookId} 
            chapterId={chapterId} 
            onStatusChange={setSaveStatus}
            onWordCountChanged={onWordCountChanged}
          />
        )}
      </EditorContainer>
    </LexicalComposer>
  );
};