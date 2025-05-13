import React from 'react';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { WordCountIcon } from '../../../components/icons';
import {
  Content,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
  WordCountBadge,
  EditorWrapper,
  EditorContainer
} from './styles';
import { LoadingChapter } from '../LoadingChapter';

interface EditorContentProps {
  chapterTitle: string;
  wordCount: number;
  onChapterTitleChange: (value: string) => void;
  onEditorChange: (content: string) => void;
  onWordCountChanged?: (wordCount: number) => void;
  bookId?: string;
  chapterId?: string;
  initialContent?: string;
  saveStatus: string;
  isOnline: boolean;
  setSaveStatus?: (status: 'saving' | 'saved' | 'error' | 'unsaved') => void;
  loadingChapter: boolean;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  chapterTitle,
  wordCount,
  onChapterTitleChange,
  onEditorChange,
  onWordCountChanged,
  bookId,
  chapterId,
  initialContent = '',
  saveStatus,
  isOnline,
  setSaveStatus,
  loadingChapter
}) => {
  // Usando chapterId como chave para forçar recriação completa
  // do componente quando mudar de capítulo
  const editorKey = `editor-${bookId}-${chapterId || 'novo'}`;

  // Verificar se o conteúdo é JSON válido
  const isJsonContent = React.useMemo(() => {
    if (!initialContent) return false;
    try {
      const parsed = JSON.parse(initialContent);
      return parsed.root !== undefined;
    } catch (e) {
      return false;
    }
  }, [initialContent]);

  console.log('Renderizando EditorContent:', {
    key: editorKey,
    chapterId,
    chapterTitle,
    contentLength: initialContent?.length || 0,
    isJsonContent
  });

  return (
    <Content>
      {/* Toolbar foi removida conforme solicitado */}
      
      {loadingChapter ? (
        <LoadingChapter mensagem="Carregando capítulo..." alinhamentoEsquerda />
      ) : (
        <EditorWrapper style={{ position: 'relative' }}>
          <EditorContainer style={{ position: 'relative', height: '100%' }}>
            <LexicalEditor
              key={editorKey}
              initialContent={initialContent}
              onChange={onEditorChange}
              bookId={bookId}
              chapterId={chapterId}
              onWordCountChanged={onWordCountChanged}
              setSaveStatus={setSaveStatus}
            />
          </EditorContainer>
          {/* Contador de palavras flutuante */}
          <WordCountBadge className="word-count-floating">
            <WordCountIcon />
            <span className="count-label">Palavras:</span> <span className="count-value">{wordCount}</span>
          </WordCountBadge>
        </EditorWrapper>
      )}
    </Content>
  );
};