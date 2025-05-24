import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { imageService, estimateImageCost } from '../services/imageService';
import { Button } from './styled/Button';
import { Spinner } from './styled/Spinner';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imageUrl: string) => void;
  context?: any;
  initialPrompt?: string;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  isOpen,
  onClose,
  onImageGenerated,
  context,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [quality, setQuality] = useState('medium');
  const [sampleCount, setSampleCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [error, setError] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  useEffect(() => {
    // Atualizar custo estimado quando mudar qualidade ou quantidade
    const cost = estimateImageCost(quality, sampleCount);
    setEstimatedCost(cost);
  }, [quality, sampleCount]);

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

  const handleConfirm = () => {
    if (generatedImages[selectedImage]) {
      onImageGenerated(generatedImages[selectedImage]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>🎨 Gerar Imagem com IA</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {!generatedImages.length ? (
            <>
              <FormGroup>
                <Label>Descrição da Imagem (opcional)</Label>
                <TextArea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva a imagem que deseja gerar ou deixe em branco para gerar automaticamente..."
                  rows={4}
                />
                <Hint>Nossa IA pode criar uma descrição baseada no contexto do seu livro</Hint>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Qualidade</Label>
                  <Select value={quality} onChange={(e) => setQuality(e.target.value)}>
                    <option value="low">Baixa (rápida)</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta (detalhada)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Quantidade</Label>
                  <Select value={sampleCount} onChange={(e) => setSampleCount(Number(e.target.value))}>
                    <option value="1">1 imagem</option>
                    <option value="2">2 imagens</option>
                    <option value="3">3 imagens</option>
                    <option value="4">4 imagens</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <CostEstimate>
                <CostIcon>💰</CostIcon>
                <CostInfo>
                  <CostLabel>Custo estimado:</CostLabel>
                  <CostValue>{estimatedCost} créditos</CostValue>
                  <CostNote>Será contabilizado para cobrança futura</CostNote>
                </CostInfo>
              </CostEstimate>

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
                  {isGenerating ? (
                    <>
                      <Spinner size="small" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Imagem'
                  )}
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <>
              <ImagePreview>
                <img 
                  src={generatedImages[selectedImage]} 
                  alt="Imagem gerada"
                />
              </ImagePreview>

              {generatedImages.length > 1 && (
                <ImageThumbnails>
                  {generatedImages.map((url, index) => (
                    <Thumbnail
                      key={index}
                      $active={index === selectedImage}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={url} alt={`Opção ${index + 1}`} />
                    </Thumbnail>
                  ))}
                </ImageThumbnails>
              )}

              {processingTime && (
                <ProcessingInfo>
                  ⚡ Gerado em {(processingTime / 1000).toFixed(1)}s
                </ProcessingInfo>
              )}

              <ButtonGroup>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setGeneratedImages([]);
                    setSelectedImage(0);
                  }}
                >
                  Gerar Novamente
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                  Usar Esta Imagem
                </Button>
              </ButtonGroup>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #000;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
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

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4361ee;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #4361ee;
  }
`;

const Hint = styled.p`
  margin-top: 5px;
  font-size: 0.875rem;
  color: #666;
`;

const CostEstimate = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const CostIcon = styled.div`
  font-size: 2rem;
`;

const CostInfo = styled.div`
  flex: 1;
`;

const CostLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const CostValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4361ee;
`;

const CostNote = styled.div`
  font-size: 0.75rem;
  color: #666;
  font-style: italic;
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

const ImagePreview = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
`;

const Thumbnail = styled.div<{ $active: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.$active ? '#4361ee' : '#ddd'};
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

const ProcessingInfo = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 20px;
`;

export default ImageGenerationModal;