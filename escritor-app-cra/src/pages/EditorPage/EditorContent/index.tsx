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
  setSaveStatus?: (status: 'saving' | 'saved' | 'idle') => void;
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

  console.log('Renderizando EditorContent com key:', editorKey);
  console.log('chapterTitle:', chapterTitle);
  console.log('initialContent:', initialContent ? `${initialContent.substring(0, 20)}...` : 'vazio');

  return (
    <Content>
      {/* Removemos a barra de ferramentas, já que não temos mais elementos nela */}
      
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
              setSaveStatus={setSaveStatus}
              onWordCountChanged={onWordCountChanged}
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