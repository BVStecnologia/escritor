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
function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Se já inicializou ou não tem conteúdo inicial, não faz nada
    if (isInitialized.current || !initialContent) return;

    // Define uma flag para indicar que o plugin já inicializou o editor
    isInitialized.current = true;

    // Atualiza o editor com o conteúdo inicial
    editor.update(() => {
      // Limpa o editor antes de adicionar o conteúdo inicial
      const root = $getRoot();
      root.clear();

      // Divide o conteúdo em parágrafos pela quebra de linha
      const paragraphs = initialContent.split('\n').filter(Boolean);

      if (paragraphs.length === 0) {
        // Se não houver conteúdo, adiciona um parágrafo vazio
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      } else {
        // Para cada parágrafo, cria um nó de parágrafo e adiciona o texto
        paragraphs.forEach(text => {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(text));
          root.append(paragraph);
        });
      }
    });
  }, [editor, initialContent]);

  return null;
};

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  initialContent,
  onChange,
  bookId,
  chapterId
}) => {
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const content = root.getTextContent();
      onChange?.(content);
    });
  };

  // Usamos uma chave dinâmica baseada no ID do capítulo para forçar a recriação do editor
  // quando mudamos de capítulo
  const editorKey = `editor-${bookId}-${chapterId || 'new'}`;

  return (
    <LexicalComposer key={editorKey} initialConfig={initialConfig}>
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
        <InitialContentPlugin initialContent={initialContent} />
        <ListPlugin />
        <LinkPlugin />
        <ImagePlugin />
        <AutocompletePlugin />
        <AIToolsSelectionPlugin />
        {bookId && chapterId && <AutoSavePlugin bookId={bookId} chapterId={chapterId} />}
      </EditorContainer>
    </LexicalComposer>
  );
};