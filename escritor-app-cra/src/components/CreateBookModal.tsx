// src/components/CreateBookModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { dbService } from '../services/dbService';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const bookOpen = keyframes`
  0% { transform: rotateY(-90deg); }
  100% { transform: rotateY(0deg); }
`;

const quillWrite = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(0deg); }
  25% { transform: translateX(10px) translateY(2px) rotate(5deg); }
  50% { transform: translateX(20px) translateY(0) rotate(0deg); }
  75% { transform: translateX(30px) translateY(2px) rotate(-5deg); }
  100% { transform: translateX(40px) translateY(0) rotate(0deg); }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(5px);
`;

const ModalContainer = styled.div`
  position: relative;
  width: 600px;
  max-width: 95%;
  background: ${({ theme }) => theme.isDarkMode ? theme.cardBackground || '#1e293b' : theme.colors.background.paper};
  border-radius: 16px;
  padding: 3rem;
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || theme.shadows.xl};
  border: 1px solid ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : (theme.colors.border?.light || theme.colors.gray[200])};
  animation: ${slideUp} 0.5s ease-out, ${bookOpen} 0.8s ease-out;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const BookDecoration = styled.div`
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  opacity: 0.05;
  font-size: 8rem;
  transform: rotate(15deg);
  color: ${({ theme }) => theme.colors.primary};
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
`;

const QuillIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  animation: ${quillWrite} 4s ease-in-out infinite;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.isDarkMode ? theme.textSecondary || '#94a3b8' : theme.colors.text.secondary};
  font-size: 1.1rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.light};
  border: 2px solid ${({ theme }) => theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])};
  border-radius: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.isDarkMode ? '#a0aec0' : theme.colors.text.tertiary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.light};
  border: 2px solid ${({ theme }) => theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])};
  border-radius: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.isDarkMode ? '#a0aec0' : theme.colors.text.tertiary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.light};
  border: 2px solid ${({ theme }) => theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])};
  border-radius: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  option {
    background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.paper};
    color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 468px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primaryGradient || theme.colors.primary};
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.lg || theme.shadows.lg};
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger}30;
  color: ${({ theme }) => theme.colors.danger};
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.success}15;
  border: 1px solid ${({ theme }) => theme.colors.success}30;
  color: ${({ theme }) => theme.colors.success};
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 0 0 16px 16px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: ${({ theme }) => theme.colors.primaryGradient || theme.colors.primary};
  transition: width 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border: none;
  background: ${({ theme }) => theme.isDarkMode ? '#374151' : theme.colors.background.light};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.isDarkMode ? '#94a3b8' : theme.colors.text.secondary};
  transition: all 0.3s ease;
  font-size: 1.75rem;
  z-index: 10;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'};
    color: #ef4444;
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(90deg) scale(0.9);
  }
`;

// Genres list
const GENRES = [
  'Romance',
  'Ficção Científica',
  'Fantasia',
  'Mistério',
  'Thriller',
  'Terror',
  'Poesia',
  'Biografia',
  'Autoajuda',
  'Infantil',
  'Juvenil',
  'História',
  'Filosofia',
  'Técnico',
  'Outro'
];

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [genero, setGenero] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Resetar form quando modal abre
  useEffect(() => {
    if (isOpen) {
      setTitulo('');
      setDescricao('');
      setGenero('');
      setError('');
      setSuccess(false);
      setProgress(0);
    }
  }, [isOpen]);

  // Atualizar barra de progresso
  useEffect(() => {
    let filled = 0;
    if (titulo) filled += 33;
    if (descricao) filled += 33;
    if (genero) filled += 34;
    setProgress(filled);
  }, [titulo, descricao, genero]);

  // Fechar ao clicar fora
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await dbService.criarLivro({
        titulo,
        autor: '', // Você pode adicionar um campo de autor se desejar
        sinopse: descricao,
        genero: genero
      });

      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar o livro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer ref={modalRef}>
        <CloseButton
          title="Fechar"
          aria-label="Fechar modal"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >✕</CloseButton>
        <BookDecoration>📚</BookDecoration>
        
        <ModalHeader>
          <QuillIcon>✍️</QuillIcon>
          <Title>Criar Novo Livro</Title>
          <Subtitle>Dê vida à sua nova história</Subtitle>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="titulo">Título do Livro *</Label>
            <Input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da sua obra"
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="descricao">Sinopse</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte um pouco sobre sua história..."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="genero">Gênero Literário</Label>
            <Select
              id="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            >
              <option value="">Selecione um gênero</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>Livro criado com sucesso! ✨</SuccessMessage>}

          <ButtonGroup>
            <SecondaryButton
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={loading || !titulo}
            >
              {loading ? 'Criando...' : 'Criar Livro'}
            </PrimaryButton>
          </ButtonGroup>
        </Form>

        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CreateBookModal;