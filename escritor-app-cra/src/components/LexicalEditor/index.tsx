import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { AutoLinkNode } from '@lexical/link';
import styled, { ThemeContext } from 'styled-components';
import debounce from 'lodash/debounce';
import { editorTheme } from './theme';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { AutoSavePlugin } from './plugins/AutoSavePlugin';
import { SpellCheckPlugin } from './plugins/SpellCheckPlugin';
import { WritingToolsPlugin } from './plugins/WritingToolsPlugin';
import { AIToolsSelectionPlugin } from './plugins/AIToolsSelectionPlugin';
import { AutocompletePlugin } from './plugins/AutocompletePlugin';
import { AIAutocompletePlugin } from './plugins/AIAutocompletePlugin';
import ImagePlugin, { ImageNode } from './plugins/ImagePlugin';
import { FloatingSaveStatus } from './FloatingSaveStatus';

// Inicialização de nós e configurações do Lexical
const EditorContainer = styled.div`
  font-family: 'Source Serif Pro', Georgia, serif;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.paper || '#ffffff'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const EditorInput = styled(ContentEditable)`
  height: 100%;
  min-height: 300px;
  padding: 32px 60px;
  font-size: 18px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text.primary};
  resize: none;
  caret-color: ${({ theme }) => theme.colors.primary};
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;

  /* Estilos para dispositivos móveis */
  @media (max-width: 768px) {
    padding: 24px;
    font-size: 16px;
    line-height: 1.6;
  }

  /* Estilização da barra de rolagem */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const Placeholder = styled.div`
  color: #adb5bd;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 32px;
  left: 60px;
  right: 60px;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  pointer-events: none;
  
  @media (max-width: 768px) {
    top: 24px;
    left: 24px;
    right: 24px;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

type EditorProps = {
  initialContent?: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  livroId?: string;
  capituloId?: string;
  loading?: boolean;
  bookId?: string;
  chapterId?: string;
  onWordCountChanged?: (wordCount: number) => void;
  setSaveStatus?: (status: 'saving' | 'saved' | 'error' | 'unsaved') => void;
};

export const LexicalEditor = ({
  initialContent = '',
  placeholder = 'Escreva aqui sua história...',
  readOnly = false,
  onChange,
  onSave,
  livroId,
  capituloId,
  loading = false,
  bookId,
  chapterId,
  onWordCountChanged,
  setSaveStatus: externalSetSaveStatus
}: EditorProps) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved' | 'error'>('saved');

  const onRef = useCallback((ref: HTMLDivElement) => {
    setFloatingAnchorElem(ref);
  }, []);

  // Configuração inicial do editor
  const initialConfig = useMemo(() => ({
    namespace: 'escritor-editor',
    theme: editorTheme,
    onError(error: Error) {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      LinkNode,
      AutoLinkNode,
      ImageNode
    ],
    editorState: initialContent,
    editable: !readOnly
  }), [initialContent, readOnly]);

  // Handler para salvar conteúdo com debounce
  const handleSave = useCallback(
    debounce(async (content: string) => {
      if (onSave) {
        try {
          setIsSaving(true);
          setSaveStatus('saving');
          await onSave(content);
          setSaveStatus('saved');
        } catch (error) {
          console.error('Erro ao salvar:', error);
          setSaveStatus('error');
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000),
    [onSave]
  );

  // Gerenciador de mudanças no editor
  const handleChange = useCallback(
    (content: string) => {
      if (onChange) {
        onChange(content);
      }
      if (onSave) {
        setSaveStatus('unsaved');
        handleSave(content);
      }
    },
    [onChange, onSave, handleSave]
  );

  // Cancelar debounce pendente ao desmontar
  useEffect(() => {
    return () => {
      handleSave.cancel();
    };
  }, [handleSave]);

  // Renderização condicional para loading
  if (loading) {
    return (
      <EditorContainer className="editor-container">
        <LoadingMessage>Carregando conteúdo...</LoadingMessage>
      </EditorContainer>
    );
  }

  // Renderização do editor
  return (
    <ThemeContext.Consumer>
      {theme => (
        <LexicalComposer initialConfig={initialConfig}>
          <EditorContainer className="editor-container">
            <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <ToolbarPlugin />
            </div>
            <div ref={onRef} className="editor-scroller" style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
              <RichTextPlugin
                contentEditable={
                  <EditorInput className="editor-input" />
                }
                placeholder={
                  <Placeholder>{placeholder}</Placeholder>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            
            {/* Plugins do Editor */}
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <ImagePlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <SpellCheckPlugin />
            
            {/* Plugins com IA */}
            <AIToolsSelectionPlugin livroId={livroId} capituloId={capituloId} />
            <WritingToolsPlugin />
            <AutocompletePlugin />
            <AIAutocompletePlugin livroId={livroId} capituloId={capituloId} />
            
            {/* Plugin de AutoSave */}
            {onSave && (
              <AutoSavePlugin 
                onStatusChange={(status) => {
                  setSaveStatus(status);
                  if (externalSetSaveStatus) externalSetSaveStatus(status);
                }} 
                bookId={bookId || livroId}
                chapterId={chapterId || capituloId}
                onWordCountChanged={onWordCountChanged}
              />
            )}
            
            {/* Indicador de Status de Salvamento */}
            {onSave && (
              <FloatingSaveStatus saveStatus={saveStatus} isOnline={true} />
            )}
          </EditorContainer>
        </LexicalComposer>
      )}
    </ThemeContext.Consumer>
  );
};