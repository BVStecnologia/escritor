import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

// Tema profissional para escritores
const theme = {
  colors: {
    primary: '#1e40af',      // Azul profissional
    secondary: '#7c3aed',    // Roxo elegante
    accent: '#dc2626',       // Vermelho para destaques
    gold: '#d97706',         // Dourado para premium
    dark: '#111827',         // Cinza escuro
    light: '#ffffff',
    paper: '#faf9f7',        // Cor de papel
    ink: '#1f2937',          // Cor de tinta
    leather: '#92400e',      // Marrom couro
    parchment: '#f3f0e8',    // Pergaminho
    subtle: {
      blue: '#dbeafe',
      purple: '#ede9fe',
      gray: '#f3f4f6',
    },
    glass: 'rgba(255, 255, 255, 0.95)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
};

// Estilos globais
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.fonts.body};
    background: ${theme.colors.paper};
    color: ${theme.colors.ink};
    overflow-x: hidden;
  }
`;

// Animações sutis
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const pageFlip = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(-10deg); }
  100% { transform: rotateY(0deg); }
`;

const quillWrite = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(0deg); }
  25% { transform: translateX(10px) translateY(2px) rotate(5deg); }
  50% { transform: translateX(20px) translateY(0) rotate(0deg); }
  75% { transform: translateX(30px) translateY(2px) rotate(-5deg); }
  100% { transform: translateX(40px) translateY(0) rotate(0deg); }
`;

const inkDrop = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
`;

// Container principal
const LibraryContainer = styled.div`
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, ${theme.colors.paper} 0%, ${theme.colors.parchment} 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Estante de livros de fundo
const BookshelfBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.05;
  background-image: 
    repeating-linear-gradient(90deg, ${theme.colors.leather} 0px, ${theme.colors.leather} 40px, transparent 40px, transparent 60px),
    repeating-linear-gradient(0deg, ${theme.colors.leather} 0px, ${theme.colors.leather} 120px, transparent 120px, transparent 140px);
  background-size: 60px 140px;
`;

// Canvas para efeitos de escrita
const WritingCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;
`;

// Portal de entrada (como uma porta de biblioteca)
const LibraryPortal = styled.div`
  position: relative;
  width: 800px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  
  @media (max-width: 768px) {
    width: 90%;
    height: auto;
  }
`;

// Moldura ornamental
const OrnamentalFrame = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 8px solid ${theme.colors.leather};
  border-radius: 12px;
  box-shadow: 
    inset 0 0 0 2px ${theme.colors.gold},
    0 0 40px ${theme.colors.shadow};
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid ${theme.colors.gold};
  }
  
  &::before {
    top: -5px;
    left: -5px;
    border-right: none;
    border-bottom: none;
  }
  
  &::after {
    bottom: -5px;
    right: -5px;
    border-left: none;
    border-top: none;
  }
`;

// Livros decorativos flutuantes
const FloatingBook = styled.div<{ delay: number }>`
  position: absolute;
  width: 60px;
  height: 80px;
  background: linear-gradient(90deg, ${theme.colors.leather} 0%, ${theme.colors.dark} 10%, ${theme.colors.leather} 20%);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 4px 8px ${theme.colors.shadow};
  animation: ${pageFlip} 6s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
  opacity: 0.2;
  
  &:nth-child(1) { top: 10%; left: 5%; }
  &:nth-child(2) { top: 20%; right: 10%; }
  &:nth-child(3) { bottom: 15%; left: 8%; }
  &:nth-child(4) { bottom: 25%; right: 5%; }
`;

// Formulário principal
const LoginCard = styled.div`
  position: relative;
  background: ${theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${theme.colors.gold}33;
  border-radius: 12px;
  padding: 3rem;
  width: 420px;
  box-shadow: 0 8px 32px ${theme.colors.shadow};
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 2rem;
  }
`;

// Cabeçalho do formulário
const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Logo = styled.div`
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
`;

const QuillIcon = styled.div`
  font-size: 3rem;
  color: ${theme.colors.primary};
  position: relative;
  animation: ${quillWrite} 4s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    width: 6px;
    height: 6px;
    background: ${theme.colors.ink};
    border-radius: 50%;
    animation: ${inkDrop} 2s ease-out infinite;
  }
`;

const Title = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: 2.5rem;
  font-weight: 900;
  color: ${theme.colors.dark};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: ${theme.colors.ink};
  font-size: 1.1rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${theme.colors.gold};
    animation: ${typewriter} 3s ease-out;
  }
`;

// Formulário
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Campos de entrada
const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.dark};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${theme.colors.light};
  border: 2px solid ${theme.colors.subtle.gray};
  border-radius: 8px;
  font-size: 1rem;
  color: ${theme.colors.ink};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.subtle.blue};
  }
  
  &::placeholder {
    color: ${theme.colors.ink}66;
  }
`;

// Botões
const Button = styled.button`
  position: relative;
  background: ${theme.colors.primary};
  color: ${theme.colors.light};
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${theme.colors.shadow};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(Button)`
  background: ${theme.colors.light};
  color: ${theme.colors.ink};
  border: 2px solid ${theme.colors.subtle.gray};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  &:hover {
    background: ${theme.colors.subtle.gray};
    border-color: ${theme.colors.primary};
  }
`;

// Divisor
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${theme.colors.subtle.gray};
  }
  
  span {
    margin: 0 1rem;
    color: ${theme.colors.ink}88;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

// Mensagem de erro
const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

// Link
const LinkText = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: ${theme.colors.ink}88;
  font-size: 0.875rem;
  
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Componente principal
const WriterPortalLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Efeito de escrita no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const quotes = [
      "Era uma vez...",
      "No princípio era o Verbo...",
      "Escrever é reescrever...",
      "A página em branco aguarda...",
      "Toda história tem um começo...",
    ];

    const particles: Array<{
      text: string;
      x: number;
      y: number;
      opacity: number;
      speed: number;
    }> = [];

    const createParticle = () => {
      const text = quotes[Math.floor(Math.random() * quotes.length)];
      particles.push({
        text,
        x: Math.random() * canvas.width,
        y: canvas.height + 50,
        opacity: 1,
        speed: 0.5 + Math.random() * 1.5,
      });
    };

    let frameCount = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      frameCount++;
      if (frameCount % 120 === 0 && particles.length < 5) {
        createParticle();
      }

      particles.forEach((particle, index) => {
        particle.y -= particle.speed;
        particle.opacity -= 0.005;

        ctx.font = '20px "Playfair Display", serif';
        ctx.fillStyle = `rgba(31, 41, 55, ${particle.opacity})`;
        ctx.fillText(particle.text, particle.x, particle.y);

        if (particle.opacity <= 0 || particle.y < -50) {
          particles.splice(index, 1);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      setError('Login com Google temporariamente indisponível.');
    } catch (err) {
      setError('Erro ao conectar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <LibraryContainer>
        <BookshelfBackground />
        <WritingCanvas ref={canvasRef} />
        
        <LibraryPortal>
          <OrnamentalFrame />
          {[0, 1, 2, 3].map(i => (
            <FloatingBook key={i} delay={i * 0.5} />
          ))}
          
          <LoginCard>
            <FormHeader>
              <Logo>
                <QuillIcon>✍️</QuillIcon>
              </Logo>
              <Title>Portal do Escritor</Title>
              <Subtitle>Sua jornada literária começa aqui</Subtitle>
            </FormHeader>

            <Form onSubmit={handleSubmit}>
              <GoogleButton
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23.766 12.2764c0-.9175-.0832-1.8017-.2339-2.6506H12.24v5.0214h6.4822c-.2784 1.5024-1.1257 2.7763-2.3973 3.6328v3.0174h3.8822c2.2704-2.091 3.5813-5.1686 3.5813-8.8166z" fill="#4285F4"/>
                  <path d="M12.24 24c3.24 0 5.9558-.9744 7.9488-2.9127l-3.8822-3.0174c-1.08.7248-2.46 1.1529-4.0666 1.1529-3.1368 0-5.8008-2.12-6.7512-4.9704H1.5168v3.1164C3.501 21.4384 7.56 24 12.24 24z" fill="#34A853"/>
                  <path d="M5.4888 14.2296c-.2604-.7248-.4104-1.5024-.4104-2.3064s.15-1.5816.4104-2.3064V6.5004H1.5168C.5544 8.4144 0 10.6072 0 12.9232s.5544 4.5088 1.5168 6.4228l3.972-3.1164z" fill="#FBBC05"/>
                  <path d="M12.24 4.776c1.7712 0 3.36.612 4.608 1.8144l3.456-3.456C18.192 1.1568 15.48 0 12.24 0 7.56 0 3.501 2.5616 1.5168 6.5004l3.972 3.1164c.9504-2.8504 3.6144-4.9704 6.7512-4.9704z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </GoogleButton>

              <Divider>
                <span>ou</span>
              </Divider>

              <InputGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Acessar Biblioteca'}
              </Button>
            </Form>

            <LinkText>
              Novo escritor? <a href="/signup">Crie sua conta</a>
            </LinkText>
          </LoginCard>
        </LibraryPortal>
      </LibraryContainer>
    </>
  );
};

export default WriterPortalLogin;