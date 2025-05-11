import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Container } from '../components/styled';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Livro } from '../types/livro';
import defaultTheme from '../styles/theme';

// Definição dos temas claro e escuro
const lightTheme = {
  ...defaultTheme,
  background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
  headerBackground: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  cardBackground: 'white',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  progressBackground: '#e2e8f0',
  bookShadow: 'rgba(0, 0, 0, 0.1)',
  bookPagesBackground: 'linear-gradient(90deg, #f5f5dc 0%, #ffffff 5%, #fafafa 95%, #f0f0dc 100%)',
  shelfColor: 'linear-gradient(180deg, #8b4513 0%, #654321 50%, #8b4513 100%)',
  shelfBottom: 'linear-gradient(180deg, #654321 0%, #4a2f1a 100%)',
  addBookBorder: '#cbd5e1',
  addBookColor: '#94a3b8',
  addBookHoverBorder: '#3b82f6',
  addBookHoverBackground: 'rgba(59, 130, 246, 0.05)',
  addBookHoverColor: '#3b82f6'
};

const darkTheme = {
  ...defaultTheme,
  background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  headerBackground: 'linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%)',
  cardBackground: '#1e293b',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  primaryGradient: 'linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%)',
  progressBackground: '#334155',
  bookShadow: 'rgba(0, 0, 0, 0.3)',
  bookPagesBackground: 'linear-gradient(90deg, #d1d5db 0%, #e5e7eb 5%, #d1d5db 95%, #c7cad1 100%)',
  shelfColor: 'linear-gradient(180deg, #5b3925 0%, #42301a 50%, #5b3925 100%)',
  shelfBottom: 'linear-gradient(180deg, #42301a 0%, #2c200e 100%)',
  addBookBorder: '#475569',
  addBookColor: '#64748b',
  addBookHoverBorder: '#3b82f6',
  addBookHoverBackground: 'rgba(59, 130, 246, 0.1)',
  addBookHoverColor: '#60a5fa'
};

// Estilo global para aplicar background e outros estilos globais
const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.textPrimary};
    transition: all 0.3s ease;
  }
`;

// ============= COMPONENTE BOOK3DLIBRARY =============
const ShelfContainer = styled.div`
  position: relative;
  width: 100%;
  perspective: 1000px;
  margin: 2rem 0;
`;

const Shelf = styled.div`
  width: 100%;
  height: 24px;
  background: ${({ theme }) => theme.shelfColor};
  border-radius: 2px;
  position: relative;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 10px;
    background: ${({ theme }) => theme.shelfBottom};
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const BooksContainer = styled.div`
  display: flex;
  gap: 15px;
  padding: 0 40px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
  min-height: 280px;
  align-items: flex-end;
`;

const Tooltip = styled.div`
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 30;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.9);
  }
`;

const BookWrapper = styled.div`
  position: relative;
  margin-bottom: 40px;

  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const Book3D = styled.div<{ color: string; width: number; index: number }>`
  position: relative;
  width: ${({ width }) => width}px;
  height: 220px;
  transform-style: preserve-3d;
  transform: translateZ(0) rotateY(-15deg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: slideIn 0.6s ease-out ${({ index }) => index * 0.1}s both;
  
  @keyframes slideIn {
    from {
      transform: translateY(-50px) rotateY(-15deg);
      opacity: 0;
    }
    to {
      transform: translateY(0) rotateY(-15deg);
      opacity: 1;
    }
  }
  
  &:hover {
    transform: translateZ(30px) rotateY(0deg) scale(1.08) translateY(-10px);
    z-index: 20;
  }
`;

const BookCover = styled.div<{ color: string; width: number }>`
  position: absolute;
  width: ${({ width }) => width}px;
  height: 220px;
  background: ${({ color }) => color};
  border-radius: 0 4px 4px 0;
  transform: translateZ(${({ width }) => width / 2}px);
  box-shadow: 
    inset 0 0 40px rgba(0, 0, 0, 0.2),
    inset -2px 0 5px rgba(0, 0, 0, 0.1),
    0 0 5px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, 
      rgba(0, 0, 0, 0.3) 0%, 
      rgba(0, 0, 0, 0.1) 50%, 
      rgba(0, 0, 0, 0.3) 100%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.15) 40%, 
      rgba(255, 255, 255, 0.25) 50%, 
      transparent 60%);
    transform: translateX(-150%) translateY(-150%);
    transition: transform 0.8s ease;
  }
  
  ${Book3D}:hover &::after {
    transform: translateX(150%) translateY(150%);
  }
`;

const BookSpine = styled.div<{ color: string; width: number }>`
  position: absolute;
  width: ${({ width }) => width}px;
  height: 220px;
  background: linear-gradient(180deg,
    ${({ color }) => {
      const darkerColor = color.replace(/(\d+)%\)/g, (match, p1) => `${Math.max(0, parseInt(p1) - 30)}%)`);
      return darkerColor;
    }} 0%,
    ${({ color }) => {
      const darkerColor = color.replace(/(\d+)%\)/g, (match, p1) => `${Math.max(0, parseInt(p1) - 20)}%)`);
      return darkerColor;
    }} 100%);
  transform: rotateY(90deg) translateZ(${({ width }) => width / 2}px);
  border-radius: 2px;
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.4),
    inset 0 0 5px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 5px;
`;

const SpineTitle = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  font-weight: 700;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  max-height: 180px;
  overflow: hidden;
  line-height: 1.2;
`;

const BookBack = styled.div<{ color: string; width: number }>`
  position: absolute;
  width: ${({ width }) => width}px;
  height: 220px;
  background: ${({ color }) => color};
  border-radius: 4px 0 0 4px;
  transform: translateZ(-${({ width }) => width / 2}px) rotateY(180deg);
  box-shadow: 
    inset 0 0 40px rgba(0, 0, 0, 0.2),
    inset 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const BookPages = styled.div<{ width: number }>`
  position: absolute;
  width: ${({ width }) => width - 10}px;
  height: 210px;
  background: ${({ theme }) => theme.bookPagesBackground};
  left: 5px;
  top: 5px;
  transform: translateZ(0);
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(0, 0, 0, 0.08),
      rgba(0, 0, 0, 0.05));
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 29px,
      rgba(0, 0, 0, 0.02) 30px
    );
  }
`;

const BookTitle = styled.div`
  position: absolute;
  top: 30px;
  left: 10px;
  right: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  color: white;
  font-weight: 800;
  font-size: 0.95rem;
  text-align: center;
  word-wrap: break-word;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  line-height: 1.2;
  max-height: 120px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const BookAuthor = styled.div`
  position: absolute;
  bottom: 30px;
  left: 10px;
  right: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.1);
  padding: 5px 10px;
  border-radius: 6px;
  backdrop-filter: blur(2px);
`;

const BookLabel = styled.div<{ color: string }>`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.cardBackground};
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.bookShadow};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary};
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  opacity: 0.8;
  
  ${BookWrapper}:hover & {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
    box-shadow: 0 6px 16px ${({ theme }) => theme.bookShadow};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${({ theme }) => theme.cardBackground};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.textSecondary};
  
  svg {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
    opacity: 0.3;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.textPrimary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.textSecondary};
    margin-bottom: 2rem;
  }
`;

const AddBookButton = styled.button`
  width: 80px;
  height: 220px;
  border: 3px dashed ${({ theme }) => theme.addBookBorder};
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.addBookColor};
  font-size: 2rem;
  margin: 0 10px 40px 10px;
  
  &:hover {
    border-color: ${({ theme }) => theme.addBookHoverBorder};
    background: ${({ theme }) => theme.addBookHoverBackground};
    color: ${({ theme }) => theme.addBookHoverColor};
    transform: scale(1.05);
  }
`;

const bookColors = [
  'linear-gradient(135deg, #FF6B6B 0%, #C62E3E 100%)', // Vermelho vibrante
  'linear-gradient(135deg, #4ECDC4 0%, #1A535C 100%)', // Turquesa
  'linear-gradient(135deg, #FFE66D 0%, #FF8C42 100%)', // Amarelo dourado
  'linear-gradient(135deg, #95E1D3 0%, #38A3A5 100%)', // Verde água
  'linear-gradient(135deg, #A8E6CF 0%, #3DDC97 100%)', // Verde menta
  'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)', // Rosa coral
  'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)', // Roxo elegante
  'linear-gradient(135deg, #FFA502 0%, #FF6348 100%)', // Laranja vibrante
  'linear-gradient(135deg, #7BED9F 0%, #2ED573 100%)', // Verde esmeralda
  'linear-gradient(135deg, #70A1FF 0%, #5352ED 100%)', // Azul royal
  'linear-gradient(135deg, #DDA0DD 0%, #B565A7 100%)', // Lavanda
  'linear-gradient(135deg, #48CAE4 0%, #0077B6 100%)', // Azul oceano
];

interface Book3DLibraryProps {
  maxBooks?: number;
  onBookClick?: (livro: Livro) => void;
}

const Book3DLibrary: React.FC<Book3DLibraryProps> = ({ maxBooks = 8, onBookClick }) => {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarLivros = async () => {
      try {
        const livrosCarregados = await dbService.getLivros();
        setLivros(livrosCarregados.slice(0, maxBooks));
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarLivros();
  }, [maxBooks]);

  const handleBookClick = (livro: Livro) => {
    if (onBookClick) {
      onBookClick(livro);
    } else {
      navigate(`/editor/${livro.id}`);
    }
  };

  const getBookWidth = () => {
    return 50 + Math.random() * 30; // Livros um pouco mais largos
  };

  if (loading) {
    return <div>Carregando biblioteca...</div>;
  }

  if (livros.length === 0) {
    return (
      <EmptyState>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3>Sua biblioteca está vazia</h3>
        <p>Comece sua jornada criando seu primeiro livro</p>
        <button
          onClick={() => navigate('/books/new')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          }}
        >
          Criar Primeiro Livro
        </button>
      </EmptyState>
    );
  }

  return (
    <ShelfContainer>
      <BooksContainer>
        {livros.map((livro, index) => {
          const width = getBookWidth();
          const color = bookColors[index % bookColors.length];
          
          return (
            <BookWrapper key={livro.id}>
              <Tooltip>{livro.titulo || livro["Nome do livro"] || "Sem título"}</Tooltip>
              <Book3D
                color={color}
                width={width}
                index={index}
                onClick={() => handleBookClick(livro)}
              >
                <BookBack color={color} width={width} />
                <BookSpine color={color} width={width}>
                  <SpineTitle>{livro.titulo}</SpineTitle>
                </BookSpine>
                <BookPages width={width} />
                <BookCover color={color} width={width}>
                  <BookTitle>{livro.titulo}</BookTitle>
                  <BookAuthor>{livro.autor}</BookAuthor>
                </BookCover>
              </Book3D>
              <BookLabel color={color}>{livro.titulo}</BookLabel>
            </BookWrapper>
          );
        })}
        <AddBookButton onClick={() => navigate('/books/new')}>
          +
        </AddBookButton>
      </BooksContainer>
      <Shelf />
    </ShelfContainer>
  );
};

// ============= COMPONENTES DO DASHBOARD =============
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: ${({ theme }) => theme.headerBackground};
    z-index: 0;
    border-radius: 0 0 50% 50%;
  }
`;

const Header = styled.header`
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const Logo = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✍️';
    font-size: 1.5rem;
  }
`;

const UserCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
`;

const MainContent = styled.main`
  position: relative;
  z-index: 5;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px ${({ theme }) => theme.bookShadow};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const WelcomeContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeLeft = styled.div`
  position: relative;
  z-index: 1;
`;

const WelcomeTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  background: ${({ theme }) => theme.primaryGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
`;

const WelcomeText = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.primaryGradient};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px ${({ theme }) => theme.bookShadow};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px ${({ theme }) => theme.bookShadow};
  }
`;

const SecondaryButton = styled.button`
  background: ${({ theme }) => theme.cardBackground};
  color: #3b82f6;
  border: 2px solid ${({ theme }) => theme.addBookBorder};
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.addBookHoverBackground};
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
`;

const ProgressVisual = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const ProgressCircle = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const ProgressValue = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary};
  line-height: 1;
`;

const ProgressLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div<{ color: string; icon: string }>`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 20px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px ${({ theme }) => theme.bookShadow};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px ${({ theme }) => theme.bookShadow};
  }
  
  &::before {
    content: '${({ icon }) => icon}';
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 6rem;
    opacity: 0.1;
    transform: rotate(-15deg);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${({ color }) => color};
  }
`;

const StatContent = styled.div`
  position: relative;
  z-index: 1;
`;

const StatTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: ${({ color }) => color}15;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  text-align: right;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.25rem;
`;

const StatBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const StatChange = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${({ positive }) => positive ? '#10b981' : '#ef4444'};
`;

const StatBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${({ theme }) => theme.progressBackground};
  border-radius: 3px;
  overflow: hidden;
`;

const StatBarFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const BooksSection = styled.section`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px ${({ theme }) => theme.bookShadow};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '📚';
    position: absolute;
    top: -40px;
    right: -40px;
    font-size: 10rem;
    opacity: 0.05;
    transform: rotate(15deg);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &::before {
    content: '';
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${({ theme }) => theme.primaryGradient};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
`;

// Componente de alternância de tema
const ThemeToggle = styled.button`
  background: none;
  border: none;
  padding: 8px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  margin-left: 1rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

interface StatsData {
  livros: number;
  capitulos: number;
  palavras: number;
  progresso: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    livros: 0,
    capitulos: 0,
    palavras: 0,
    progresso: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Verifica se há uma preferência de tema salva
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    } else {
      // Verifica a preferência do sistema
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  useEffect(() => {
    // Salva a preferência do tema
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const livros = await dbService.getLivros();
        let totalCapitulos = 0;
        let totalPalavras = 0;
        
        for (const livro of livros) {
          const capitulos = await dbService.getCapitulosPorLivroId(livro.id);
          totalCapitulos += capitulos?.length || 0;
          
          for (const capitulo of capitulos || []) {
            if (capitulo.conteudo) {
              totalPalavras += capitulo.conteudo.split(/\s+/).filter(Boolean).length;
            }
          }
        }

        const progresso = livros.length > 0 ? Math.min(Math.round((totalCapitulos / (livros.length * 10)) * 100), 100) : 0;

        setStats({
          livros: livros.length,
          capitulos: totalCapitulos,
          palavras: totalPalavras,
          progresso
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const getUserInitial = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  };

  const calculateCircumference = (radius: number) => 2 * Math.PI * radius;

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <DashboardContainer>
        <Header>
          <Logo>Escritor</Logo>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserCard onClick={() => navigate('/profile')}>
              <UserAvatar>{getUserInitial()}</UserAvatar>
              <div>
                <div style={{ fontWeight: 600 }}>{getUserName()}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Autor iniciante</div>
              </div>
            </UserCard>
            <ThemeToggle onClick={toggleTheme}>
              {darkMode ? '☀️' : '🌙'}
            </ThemeToggle>
          </div>
        </Header>

        <MainContent>
          <WelcomeCard>
            <WelcomeContent>
              <WelcomeLeft>
                <WelcomeTitle>
                  Sua jornada de escrita começa aqui ✨
                </WelcomeTitle>
                <WelcomeText>
                  Já são {stats.palavras.toLocaleString('pt-BR')} palavras escritas! 
                  Continue criando e veja sua história ganhar vida.
                </WelcomeText>
                <ActionButtons>
                  <PrimaryButton onClick={() => navigate('/editor')}>
                    Continuar Escrevendo
                  </PrimaryButton>
                  <SecondaryButton onClick={() => navigate('/books/new')}>
                    Novo Livro
                  </SecondaryButton>
                </ActionButtons>
              </WelcomeLeft>
              
              <ProgressVisual>
                <ProgressCircle viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={darkMode ? "#334155" : "#e2e8f0"}
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={calculateCircumference(45)}
                    strokeDashoffset={calculateCircumference(45) * (1 - stats.progresso / 100)}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={darkMode ? "#1d4ed8" : "#3b82f6"} />
                      <stop offset="100%" stopColor={darkMode ? "#7e22ce" : "#8b5cf6"} />
                    </linearGradient>
                  </defs>
                </ProgressCircle>
                <ProgressText>
                  <ProgressValue>{stats.progresso}%</ProgressValue>
                  <ProgressLabel>Progresso geral</ProgressLabel>
                </ProgressText>
              </ProgressVisual>
            </WelcomeContent>
          </WelcomeCard>

          <StatsGrid>
            <StatCard color="#3b82f6" icon="📚">
              <StatContent>
                <StatTop>
                  <StatIcon color="#3b82f6">📚</StatIcon>
                  <StatInfo>
                    <StatValue>{stats.livros}</StatValue>
                    <StatLabel>Livros criados</StatLabel>
                  </StatInfo>
                </StatTop>
                <StatBottom>
                  <StatChange positive>
                    <span>↑</span> +1 este mês
                  </StatChange>
                  <StatBar>
                    <StatBarFill width={75} color="#3b82f6" />
                  </StatBar>
                </StatBottom>
              </StatContent>
            </StatCard>

            <StatCard color="#10b981" icon="📑">
              <StatContent>
                <StatTop>
                  <StatIcon color="#10b981">📑</StatIcon>
                  <StatInfo>
                    <StatValue>{stats.capitulos}</StatValue>
                    <StatLabel>Capítulos escritos</StatLabel>
                  </StatInfo>
                </StatTop>
                <StatBottom>
                  <StatChange positive>
                    <span>↑</span> +3 esta semana
                  </StatChange>
                  <StatBar>
                    <StatBarFill width={60} color="#10b981" />
                  </StatBar>
                </StatBottom>
              </StatContent>
            </StatCard>

            <StatCard color="#f59e0b" icon="✍️">
              <StatContent>
                <StatTop>
                  <StatIcon color="#f59e0b">✍️</StatIcon>
                  <StatInfo>
                    <StatValue>{stats.palavras.toLocaleString('pt-BR')}</StatValue>
                    <StatLabel>Palavras totais</StatLabel>
                  </StatInfo>
                </StatTop>
                <StatBottom>
                  <StatChange positive>
                    <span>↑</span> +2.458 hoje
                  </StatChange>
                  <StatBar>
                    <StatBarFill width={85} color="#f59e0b" />
                  </StatBar>
                </StatBottom>
              </StatContent>
            </StatCard>

            <StatCard color="#ef4444" icon="🔥">
              <StatContent>
                <StatTop>
                  <StatIcon color="#ef4444">🔥</StatIcon>
                  <StatInfo>
                    <StatValue>7</StatValue>
                    <StatLabel>Dias consecutivos</StatLabel>
                  </StatInfo>
                </StatTop>
                <StatBottom>
                  <StatChange positive>
                    <span>🎯</span> Meta semanal atingida!
                  </StatChange>
                  <StatBar>
                    <StatBarFill width={100} color="#ef4444" />
                  </StatBar>
                </StatBottom>
              </StatContent>
            </StatCard>
          </StatsGrid>

          <BooksSection>
            <SectionHeader>
              <SectionTitle>
                📚 Sua Biblioteca
              </SectionTitle>
              <SecondaryButton 
                onClick={() => navigate('/books')}
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
              >
                Ver todos os livros
              </SecondaryButton>
            </SectionHeader>
            <Book3DLibrary maxBooks={8} />
          </BooksSection>
        </MainContent>
      </DashboardContainer>
    </ThemeProvider>
  );
};

export default DashboardPage;