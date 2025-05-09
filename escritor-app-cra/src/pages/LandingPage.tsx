import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Title, 
  Subtitle, 
  Paragraph, 
  List, 
  ListItem, 
  Button, 
  ButtonGroup,
  Container,
  FlexContainer,
  Section
} from '../components/styled';

// Styled components específicos para a LandingPage
const HeroSection = styled(Section)`
  text-align: center;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.space['3xl']} 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.light} 0%, #e8f5e9 100%);
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.space.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: ${({ theme }) => theme.transitions.normal};
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const HeroTitle = styled(Title)`
  font-size: 3.5rem;
  margin-bottom: ${({ theme }) => theme.space.md};
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(Subtitle)`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.space.xl};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray[700]};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.25rem;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.space.xl};
  margin-top: ${({ theme }) => theme.space['2xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const LandingPage: React.FC = () => {
  return (
    <Container>
      <HeroSection>
        <HeroTitle>Escritor App</HeroTitle>
        <HeroSubtitle>Transforme suas ideias em histórias incríveis com a assistência da IA Claude</HeroSubtitle>
        
        <ButtonGroup>
          <StyledLink to="/login">
            <Button variant="primary" size="lg">
              Login
            </Button>
          </StyledLink>
          
          <StyledLink to="/signup">
            <Button variant="secondary" size="lg">
              Cadastrar
            </Button>
          </StyledLink>
        </ButtonGroup>
        
        <Section>
          <Subtitle>Recursos que vão revolucionar sua escrita</Subtitle>
          
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>📝</FeatureIcon>
              <Subtitle>Escreva com Liberdade</Subtitle>
              <Paragraph>Organize seus livros em capítulos e escrevas sem distrações em nosso editor intuitivo.</Paragraph>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🤖</FeatureIcon>
              <Subtitle>Assistente IA Claude</Subtitle>
              <Paragraph>Receba sugestões personalizadas para melhorar seu texto e superar bloqueios criativos.</Paragraph>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>💡</FeatureIcon>
              <Subtitle>Ideias Criativas</Subtitle>
              <Paragraph>Gere ideias para personagens, cenários e reviravoltas para enriquecer sua história.</Paragraph>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>✓</FeatureIcon>
              <Subtitle>Revisão Inteligente</Subtitle>
              <Paragraph>Verificação ortográfica e gramatical automatizada para garantir qualidade.</Paragraph>
            </FeatureCard>
          </FeaturesGrid>
        </Section>
      </HeroSection>
    </Container>
  );
};

export default LandingPage;