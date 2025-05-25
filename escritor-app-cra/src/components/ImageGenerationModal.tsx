import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { imageService, estimateImageCost } from '../services/imageService';
import { Button } from './styled/Button';
import { Spinner } from './styled/Spinner';
import { useTheme } from '../contexts/ThemeContext';
import LoadingAnimation from './LoadingAnimation';

// Global style para garantir que o modal fique acima de tudo
const ModalGlobalStyle = createGlobalStyle`
  body.modal-open {
    overflow: hidden;
    
    /* Force todos elementos para trás */
    & > *:not([data-modal-overlay]):not([data-fullimage-overlay]) {
      z-index: 1 !important;
    }
  }
  
  /* Garante máximo z-index para os modais */
  [data-modal-overlay],
  [data-fullimage-overlay] {
    z-index: 9999999 !important;
    position: fixed !important;
  }
  
  [data-modal-content] {
    z-index: 9999999 !important;
  }
`;

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated?: (imageUrl: string) => void;
  onImageSelect?: (imageUrl: string) => void; // Alias para compatibilidade
  context?: any;
  initialPrompt?: string;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  onImageGenerated,
  onImageSelect, // Suporte para ambos os nomes
  context,
  initialPrompt = ''
}) => {
  const { isDarkMode } = useTheme();
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [quality, setQuality] = useState('medium');
  const [sampleCount, setSampleCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [error, setError] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    // Atualizar custo estimado quando mudar qualidade ou quantidade
    const cost = estimateImageCost(quality, sampleCount);
    setEstimatedCost(cost);
  }, [quality, sampleCount]);
  
  // Atualizar prompt quando o modal abrir com novo initialPrompt
  useEffect(() => {
    if (isOpen && initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);
  
  // Adicionar/remover classe do body quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedImages([]);
    setProcessingTime(null);

    try {
      const result = await imageService.generateImage(
        prompt,
        context,
        sampleCount,
        true // useAI
      );

      if (result.success && result.imageUrls) {
        setGeneratedImages(result.imageUrls);
        setSelectedImage(0);
        setCurrentPrompt(prompt || ''); // Salvar o prompt usado
        if (result.processingTimeMs) {
          setProcessingTime(result.processingTimeMs);
        }
      } else {
        setError(result.error || 'Erro ao gerar imagem');
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (generatedImages[selectedImage]) {
      const imageUrl = generatedImages[selectedImage];
      
      // Registrar a imagem como usada
      const registerResult = await imageService.registerUsedImage(
        imageUrl,
        currentPrompt,
        context?.livroId
      );
      
      if (!registerResult.success) {
        console.error('Erro ao registrar imagem:', registerResult.error);
        // Continuar mesmo se falhar o registro
      }
      
      // Suportar ambos os callbacks
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
      if (onImageSelect) {
        onImageSelect(imageUrl);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <ModalGlobalStyle />
      <ModalOverlay onClick={onClose} data-modal-overlay>
        <ModalContent $isDarkMode={isDarkMode} onClick={(e) => e.stopPropagation()} data-modal-content>
          <ModalHeader $isDarkMode={isDarkMode}>
            <h2>🎨 Gerar Imagem com IA</h2>
            <CloseButton $isDarkMode={isDarkMode} onClick={onClose}>×</CloseButton>
          </ModalHeader>

        <ModalBody>
          {isGenerating ? (
            <LoadingAnimation 
              estimatedTime={quality === 'high' ? 40 : 30}
              isDarkMode={isDarkMode}
              quality={quality}
            />
          ) : !generatedImages.length ? (
            <>
              <FormGroup>
                <Label $isDarkMode={isDarkMode}>Descrição da Imagem (opcional)</Label>
                <TextArea
                  $isDarkMode={isDarkMode}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva a imagem que deseja gerar ou deixe em branco para gerar automaticamente..."
                  rows={4}
                />
                <Hint $isDarkMode={isDarkMode}>Nossa IA pode criar uma descrição baseada no contexto do seu livro</Hint>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label $isDarkMode={isDarkMode}>Qualidade</Label>
                  <Select $isDarkMode={isDarkMode} value={quality} onChange={(e) => setQuality(e.target.value)}>
                    <option value="low">Baixa (~15s)</option>
                    <option value="medium">Média (~25s)</option>
                    <option value="high">Alta (~40s)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label $isDarkMode={isDarkMode}>Quantidade</Label>
                  <Select $isDarkMode={isDarkMode} value={sampleCount} onChange={(e) => setSampleCount(Number(e.target.value))}>
                    <option value="1">1 imagem</option>
                    <option value="2">2 imagens</option>
                    <option value="3">3 imagens</option>
                    <option value="4">4 imagens</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <CostEstimate $isDarkMode={isDarkMode}>
                <CostIcon>💰</CostIcon>
                <CostInfo>
                  <CostLabel $isDarkMode={isDarkMode}>Custo estimado:</CostLabel>
                  <CostValue>{estimatedCost} créditos</CostValue>
                  <CostNote $isDarkMode={isDarkMode}>Será contabilizado para cobrança futura</CostNote>
                </CostInfo>
              </CostEstimate>
              
              {quality === 'high' && (
                <TimeHint $isDarkMode={isDarkMode}>
                  <TimeIcon>⏱️</TimeIcon>
                  Alta qualidade pode levar até 40s
                </TimeHint>
              )}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <ButtonGroup>
                <Button variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  Gerar Imagem
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <>
              <ImageContainer $isDarkMode={isDarkMode} $isCover={context?.tipo === 'capa'}>
                <ImagePreview onClick={() => setShowFullImage(true)}>
                  <img 
                    src={generatedImages[selectedImage]} 
                    alt="Imagem gerada"
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.log('Dimensões da imagem:', {
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        ratio: img.naturalWidth / img.naturalHeight
                      });
                    }}
                  />
                  <ExpandIcon title="Clique para ver em tamanho real">🔍</ExpandIcon>
                </ImagePreview>
              </ImageContainer>

              {generatedImages.length > 1 && (
                <ImageThumbnails>
                  {generatedImages.map((url, index) => (
                    <Thumbnail
                      key={index}
                      $active={index === selectedImage}
                      $isDarkMode={isDarkMode}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={url} alt={`Opção ${index + 1}`} />
                    </Thumbnail>
                  ))}
                </ImageThumbnails>
              )}

              {processingTime && (
                <ProcessingInfo $isDarkMode={isDarkMode}>
                  ⚡ Gerado em {(processingTime / 1000).toFixed(1)}s
                </ProcessingInfo>
              )}

              <ButtonGroup>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setGeneratedImages([]);
                    setSelectedImage(0);
                    setError('');
                  }}
                >
                  Gerar Outra Imagem
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                  Usar Esta Imagem
                </Button>
              </ButtonGroup>
              
              <LinkButton onClick={async () => {
                if (generatedImages[selectedImage]) {
                  const imageUrl = generatedImages[selectedImage];
                  
                  // Registrar a imagem como usada
                  const registerResult = await imageService.registerUsedImage(
                    imageUrl,
                    currentPrompt,
                    context?.livroId
                  );
                  
                  if (!registerResult.success) {
                    console.error('Erro ao registrar imagem:', registerResult.error);
                  }
                  
                  if (onImageGenerated) {
                    onImageGenerated(imageUrl);
                  }
                  if (onImageSelect) {
                    onImageSelect(imageUrl);
                  }
                  // Resetar estado mas manter modal aberto
                  setGeneratedImages([]);
                  setSelectedImage(0);
                  setError('');
                }
              }}>
                Usar e gerar outra imagem
              </LinkButton>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
    
    {/* Modal de visualização completa */}
    {showFullImage && (
      <FullImageOverlay onClick={() => setShowFullImage(false)} data-fullimage-overlay>
        <FullImageContainer onClick={(e) => e.stopPropagation()}>
          <CloseFullImageButton onClick={() => setShowFullImage(false)}>✕</CloseFullImageButton>
          <FullImage 
            src={generatedImages[selectedImage]} 
            alt="Imagem em tamanho completo"
            onClick={(e) => e.stopPropagation()}
          />
        </FullImageContainer>
      </FullImageOverlay>
    )}
    </>,
    document.body
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999999 !important;
  isolation: isolate;
`;

const ModalContent = styled.div<{ $isDarkMode: boolean }>`
  background: ${props => props.$isDarkMode ? '#1e1e1e' : '#ffffff'};
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.$isDarkMode ? '#333' : '#e0e0e0'};
  position: relative;
  z-index: 999999999 !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  margin: auto;
`;

const ModalHeader = styled.div<{ $isDarkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#333' : '#e0e0e0'};

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${props => props.$isDarkMode ? '#fff' : '#333'};
  }
`;

const CloseButton = styled.button<{ $isDarkMode: boolean }>`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${props => props.$isDarkMode ? '#aaa' : '#666'};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.$isDarkMode ? '#fff' : '#000'};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const Label = styled.label<{ $isDarkMode: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.$isDarkMode ? '#fff' : '#333'};
`;

const TextArea = styled.textarea<{ $isDarkMode: boolean }>`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.$isDarkMode ? '#444' : '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.$isDarkMode ? '#2a2a2a' : '#fff'};
  color: ${props => props.$isDarkMode ? '#fff' : '#333'};

  &:focus {
    outline: none;
    border-color: #4361ee;
  }
`;

const Select = styled.select<{ $isDarkMode: boolean }>`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.$isDarkMode ? '#444' : '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.$isDarkMode ? '#2a2a2a' : '#fff'};
  color: ${props => props.$isDarkMode ? '#fff' : '#333'};

  &:focus {
    outline: none;
    border-color: #4361ee;
  }
  
  option {
    background: ${props => props.$isDarkMode ? '#2a2a2a' : '#fff'};
    color: ${props => props.$isDarkMode ? '#fff' : '#333'};
  }
`;

const Hint = styled.p<{ $isDarkMode: boolean }>`
  margin-top: 5px;
  font-size: 0.875rem;
  color: ${props => props.$isDarkMode ? '#aaa' : '#666'};
`;

const CostEstimate = styled.div<{ $isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: ${props => props.$isDarkMode ? 'rgba(67, 97, 238, 0.1)' : '#f0f7ff'};
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.$isDarkMode ? 'rgba(67, 97, 238, 0.3)' : 'transparent'};
`;

const CostIcon = styled.div`
  font-size: 2rem;
`;

const CostInfo = styled.div`
  flex: 1;
`;

const CostLabel = styled.div<{ $isDarkMode: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDarkMode ? '#aaa' : '#666'};
`;

const CostValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4361ee;
`;

const CostNote = styled.div<{ $isDarkMode: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDarkMode ? '#999' : '#666'};
  font-style: italic;
`;

const TimeHint = styled.div<{ $isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.$isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.08)'};
  border: 1px solid ${props => props.$isDarkMode ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.2)'};
  border-radius: 6px;
  font-size: 0.875rem;
  color: ${props => props.$isDarkMode ? '#ffd93d' : '#f59e0b'};
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TimeIcon = styled.span`
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  padding: 10px;
  background: #fee;
  color: #c00;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ImageContainer = styled.div<{ $isDarkMode: boolean; $isCover?: boolean }>`
  background: ${props => props.$isDarkMode ? '#2a2a2a' : '#f0f0f0'};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  /* Mensagem sobre proporção */
  &::after {
    content: ${props => props.$isCover ? '"Nota: A imagem deveria ter proporção 2:3 para capa"' : '""'};
    position: absolute;
    bottom: 10px;
    font-size: 0.75rem;
    color: ${props => props.$isDarkMode ? '#999' : '#666'};
    font-style: italic;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  cursor: pointer;
  display: inline-block;
  
  img {
    display: block;
    /* Permite que a imagem defina seu próprio tamanho */
    max-width: 400px;
    max-height: 500px;
    width: auto;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
`;

const Thumbnail = styled.div<{ $active: boolean; $isDarkMode: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.$active ? '#4361ee' : (props.$isDarkMode ? '#444' : '#ddd')};
  transition: all 0.2s;

  &:hover {
    border-color: #4361ee;
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProcessingInfo = styled.div<{ $isDarkMode: boolean }>`
  text-align: center;
  color: ${props => props.$isDarkMode ? '#aaa' : '#666'};
  font-size: 0.875rem;
  margin-bottom: 20px;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #4361ee;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 10px;
  display: block;
  width: 100%;
  text-align: center;
  padding: 5px;
  
  &:hover {
    color: #2c4bce;
  }
`;

const ExpandIcon = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 50%;
  font-size: 1.2rem;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  ${ImagePreview}:hover & {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const FullImageOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
  cursor: zoom-out;
  padding: 20px;
  isolation: isolate;
`;

const FullImageContainer = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
`;

const FullImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
  display: block;
`;

const CloseFullImageButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 2147483647;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }
`;

export default ImageGenerationModal;