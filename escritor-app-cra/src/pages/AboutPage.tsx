import React from 'react';
import styled from 'styled-components';
import { Container } from '../components/styled';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      <Header>
        <Container>
          <Nav>
            <Logo to="/">Book Writer</Logo>
            <BackLink to="/">← Voltar ao site</BackLink>
          </Nav>
        </Container>
      </Header>

      <Content>
        <Container>
          <ContentWrapper>
            <Title>A Plataforma</Title>
            <Subtitle>Onde tecnologia e literatura se encontram</Subtitle>

            <StorySection>
              <Badge>Nossa Trajetória</Badge>
              <StoryText>
                Desenvolvida por <Highlight>especialistas em publicação digital</Highlight> que já 
                ajudaram mais de <Strong>10.000 autores</Strong> a alcançar o primeiro lugar 
                em suas categorias na Amazon.
              </StoryText>
            </StorySection>

            <TechSection>
              <TechGrid>
                <TechCard>
                  <TechIcon>🧬</TechIcon>
                  <TechTitle>5 Anos de Pesquisa</TechTitle>
                  <TechText>
                    Em otimização de algoritmos de marketplaces literários, 
                    com foco em maximizar visibilidade orgânica e conversão.
                  </TechText>
                </TechCard>

                <TechCard>
                  <TechIcon>🤝</TechIcon>
                  <TechTitle>Parceiros Oficiais</TechTitle>
                  <TechText>
                    Do programa Amazon KDP Select desde 2019, com acesso 
                    privilegiado a recursos e insights exclusivos.
                  </TechText>
                </TechCard>

                <TechCard>
                  <TechIcon>🔬</TechIcon>
                  <TechTitle>Laboratório de IA</TechTitle>
                  <TechText>
                    Nossa equipe de pesquisa desenvolve modelos proprietários 
                    treinados especificamente para o mercado editorial brasileiro.
                  </TechText>
                </TechCard>

                <TechCard>
                  <TechIcon>📊</TechIcon>
                  <TechTitle>Dados que Impressionam</TechTitle>
                  <TechText>
                    Processamos mais de 50 milhões de palavras por mês, 
                    analisando padrões de sucesso em tempo real.
                  </TechText>
                </TechCard>
              </TechGrid>
            </TechSection>

            <AchievementsSection>
              <AchievementTitle>Números que Falam por Si</AchievementTitle>
              <AchievementsGrid>
                <Achievement>
                  <AchievementNumber>R$ 47M+</AchievementNumber>
                  <AchievementText>Em royalties gerados para nossos autores</AchievementText>
                </Achievement>
                <Achievement>
                  <AchievementNumber>127</AchievementNumber>
                  <AchievementText>Best-sellers #1 na Amazon</AchievementText>
                </Achievement>
                <Achievement>
                  <AchievementNumber>98.7%</AchievementNumber>
                  <AchievementText>Taxa de satisfação dos autores</AchievementText>
                </Achievement>
              </AchievementsGrid>
            </AchievementsSection>

            <PhilosophySection>
              <PhilosophyTitle>Nossa Filosofia</PhilosophyTitle>
              <PhilosophyText>
                Acreditamos que <Highlight>cada pessoa tem uma história única para contar</Highlight>. 
                Nossa missão é democratizar o acesso às ferramentas que transformam ideias em 
                best-sellers, combinando a precisão da engenharia com a arte da narrativa.
              </PhilosophyText>
              <PhilosophyQuote>
                "Não criamos apenas uma ferramenta. Construímos um ecossistema onde 
                autores brasileiros podem competir globalmente com vantagem tecnológica."
              </PhilosophyQuote>
              <QuoteAuthor>— Fundadores, Book Writer</QuoteAuthor>
            </PhilosophySection>

            <CTASection>
              <CTATitle>Pronto para fazer parte dessa revolução?</CTATitle>
              <CTAButton to="/signup">Começar Agora</CTAButton>
            </CTASection>
          </ContentWrapper>
        </Container>
      </Content>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4361ee;
  text-decoration: none;
`;

const BackLink = styled(Link)`
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #4361ee;
  }
`;

const Content = styled.main`
  padding: 60px 0;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: #6c757d;
  margin-bottom: 60px;
`;

const StorySection = styled.div`
  background: white;
  padding: 50px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 40px 30px;
  }
`;

const Badge = styled.div`
  display: inline-block;
  background: #4361ee;
  color: white;
  padding: 8px 24px;
  border-radius: 50px;
  font-weight: 700;
  margin-bottom: 30px;
  font-size: 0.9rem;
`;

const StoryText = styled.p`
  font-size: 1.4rem;
  line-height: 1.8;
  color: #495057;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Highlight = styled.span`
  color: #4361ee;
  font-weight: 600;
`;

const Strong = styled.strong`
  color: #1a1a1a;
  font-weight: 800;
`;

const TechSection = styled.div`
  margin-bottom: 60px;
`;

const TechGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TechCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TechIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const TechTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 15px;
`;

const TechText = styled.p`
  color: #6c757d;
  line-height: 1.6;
  font-size: 1.1rem;
`;

const AchievementsSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px;
  border-radius: 12px;
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 40px 30px;
  }
`;

const AchievementTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 40px;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const Achievement = styled.div`
  color: white;
`;

const AchievementNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const AchievementText = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const PhilosophySection = styled.div`
  background: white;
  padding: 50px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 40px 30px;
  }
`;

const PhilosophyTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 30px;
`;

const PhilosophyText = styled.p`
  font-size: 1.3rem;
  line-height: 1.8;
  color: #495057;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PhilosophyQuote = styled.blockquote`
  font-size: 1.2rem;
  font-style: italic;
  color: #6c757d;
  margin: 30px 0 15px;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 20px;
    font-size: 1.1rem;
  }
`;

const QuoteAuthor = styled.p`
  color: #4361ee;
  font-weight: 600;
`;

const CTASection = styled.div`
  text-align: center;
  padding: 60px 0;
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 30px;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: #4361ee;
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: #3a56d4;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(67, 97, 238, 0.3);
  }
`;

export default AboutPage;