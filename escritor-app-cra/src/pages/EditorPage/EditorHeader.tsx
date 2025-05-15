import React, { useState, useEffect } from 'react';
import { Logo, BookTitle, HeaderContent, ThemeToggleButton, StatusIndicator, ActionButton, Header } from './styles';
import { PenIcon, ArrowBackIcon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

// Novos componentes com largura fixa garantindo centralização
const SideSection = styled.div`
  display: flex;
  align-items: center;
  width: 350px; /* Largura fixa para ambos os lados */
`;

const LeftSection = styled(SideSection)`
  justify-content: flex-start;
`;

const RightSection = styled(SideSection)`
  justify-content: flex-end;
  gap: 16px; /* Espaçamento uniforme entre os itens */
`;

// Componente centralizado no cabeçalho
const CenterContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

// Botão de painel mais sutil com melhor suporte para tema escuro
const PainelButton = styled.button<{ $isDarkMode: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    opacity: 1;
    background: ${({ $isDarkMode, theme }) => 
      $isDarkMode 
        ? 'rgba(60, 60, 70, 0.6)' // Fundo escuro sutil para o tema escuro
        : theme.colors.background.light
    };
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary}; 
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

// Frases motivacionais para escritores - lista expandida
const motivationalPhrases = [
  // Frases originais
  "Cada palavra é um novo mundo.",
  "A melhor inspiração vem da dedicação.",
  "Escreva hoje o que outros lerão amanhã.",
  "Uma palavra por vez constrói histórias.",
  "A página em branco é um convite à criação.",
  "Palavras dão vida a pensamentos.",
  "A escrita transforma o invisível em visível.",
  "Escrever é descobrir o que você não sabia que sabia.",
  "Cada parágrafo é um passo em sua jornada.",
  "Sua história merece ser contada.",
  
  // Novas frases
  "Grandes histórias começam com a coragem de escrever.",
  "No silêncio das palavras, encontramos nosso eco.",
  "Quem escreve, constrói pontes entre mundos.",
  "Deixe suas palavras serem o mapa para o desconhecido.",
  "A escrita é a mais poderosa forma de magia.",
  "Cada frase é uma semente para novas ideias.",
  "Seja o autor da sua própria história.",
  "O melhor momento para escrever é agora.",
  "Palavras são ferramentas que constroem realidades.",
  "As melhores histórias nascem da verdade interior.",
  "Escrever é libertar a voz do silêncio.",
  "Suas palavras podem mudar o mundo de alguém.",
  "A criatividade floresce no jardim da disciplina.",
  "A inspiração vem enquanto escrevemos, não antes.",
  "Escrever é um ato de coragem e descoberta.",
  "Toda grande jornada começa com um primeiro parágrafo.",
  "As palavras são as asas dos pensamentos.",
  "Escrever é pintar com palavras.",
  "O livro que não escrevemos também não será lido.",
  "Somos as histórias que contamos a nós mesmos.",
  "A persistência transforma palavras em obras-primas.",
  "Escrever é dançar com as ideias.",
  "Palavras mudam mentes, histórias mudam corações.",
  "Quando escrevemos, criamos nosso próprio destino.",
  "A imaginação é o lápis que nunca se gasta.",
  "O papel em branco é o espelho da possibilidade.",
  "A escrita é a voz da alma no papel.",
  "Histórias são mapas para navegar pela vida.",
  "Na escrita encontramos a liberdade das possibilidades infinitas.",
  "Os melhores escritores são primeiro grandes observadores.",
  "Escrever é um ato de resistência contra o esquecimento.",
  "Uma história bem contada pode mudar o mundo.",
  "Escrever todos os dias é como regar um jardim interior.",
  "A melhor edição vem depois do primeiro rascunho.",
  "Suas palavras são sementes; plante-as com sabedoria.",
  "Escolha palavras que deixem marcas, não apenas impressões.",
  "A escrita nos ensina a ver além do óbvio.",
  "Escrever é um ato de fé no poder das palavras.",
  "Sua voz única é sua maior força como escritor.",
  "Escrever é mergulhar no oceano da imaginação."
];

// Componente para a saudação
const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState('');
  const [motivational, setMotivational] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
  const navigate = useNavigate();

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

    // Estados 'saved' ou qualquer outro estado (incluindo o padrão)
    return (
      <StatusIndicator $status="saved">
        Salvo
      </StatusIndicator>
    );
  };

  return (
    <Header>
      <HeaderContent>
        <LeftSection>
          <Logo onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', marginRight: '1.5rem' }}>
            Bookwriter
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
        </LeftSection>
        
        <CenterContent>
          <Greeting />
        </CenterContent>

        <RightSection>
          {renderStatus()}
          
          <ThemeToggleButton onClick={onToggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggleButton>
          
          <PainelButton $isDarkMode={isDarkMode} onClick={onBackToDashboard}>
            <ArrowBackIcon />
            Painel
          </PainelButton>
        </RightSection>
      </HeaderContent>
    </Header>
  );
};