import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import defaultTheme from '../styles/theme';

// Definição dos temas claro e escuro
const lightTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    paper: '#faf9f7',
    ink: '#1f2937',
    leather: '#92400e',
    parchment: '#f3f0e8',
    glass: 'rgba(255, 255, 255, 0.98)',
    gold: '#d97706',
    subtle: {
      blue: '#dbeafe',
      purple: '#ede9fe',
      gray: '#f3f4f6',
    },
    background: {
      ...defaultTheme.colors.background,
      main: '#f0f6ff',
      paper: '#ffffff',
      sidebar: '#ffffff',
      header: '#ffffff',
      light: '#ffffff',
      dark: '#e0e7ff',
      gradient: 'linear-gradient(135deg, #f0f6ff 0%, #e0e7ff 100%)',
      glass: 'rgba(255,255,255,0.8)',
      overlay: 'rgba(0,0,0,0.1)',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
      tertiary: '#6c757d',
      light: '#f8f9fa',
      inverse: '#ffffff',
    },
  },
};

const darkTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#60a5fa',
    secondary: '#a78bfa',
    success: '#4ade80',
    danger: '#f87171',
    warning: '#fbbf24',
    info: '#22d3ee',
    light: '#0f172a',
    dark: '#e5e7eb',
    paper: '#0f172a',
    ink: '#e5e7eb',
    leather: '#7c2d12',
    parchment: '#1e293b',
    glass: 'rgba(15, 23, 42, 0.98)',
    gold: '#fbbf24',
    subtle: {
      blue: '#1e3a8a',
      purple: '#312e81',
      gray: '#374151',
    },
    gray: {
      50: '#18212f',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#94a3b8',
      tertiary: '#64748b',
      light: '#f8fafc',
      inverse: '#0f172a',
    },
    background: {
      ...defaultTheme.colors.background,
      main: '#0f172a',
      paper: '#1e293b',
      sidebar: '#1e293b',
      header: '#1e293b',
      light: '#1e293b',
      dark: '#0f172a',
      gradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      glass: 'rgba(15,23,42,0.8)',
      overlay: 'rgba(0,0,0,0.5)',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
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
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.paper};
    color: ${({ theme }) => theme.colors.ink};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Container principal
const ProfileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.paper} 0%, ${({ theme }) => theme.colors.parchment} 100%);
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
`;

// Decoração de fundo
const BookshelfDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: 
    repeating-linear-gradient(90deg, ${({ theme }) => theme.colors.leather} 0px, ${({ theme }) => theme.colors.leather} 40px, transparent 40px, transparent 60px),
    repeating-linear-gradient(0deg, ${({ theme }) => theme.colors.leather} 0px, ${({ theme }) => theme.colors.leather} 120px, transparent 120px, transparent 140px);
  background-size: 60px 140px;
  pointer-events: none;
`;

// Canvas para efeitos decorativos
const DecorativeCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;
  z-index: 1;
`;

// Header estilizado
const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 3rem;
  position: relative;
  z-index: 2;
  animation: ${fadeIn} 0.8s ease-out;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.gold}33;
  border-radius: 12px;
  box-shadow: 0 8px 32px ${({ theme }) => theme.shadows.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ProfileTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.dark};
  margin: 0;
  
  &::before {
    content: '📝';
    margin-right: 1rem;
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.light};
    transform: translateY(-2px);
  }
`;

// Container principal do conteúdo
const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Card de perfil
const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.gold}33;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px ${({ theme }) => theme.shadows.lg};
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

// Seção com título
const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gold}33;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: ${({ theme }) => theme.colors.gold};
  }
`;

// Formulário
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.colors.light};
  border: 2px solid ${({ theme }) => theme.colors.subtle?.gray || theme.colors.gray[200]};
  border-radius: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.ink};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.subtle?.blue || theme.colors.primaryLight};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.subtle?.gray || theme.colors.gray[200]};
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.colors.light};
  border: 2px solid ${({ theme }) => theme.colors.subtle?.gray || theme.colors.gray[200]};
  border-radius: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.ink};
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.body};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.subtle?.blue || theme.colors.primaryLight};
  }
`;

// Botões
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.light};
  border: none;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.subtle?.blue || theme.colors.primaryLight};
  }
`;

// Card de estatísticas
const StatsCard = styled.div`
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.gold}33;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px ${({ theme }) => theme.shadows.lg};
  animation: ${fadeIn} 0.8s ease-out 0.4s both;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

// Grid de estatísticas
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const StatItem = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border: 1px solid ${({ theme }) => theme.colors.subtle?.gray || theme.colors.gray[200]};
  border-radius: 8px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.shadows.md};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ theme }) => theme.colors.gold};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.mono};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.ink}88;
  font-weight: 500;
`;

// Mensagem de status
const StatusMessage = styled.div<{ isError?: boolean }>`
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: ${({ isError }) => 
    isError ? '#fef2f2' : '#f0fdf4'};
  color: ${({ isError }) => 
    isError ? '#dc2626' : '#16a34a'};
  border: 1px solid ${({ isError }) => 
    isError ? '#fecaca' : '#bbf7d0'};
  animation: ${fadeIn} 0.3s ease-out;
`;

// Card de citação
const QuoteCard = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border: 1px solid ${({ theme }) => theme.colors.subtle?.gray || theme.colors.gray[200]};
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  position: relative;
  
  &::before {
    content: '"';
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.gold}33;
    position: absolute;
    top: -10px;
    left: 10px;
  }
`;

const Quote = styled.p`
  font-style: italic;
  color: ${({ theme }) => theme.colors.ink}88;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const QuoteAuthor = styled.span`
  display: block;
  text-align: right;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.ink}66;
  font-size: 0.875rem;
`;

// Tipos
interface ProfileData {
  nome: string;
  Sobrenome: string;
  email: string;
  biografia: string;
  generoPreferido: string;
  site: string;
  Tema: string;
}

// Componente principal
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profile, setProfile] = useState<ProfileData>({
    nome: '',
    Sobrenome: '',
    email: '',
    biografia: '',
    generoPreferido: '',
    site: '',
    Tema: 'claro'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [stats, setStats] = useState({
    livros: 0,
    capitulos: 0,
    palavrasEscritas: 0,
    diasConsecutivos: 0
  });

  // Canvas com animação de tinta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
    }> = [];

    const createParticle = () => {
      if (particles.length > 50) return;
      
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 2 + 1,
        life: 1,
        size: Math.random() * 3 + 1,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (Math.random() < 0.1) createParticle();

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
        particle.vy += 0.05; // Gravidade

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(31, 41, 55, ${particle.life * 0.3})`;
        ctx.fill();

        if (particle.life <= 0 || particle.y > canvas.height) {
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

  // Carregar dados do perfil
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!user) return;

      try {
        const perfilData = await dbService.getPerfilUsuario();
        if (perfilData) {
          // Tema do perfil pode ser usado para sincronizar com o modo escuro/claro
          const temaPerfil = perfilData.Tema === 'escuro';

          // Se o tema do perfil for diferente do tema atual, atualize-o
          if (temaPerfil !== isDarkMode) {
            // Esta é apenas uma sincronização no carregamento
            // Não estamos chamando toggleTheme() para evitar um loop
          }

          setProfile({
            nome: perfilData.nome || '',
            Sobrenome: perfilData.Sobrenome || '',
            email: user.email || '',
            biografia: perfilData.biografia || '',
            generoPreferido: perfilData.generoPreferido || '',
            site: perfilData.site || '',
            Tema: perfilData.Tema || 'claro'
          });

          console.log('Perfil carregado:', perfilData);
        }

        const livros = await dbService.getLivros();
        let totalCapitulos = 0;
        let totalPalavras = 0;

        for (const livro of livros) {
          const capitulos = await dbService.getCapitulosPorLivroId(livro.id);
          totalCapitulos += capitulos?.length || 0;

          for (const capitulo of capitulos || []) {
            if (capitulo.conteudo) {
              totalPalavras += capitulo.conteudo.split(/\s+/).filter(Boolean).length;
            }
          }
        }

        // Usar palavras do perfil se estiver disponível
        if (perfilData && perfilData.palavras && perfilData.palavras > 0) {
          totalPalavras = perfilData.palavras;
        } else if (totalPalavras > 0) {
          // Atualizar contagem de palavras no perfil
          await dbService.atualizarPalavrasUsuario(totalPalavras);
        }

        setStats({
          livros: livros.length,
          capitulos: totalCapitulos,
          palavrasEscritas: totalPalavras,
          diasConsecutivos: Math.floor(Math.random() * 30) + 1 // Exemplo
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage({
          text: "Não foi possível carregar as informações do perfil.",
          isError: true
        });
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [user, isDarkMode]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Salvar o tema no perfil se mudou
      const temaPerfil = isDarkMode ? 'escuro' : 'claro';

      console.log('Salvando perfil com os seguintes dados:', {
        nome: profile.nome,
        Sobrenome: profile.Sobrenome,
        biografia: profile.biografia,
        generoPreferido: profile.generoPreferido,
        site: profile.site,
        Tema: temaPerfil
      });

      await dbService.atualizarPerfilUsuario({
        nome: profile.nome,
        Sobrenome: profile.Sobrenome,
        biografia: profile.biografia,
        generoPreferido: profile.generoPreferido,
        site: profile.site,
        Tema: temaPerfil
      });

      console.log('Perfil atualizado com sucesso!');
      setMessage({
        text: "Perfil atualizado com sucesso!",
        isError: false
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMessage({
        text: "Não foi possível atualizar o perfil. Tente novamente.",
        isError: true
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme as any : lightTheme as any}>
      <GlobalStyle />
      <ProfileContainer>
        <BookshelfDecoration />
        <DecorativeCanvas ref={canvasRef} />
        
        <Header>
          <HeaderContent>
            <ProfileTitle>Perfil do Escritor</ProfileTitle>
            <HeaderButtons>
              <ThemeToggle onClick={toggleTheme}>
                {isDarkMode ? '☀️' : '🌙'}
              </ThemeToggle>
              <BackButton onClick={() => navigate('/dashboard')}>
                ← Voltar ao Dashboard
              </BackButton>
            </HeaderButtons>
          </HeaderContent>
        </Header>
        
        <MainContent>
          <ProfileCard>
            <Section>
              <SectionTitle>Informações Pessoais</SectionTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={profile.nome}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="Sobrenome">Sobrenome</Label>
                  <Input
                    id="Sobrenome"
                    name="Sobrenome"
                    value={profile.Sobrenome}
                    onChange={handleInputChange}
                    placeholder="Seu sobrenome"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled
                    placeholder="Seu email"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="biografia">Biografia</Label>
                  <Textarea
                    id="biografia"
                    name="biografia"
                    value={profile.biografia}
                    onChange={handleInputChange}
                    placeholder="Conte sua história como escritor..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="generoPreferido">Gênero Literário Preferido</Label>
                  <Input
                    id="generoPreferido"
                    name="generoPreferido"
                    value={profile.generoPreferido}
                    onChange={handleInputChange}
                    placeholder="Ex: Romance, Ficção Científica, Fantasia..."
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="site">Website ou Blog</Label>
                  <Input
                    id="site"
                    name="site"
                    value={profile.site}
                    onChange={handleInputChange}
                    placeholder="https://seu-site.com"
                  />
                </FormGroup>
                
                <ButtonGroup>
                  <SecondaryButton
                    type="button"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancelar
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </PrimaryButton>
                </ButtonGroup>
                
                {message && (
                  <StatusMessage isError={message.isError}>
                    {message.text}
                  </StatusMessage>
                )}
              </Form>
            </Section>
          </ProfileCard>
          
          <div>
            <StatsCard>
              <Section>
                <SectionTitle>Estatísticas de Escrita</SectionTitle>
                <StatsGrid>
                  <StatItem>
                    <StatIcon>📚</StatIcon>
                    <StatValue>{stats.livros}</StatValue>
                    <StatLabel>Livros Criados</StatLabel>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon>📑</StatIcon>
                    <StatValue>{stats.capitulos}</StatValue>
                    <StatLabel>Capítulos Escritos</StatLabel>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon>✍️</StatIcon>
                    <StatValue>{stats.palavrasEscritas.toLocaleString('pt-BR')}</StatValue>
                    <StatLabel>Palavras Totais</StatLabel>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon>🔥</StatIcon>
                    <StatValue>{stats.diasConsecutivos}</StatValue>
                    <StatLabel>Dias Consecutivos</StatLabel>
                  </StatItem>
                </StatsGrid>
              </Section>
            </StatsCard>
            
            <QuoteCard>
              <Quote>
                "Escrever é a arte de transformar pensamentos em mundos, e palavras em portais para a imaginação."
              </Quote>
              <QuoteAuthor>— Anônimo</QuoteAuthor>
            </QuoteCard>
          </div>
        </MainContent>
      </ProfileContainer>
    </ThemeProvider>
  );
};

export default ProfilePage;