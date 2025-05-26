import React from 'react';
import styled from 'styled-components';
import { Container } from '../components/styled';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
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
            <Title>Termos de Uso</Title>
            <LastUpdate>Vigência: Janeiro 2024</LastUpdate>

            <IntroSection>
              <IntroText>
                Ao utilizar o Book Writer, você concorda com estes termos. 
                Simples assim. Sem letras miúdas, sem pegadinhas.
              </IntroText>
            </IntroSection>

            <Section>
              <SectionNumber>01</SectionNumber>
              <SectionContent>
                <SectionTitle>Propriedade Intelectual</SectionTitle>
                <SectionText>
                  <Strong>100% seu.</Strong> Todo conteúdo que você criar usando nossa plataforma 
                  é de sua propriedade exclusiva. Nós não reivindicamos direitos autorais sobre 
                  seus textos, ideias ou criações. Você mantém todos os direitos, incluindo 
                  publicação, comercialização e distribuição.
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>02</SectionNumber>
              <SectionContent>
                <SectionTitle>Uso Permitido</SectionTitle>
                <SectionText>
                  Nossa tecnologia foi criada para <Strong>empoderar autores legítimos</Strong>. 
                  Use o Book Writer para criar obras originais, educativas e que agreguem valor. 
                  Conteúdo ilegal, ofensivo ou plagiado resultará em suspensão imediata.
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>03</SectionNumber>
              <SectionContent>
                <SectionTitle>Pagamentos e Reembolsos</SectionTitle>
                <SectionText>
                  <Strong>Garantia de 30 dias.</Strong> Não ficou satisfeito? Devolvemos 100% 
                  do valor pago, sem perguntas. Após 30 dias, os pagamentos são finais. 
                  Você pode cancelar sua assinatura a qualquer momento, mantendo acesso até 
                  o fim do período pago.
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>04</SectionNumber>
              <SectionContent>
                <SectionTitle>Limites de Uso</SectionTitle>
                <SectionText>
                  Cada plano tem um limite de créditos mensais. Use com sabedoria. 
                  <Strong> Não há rollover</Strong> - créditos não utilizados expiram ao 
                  final do mês. Upgrades podem ser feitos a qualquer momento com 
                  cobrança proporcional.
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>05</SectionNumber>
              <SectionContent>
                <SectionTitle>Disponibilidade</SectionTitle>
                <SectionText>
                  Trabalhamos para manter <Strong>99.9% de uptime</Strong>. Em raras 
                  manutenções, avisaremos com antecedência. Não nos responsabilizamos 
                  por interrupções causadas por terceiros (AWS, OpenAI, etc).
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>06</SectionNumber>
              <SectionContent>
                <SectionTitle>Privacidade e Segurança</SectionTitle>
                <SectionText>
                  Seus dados são <Strong>criptografados end-to-end</Strong>. Nem nossos 
                  engenheiros conseguem ler seus textos. Cumprimos rigorosamente a LGPD 
                  e você pode solicitar exclusão total a qualquer momento.
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>07</SectionNumber>
              <SectionContent>
                <SectionTitle>Responsabilidades</SectionTitle>
                <SectionText>
                  Fornecemos a ferramenta, <Strong>você cria a magia</Strong>. Não nos 
                  responsabilizamos pelo sucesso comercial dos livros ou por decisões 
                  editoriais. Nossa garantia é de funcionamento da plataforma, não de 
                  resultados específicos.
                </SectionText>
              </SectionContent>
            </Section>

            <Section>
              <SectionNumber>08</SectionNumber>
              <SectionContent>
                <SectionTitle>Alterações nos Termos</SectionTitle>
                <SectionText>
                  Podemos atualizar estes termos. Quando isso acontecer, 
                  <Strong> avisaremos por email</Strong> com 30 dias de antecedência. 
                  Continuar usando após as mudanças significa concordância.
                </SectionText>
              </SectionContent>
            </Section>

            <FinalSection>
              <FinalTitle>Filosofia Book Writer</FinalTitle>
              <FinalText>
                Acreditamos em transparência radical. Sem asteriscos, sem surpresas. 
                Nossa missão é democratizar a escrita profissional, e isso começa 
                com termos que qualquer pessoa possa entender.
              </FinalText>
              <ContactInfo>
                <ContactTitle>Dúvidas?</ContactTitle>
                <ContactEmail>juridico@bookwriter.work</ContactEmail>
              </ContactInfo>
            </FinalSection>

            <Signature>
              <SignatureText>
                Book Writer LTDA<br />
                CNPJ: 00.000.000/0001-00<br />
                São Paulo, Brasil
              </SignatureText>
            </Signature>
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
  font-weight: 500;
`;

const IntroSection = styled.div`
  background: linear-gradient(135deg, #667eea15, #764ba215);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 50px;
  text-align: center;
`;

const IntroText = styled.p`
  font-size: 1.2rem;
  color: #495057;
  line-height: 1.6;
  margin: 0;
`;

const Section = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e9ecef;

  &:last-of-type {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const SectionNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #e9ecef;
  line-height: 1;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SectionContent = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 15px;
`;

const SectionText = styled.p`
  color: #495057;
  line-height: 1.8;
  font-size: 1.1rem;
`;

const Strong = styled.strong`
  color: #4361ee;
  font-weight: 600;
`;

const FinalSection = styled.div`
  background: #f8f9fa;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  margin: 50px 0 40px;
`;

const FinalTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

const FinalText = styled.p`
  font-size: 1.2rem;
  color: #495057;
  line-height: 1.8;
  margin-bottom: 30px;
`;

const ContactInfo = styled.div`
  margin-top: 30px;
`;

const ContactTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
`;

const ContactEmail = styled.p`
  color: #4361ee;
  font-weight: 500;
  font-size: 1.1rem;
`;

const Signature = styled.div`
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
`;

const SignatureText = styled.p`
  color: #6c757d;
  line-height: 1.8;
`;

export default TermsPage;