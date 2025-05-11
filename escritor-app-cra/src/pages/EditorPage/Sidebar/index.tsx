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
import styled from 'styled-components';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.15);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopupContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.5rem;
`;

const PopupTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const PopupInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.glass};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  margin-bottom: 0.5rem;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};
  }
`;

const PopupActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const PopupButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

interface SidebarProps {
  chapters: Capitulo[];
  activeChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  onNewChapter: (title?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  onNewChapter
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [newTitle, setNewTitle] = useState('');

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

            <NewChapterButton onClick={() => setShowPopup(true)}>
              <PlusIcon />
              Novo Capítulo
            </NewChapterButton>
            {showPopup && (
              <PopupOverlay onClick={() => setShowPopup(false)}>
                <PopupContainer onClick={e => e.stopPropagation()}>
                  <PopupTitle>Novo Capítulo</PopupTitle>
                  <PopupInput
                    autoFocus
                    placeholder="Título do novo capítulo"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTitle.trim()) {
                        onNewChapter(newTitle.trim());
                        setShowPopup(false);
                        setNewTitle('');
                      }
                    }}
                  />
                  <PopupActions>
                    <PopupButton
                      style={{ background: '#eee', color: '#333' }}
                      onClick={() => {
                        setShowPopup(false);
                        setNewTitle('');
                      }}
                    >
                      Cancelar
                    </PopupButton>
                    <PopupButton
                      disabled={!newTitle.trim()}
                      onClick={() => {
                        if (newTitle.trim()) {
                          onNewChapter(newTitle.trim());
                          setShowPopup(false);
                          setNewTitle('');
                        }
                      }}
                    >
                      Criar
                    </PopupButton>
                  </PopupActions>
                </PopupContainer>
              </PopupOverlay>
            )}
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
              onClick={() => setShowPopup(true)}
            >
              <PlusIcon />
            </div>
            {showPopup && (
              <PopupOverlay onClick={() => setShowPopup(false)}>
                <PopupContainer onClick={e => e.stopPropagation()}>
                  <PopupTitle>Novo Capítulo</PopupTitle>
                  <PopupInput
                    autoFocus
                    placeholder="Título do novo capítulo"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTitle.trim()) {
                        onNewChapter(newTitle.trim());
                        setShowPopup(false);
                        setNewTitle('');
                      }
                    }}
                  />
                  <PopupActions>
                    <PopupButton
                      style={{ background: '#eee', color: '#333' }}
                      onClick={() => {
                        setShowPopup(false);
                        setNewTitle('');
                      }}
                    >
                      Cancelar
                    </PopupButton>
                    <PopupButton
                      disabled={!newTitle.trim()}
                      onClick={() => {
                        if (newTitle.trim()) {
                          onNewChapter(newTitle.trim());
                          setShowPopup(false);
                          setNewTitle('');
                        }
                      }}
                    >
                      Criar
                    </PopupButton>
                  </PopupActions>
                </PopupContainer>
              </PopupOverlay>
            )}
          </>
        )}
      </ChaptersContainer>
    </SidebarContainer>
  );
};