import React from 'react';
import styled from 'styled-components';
import { Container } from '../components/styled';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
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
            <Title>Política de Privacidade</Title>
            <LastUpdate>Última atualização: Janeiro 2024</LastUpdate>

            <Section>
              <SectionIcon>🔒</SectionIcon>
              <SectionTitle>Seus dados são sagrados</SectionTitle>
              <SectionText>
                Utilizamos criptografia de nível bancário (AES-256) para proteger todas as suas informações. 
                O mesmo padrão usado pelos maiores bancos do mundo.
              </SectionText>
            </Section>

            <Section>
              <SectionIcon>📊</SectionIcon>
              <SectionTitle>Coletamos apenas o essencial</SectionTitle>
              <SectionText>
                Nome, email e dados de pagamento. Nada além disso. 
                Seus textos e ideias permanecem 100% privados e criptografados.
              </SectionText>
            </Section>

            <Section>
              <SectionIcon>🚫</SectionIcon>
              <SectionTitle>Nunca vendemos seus dados</SectionTitle>
              <SectionText>
                Seus dados jamais serão compartilhados, vendidos ou alugados. 
                Nem para anunciantes, nem para terceiros. Nunca.
              </SectionText>
            </Section>

            <Section>
              <SectionIcon>⚙️</SectionIcon>
              <SectionTitle>Você tem controle total</SectionTitle>
              <SectionText>
                Exporte ou delete todos os seus dados a qualquer momento. 
                Sem burocracia, sem questionamentos. É seu direito.
              </SectionText>
            </Section>

            <Section>
              <SectionIcon>🇧🇷</SectionIcon>
              <SectionTitle>Conformidade com LGPD</SectionTitle>
              <SectionText>
                Seguimos rigorosamente a Lei Geral de Proteção de Dados. 
                Transparência e segurança são nossos pilares fundamentais.
              </SectionText>
            </Section>

            <ContactSection>
              <ContactTitle>Dúvidas sobre privacidade?</ContactTitle>
              <ContactText>Entre em contato: privacidade@bookwriter.work</ContactText>
            </ContactSection>
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
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 60px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    padding: 40px 30px;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 10px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const LastUpdate = styled.p`
  text-align: center;
  color: #6c757d;
  margin-bottom: 50px;
`;

const Section = styled.div`
  margin-bottom: 40px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
`;

const SectionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 15px;
`;

const SectionText = styled.p`
  color: #495057;
  line-height: 1.6;
  font-size: 1.1rem;
`;

const ContactSection = styled.div`
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
`;

const ContactTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
`;

const ContactText = styled.p`
  color: #4361ee;
  font-weight: 500;
`;

export default PrivacyPage;