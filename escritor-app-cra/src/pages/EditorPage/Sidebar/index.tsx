import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Capitulo, dbService } from '../../../services/dbService';
import { ChapterCard } from './ChapterCard';
import { PlusIcon, DeleteIcon, CloseIcon, CollapseRightIcon, CollapseLeftIcon } from '../../../components/icons';
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
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';

// Animações para os componentes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

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

// Adicionar este componente estilizado para as instruções
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.secondary};
  animation: ${fadeInUp} 0.5s ease;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyStateText = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const EmptyStateExample = styled.div`
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  font-size: 0.9rem;
  text-align: left;
`;

const ExampleItem = styled.div`
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ExampleNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}40;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.75rem;
  font-weight: bold;
`;

interface SidebarProps {
  chapters: Capitulo[];
  activeChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  onNewChapter: (title?: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onChaptersReorder?: (reorderedChapters: Capitulo[]) => void;
  onChapterTitleChange?: (chapterId: string, newTitle: string) => void;
  hideCollapseButton?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  onNewChapter,
  onDeleteChapter,
  onChaptersReorder,
  onChapterTitleChange,
  hideCollapseButton
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
    setChapterToDelete(chapter);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (chapterToDelete && onDeleteChapter) {
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

  const renderChapters = () => {
    return filteredChapters.map((chapter, index) => (
      <Draggable 
        key={String(chapter.id)} 
        draggableId={String(chapter.id)} 
        index={index}
        isDragDisabled={!isOpen}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.6 : 1
            }}
          >
            <ChapterCard
              chapter={chapter}
              index={index}
              isActive={String(chapter.id) === activeChapterId}
              onClick={() => onChapterSelect(String(chapter.id))}
              onDelete={(e) => handleDeleteClick(chapter, e)}
              onTitleChange={onChapterTitleChange}
            />
          </div>
        )}
      </Draggable>
    ));
  };

  return (
    <SidebarContainer $isOpen={isOpen} $isEmpty={filteredChapters.length === 0}>
      <SidebarHeader $isOpen={isOpen}>
        {isOpen && <SidebarTitle $isOpen={isOpen}>Partes</SidebarTitle>}
        {!hideCollapseButton && (
        <ToggleSidebarButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <CollapseLeftIcon /> : <CollapseRightIcon />}
        </ToggleSidebarButton>
        )}
      </SidebarHeader>

      {isOpen && (
        // Mostrar campo de busca apenas se tiver mais de 3 partes
        filteredChapters.length > 3 && (
          <ChapterSearch $isOpen={isOpen}>
            <SearchInput
              placeholder="Buscar partes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </ChapterSearch>
        )
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
                  {filteredChapters.length > 0 ? (
                    <>
                      {renderChapters()}
                      {provided.placeholder}
                    </>
                  ) : (
                    !showPopup && (
                    <EmptyStateContainer>
                      <EmptyStateIcon>📝</EmptyStateIcon>
                      <EmptyStateTitle>Monte as partes do seu livro</EmptyStateTitle>
                      <EmptyStateText>
                          Você pode começar escrevendo os capítulos, adicionar a capa e a introdução depois, ou, se preferir, montar a capa primeiro.<br />
                          Organize as partes do seu livro do jeito que fizer mais sentido para você: arraste, solte e reordene quando quiser.<br />
                          O importante é dar o primeiro passo na sua história!
                      </EmptyStateText>
                      <EmptyStateExample>
                        <ExampleItem>
                          <ExampleNumber>1</ExampleNumber>
                          Capa
                        </ExampleItem>
                        <ExampleItem>
                          <ExampleNumber>2</ExampleNumber>
                          Introdução
                        </ExampleItem>
                        <ExampleItem>
                          <ExampleNumber>3</ExampleNumber>
                          Capítulo 1
                        </ExampleItem>
                      </EmptyStateExample>
                      <NewChapterButton onClick={() => setShowPopup(true)}>
                        <PlusIcon />
                          {filteredChapters.length === 0 ? 'Criar primeira parte' : 'Nova Parte'}
                      </NewChapterButton>
                    </EmptyStateContainer>
                    )
                  )}
                </div>
              )}
            </Droppable>
            {filteredChapters.length > 0 && (
              <NewChapterButton onClick={() => setShowPopup(true)}>
                <PlusIcon />
                Nova Parte
              </NewChapterButton>
            )}
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
            <PopupTitle>{filteredChapters.length === 0 ? 'Primeira Parte' : 'Nova Parte'}</PopupTitle>
            <PopupInput
              autoFocus
              placeholder={filteredChapters.length === 0 ? 'Título da primeira parte' : 'Título da nova parte'}
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