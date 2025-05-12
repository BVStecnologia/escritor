import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Capitulo, dbService } from '../../../services/dbService';
import { ChapterCard } from './ChapterCard';
import { MenuIcon, PlusIcon, DeleteIcon, CloseIcon } from '../../../components/icons';
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
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)'};
  backdrop-filter: blur(4px);
  z-index: 1000;
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

const DeletePopupContainer = styled(PopupContainer)`
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.isDarkMode 
    ? '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' 
    : '0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)'};
  z-index: 1010;
  animation: scaleIn 0.2s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const DeleteMessage = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const DeleteWarning = styled.p`
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.danger || theme.colors.error || "#f87171"};
  text-align: center;
  font-weight: 500;
`;

const DeleteButton = styled(PopupButton)`
  background: ${({ theme }) => theme.colors.danger || theme.colors.error || "#f87171"};
  
  &:hover {
    background: ${({ theme }) => theme.colors.danger 
      ? `${theme.colors.danger}dd` 
      : theme.colors.error 
        ? `${theme.colors.error}dd` 
        : "#ef4444"};
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
  margin: 0 auto 1rem auto;
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

// DeleteConfirmationModal componente separado para renderizar através de portais
const DeleteConfirmationModal = ({ 
  onConfirm, 
  onCancel, 
  chapter, 
  isDarkMode 
}: { 
  onConfirm: () => void; 
  onCancel: () => void; 
  chapter: Capitulo; 
  isDarkMode: boolean; 
}) => {
  // Usando ReactDOM.createPortal para renderizar o modal fora da hierarquia do DOM
  return ReactDOM.createPortal(
    <PopupOverlay onClick={onCancel}>
      <DeletePopupContainer onClick={e => e.stopPropagation()}>
        <PopupTitle style={{ color: "#f87171" }}>
          Excluir Parte
        </PopupTitle>
        <DeleteMessage>
          Tem certeza que deseja excluir a parte "{chapter.titulo || 'Sem título'}"?
        </DeleteMessage>
        <DeleteWarning>
          Esta ação não pode ser desfeita e todo o conteúdo será perdido.
        </DeleteWarning>
        <PopupActions>
          <PopupButton
            style={{ 
              background: isDarkMode ? '#334155' : '#eee', 
              color: isDarkMode ? '#e2e8f0' : '#333' 
            }}
            onClick={onCancel}
          >
            Cancelar
          </PopupButton>
          <DeleteButton onClick={onConfirm}>
            Excluir
          </DeleteButton>
        </PopupActions>
      </DeletePopupContainer>
    </PopupOverlay>,
    document.body // Renderiza diretamente no body do documento
  );
};

interface SidebarProps {
  chapters: Capitulo[];
  activeChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  onNewChapter: (title?: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onChaptersReorder?: (reorderedChapters: Capitulo[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  onNewChapter,
  onDeleteChapter,
  onChaptersReorder
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<Capitulo | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const { isDarkMode } = useTheme();

  const filteredChapters = chapters.filter(chapter =>
    chapter.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (chapter: Capitulo, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Parte selecionada para exclusão:', chapter.titulo);
    setChapterToDelete(chapter);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (chapterToDelete && onDeleteChapter) {
      console.log('Excluindo parte:', chapterToDelete.titulo);
      onDeleteChapter(chapterToDelete.id);
      setShowDeletePopup(false);
      setChapterToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setChapterToDelete(null);
  };
  
  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    
    // Verificar se o item foi solto dentro da lista
    if (!destination || 
        (source.index === destination.index && source.droppableId === destination.droppableId)) {
      return;
    }
    
    // Fazer uma cópia dos capítulos
    const reorderedChapters = Array.from(filteredChapters);
    
    // Remover da posição original
    const [movedChapter] = reorderedChapters.splice(source.index, 1);
    
    // Inserir na nova posição
    reorderedChapters.splice(destination.index, 0, movedChapter);
    
    // Atualizar as ordens
    const updatedChapters = reorderedChapters.map((chapter, index) => ({
      ...chapter,
      ordem: index + 1
    }));
    
    // Notificar componente pai que irá atualizar no banco de dados
    if (onChaptersReorder) {
      onChaptersReorder(updatedChapters);
    }
  }, [filteredChapters, onChaptersReorder]);

  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader $isOpen={isOpen}>
        {isOpen && <SidebarTitle $isOpen={isOpen}>Partes</SidebarTitle>}
        <ToggleSidebarButton onClick={() => setIsOpen(!isOpen)}>
          <MenuIcon />
        </ToggleSidebarButton>
      </SidebarHeader>

      {isOpen && (
        <ChapterSearch $isOpen={isOpen}>
          <SearchInput
            placeholder="Buscar partes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ChapterSearch>
      )}

      <ChaptersContainer>
        {isOpen ? (
          // Versão completa quando aberto
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="chapters-list">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ width: '100%' }}
                >
                  {filteredChapters.map((chapter, index) => (
                    <Draggable 
                      key={chapter.id} 
                      draggableId={String(chapter.id)} 
                      index={index}
                      isDragDisabled={String(chapter.id) === String(activeChapterId)}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1
                          }}
                        >
                          <ChapterCard
                            chapter={chapter}
                            index={index}
                            isActive={String(chapter.id) === String(activeChapterId)}
                            onClick={String(chapter.id) !== String(activeChapterId) ? () => onChapterSelect(chapter.id) : () => {}}
                            onDelete={onDeleteChapter ? (e) => handleDeleteClick(chapter, e) : undefined}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <NewChapterButton onClick={() => setShowPopup(true)}>
              <PlusIcon />
              Nova Parte
            </NewChapterButton>
          </DragDropContext>
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
          </>
        )}
      </ChaptersContainer>

      {/* Popup de nova parte */}
      {showPopup && (
        <PopupOverlay onClick={() => setShowPopup(false)}>
          <PopupContainer onClick={e => e.stopPropagation()}>
            <PopupTitle>Nova Parte</PopupTitle>
            <PopupInput
              autoFocus
              placeholder="Título da nova parte"
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

      {/* Popup de confirmação de exclusão usando portal */}
      {showDeletePopup && chapterToDelete && (
        <DeleteConfirmationModal
          chapter={chapterToDelete}
          isDarkMode={isDarkMode}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </SidebarContainer>
  );
};