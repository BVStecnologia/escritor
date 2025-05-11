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

interface EditorContentProps {
  chapterTitle: string;
  wordCount: number;
  onChapterTitleChange: (value: string) => void;
  onEditorChange: (content: string) => void;
  bookId?: string;
  chapterId?: string;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  chapterTitle,
  wordCount,
  onChapterTitleChange,
  onEditorChange,
  bookId,
  chapterId
}) => {
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

      <EditorWrapper>
        <EditorContainer>
          <LexicalEditor
            initialContent=""
            onChange={onEditorChange}
            bookId={bookId}
            chapterId={chapterId}
          />
        </EditorContainer>
      </EditorWrapper>
    </Content>
  );
};