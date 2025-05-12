import React, { useState, useRef, useEffect } from 'react';
import { Capitulo } from '../../../services/dbService';
import { WordCountIcon, DeleteIcon } from '../../../components/icons';
import { useTheme } from '../../../contexts/ThemeContext';
import styled from 'styled-components';
import {
  ChapterCardContainer,
  ChapterInfo,
  ChapterNumber,
  ChapterTitle,
  ChapterStats,
  ChapterStat,
  ChapterProgress,
  ChapterProgressBar
} from './styles';

// Botão de exclusão que aparece apenas quando o mouse está sobre o card
const DeleteButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.danger || theme.colors.error || "#f87171"};
  z-index: 10;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.danger || theme.colors.error || "#f87171"};
    color: white;
    transform: scale(1.1);
  }
  
  ${ChapterCardContainer}:hover & {
    opacity: 1;
  }
`;

// Indicador de arrastar que aparece apenas quando o mouse está sobre o card
const DragHandleIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: calc(50% - 12px);
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
  transition: all 0.2s ease;
  
  &::before, &::after {
    content: '';
    display: block;
    width: 20px;
    height: 2px;
    background: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
    margin: 2px 0;
    border-radius: 2px;
  }
  
  ${ChapterCardContainer}:hover & {
    opacity: 0.6;
  }
  
  ${ChapterCardContainer}:hover &:hover {
    opacity: 1;
    cursor: grab;
  }
`;

// Input para edição do título do capítulo
const ChapterTitleInput = styled.input`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 0.1rem 0;
  margin: 0;
  width: 100%;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

interface ChapterCardProps {
  chapter: Capitulo;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onTitleChange?: (id: string, newTitle: string) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  isActive,
  onClick,
  onDelete,
  onTitleChange
}) => {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chapter.titulo || 'Sem título');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use o campo 'palavras' do capítulo quando disponível, senão calcule a partir do conteúdo
  const wordCount = typeof chapter.palavras === 'number' 
    ? chapter.palavras 
    : chapter.conteudo 
      ? chapter.conteudo.split(/\s+/).filter(Boolean).length 
      : 0;
  
  // Progresso fixo para evitar flicker
  const progress = 100;

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDelete) {
      console.log('Botão de exclusão clicado');
      onDelete(e);
    }
  };
  
  // Sempre usar o índice + 1 como número da parte, independentemente do campo ordem
  const displayIndex = index + 1;
  
  // Lidar com clique no título para edição
  const handleTitleClick = (e: React.MouseEvent) => {
    if (isActive && onTitleChange) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };
  
  // Lidar com alteração do título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('Título sendo alterado:', newTitle);
    setEditedTitle(newTitle);
  };
  
  // Lidar com o fim da edição do título
  const handleTitleBlur = () => {
    console.log('===== INÍCIO DO PROCESSO DE ATUALIZAÇÃO DO TÍTULO =====');
    setIsEditing(false);
    
    // Verificar se o título foi alterado
    const novoTitulo = editedTitle.trim() || 'Sem título';
    const tituloAtual = chapter.titulo || 'Sem título';
    
    console.log('Comparando títulos:', {
      novoTitulo,
      tituloAtual,
      diferentes: novoTitulo !== tituloAtual
    });
    
    // Salvar o título somente se foi alterado
    if (onTitleChange) {
      try {
        console.log('Enviando título para salvar:', {
          id: chapter.id,
          titulo: novoTitulo
        });
        
        // Passar o ID e o novo título para a função de atualização
        onTitleChange(String(chapter.id), novoTitulo);
        
        console.log('Função onTitleChange executada com sucesso');
      } catch (error) {
        console.error('ERRO ao atualizar título:', error);
      }
    } else {
      console.log('Função onTitleChange não disponível');
    }
    
    console.log('===== FIM DO PROCESSO DE ATUALIZAÇÃO DO TÍTULO =====');
  };
  
  // Lidar com teclas durante a edição do título
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditedTitle(chapter.titulo || 'Sem título');
      setIsEditing(false);
    }
  };

  // Focar no input quando começa a edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <ChapterCardContainer 
      $active={isActive} 
      $index={index}
      onClick={onClick}
      style={{ cursor: isActive ? 'default' : 'pointer', position: 'relative' }}
    >
      <DragHandleIcon />
      
      {onDelete && (
        <DeleteButton onClick={handleDeleteClick}>
          <DeleteIcon />
        </DeleteButton>
      )}
      
      <ChapterInfo $active={isActive}>
        <ChapterNumber $active={isActive}>
          Parte {displayIndex}
        </ChapterNumber>
        
        {isActive && isEditing ? (
          <ChapterTitleInput
            ref={inputRef}
            value={editedTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <ChapterTitle onClick={isActive ? handleTitleClick : undefined}>
            {chapter.titulo || 'Sem título'}
            {isActive && onTitleChange && (
              <span style={{ 
                fontSize: '0.7rem', 
                opacity: 0.6, 
                marginLeft: '0.4rem', 
                verticalAlign: 'middle' 
              }}>
                (clique para editar)
              </span>
            )}
          </ChapterTitle>
        )}
        
        <ChapterStats $active={isActive}>
          <ChapterStat>
            <WordCountIcon />
            {wordCount} palavras
          </ChapterStat>
        </ChapterStats>
      </ChapterInfo>
      <ChapterProgress $active={isActive}>
        <ChapterProgressBar 
          $progress={progress} 
          $active={isActive}
        />
      </ChapterProgress>
    </ChapterCardContainer>
  );
};