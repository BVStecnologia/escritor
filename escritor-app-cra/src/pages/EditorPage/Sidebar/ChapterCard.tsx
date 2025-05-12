import React from 'react';
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
  
  ${ChapterCardContainer}:hover &:not([data-disabled=true]) {
    opacity: 0.6;
  }
  
  ${ChapterCardContainer}:hover &:hover:not([data-disabled=true]) {
    opacity: 1;
    cursor: grab;
  }
`;

interface ChapterCardProps {
  chapter: Capitulo;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  isActive,
  onClick,
  onDelete
}) => {
  const { isDarkMode } = useTheme();
  
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

  return (
    <ChapterCardContainer 
      $active={isActive} 
      $index={index}
      onClick={onClick}
      style={{ cursor: isActive ? 'default' : 'pointer', position: 'relative' }}
    >
      <DragHandleIcon data-disabled={isActive ? "true" : "false"} />
      
      {onDelete && (
        <DeleteButton onClick={handleDeleteClick}>
          <DeleteIcon />
        </DeleteButton>
      )}
      
      <ChapterInfo $active={isActive}>
        <ChapterNumber $active={isActive}>
          Parte {displayIndex}
        </ChapterNumber>
        <ChapterTitle>
          {chapter.titulo || 'Sem título'}
        </ChapterTitle>
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