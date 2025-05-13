// src/components/CreateBookModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

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
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 600px;
  max-width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || theme.shadows.xl};
  animation: ${slideUp} 0.5s ease-out, ${bookOpen} 0.8s ease-out;
  overflow: hidden; /* Importante: esconde qualquer overflow, incluindo barras de rolagem */
  user-select: none;
  
  /* Fundo unificado para todo o container */
  background: ${({ theme }) => theme.isDarkMode ? theme.cardBackground || '#1e293b' : theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : (theme.colors.border?.light || theme.colors.gray[200])};
  
  @media (max-width: 768px) {
    max-height: 80vh;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; 
  
  /* Esconder a barra de rolagem no Chrome, Safari e novos Edge */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 4px;
  }
  
  /* Para Firefox */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => 
    theme.isDarkMode 
      ? 'rgba(255, 255, 255, 0.2) transparent' 
      : 'rgba(0, 0, 0, 0.1) transparent'
  };
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
  z-index: 1;
`;

const ModalHeader = styled.div`
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
  background: ${({ theme }) => theme.isDarkMode ? theme.cardBackground || '#1e293b' : theme.colors.background.paper};
  position: relative;
  z-index: 3;
  cursor: move;

  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 5px;
    background-color: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 3px;
    opacity: 0.8;
  }
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
  padding: 0 3rem 6rem;
  background: ${({ theme }) => theme.isDarkMode ? theme.cardBackground || '#1e293b' : theme.colors.background.paper};
  
  @media (max-width: 768px) {
    padding: 0 2rem 6rem;
  }
`;

const FormGroup = styled.div`
  position: relative;
  margin: 0;
  padding: 0;
  border: none;
`;

const RequiredAsterisk = styled.span`
  color: ${({ theme }) => theme.colors.primary || '#f97316'};
  margin-left: 5px;
  font-weight: bold;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const Tooltip = styled.span`
  position: relative;
  margin-left: 5px;
  cursor: help;
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    top: -5px;
    left: 20px;
    background: ${({ theme }) => theme.isDarkMode ? '#4a5568' : theme.colors.background.light};
    color: ${({ theme }) => theme.isDarkMode ? '#e2e8f0' : theme.colors.text.primary};
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: normal;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
    max-width: 270px;
    white-space: normal;
    transform: translateY(-100%);
    width: 270px;
    
    @media (max-width: 768px) {
      left: 50%;
      transform: translateX(-50%) translateY(-100%);
    }
  }
`;

interface InputProps {
  required?: boolean;
}

const Input = styled.input<InputProps>`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.light};
  border: 2px solid ${({ theme, required }) => 
    required 
      ? `${theme.isDarkMode ? theme.colors.primary+'40' : theme.colors.primary+'30'}`
      : theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])
  };
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

interface TextareaProps {
  required?: boolean;
}

const Textarea = styled.textarea<TextareaProps>`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.light};
  border: 2px solid ${({ theme, required }) => 
    required 
      ? `${theme.isDarkMode ? theme.colors.primary+'40' : theme.colors.primary+'30'}`
      : theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])
  };
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

interface SelectProps {
  required?: boolean;
}

const Select = styled.select<SelectProps>`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#2d3748' : theme.colors.background.light};
  border: 2px solid ${({ theme, required }) => 
    required 
      ? `${theme.isDarkMode ? theme.colors.primary+'40' : theme.colors.primary+'30'}`
      : theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])
  };
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
  position: sticky;
  bottom: 0;
  background: ${({ theme }) => theme.isDarkMode ? theme.cardBackground || '#1e293b' : theme.colors.background.paper};
  padding: 1.5rem 3rem;
  z-index: 3;
  margin-bottom: 0;
  box-shadow: 0 -10px 20px ${({ theme }) => theme.isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
  }
  
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
  z-index: 5;
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

// Novo componente para separador de seção
const SectionDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.textSecondary || '#94a3b8' : theme.colors.text.secondary};
  font-size: 0.9rem;
  font-weight: 600;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
  
  &::before {
    margin-right: 0.75rem;
  }
  
  &::after {
    margin-left: 0.75rem;
  }
`;

const RequiredFieldsNote = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.isDarkMode ? theme.textSecondary || '#94a3b8' : theme.colors.text.secondary};
  font-size: 0.8rem;
  margin-top: 1rem;
  font-style: italic;
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
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [genero, setGenero] = useState('');
  const [autor, setAutor] = useState('');
  const [personagens, setPersonagens] = useState('');
  const [ambientacao, setAmbientacao] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
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
      setAutor('');
      setPersonagens('');
      setAmbientacao('');
      setPalavrasChave('');
      setError('');
      setSuccess(false);
      setProgress(0);
    }
  }, [isOpen]);

  // Atualizar barra de progresso com pesos diferentes
  useEffect(() => {
    let filled = 0;
    
    // Campos obrigatórios (75% do peso total)
    if (titulo) filled += 25;
    if (descricao) filled += 25;
    if (genero) filled += 25;
    
    // Campos opcionais (25% do peso total)
    if (autor) filled += 6.25;
    if (personagens) filled += 6.25;
    if (ambientacao) filled += 6.25;
    if (palavrasChave) filled += 6.25;
    
    setProgress(Math.min(filled, 100)); // Garante que não ultrapasse 100%
  }, [titulo, descricao, genero, autor, personagens, ambientacao, palavrasChave]);

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
      const novoLivro = await dbService.criarLivro({
        titulo,
        autor,
        sinopse: descricao,
        genero,
        personagens,
        ambientacao,
        palavras_chave: palavrasChave
      });

      setSuccess(true);
      
      // Após criar o livro com sucesso, aguarda 1,5 segundos para melhor experiência
      setTimeout(() => {
        onSuccess();
        
        // Redireciona para o editor, usando o ID do livro recém-criado
        if (novoLivro && novoLivro.id) {
          navigate(`/editor/${novoLivro.id}`);
        } else {
          onClose();
        }
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
          <Subtitle>Preencha as informações básicas do seu livro</Subtitle>
        </ModalHeader>

        <ContentWrapper>
          <Form onSubmit={handleSubmit}>
            {/* Campos Obrigatórios */}
            <FormGroup>
              <Label htmlFor="titulo">
                Título do Livro
                <RequiredAsterisk>*</RequiredAsterisk>
                <Tooltip data-tooltip="O título é a identidade principal do seu livro e será usado para referência nos sistemas de IA.">
                  💡
                </Tooltip>
              </Label>
              <Input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título da sua obra (obrigatório)"
                autoFocus
                maxLength={100}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="genero">
                Gênero Literário
                <RequiredAsterisk>*</RequiredAsterisk>
                <Tooltip data-tooltip="O gênero ajuda a IA a entender o estilo, tom e convenções que deve seguir ao auxiliar na escrita.">
                  💡
                </Tooltip>
              </Label>
              <Select
                id="genero"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                required={true}
              >
                <option value="">Selecione um gênero (obrigatório)</option>
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="descricao">
                Sinopse/Premissa
                <RequiredAsterisk>*</RequiredAsterisk>
                <Tooltip data-tooltip="Um breve resumo da história que fornece contexto essencial para a IA compreender o enredo central.">
                  💡
                </Tooltip>
              </Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o conceito principal da sua história em poucas linhas (obrigatório)"
                maxLength={500}
                required={true}
              />
            </FormGroup>

            {/* Separador para campos opcionais */}
            <SectionDivider>Informações Adicionais (Opcionais)</SectionDivider>

            <FormGroup>
              <Label htmlFor="autor">
                Autor
                <Tooltip data-tooltip="Nome do autor ou pseudônimo. Se não preenchido, usará seu nome de usuário.">
                  💡
                </Tooltip>
              </Label>
              <Input
                id="autor"
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Seu nome como autor ou pseudônimo (opcional)"
                maxLength={100}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="personagens">
                Personagens Principais
                <Tooltip data-tooltip="Liste os protagonistas com breves descrições para ajudar a IA a manter consistência nos diálogos e ações.">
                  💡
                </Tooltip>
              </Label>
              <Textarea
                id="personagens"
                value={personagens}
                onChange={(e) => setPersonagens(e.target.value)}
                placeholder="Ex: Maria Silva: protagonista, 30 anos, determinada; João Pereira: antagonista, ambicioso... (opcional)"
                maxLength={500}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="ambientacao">
                Ambientação/Cenário
                <Tooltip data-tooltip="Defina onde e quando a história se passa para criar uma atmosfera coerente e referências temporais adequadas.">
                  💡
                </Tooltip>
              </Label>
              <Textarea
                id="ambientacao"
                value={ambientacao}
                onChange={(e) => setAmbientacao(e.target.value)}
                placeholder="Ex: Brasil, anos 90, em uma pequena cidade litorânea cercada por florestas... (opcional)"
                maxLength={500}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="palavrasChave">
                Palavras-chave
                <Tooltip data-tooltip="Termos relevantes que caracterizam a obra e ajudam na recuperação de informações pela IA.">
                  💡
                </Tooltip>
              </Label>
              <Input
                id="palavrasChave"
                type="text"
                value={palavrasChave}
                onChange={(e) => setPalavrasChave(e.target.value)}
                placeholder="Ex: aventura, mistério, viagem no tempo, distopia (separadas por vírgula, opcional)"
                maxLength={200}
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>Livro criado com sucesso! ✨</SuccessMessage>}

            <RequiredFieldsNote>
              Campos marcados com <RequiredAsterisk>*</RequiredAsterisk> são obrigatórios
            </RequiredFieldsNote>

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
                disabled={loading || !titulo || !genero || !descricao}
              >
                {loading ? 'Criando...' : 'Criar Livro'}
              </PrimaryButton>
            </ButtonGroup>
          </Form>
        </ContentWrapper>

        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CreateBookModal;