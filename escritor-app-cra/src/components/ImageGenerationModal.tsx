import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { imageService, PromptContext } from '../services/imageService';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  width: 700px;
  max-width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || theme.shadows.xl};
  animation: ${slideUp} 0.5s ease-out;
  overflow: hidden;
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

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.25rem;
  font-weight: 900;
  color: ${({ theme }) => theme.isDarkMode ? theme.textPrimary || '#e2e8f0' : theme.colors.text.primary};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
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
  padding: 0 3rem 3rem;
  background: ${({ theme }) => theme.isDarkMode ? theme.cardBackground || '#1e293b' : theme.colors.background.paper};
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 3rem;
  }
`;

const FormGroup = styled.div`
  position: relative;
  margin: 0;
  padding: 0;
  border: none;
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.isDarkMode ? '#1a1a1a' : theme.colors.background.light};
  border: 2px solid ${({ theme }) => theme.isDarkMode ? '#4a5568' : (theme.colors.border?.light || theme.colors.gray[200])};
  border-radius: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? 'white' : theme.colors.text.primary};
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.isDarkMode ? '#94a3b8' : theme.colors.text.tertiary};
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

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  border: none;
  background: ${({ theme }) => theme.isDarkMode ? '#374151' : theme.colors.background.light};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.isDarkMode ? '#94a3b8' : theme.colors.text.secondary};
  transition: all 0.3s ease;
  font-size: 1.5rem;
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

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger}30;
  color: ${({ theme }) => theme.colors.danger};
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ImagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }
`;

const Image = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
`;

const ImageSelected = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  
  &::after {
    content: '✓';
    font-size: 2rem;
    color: white;
    font-weight: bold;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`;

const Checkbox = styled.input`
  margin-right: 8px;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.textSecondary || '#94a3b8' : theme.colors.text.secondary};
  cursor: pointer;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.isDarkMode ? theme.textSecondary || '#94a3b8' : theme.colors.text.secondary};
`;

const CountSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 0.5rem;
`;

const CountButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: ${({ theme, active }) => active ? theme.colors.primary : (theme.isDarkMode ? '#2d3748' : theme.colors.background.light)};
  color: ${({ theme, active }) => active ? 'white' : (theme.isDarkMode ? theme.textSecondary : theme.colors.text.secondary)};
  border: 1px solid ${({ theme, active }) => active ? 'transparent' : (theme.isDarkMode ? '#4a5568' : theme.colors.border?.light)};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, active }) => active ? theme.colors.primary : (theme.isDarkMode ? '#4a5568' : '#f0f0f0')};
  }
`;

const InfoMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
  border: 1px solid ${({ theme }) => theme.isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
  border-radius: 6px;
  color: ${({ theme }) => theme.isDarkMode ? '#93c5fd' : '#3b82f6'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '💡';
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const PromptInfo = styled.div`
  background: ${({ theme }) => theme.isDarkMode ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.05)'};
  border: 1px solid ${({ theme }) => theme.isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'};
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.isDarkMode ? '#a5b4fc' : '#4f46e5'};
  
  &::before {
    content: 'ℹ️';
    margin-right: 0.5rem;
  }
`;

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
  context?: PromptContext;
  initialPrompt?: string;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  context,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [imageCount, setImageCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Resetar o estado quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setError('');
      setImages([]);
      setSelectedImage(null);
      setLoading(false);
    }
  }, [isOpen, initialPrompt]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fechar ao clicar fora do modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Gerar imagem
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setImages([]);
    setSelectedImage(null);

    try {
      const result = await imageService.generateImage(
        prompt,
        context,
        imageCount,
        useAI
      );

      if (result.success && result.imageUrls && result.imageUrls.length > 0) {
        setImages(result.imageUrls);
        setSelectedImage(result.imageUrls[0]); // Selecionar a primeira imagem por padrão
      } else {
        setError(result.error || 'Não foi possível gerar as imagens. Tente novamente.');
      }
    } catch (error: any) {
      setError(`Erro ao gerar imagem: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Selecionar imagem
  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
  };

  // Confirmar seleção
  const handleConfirmSelection = async () => {
    if (selectedImage) {
      setIsSaving(true);
      
      try {
        // Salvar a imagem antes de fechar
        if (context?.livroId) {
          await imageService.saveGeneratedImage(
            [selectedImage], 
            prompt, 
            context
          );
        }
        
        onImageSelect(selectedImage);
        onClose();
      } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        setError('Ocorreu um erro ao salvar a imagem. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <CloseButton
          title="Fechar"
          aria-label="Fechar modal"
          onClick={onClose}
        >✕</CloseButton>
        
        <ModalHeader>
          <Title>{context?.tipo === 'capa' ? 'Gerar Capa' : 'Gerar Imagem'}</Title>
          <Subtitle>
            {context?.tipo === 'capa' 
              ? 'Crie uma capa para seu livro usando IA' 
              : 'Gere uma imagem para ilustrar seu capítulo'}
          </Subtitle>
        </ModalHeader>

        <ContentWrapper>
          <Form onSubmit={handleGenerateImage}>
            <FormGroup>
              <Label htmlFor="prompt">
                Descrição da imagem
                <Tooltip data-tooltip="Descreva a imagem que você deseja gerar. Seja específico quanto aos detalhes importantes. A IA irá usar o contexto do livro/capítulo para melhorar o resultado.">
                  💡
                </Tooltip>
              </Label>
              
              {context?.tipo === 'capa' && (
                <InfoMessage>
                  O prompt abaixo foi gerado automaticamente com os dados do seu livro (título, autor, gênero, etc).
                  Você pode editá-lo para personalizar ainda mais a imagem.
                </InfoMessage>
              )}
              
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={context?.tipo === 'capa' 
                  ? "Descreva a capa que você deseja para seu livro..." 
                  : "Descreva a imagem que você deseja gerar para este capítulo..."}
                disabled={loading}
              />
              
              {initialPrompt && initialPrompt.trim() !== prompt.trim() && !loading && (
                <PromptInfo>
                  O texto acima foi editado por você. O prompt inicial incluía todas as informações do seu {context?.tipo === 'capa' ? 'livro' : 'capítulo'}.
                </PromptInfo>
              )}
              
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  disabled={loading}
                />
                <CheckboxLabel htmlFor="useAI">
                  Usar IA para melhorar o prompt automaticamente com contexto do {context?.tipo === 'capa' ? 'livro' : 'capítulo'}
                </CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>
            
            <FormGroup>
              <Label>
                Número de imagens a gerar
                <Tooltip data-tooltip="Quantas variações da imagem você deseja gerar. Mais imagens permitem mais opções, mas demoram mais para gerar.">
                  💡
                </Tooltip>
              </Label>
              <CountSelector>
                {[1, 2, 3, 4].map(count => (
                  <CountButton
                    key={count}
                    active={imageCount === count}
                    onClick={() => setImageCount(count)}
                    type="button"
                    disabled={loading}
                  >
                    {count}
                  </CountButton>
                ))}
              </CountSelector>
            </FormGroup>

            {images.length > 0 && context?.tipo === 'capa' && (
              <InfoMessage>
                Após selecionar uma imagem, você poderá visualizá-la em tamanho completo clicando sobre ela no formulário.
              </InfoMessage>
            )}
            
            {error && <ErrorMessage>{error}</ErrorMessage>}

            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Gerando imagem{imageCount > 1 ? 'ns' : ''}...</LoadingText>
              </LoadingContainer>
            ) : images.length > 0 ? (
              <>
                <ImagesContainer>
                  {images.map((url, index) => (
                    <ImageCard 
                      key={index} 
                      onClick={() => handleImageSelect(url)}
                    >
                      <Image src={url} alt={`Imagem gerada ${index + 1}`} />
                      {selectedImage === url && <ImageSelected />}
                    </ImageCard>
                  ))}
                </ImagesContainer>
                
                <ButtonGroup>
                  <SecondaryButton
                    type="submit"
                    disabled={loading || isSaving}
                  >
                    Gerar Novamente
                  </SecondaryButton>
                  <PrimaryButton
                    type="button"
                    onClick={handleConfirmSelection}
                    disabled={!selectedImage || isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Usar Imagem Selecionada'}
                  </PrimaryButton>
                </ButtonGroup>
              </>
            ) : (
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
                  disabled={loading}
                >
                  Gerar Imagem{imageCount > 1 ? 'ns' : ''}
                </PrimaryButton>
              </ButtonGroup>
            )}
          </Form>
        </ContentWrapper>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ImageGenerationModal;