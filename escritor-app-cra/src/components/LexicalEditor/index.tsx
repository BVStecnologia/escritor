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
import { SpellCheckPlugin } from './plugins/SpellCheckPlugin';

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
  height: 100%;
  
  /* Personalizar a barra de rolagem */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.primary + '40'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.colors.primary + '80'};
  }
  
  /* Importante para posicionamento dos componentes flutuantes */
  .editor-container {
    position: relative;
    height: 100%;
  }
`;

const ContentEditableWrapper = styled.div`
  min-height: 100%;
  padding: 2rem;
  padding-bottom: 8rem; /* Adicionar espaço extra na parte inferior para o contador de palavras */

  .editor-input {
    outline: none;
    min-height: 100%;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 1.125rem;
    line-height: 1.75;
    color: ${({ theme }) => theme.colors.text.primary};

    /* Suporte a estilos inline para fontes */
    [style*="font-family"] {
      font-family: inherit; /* Reseta para o valor padrão */
    }
    
    /* Preserve estilos inline definidos pelo editor */
    [style] {
      font-family: var(--lexical-font-family, inherit);
    }
    
    /* Estilo para palavras com erro ortográfico */
    .spelling-error {
      text-decoration: underline wavy red;
      text-decoration-thickness: 2px;
      cursor: pointer;
      display: inline-block; /* Para garantir que o elemento não se estenda */
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
    }
  }

  /* Desativar sublinhado vermelho para elementos pai */
  [data-spell-checked="true"] {
    text-decoration: none !important;
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
  const contentLoaded = useRef<boolean>(false);

  useEffect(() => {
    if (!initialContent) return;
    
    // Resetar o estado ao mudar de capítulo
    if (lastChapterId.current !== chapterId) {
      contentLoaded.current = false;
    }
    
    // Não carregar novamente se já foi carregado para este capítulo
    if (contentLoaded.current) return;

    console.log('Carregando conteúdo no editor. Tamanho:', initialContent.length);
    
    editor.update(() => {
      try {
        // Verificar se o conteúdo parece ser JSON
        if (initialContent.startsWith('{') && initialContent.includes('"root"')) {
          console.log('Carregando conteúdo como JSON formatado');
          const json = JSON.parse(initialContent);
          
          if (json.root) {
            // Garante que estilos como font-family sejam preservados
            const editorState = editor.parseEditorState(json);
            editor.setEditorState(editorState);
            console.log('Conteúdo formatado carregado com sucesso');
          } else {
            throw new Error('JSON inválido para o Lexical');
          }
        } else {
          // Fallback para texto puro se não for JSON válido do Lexical
          console.log('Carregando como texto puro (fallback)');
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
        
        // Marcar como carregado para este capítulo
        contentLoaded.current = true;
      } catch (e) {
        console.error('Erro ao carregar conteúdo no editor:', e);
        
        // Tentar recuperar carregando como texto puro
        const root = $getRoot();
        root.clear();
        
        try {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('Erro ao carregar formatação. Tente editar e salvar novamente.'));
          root.append(paragraph);
        } catch (e2) {
          console.error('Erro fatal ao carregar editor:', e2);
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
          <ContentEditableWrapper className="editor-container">
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
        <SpellCheckPlugin />
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