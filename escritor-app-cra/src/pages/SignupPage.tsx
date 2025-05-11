import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components'; // Importação correta
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

// Tema profissional para autores (mesmo do login)
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

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const quillDraw = keyframes`
  0% { stroke-dashoffset: 600; }
  100% { stroke-dashoffset: 0; }
`;

const bookOpen = keyframes`
  0% { transform: rotateY(-90deg); }
  100% { transform: rotateY(0deg); }
`;

// Container principal
const SignupContainer = styled.div`
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, ${theme.colors.paper} 0%, ${theme.colors.parchment} 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

// Estante de livros de fundo (igual ao login)
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

// Moldura principal
const SignupPortal = styled.div`
  position: relative;
  width: 900px;
  max-width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  
  @media (max-width: 768px) {
    width: 100%;
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
    width: 60px;
    height: 60px;
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

// Card do formulário
const SignupCard = styled.div`
  position: relative;
  background: ${theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${theme.colors.gold}33;
  border-radius: 12px;
  padding: 3rem;
  width: 520px;
  max-width: 100%;
  box-shadow: 0 8px 32px ${theme.colors.shadow};
  animation: ${fadeIn} 1s ease-out, ${bookOpen} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

// Cabeçalho do formulário
const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  padding-top: 1rem;
`;

const BookIcon = styled.div`
  font-size: 3rem;
  color: ${theme.colors.primary};
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  height: 60px;
  
  &::after {
    content: '📚';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    animation: ${bookOpen} 2s ease-in-out infinite alternate;
  }
`;

const Title = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: 2.5rem;
  font-weight: 900;
  color: ${theme.colors.dark};
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: ${theme.colors.ink};
  font-size: 1.1rem;
  font-weight: 500;
`;

// Formulário
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// Campos de entrada
const FormGroup = styled.div`
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

// Indicador de força da senha
const PasswordStrength = styled.div<{ strength: number }>`
  height: 5px;
  background-color: ${({ strength }) => {
    if (strength === 0) return theme.colors.subtle.gray;
    if (strength === 1) return theme.colors.accent;
    if (strength === 2) return theme.colors.gold;
    return theme.colors.primary;
  }};
  width: 100%;
  margin-top: 0.5rem;
  border-radius: 999px;
  transition: all 0.3s ease;
`;

const HelperText = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.ink}88;
  margin-top: 0.25rem;
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

// Mensagem de erro
const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
`;

// Texto de termos
const TermsText = styled.p`
  font-size: 0.8rem;
  color: ${theme.colors.ink}88;
  text-align: center;
  margin: 1rem 0;
  
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Links
const LinkContainer = styled.div`
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

// Botão do Google
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

// Componente principal
const SignupPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          console.log('Usuário já está autenticado. Redirecionando para o dashboard...');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Verificador de força de senha
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(Math.min(3, strength));
  }, [password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Fraca';
    if (passwordStrength === 2) return 'Média';
    return 'Forte';
  };

  // Efeito de escrita no canvas (mesmo do login)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const quotes = [
      "Toda grande obra começa com a primeira palavra...",
      "Escreva sua história...",
      "Um novo capítulo aguarda...",
      "O autor nasce aqui...",
      "Seu livro começa agora...",
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

  // Função para lidar com o login do Google
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      // Não precisamos definir erro aqui, pois o redirecionamento acontecerá
    } catch (err) {
      setError('Erro ao conectar com Google. Tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    if (passwordStrength < 2) {
      setError('Por favor, utilize uma senha mais forte.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signUp(email, password, name);

      if (user) {
        if (!user.confirmed_at) {
          // Se precisar de verificação de email
          navigate('/login', {
            state: {
              message: 'Por favor, verifique seu email para confirmar sua conta.'
            }
          });
        } else {
          // Login automático já foi realizado no AuthContext
          console.log('Cadastro e login automático realizados com sucesso');
          navigate('/dashboard');
        }
      } else {
        throw new Error('Falha ao criar a conta');
      }

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Falha ao criar a conta. Tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <SignupContainer>
        <BookshelfBackground />
        <WritingCanvas ref={canvasRef} />
        
        <SignupPortal>
          <OrnamentalFrame />
          
          <SignupCard>
            <FormHeader>
              <BookIcon />
              <Title>Crie sua Biblioteca</Title>
              <Subtitle>Comece sua jornada como bookwriter</Subtitle>
            </FormHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleSubmit}>
              <GoogleButton
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || loading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23.766 12.2764c0-.9175-.0832-1.8017-.2339-2.6506H12.24v5.0214h6.4822c-.2784 1.5024-1.1257 2.7763-2.3973 3.6328v3.0174h3.8822c2.2704-2.091 3.5813-5.1686 3.5813-8.8166z" fill="#4285F4"/>
                  <path d="M12.24 24c3.24 0 5.9558-.9744 7.9488-2.9127l-3.8822-3.0174c-1.08.7248-2.46 1.1529-4.0666 1.1529-3.1368 0-5.8008-2.12-6.7512-4.9704H1.5168v3.1164C3.501 21.4384 7.56 24 12.24 24z" fill="#34A853"/>
                  <path d="M5.4888 14.2296c-.2604-.7248-.4104-1.5024-.4104-2.3064s.15-1.5816.4104-2.3064V6.5004H1.5168C.5544 8.4144 0 10.6072 0 12.9232s.5544 4.5088 1.5168 6.4228l3.972-3.1164z" fill="#FBBC05"/>
                  <path d="M12.24 4.776c1.7712 0 3.36.612 4.608 1.8144l3.456-3.456C18.192 1.1568 15.48 0 12.24 0 7.56 0 3.501 2.5616 1.5168 6.5004l3.972 3.1164c.9504-2.8504 3.6144-4.9704 6.7512-4.9704z" fill="#EA4335"/>
                </svg>
                Cadastrar com Google
              </GoogleButton>

              <Divider>
                <span>ou</span>
              </Divider>

              <FormGroup>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Como deseja ser chamado"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">Senha</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Crie uma senha forte"
                />
                <PasswordStrength strength={passwordStrength} />
                {password && (
                  <HelperText>
                    Força da senha: {getPasswordStrengthText()}
                  </HelperText>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Digite a senha novamente"
                />
              </FormGroup>
              
              <TermsText>
                Ao criar uma conta, você concorda com nossos{' '}
                <Link to="/terms">Termos de Uso</Link> e{' '}
                <Link to="/privacy">Política de Privacidade</Link>.
              </TermsText>
              
              <Button 
                type="submit" 
                disabled={isLoading || loading}
              >
                {isLoading || loading ? 'Criando sua biblioteca...' : 'Criar Conta'}
              </Button>
            </Form>
            
            <LinkContainer>
              <p>
                Já tem uma conta?{' '}
                <Link to="/login">Faça login</Link>
              </p>
              <Link to="/" style={{ color: theme.colors.ink + '88', fontSize: '0.8rem' }}>
                Voltar para a página inicial
              </Link>
            </LinkContainer>
          </SignupCard>
        </SignupPortal>
      </SignupContainer>
    </>
  );
};

export default SignupPage;