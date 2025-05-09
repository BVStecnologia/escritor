import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Container,
  Card,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Paragraph,
  Text,
  Link as StyledLink,
  FlexContainer,
  Title
} from '../components/styled';

const LoginContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.space.xl};
`;

const LoginCard = styled(Card)`
  max-width: 450px;
  width: 100%;
  padding: ${({ theme }) => theme.space.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.space.lg};
  }
`;

const LoginTitle = styled(Title)`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const FormLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPassword = styled(FormLink)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: -${({ theme }) => theme.space.xs};
  margin-bottom: ${({ theme }) => theme.space.md};
  display: block;
  text-align: right;
`;

const LoginLink = styled(FormLink)`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.space.md};
`;

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
    <LoginContainer>
      <LoginCard>
        <LoginTitle>Bem-vindo de volta</LoginTitle>
        
        {error && <Text color="danger" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</Text>}
        
        <Form onSubmit={handleSubmit}>
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
              placeholder="Sua senha"
            />
          </FormGroup>
          
          <ForgotPassword to="/forgot-password">Esqueceu a senha?</ForgotPassword>
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
        
        <FlexContainer direction="column" align="center" style={{ marginTop: '1.5rem' }}>
          <Paragraph style={{ textAlign: 'center', margin: 0 }}>
            Não tem uma conta? <FormLink to="/signup">Cadastre-se</FormLink>
          </Paragraph>
          <LoginLink to="/">Voltar para a página inicial</LoginLink>
        </FlexContainer>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;