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
        {isOpen ? (
          // Versão completa quando aberto
          <>
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
          </>
        ) : (
          // Versão recolhida - apenas ícones ou versão simplificada
          <>
            {filteredChapters.map((chapter, index) => (
              <div
                key={chapter.id}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: chapter.id === activeChapterId ? 'var(--primary-color, #3b82f6)' : 'var(--background-paper, #fff)',
                  color: chapter.id === activeChapterId ? '#fff' : 'inherit',
                  margin: '0 auto',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
                onClick={() => onChapterSelect(chapter.id)}
              >
                {index + 1}
              </div>
            ))}

            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--primary-light, #60a5fa)',
                color: '#fff',
                margin: '8px auto 0',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
              onClick={onNewChapter}
            >
              <PlusIcon />
            </div>
          </>
        )}
      </ChaptersContainer>
    </SidebarContainer>
  );
};