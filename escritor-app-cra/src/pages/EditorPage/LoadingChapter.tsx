import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const LoadingContainer = styled.div<{ $alinhamentoEsquerda?: boolean }>`
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.paper};
  padding: 2rem;
  text-align: center;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
  overflow: hidden;
`;

const LoadingAnimation = styled.div`
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
  display: flex;
  justify-content: center;
`;

const LoadingBook = styled.div<{ $isDarkMode: boolean }>`
  width: 120px;
  height: 80px;
  position: relative;
  border-radius: 8px 4px 4px 8px;
  background: ${({ theme }) => theme.colors.primaryGradient};
  box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};

  &::before {
    content: '';
    position: absolute;
    width: 12px;
    left: 0;
    top: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 8px 0 0 8px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 30px;
    right: 10px;
    height: 8px;
    background: ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
    box-shadow: 0 20px 0 ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'},
                0 40px 0 ${({ $isDarkMode }) => $isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  }
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const LoadingChapter: React.FC<{ mensagem?: string; alinhamentoEsquerda?: boolean }> = ({ mensagem, alinhamentoEsquerda }) => {
  const { isDarkMode } = useTheme();

  return (
    <LoadingContainer>
      <LoadingAnimation>
        <LoadingBook $isDarkMode={isDarkMode} />
      </LoadingAnimation>
      <LoadingText>{mensagem || 'Carregando capítulo...'}</LoadingText>
    </LoadingContainer>
  );
};