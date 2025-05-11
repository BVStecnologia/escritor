import React, { useState } from 'react';
import { Capitulo } from '../../../services/dbService';
import { ChapterCard } from './ChapterCard';
import { MenuIcon, PlusIcon } from '../../../components/icons';
import {
  SidebarContainer,
  SidebarHeader,
  SidebarTitle,
  ToggleSidebarButton,
  ChapterSearch,
  SearchInput,
  ChaptersContainer,
  NewChapterButton
} from './styles';

interface SidebarProps {
  chapters: Capitulo[];
  activeChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  onNewChapter: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  onNewChapter
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChapters = chapters.filter(chapter =>
    chapter.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader $isOpen={isOpen}>
        {isOpen && <SidebarTitle $isOpen={isOpen}>Capítulos</SidebarTitle>}
        <ToggleSidebarButton onClick={() => setIsOpen(!isOpen)}>
          <MenuIcon />
        </ToggleSidebarButton>
      </SidebarHeader>

      {isOpen && (
        <ChapterSearch $isOpen={isOpen}>
          <SearchInput
            placeholder="Buscar capítulos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ChapterSearch>
      )}

      <ChaptersContainer>
        {filteredChapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            index={index}
            isActive={chapter.id === activeChapterId}
            onClick={() => onChapterSelect(chapter.id)}
          />
        ))}

        <NewChapterButton onClick={onNewChapter}>
          <PlusIcon />
          Novo Capítulo
        </NewChapterButton>
      </ChaptersContainer>
    </SidebarContainer>
  );
};