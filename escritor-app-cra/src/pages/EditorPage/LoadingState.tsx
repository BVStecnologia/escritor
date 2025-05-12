import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const LoadingContainer = styled.div<{ $alinhamentoEsquerda?: boolean }>`
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: ${({ $alinhamentoEsquerda }) => $alinhamentoEsquerda ? 'flex-start' : 'center'};
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: 2rem;
  text-align: ${({ $alinhamentoEsquerda }) => $alinhamentoEsquerda ? 'left' : 'center'};
`;

const LoadingAnimation = styled.div`
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
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

export const LoadingState: React.FC<{ mensagem?: string; alinhamentoEsquerda?: boolean }> = ({ mensagem, alinhamentoEsquerda }) => {
  const { isDarkMode } = useAppTheme();

  return (
    <LoadingContainer $alinhamentoEsquerda={alinhamentoEsquerda}>
      <LoadingAnimation>
        <LoadingBook $isDarkMode={isDarkMode} />
      </LoadingAnimation>
      <LoadingText>{mensagem || 'Preparando seu ambiente de escrita...'}</LoadingText>
    </LoadingContainer>
  );
};