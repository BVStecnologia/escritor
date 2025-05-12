import React from 'react';
import { LexicalEditor } from '../../../components/LexicalEditor';
import { WordCountIcon } from '../../../components/icons';
import {
  Content,
  Toolbar,
  ToolbarLeft,
  ChapterTitleInput,
  ToolbarRight,
  WordCountBadge,
  EditorWrapper,
  EditorContainer
} from './styles';
import { FloatingSaveStatus } from '../../../components/LexicalEditor/FloatingSaveStatus';
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
      <Toolbar>
        <ToolbarLeft>
          <ChapterTitleInput
            placeholder="Título do capítulo"
            value={chapterTitle}
            onChange={(e) => onChapterTitleChange(e.target.value)}
          />
        </ToolbarLeft>
        <ToolbarRight>
          <WordCountBadge>
            <WordCountIcon />
            Palavras: <span>{wordCount}</span>
          </WordCountBadge>
        </ToolbarRight>
      </Toolbar>

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
          <FloatingSaveStatus saveStatus={saveStatus} isOnline={isOnline} />
        </EditorWrapper>
      )}
    </Content>
  );
};