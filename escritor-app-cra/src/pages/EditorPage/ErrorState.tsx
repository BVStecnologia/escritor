import React from 'react';
import styled from 'styled-components';
import { ArrowBackIcon } from '../../components/icons';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: ${({ theme }) => theme.space.xl};
`;

const ErrorCard = styled.div`
  padding: 3rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
  text-align: center;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

interface ErrorStateProps {
  error: string | null;
  onBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onBack }) => {
  return (
    <ErrorContainer>
      <ErrorCard>
        <ErrorIcon>⚠️</ErrorIcon>
        <ErrorTitle>Ops, algo deu errado!</ErrorTitle>
        <ErrorMessage>
          {error || 'Não foi possível carregar as informações do livro. Por favor, tente novamente.'}
        </ErrorMessage>
        <BackButton onClick={onBack}>
          <ArrowBackIcon />
          Voltar para Dashboard
        </BackButton>
      </ErrorCard>
    </ErrorContainer>
  );
};