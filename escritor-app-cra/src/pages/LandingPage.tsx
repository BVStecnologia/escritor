import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Title, 
  Subtitle, 
  Paragraph, 
  Button, 
  ButtonGroup,
  Container,
  Section
} from '../components/styled';

// Página inteira
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

// Navbar
const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.xl};
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
`;

const Logo = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  
  span {
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

// Seção hero
const HeroSection = styled(Section)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.space['4xl']} 0 ${({ theme }) => theme.space['3xl']};
  position: relative;
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space['3xl']} 0 ${({ theme }) => theme.space['2xl']};
  }
`;

// Decoração de fundo
const BackgroundDecoration = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
  opacity: 0.4;
  pointer-events: none;
  
  &:before {
    content: '';
    position: absolute;
    width: 40vw;
    height: 40vw;
    border-radius: 50%;
    background: linear-gradient(45deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryLight});
    top: -15vw;
    right: -15vw;
    filter: blur(50px);
  }
  
  &:after {
    content: '';
    position: absolute;
    width: 30vw;
    height: 30vw;
    border-radius: 50%;
    background: linear-gradient(45deg, ${({ theme }) => theme.colors.secondary}, ${({ theme }) => theme.colors.secondaryLight});
    bottom: -10vw;
    left: -10vw;
    filter: blur(50px);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
`;

const HeroTitle = styled(Title)`
  font-size: ${({ theme }) => theme.fontSizes['6xl']};
  margin-bottom: ${({ theme }) => theme.space.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['5xl']};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
  }
`;

const HeroSubtitle = styled(Subtitle)`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.normal};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

// Botões Hero
const HeroButtons = styled(ButtonGroup)`
  margin-bottom: ${({ theme }) => theme.space['3xl']};
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

// Seção de recursos
const FeaturesSection = styled(Section)`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii['3xl']} ${({ theme }) => theme.radii['3xl']} 0 0;
  padding: ${({ theme }) => theme.space['4xl']} 0;
  position: relative;
  margin-top: -${({ theme }) => theme.space['3xl']};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space['3xl']} 0;
    margin-top: -${({ theme }) => theme.space['2xl']};
  }
`;

const FeaturesSectionTitle = styled(Subtitle)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space['3xl']};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  
  &:after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    margin: ${({ theme }) => theme.space.md} auto 0;
    border-radius: ${({ theme }) => theme.radii.full};
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.space.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.light};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.space.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: ${({ theme }) => theme.transitions.normal};
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    z-index: 1;
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  margin-bottom: ${({ theme }) => theme.space.lg};
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${({ theme }) => theme.radii.full};
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primaryLight}, transparent);
    opacity: 0.2;
  }
`;

const FeatureTitle = styled(Subtitle)`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FeatureDescription = styled(Paragraph)`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  flex-grow: 1;
`;

const LandingPage: React.FC = () => {
  return (
    <PageWrapper>
      <Navbar>
        <Logo>
          <span>Escritor</span> App
        </Logo>
        <NavLinks>
          <NavLink to="/features">Recursos</NavLink>
          <NavLink to="/pricing">Preços</NavLink>
          <NavLink to="/about">Sobre</NavLink>
          <NavLink to="/login">Login</NavLink>
        </NavLinks>
        <StyledLink to="/signup">
          <Button variant="primary" size="sm">Registrar</Button>
        </StyledLink>
      </Navbar>
      
      <HeroSection>
        <BackgroundDecoration />
        <HeroContent>
          <HeroTitle>Transforme suas ideias em histórias incríveis</HeroTitle>
          <HeroSubtitle>
            Com a assistência de IA Claude, escreva livros e histórias que cativam seus leitores
          </HeroSubtitle>
          
          <HeroButtons>
            <StyledLink to="/login">
              <Button variant="primary" size="lg">
                Começar agora
              </Button>
            </StyledLink>
            
            <StyledLink to="/signup">
              <Button variant="secondary" size="lg">
                Criar conta
              </Button>
            </StyledLink>
          </HeroButtons>
        </HeroContent>
      </HeroSection>
      
      <FeaturesSection>
        <Container>
          <FeaturesSectionTitle>
            Recursos que impulsionam sua criatividade
          </FeaturesSectionTitle>
          
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>📝</FeatureIcon>
              <FeatureTitle>Editor Intuitivo</FeatureTitle>
              <FeatureDescription>
                Organize seus livros em capítulos e escreva sem distrações em nosso editor projetado para escritores.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🤖</FeatureIcon>
              <FeatureTitle>IA Claude Assistant</FeatureTitle>
              <FeatureDescription>
                Receba sugestões personalizadas para melhorar seu texto e superar bloqueios criativos com nossa IA integrada.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>💡</FeatureIcon>
              <FeatureTitle>Brainstorming Criativo</FeatureTitle>
              <FeatureDescription>
                Gere ideias para personagens, cenários e reviravoltas para enriquecer sua história quando precisar de inspiração.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureTitle>Revisão Inteligente</FeatureTitle>
              <FeatureDescription>
                Verificação ortográfica e gramatical automatizada para garantir um texto impecável e profissional.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Container>
      </FeaturesSection>
    </PageWrapper>
  );
};

export default LandingPage;