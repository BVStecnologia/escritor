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
import { useTheme } from '../../../contexts/ThemeContext';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'};
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopupContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.isDarkMode 
    ? '0 8px 32px rgba(0,0,0,0.3)' 
    : '0 8px 32px rgba(0,0,0,0.18)'};
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
  border: 1px solid ${({ theme }) => theme.colors.border?.light || (theme.isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")};
  background: ${({ theme }) => theme.colors.background.glass};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  margin-bottom: 0.5rem;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.isDarkMode 
      ? `0 0 0 2px ${theme.colors.primary}30` 
      : theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};
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
  color: ${({ theme }) => theme.colors.white || "#ffffff"};
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const CollapsedChapter = styled.div<{ $active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode 
        ? 'rgba(79, 70, 229, 0.15)' 
        : 'rgba(137, 155, 255, 0.15)' 
      : theme.colors.background.paper};
  color: ${({ theme, $active }) => 
    $active 
      ? theme.colors.primary 
      : theme.colors.text.primary};
  margin: 0 auto;
  cursor: ${({ $active }) => $active ? 'default' : 'pointer'};
  font-weight: bold;
  box-shadow: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode 
        ? 'inset 0 0 0 1px rgba(79, 70, 229, 0.3)' 
        : 'inset 0 0 0 1px rgba(137, 155, 255, 0.3)' 
      : theme.colors.shadow?.sm || '0 2px 8px rgba(0, 0, 0, 0.05)'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: ${({ $active }) => $active ? 'none' : 'translateY(-2px)'};
    box-shadow: ${({ theme, $active }) => 
      $active 
        ? theme.isDarkMode 
          ? 'inset 0 0 0 1px rgba(79, 70, 229, 0.3)' 
          : 'inset 0 0 0 1px rgba(137, 155, 255, 0.3)' 
        : theme.colors.shadow?.md || '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const CollapsedNewButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary + (theme.isDarkMode ? '15' : '10')};
  color: ${({ theme }) => theme.colors.primary};
  margin: 1rem auto 0;
  cursor: pointer;
  border: 1px dashed ${({ theme }) => theme.colors.primary + (theme.isDarkMode ? '40' : '50')};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.primary + (theme.isDarkMode ? '25' : '20')};
  }
  
  svg {
    width: 18px;
    height: 18px;
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
  const { isDarkMode } = useTheme();

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
                isActive={String(chapter.id) === String(activeChapterId)}
                onClick={String(chapter.id) !== String(activeChapterId) ? () => onChapterSelect(chapter.id) : () => {}}
              />
            ))}

            <NewChapterButton onClick={() => setShowPopup(true)}>
              <PlusIcon />
              Novo Capítulo
            </NewChapterButton>
          </>
        ) : (
          // Versão recolhida - apenas ícones ou versão simplificada
          <>
            {filteredChapters.map((chapter, index) => (
              <CollapsedChapter
                key={chapter.id}
                $active={String(chapter.id) === String(activeChapterId)}
                onClick={() => String(chapter.id) !== String(activeChapterId) && onChapterSelect(chapter.id)}
              >
                {index + 1}
              </CollapsedChapter>
            ))}
            
            <CollapsedNewButton onClick={() => setShowPopup(true)}>
              <PlusIcon />
            </CollapsedNewButton>
          </>
        )}
      </ChaptersContainer>

      {/* Popup de novo capítulo sempre visível quando showPopup for true */}
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
                style={{ 
                  background: isDarkMode ? '#334155' : '#eee', 
                  color: isDarkMode ? '#e2e8f0' : '#333' 
                }}
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
    </SidebarContainer>
  );
};