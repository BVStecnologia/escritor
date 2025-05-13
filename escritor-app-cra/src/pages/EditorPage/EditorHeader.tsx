import React, { useState, useEffect } from 'react';
import { Logo, BookTitle, HeaderContent, HeaderControls, ThemeToggleButton, StatusIndicator, ActionButton, Header, LogoSection } from './styles';
import { PenIcon, ArrowBackIcon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

// Componente estilizado para a saudação - sem fundo
const GreetingContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  transition: all 0.3s ease;
  flex-direction: column;
`;

const GreetingIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
`;

const GreetingText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-left: 0.25rem;
`;

const MotivationalText = styled.div`
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 0.25rem;
  text-align: center;
`;

// Componente centralizado no cabeçalho
const CenterContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

// Frases motivacionais para escritores
const motivationalPhrases = [
  "Cada palavra é um novo mundo.",
  "A melhor inspiração vem da dedicação.",
  "Escreva hoje o que outros lerão amanhã.",
  "Uma palavra por vez constrói histórias.",
  "A página em branco é um convite à criação.",
  "Palavras dão vida a pensamentos.",
  "A escrita transforma o invisível em visível.",
  "Escrever é descobrir o que você não sabia que sabia.",
  "Cada parágrafo é um passo em sua jornada.",
  "Sua história merece ser contada."
];

// Componente para a saudação
const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState('');
  const [motivational, setMotivational] = useState('');
  const { user } = useAuth();
  
  // Nome do usuário (obtido dos metadados do usuário)
  const userName = user?.user_metadata?.name || 'Escritor';

  // Função para determinar a saudação baseada no horário atual
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting('Bom dia');
        setIcon('☕'); // Ícone para café da manhã
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting('Boa tarde');
        setIcon('☀️'); // Ícone para sol/tarde
      } else if (currentHour >= 18 && currentHour < 24) { // Ajustado: noite vai até meia-noite
        setGreeting('Boa noite');
        setIcon('🌙'); // Ícone para noite
      } else {
        setGreeting('Boa madrugada');
        setIcon('🦉'); // Coruja para madrugada (00h às 5h)
      }
      
      // Escolher uma frase motivacional aleatória
      const randomIndex = Math.floor(Math.random() * motivationalPhrases.length);
      setMotivational(motivationalPhrases[randomIndex]);
    };
    
    // Atualizar a saudação imediatamente e depois a cada minuto
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <GreetingContainer>
      <GreetingText>
        <GreetingIcon>{icon}</GreetingIcon>
        {greeting},<UserName>{userName}!</UserName>
      </GreetingText>
      <MotivationalText>{motivational}</MotivationalText>
    </GreetingContainer>
  );
};

interface EditorHeaderProps {
  bookTitle: string;
  saveStatus: string;
  titleSaveStatus: string;
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
  onBookTitleChange: (title: string) => void;
  onEditBookInfo: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  bookTitle,
  saveStatus,
  titleSaveStatus,
  isOnline,
  isDarkMode,
  onToggleTheme,
  onBackToDashboard,
  onBookTitleChange,
  onEditBookInfo
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(bookTitle);

  const handleEditBookInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditBookInfo();
  };

  const renderStatus = () => {
    if (!isOnline) {
      return (
        <StatusIndicator $status="offline">
          Offline
        </StatusIndicator>
      );
    }

    if (saveStatus === 'saving') {
      return (
        <StatusIndicator $status="saving">
          Salvando...
        </StatusIndicator>
      );
    }

    if (saveStatus === 'saved') {
      return (
        <StatusIndicator $status="saved">
          Salvo
        </StatusIndicator>
      );
    }

    return (
      <StatusIndicator $status="online">
        Online
      </StatusIndicator>
    );
  };

  return (
    <Header>
      <HeaderContent>
        <LogoSection>
          <Logo>
            Bookwriter
            <svg width="0" height="0">
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </svg>
          </Logo>

          <BookTitle onClick={handleEditBookInfo}>
            {bookTitle || "Sem título"}
            <button 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '0', 
                marginLeft: '8px', 
                display: 'inline-flex', 
                alignItems: 'center' 
              }}
              onClick={handleEditBookInfo}
              title="Editar informações do livro"
            >
              <PenIcon />
            </button>
          </BookTitle>
        </LogoSection>
        
        {/* Componente de saudação centralizado */}
        <CenterContent>
          <Greeting />
        </CenterContent>

        <HeaderControls>
          {renderStatus()}
          
          <ThemeToggleButton onClick={onToggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggleButton>
          
          <ActionButton onClick={onBackToDashboard}>
            <ArrowBackIcon />
            Voltar
          </ActionButton>
        </HeaderControls>
      </HeaderContent>
    </Header>
  );
};