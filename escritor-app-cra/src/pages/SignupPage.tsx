import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Card,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Text,
  Paragraph,
  FlexContainer,
  Title,
  ErrorMessage,
  HelperText
} from '../components/styled';

const SignupContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.space.xl};
`;

const SignupCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  padding: ${({ theme }) => theme.space.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.space.lg};
  }
`;

const SignupTitle = styled(Title)`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const FormLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    text-decoration: underline;
  }
`;

const HomeLink = styled(FormLink)`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.space.md};
`;

const PasswordStrength = styled.div<{ strength: number }>`
  height: 5px;
  background-color: ${({ theme, strength }) => {
    if (strength === 0) return theme.colors.gray[300];
    if (strength === 1) return theme.colors.danger;
    if (strength === 2) return theme.colors.warning;
    return theme.colors.primary;
  }};
  width: 100%;
  margin-top: ${({ theme }) => theme.space.xs};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: ${({ theme }) => theme.transitions.normal};
`;

const TermsText = styled(Paragraph)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.lg};
  text-align: center;
`;

const SignupPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();

  // Verificador simples de força de senha
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
      // Cadastro com Supabase via AuthContext
      const user = await signUp(email, password, name);

      if (user) {
        // Se a verificação de email estiver ativada no Supabase,
        // informamos o usuário para verificar seu email
        if (!user.confirmed_at) {
          navigate('/login', {
            state: {
              message: 'Por favor, verifique seu email para confirmar sua conta.'
            }
          });
        } else {
          // Caso a verificação de email esteja desativada,
          // redirecionamos direto para o dashboard
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
    <SignupContainer>
      <SignupCard>
        <SignupTitle>Crie sua conta</SignupTitle>
        
        {error && <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Nome</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome completo"
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
              placeholder="Seu endereço de email"
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
              placeholder="Confirme sua senha"
            />
          </FormGroup>
          
          <TermsText>
            Ao criar uma conta, você concorda com nossos <FormLink to="/terms">Termos de Uso</FormLink> e <FormLink to="/privacy">Política de Privacidade</FormLink>.
          </TermsText>
          
          <Button 
            type="submit" 
            variant="secondary" 
            fullWidth 
            disabled={isLoading || loading}
          >
            {isLoading || loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </Form>
        
        <FlexContainer direction="column" align="center" style={{ marginTop: '1.5rem' }}>
          <Paragraph style={{ textAlign: 'center', margin: 0 }}>
            Já tem uma conta? <FormLink to="/login" style={{ color: '#4CAF50' }}>Faça login</FormLink>
          </Paragraph>
          <HomeLink to="/">Voltar para a página inicial</HomeLink>
        </FlexContainer>
      </SignupCard>
    </SignupContainer>
  );
};

export default SignupPage;