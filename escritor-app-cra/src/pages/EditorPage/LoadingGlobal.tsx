import React from 'react';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const LoadingContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  width: 100vw;
  height: 100vh;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
`;

const LoadingAnimation = styled.div`
  margin-bottom: 2.5rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const LoadingBook = styled.div`
  width: 160px;
  height: 110px;
  position: relative;
  border-radius: 8px 4px 4px 8px;
  background: ${({ theme }) => theme.colors.primaryGradient};
  box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
  
  &::before {
    content: '';
    position: absolute;
    width: 16px;
    left: 0;
    top: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 8px 0 0 8px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 40px;
    right: 15px;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 30px 0 rgba(255, 255, 255, 0.2),
                0 60px 0 rgba(255, 255, 255, 0.2);
  }
`;

const LoadingText = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const LoadingGlobal: React.FC<{ mensagem?: string }> = ({ mensagem }) => (
  <LoadingContainer>
    <LoadingAnimation>
      <LoadingBook />
    </LoadingAnimation>
    <LoadingText>{mensagem || 'Preparando seu ambiente de escrita...'}</LoadingText>
  </LoadingContainer>
); 