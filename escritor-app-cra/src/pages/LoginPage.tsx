import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Paragraph,
  Title
} from '../components/styled';

// Estilo para a página inteira
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: ${({ theme }) => theme.space.md};
  position: relative;
  overflow: hidden;
`;

// Formas decorativas no fundo
const BackgroundShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  
  &:before {
    content: '';
    position: absolute;
    width: 40vw;
    height: 40vw;
    background-color: ${({ theme }) => theme.colors.primary};
    opacity: 0.03;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    top: -10vw;
    right: -10vw;
    animation: floatAnimation 20s infinite alternate ease-in-out;
  }
  
  &:after {
    content: '';
    position: absolute;
    width: 30vw;
    height: 30vw;
    background-color: ${({ theme }) => theme.colors.secondary};
    opacity: 0.03;
    border-radius: 50% 50% 70% 30% / 60% 40% 60% 40%;
    bottom: -5vw;
    left: -5vw;
    animation: floatAnimation 15s infinite alternate-reverse ease-in-out;
  }
  
  @keyframes floatAnimation {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    100% {
      transform: translate(2vw, 2vh) rotate(10deg);
    }
  }
`;

// Container do conteúdo de login
const LoginContainer = styled(Container)`
  position: relative;
  z-index: 1;
  max-width: 1100px;
  display: flex;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.white};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

// Parte esquerda - Ilustração/Descrição
const LoginImageSide = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  padding: ${({ theme }) => theme.space['3xl']};
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23ffffff' fill-opacity='0.05' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'%3E%3C/path%3E%3C/svg%3E");
    opacity: 0.5;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space.xl};
  }
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.space.lg};
  position: relative;
  z-index: 1;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`;

const WelcomeText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  opacity: 0.9;
  margin-bottom: ${({ theme }) => theme.space.xl};
  position: relative;
  z-index: 1;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const LogoText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.space['2xl']};
  position: relative;
  z-index: 1;
  
  &:after {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.white};
    opacity: 0.4;
    border-radius: ${({ theme }) => theme.radii.full};
    margin-top: ${({ theme }) => theme.space.sm};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

// Parte direita - Formulário
const LoginFormSide = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.space['3xl']};
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space.xl};
  }
`;

const LoginTitle = styled(Title)`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const StyledForm = styled(Form)`
  margin-bottom: ${({ theme }) => theme.space.xl};
  
  /* Resolver problema da faixa cinza */
  & ${FormGroup} + ${FormGroup} {
    margin-top: ${({ theme }) => theme.space.md};
  }
`;

const StyledFormGroup = styled(FormGroup)`
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const StyledInput = styled(Input)`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }
`;

const ForgotPassword = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.space.xs};
  margin-bottom: ${({ theme }) => theme.space.lg};
  display: block;
  text-align: right;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: ${({ theme }) => theme.space.lg} 0;
  
  &:before, &:after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  }
  
  &:before {
    margin-right: ${({ theme }) => theme.space.md};
  }
  
  &:after {
    margin-left: ${({ theme }) => theme.space.md};
  }
`;

const SocialLoginButton = styled(Button)`
  margin-bottom: ${({ theme }) => theme.space.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.light};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const SignUpText = styled(Paragraph)`
  text-align: center;
  margin-top: ${({ theme }) => theme.space.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SignUpLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(255, 10, 84, 0.1);
  color: ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

// Componente principal da página
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Simulação de login
      console.log(`Login com: ${email}`);
      // Aqui iremos implementar a autenticação real com Supabase
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Falha ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <BackgroundShapes />
      <LoginContainer>
        <LoginImageSide>
          <LogoText>Escritor App</LogoText>
          <WelcomeTitle>Bem-vindo de volta</WelcomeTitle>
          <WelcomeText>
            Continue sua jornada de escrita com todas as ferramentas que você precisa para 
            criar histórias extraordinárias. O melhor aplicativo para escritores modernos.
          </WelcomeText>
        </LoginImageSide>
        
        <LoginFormSide>
          <LoginTitle>Acesse sua conta</LoginTitle>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <StyledForm onSubmit={handleSubmit}>
            <StyledFormGroup>
              <Label htmlFor="email">Email</Label>
              <StyledInput
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Seu endereço de email"
              />
            </StyledFormGroup>
            
            <StyledFormGroup>
              <Label htmlFor="password">Senha</Label>
              <StyledInput
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
              />
            </StyledFormGroup>
            
            <ForgotPassword to="/forgot-password">Esqueceu a senha?</ForgotPassword>
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </StyledForm>
          
          <OrDivider>ou</OrDivider>
          
          <SocialLoginButton fullWidth>
            <span style={{ marginRight: '10px' }}>🌐</span> Continuar com Google
          </SocialLoginButton>
          
          <SignUpText>
            Não tem uma conta? <SignUpLink to="/signup">Cadastre-se aqui</SignUpLink>
          </SignUpText>
        </LoginFormSide>
      </LoginContainer>
    </PageWrapper>
  );
};

export default LoginPage;