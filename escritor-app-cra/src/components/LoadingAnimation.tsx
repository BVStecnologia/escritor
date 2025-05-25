import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingAnimationProps {
  estimatedTime?: number;
  isDarkMode: boolean;
  quality?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  estimatedTime = 30, 
  isDarkMode,
  quality = 'medium'
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showMagic, setShowMagic] = useState(true);
  
  const phases = quality === 'high' ? [
    { icon: "🎨", text: "Preparando paleta de alta definição..." },
    { icon: "🖼️", text: "Renderizando detalhes complexos..." },
    { icon: "✨", text: "Aplicando texturas avançadas..." },
    { icon: "📝", text: "Refinando tipografia e elementos..." },
    { icon: "🎯", text: "Finalizando em alta qualidade..." }
  ] : [
    { icon: "🎨", text: "Preparando a paleta de cores..." },
    { icon: "🖼️", text: "Criando a composição perfeita..." },
    { icon: "✨", text: "Adicionando magia ao design..." },
    { icon: "📝", text: "Posicionando título e autor..." },
    { icon: "🎯", text: "Ajustando os detalhes finais..." }
  ];
  
  useEffect(() => {
    // Progresso suave
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return 95; // Para em 95% até completar
        return p + Math.random() * 3; // Incremento variável
      });
    }, 500);
    
    // Mudança de fase
    const phaseInterval = setInterval(() => {
      setCurrentPhase(phase => (phase + 1) % phases.length);
      setShowMagic(true);
      setTimeout(() => setShowMagic(false), 400);
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, [phases.length]);
  
  return (
    <LoadingContainer $isDarkMode={isDarkMode}>
      <AnimationWrapper>
        <BookAnimation>
          <Book className="book">
            <Cover className="cover">
              <CoverShine />
              <CoverText $isDarkMode={isDarkMode}>
                <div className="title">BookWriter</div>
                <div className="creating">criando...</div>
              </CoverText>
            </Cover>
            <Pages className="pages" />
          </Book>
          
          <MagicParticles>
            {[...Array(6)].map((_, i) => (
              <Particle key={i} $delay={i * 0.3} $position={i}>
                ✨
              </Particle>
            ))}
          </MagicParticles>
          
          <BrushIcon $show={showMagic}>🖌️</BrushIcon>
        </BookAnimation>
      </AnimationWrapper>
      
      <ContentWrapper>
        <PhaseInfo>
          <PhaseIcon className={showMagic ? 'bounce' : ''}>
            {phases[currentPhase].icon}
          </PhaseIcon>
          <PhaseText $isDarkMode={isDarkMode}>
            {phases[currentPhase].text}
          </PhaseText>
        </PhaseInfo>
        
        <ProgressWrapper>
          <ProgressBar $isDarkMode={isDarkMode}>
            <ProgressFill style={{ width: `${progress}%` }} />
            <ProgressGlow style={{ width: `${progress}%` }} />
          </ProgressBar>
          <ProgressText $isDarkMode={isDarkMode}>
            {Math.round(progress)}%
          </ProgressText>
        </ProgressWrapper>
        
        <TimeEstimate $isDarkMode={isDarkMode}>
          <ClockIcon>⏱️</ClockIcon>
          Tempo estimado: {Math.max(1, Math.round((100 - progress) * estimatedTime / 100))}s
        </TimeEstimate>
        
        <InspirationText $isDarkMode={isDarkMode}>
          "Toda grande história merece uma capa inesquecível"
        </InspirationText>
      </ContentWrapper>
    </LoadingContainer>
  );
};

// Animações
const float = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
`;

const pageFlip = keyframes`
  0% { transform: rotateY(0deg); }
  20% { transform: rotateY(-20deg); }
  40% { transform: rotateY(10deg); }
  60% { transform: rotateY(-5deg); }
  80% { transform: rotateY(2deg); }
  100% { transform: rotateY(0deg); }
`;

const sparkle = keyframes`
  0% { 
    opacity: 0;
    transform: scale(0) rotate(0deg) translateY(0);
  }
  50% { 
    opacity: 1;
    transform: scale(1) rotate(180deg) translateY(-30px);
  }
  100% { 
    opacity: 0;
    transform: scale(0) rotate(360deg) translateY(-60px);
  }
`;

const shine = keyframes`
  0% { left: -100%; }
  50%, 100% { left: 200%; }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const brushStroke = keyframes`
  0% { 
    opacity: 0;
    transform: translateX(-50px) translateY(50px) rotate(-45deg);
  }
  50% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(-45deg);
  }
  100% { 
    opacity: 0;
    transform: translateX(50px) translateY(-50px) rotate(-45deg);
  }
`;

// Styled Components
const LoadingContainer = styled.div<{ $isDarkMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 60px 20px;
  min-height: 500px;
  justify-content: center;
`;

const AnimationWrapper = styled.div`
  position: relative;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BookAnimation = styled.div`
  position: relative;
  width: 150px;
  height: 200px;
  animation: ${float} 4s ease-in-out infinite;
`;

const Book = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateX(-15deg) rotateY(0deg);
  animation: ${pageFlip} 6s ease-in-out infinite;
`;

const Cover = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4361ee 0%, #6a5acd 50%, #4361ee 100%);
  border-radius: 5px 10px 10px 5px;
  box-shadow: 
    0 5px 15px rgba(0,0,0,0.3),
    inset 0 0 0 1px rgba(255,255,255,0.1);
  overflow: hidden;
`;

const CoverShine = styled.div`
  position: absolute;
  top: -2px;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.2),
    transparent
  );
  animation: ${shine} 3s ease-in-out infinite;
`;

const CoverText = styled.div<{ $isDarkMode: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  
  .title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 5px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }
  
  .creating {
    font-size: 0.8rem;
    opacity: 0.9;
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

const Pages = styled.div`
  position: absolute;
  width: 96%;
  height: 90%;
  background: linear-gradient(to right, #f5f5f5 0%, #e8e8e8 100%);
  right: 0;
  top: 5%;
  border-radius: 0 5px 5px 0;
  transform: translateZ(-10px);
  box-shadow: 
    inset 0 0 20px rgba(0,0,0,0.05),
    0 0 5px rgba(0,0,0,0.1);
    
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 1px,
      rgba(0,0,0,0.03) 1px,
      rgba(0,0,0,0.03) 2px
    );
  }
`;

const MagicParticles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Particle = styled.div<{ $delay: number; $position: number }>`
  position: absolute;
  font-size: 1.5rem;
  animation: ${sparkle} 3s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  
  ${props => {
    const positions = [
      { top: '10%', left: '10%' },
      { top: '20%', right: '10%' },
      { bottom: '20%', left: '15%' },
      { bottom: '10%', right: '15%' },
      { top: '50%', left: '0%' },
      { top: '50%', right: '0%' }
    ];
    const pos = positions[props.$position % positions.length];
    return Object.entries(pos).map(([key, value]) => `${key}: ${value};`).join(' ');
  }}
`;

const BrushIcon = styled.div<{ $show: boolean }>`
  position: absolute;
  font-size: 2.5rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: ${props => props.$show ? 1 : 0};
  animation: ${props => props.$show ? brushStroke : 'none'} 1s ease-out;
  pointer-events: none;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 400px;
`;

const PhaseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 50px;
`;

const PhaseIcon = styled.span`
  font-size: 2.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
  
  &.bounce {
    animation: ${bounce} 0.6s ease-out;
  }
`;

const PhaseText = styled.p<{ $isDarkMode: boolean }>`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  font-weight: 500;
`;

const ProgressWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const ProgressBar = styled.div<{ $isDarkMode: boolean }>`
  width: 100%;
  height: 10px;
  background: ${props => props.$isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)'};
  border-radius: 5px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #6a5acd, #4361ee);
  background-size: 200% 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
  animation: ${shine} 2s linear infinite;
`;

const ProgressGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  border-radius: 5px;
  animation: ${shine} 2s linear infinite;
`;

const ProgressText = styled.span<{ $isDarkMode: boolean }>`
  position: absolute;
  right: 10px;
  top: -25px;
  font-size: 0.9rem;
  font-weight: bold;
  color: ${props => props.$isDarkMode ? '#4361ee' : '#4361ee'};
`;

const TimeEstimate = styled.div<{ $isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: ${props => props.$isDarkMode ? '#aaa' : '#666'};
`;

const ClockIcon = styled.span`
  font-size: 1.2rem;
`;

const InspirationText = styled.p<{ $isDarkMode: boolean }>`
  font-style: italic;
  font-size: 0.9rem;
  color: ${props => props.$isDarkMode ? '#999' : '#777'};
  text-align: center;
  margin-top: 10px;
  opacity: 0.8;
`;

export default LoadingAnimation;