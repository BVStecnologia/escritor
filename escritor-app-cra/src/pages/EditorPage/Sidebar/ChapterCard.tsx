import React from 'react';
import { Capitulo } from '../../../services/dbService';
import { WordCountIcon } from '../../../components/icons';
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

interface ChapterCardProps {
  chapter: Capitulo;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  isActive,
  onClick
}) => {
  // Calculate word count
  const wordCount = chapter.conteudo 
    ? chapter.conteudo.split(/\s+/).filter(Boolean).length 
    : 0;
  
  // Progresso fixo para evitar flicker
  const progress = 100;

  return (
    <ChapterCardContainer 
      $active={isActive} 
      $index={index}
      onClick={onClick}
    >
      <ChapterInfo $active={isActive}>
        <ChapterNumber $active={isActive}>
          Capítulo {index + 1}
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