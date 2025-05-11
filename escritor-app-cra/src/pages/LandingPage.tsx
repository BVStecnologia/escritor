import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LandingPage: React.FC = () => {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <HeroContent>
            <AttentionGrabber>
              ⚡ REVELADO: O Segredo dos Autores que Faturam R$ 10.000+ por Mês na Amazon
            </AttentionGrabber>
            
            <HeroHeadline>
              Transforme Sua Paixão por Escrever em um <span>Negócio Lucrativo</span> com IA Claude
            </HeroHeadline>
            
            <HeroSubheadline>
              Descubra como escritores iniciantes estão publicando livros profissionais em tempo recorde e gerando renda passiva de R$ 3.000 a R$ 50.000 por mês na Amazon KDP
            </HeroSubheadline>

            <HeroStats>
              <StatItem>
                <StatNumber>R$ 362,8M</StatNumber>
                <StatLabel>Pagos aos autores KDP em 2024</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>50.000+</StatNumber>
                <StatLabel>Autores brasileiros na Amazon</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>33%</StatNumber>
                <StatLabel>Crescimento do mercado em 2023</StatLabel>
              </StatItem>
            </HeroStats>

            <HeroCTA>
              <CTAButton href="#planos">
                QUERO COMEÇAR A GANHAR AGORA
              </CTAButton>
              <Guarantee>
                <span>✓</span> Garantia de 30 dias ou seu dinheiro de volta
              </Guarantee>
            </HeroCTA>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Seção de Problemas/Dores */}
      <PainSection>
        <Container>
          <SectionTitle>Você Se Identifica Com Alguma Dessas Situações?</SectionTitle>
          
          <PainGrid>
            <PainCard>
              <PainIcon>😰</PainIcon>
              <PainTitle>Bloqueio Criativo Constante</PainTitle>
              <PainText>Fica horas olhando para a tela em branco sem saber o que escrever?</PainText>
            </PainCard>
            
            <PainCard>
              <PainIcon>⏰</PainIcon>
              <PainTitle>Nunca Termina um Livro</PainTitle>
              <PainText>Começa vários projetos mas nunca consegue finalizar nenhum?</PainText>
            </PainCard>
            
            <PainCard>
              <PainIcon>💸</PainIcon>
              <PainTitle>Sem Retorno Financeiro</PainTitle>
              <PainText>Sonha em viver de escrita mas não sabe como monetizar?</PainText>
            </PainCard>
            
            <PainCard>
              <PainIcon>🤔</PainIcon>
              <PainTitle>Medo de Não Ser Bom</PainTitle>
              <PainText>Acha que precisa ser um gênio para publicar na Amazon?</PainText>
            </PainCard>
          </PainGrid>

          <PainCTA>
            <h3>A BOA NOTÍCIA:</h3>
            <p>Todos esses problemas podem ser resolvidos com a ferramenta certa e o método comprovado que vou te mostrar agora...</p>
          </PainCTA>
        </Container>
      </PainSection>

      {/* Seção de Solução */}
      <SolutionSection>
        <Container>
          <SectionTitle>Apresentando o Escritor App</SectionTitle>
          <SectionSubtitle>
            A ferramenta brasileira que usa IA Claude para transformar suas ideias em livros profissionais
          </SectionSubtitle>

          <SolutionGrid>
            <SolutionCard>
              <SolutionIcon>🚀</SolutionIcon>
              <SolutionTitle>Escreva 10x Mais Rápido</SolutionTitle>
              <SolutionText>
                IA Claude gera textos profissionais instantaneamente. Termine capítulos em minutos, não horas.
              </SolutionText>
            </SolutionCard>

            <SolutionCard>
              <SolutionIcon>💎</SolutionIcon>
              <SolutionTitle>Qualidade Profissional</SolutionTitle>
              <SolutionText>
                Correção automática, melhorias de estilo e sugestões que transformam seu texto em obra-prima.
              </SolutionText>
            </SolutionCard>

            <SolutionCard>
              <SolutionIcon>📈</SolutionIcon>
              <SolutionTitle>Otimizado para Amazon</SolutionTitle>
              <SolutionText>
                Textos formatados e estruturados para maximizar suas vendas na plataforma KDP.
              </SolutionText>
            </SolutionCard>

            <SolutionCard>
              <SolutionIcon>🎯</SolutionIcon>
              <SolutionTitle>Publicação Simplificada</SolutionTitle>
              <SolutionText>
                Guias passo a passo para publicar seus livros e começar a vender imediatamente.
              </SolutionText>
            </SolutionCard>
          </SolutionGrid>
        </Container>
      </SolutionSection>

      {/* Seção de Resultados */}
      <ResultsSection>
        <Container>
          <SectionTitle>Veja os Resultados de Quem Já Usa</SectionTitle>
          
          <ResultsGrid>
            <ResultCard>
              <ResultContent>
                <ResultQuote>"Em 3 meses publiquei 5 livros. O primeiro já me rende R$ 2.000 por mês no piloto automático!"</ResultQuote>
                <ResultAuthor>
                  <ResultName>Maria Santos</ResultName>
                  <ResultIncome>R$ 8.432/mês</ResultIncome>
                  <ResultBooks>Romance • 5 livros publicados</ResultBooks>
                </ResultAuthor>
              </ResultContent>
            </ResultCard>

            <ResultCard>
              <ResultContent>
                <ResultQuote>"Saí do zero para 6 dígitos em menos de 6 meses. A IA escreve melhor que muitos ghostwriters!"</ResultQuote>
                <ResultAuthor>
                  <ResultName>Roberto Lima</ResultName>
                  <ResultIncome>R$ 15.790/mês</ResultIncome>
                  <ResultBooks>Não-ficção • 8 livros publicados</ResultBooks>
                </ResultAuthor>
              </ResultContent>
            </ResultCard>

            <ResultCard>
              <ResultContent>
                <ResultQuote>"Larguei meu emprego CLT. Hoje vivo exclusivamente dos meus livros na Amazon. Melhor decisão!"</ResultQuote>
                <ResultAuthor>
                  <ResultName>Ana Paula</ResultName>
                  <ResultIncome>R$ 24.300/mês</ResultIncome>
                  <ResultBooks>Autoajuda • 12 livros publicados</ResultBooks>
                </ResultAuthor>
              </ResultContent>
            </ResultCard>
          </ResultsGrid>

          <IncomeCalculator>
            <h3>Calcule Seu Potencial de Ganhos</h3>
            <CalculatorGrid>
              <CalculatorItem>
                <span>1 livro vendendo 50 cópias/mês:</span>
                <strong>R$ 1.750/mês</strong>
              </CalculatorItem>
              <CalculatorItem>
                <span>3 livros vendendo 50 cópias/mês:</span>
                <strong>R$ 5.250/mês</strong>
              </CalculatorItem>
              <CalculatorItem>
                <span>10 livros vendendo 50 cópias/mês:</span>
                <strong>R$ 17.500/mês</strong>
              </CalculatorItem>
            </CalculatorGrid>
            <small>*Baseado no preço médio de R$ 35 por livro com 70% de royalties</small>
          </IncomeCalculator>
        </Container>
      </ResultsSection>

      {/* Seção de Planos e Preços */}
      <PricingSection id="planos">
        <Container>
          <SectionTitle>Escolha Seu Plano e Comece Hoje</SectionTitle>
          <SectionSubtitle>
            Todos os planos incluem acesso completo à IA Claude e suporte em português
          </SectionSubtitle>

          <PricingGrid>
            <PricingCard>
              <PricingHeader>
                <PlanName>Iniciante</PlanName>
                <PlanPrice>
                  <Currency>R$</Currency>
                  <Price>49,90</Price>
                  <Period>/mês</Period>
                </PlanPrice>
              </PricingHeader>
              
              <PlanFeatures>
                <Feature>✓ IA Claude para escrita</Feature>
                <Feature>✓ 50.000 palavras/mês</Feature>
                <Feature>✓ Editor profissional</Feature>
                <Feature>✓ Corretor ortográfico</Feature>
                <Feature>✓ 1 livro por vez</Feature>
                <Feature>✓ Suporte por email</Feature>
              </PlanFeatures>
              
              <PlanCTA>
                <CTAButton $secondary>
                  COMEÇAR AGORA
                </CTAButton>
              </PlanCTA>
            </PricingCard>

            <PricingCard $featured>
              <PopularBadge>MAIS POPULAR</PopularBadge>
              <PricingHeader>
                <PlanName>Profissional</PlanName>
                <PlanPrice>
                  <Currency>R$</Currency>
                  <Price>79,90</Price>
                  <Period>/mês</Period>
                </PlanPrice>
              </PricingHeader>
              
              <PlanFeatures>
                <Feature>✓ Tudo do plano Iniciante</Feature>
                <Feature>✓ 100.000 palavras/mês</Feature>
                <Feature>✓ Múltiplos livros simultâneos</Feature>
                <Feature>✓ Melhorias de estilo avançadas</Feature>
                <Feature>✓ Ideias criativas ilimitadas</Feature>
                <Feature>✓ Suporte prioritário</Feature>
              </PlanFeatures>
              
              <PlanCTA>
                <CTAButton>
                  QUERO SER PROFISSIONAL
                </CTAButton>
              </PlanCTA>
            </PricingCard>

            <PricingCard>
              <PricingHeader>
                <PlanName>Ilimitado</PlanName>
                <PlanPrice>
                  <Currency>R$</Currency>
                  <Price>119,90</Price>
                  <Period>/mês</Period>
                </PlanPrice>
              </PricingHeader>
              
              <PlanFeatures>
                <Feature>✓ Tudo do Profissional</Feature>
                <Feature>✓ 200.000 palavras/mês</Feature>
                <Feature>✓ Livros ilimitados</Feature>
                <Feature>✓ Velocidade máxima de geração</Feature>
                <Feature>✓ Acesso prioritário a novidades</Feature>
                <Feature>✓ Suporte VIP WhatsApp</Feature>
              </PlanFeatures>
              
              <PlanCTA>
                <CTAButton $secondary>
                  PLANO ILIMITADO
                </CTAButton>
              </PlanCTA>
            </PricingCard>
          </PricingGrid>

          <MoneyBackGuarantee>
            <GuaranteeIcon>🛡️</GuaranteeIcon>
            <GuaranteeContent>
              <h3>Garantia Incondicional de 30 Dias</h3>
              <p>Se não ficar 100% satisfeito, devolvemos todo seu dinheiro. Sem perguntas, sem burocracia.</p>
            </GuaranteeContent>
          </MoneyBackGuarantee>
        </Container>
      </PricingSection>

      {/* Seção de FAQ */}
      <FAQSection>
        <Container>
          <SectionTitle>Perguntas Frequentes</SectionTitle>
          
          <FAQGrid>
            <FAQItem>
              <FAQQuestion>Preciso saber escrever bem para usar?</FAQQuestion>
              <FAQAnswer>
                Não! A IA Claude escreve por você. Você só precisa ter ideias e revisar o conteúdo gerado.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Quanto tempo leva para publicar meu primeiro livro?</FAQQuestion>
              <FAQAnswer>
                Com dedicação de 1-2 horas por dia, você pode ter seu primeiro livro pronto em 7-14 dias.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Os livros gerados são 100% originais?</FAQQuestion>
              <FAQAnswer>
                Sim! A IA cria conteúdo único baseado nas suas instruções. Nunca haverá plágio.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Posso cancelar quando quiser?</FAQQuestion>
              <FAQAnswer>
                Sim, sem multas ou taxas. Cancele com 1 clique direto no painel.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Funciona para qualquer gênero literário?</FAQQuestion>
              <FAQAnswer>
                Sim! Romance, ficção, não-ficção, autoajuda, infantil, técnico... Qualquer gênero!
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>E se eu não gostar?</FAQQuestion>
              <FAQAnswer>
                Garantia de 30 dias. Se não ficar satisfeito, devolvemos 100% do seu dinheiro.
              </FAQAnswer>
            </FAQItem>
          </FAQGrid>
        </Container>
      </FAQSection>

      {/* CTA Final */}
      <FinalCTASection>
        <Container>
          <FinalCTAContent>
            <FinalCTATitle>
              Comece Sua Jornada Como Autor de Sucesso
            </FinalCTATitle>
            
            <FinalCTAText>
              Junte-se a centenas de escritores que já estão transformando suas ideias em livros publicados e gerando renda passiva na Amazon
            </FinalCTAText>

            <CTAButtonSpecial href="#planos">
              COMEÇAR AGORA COM DESCONTO ESPECIAL
            </CTAButtonSpecial>

            <FinalGuarantee>
              <FinalGuaranteeItem>
                <CheckIcon>✓</CheckIcon>
                Acesso imediato à plataforma
              </FinalGuaranteeItem>
              <FinalGuaranteeItem>
                <CheckIcon>✓</CheckIcon>
                Garantia de 30 dias
              </FinalGuaranteeItem>
              <FinalGuaranteeItem>
                <CheckIcon>✓</CheckIcon>
                Suporte completo em português
              </FinalGuaranteeItem>
            </FinalGuarantee>
          </FinalCTAContent>
        </Container>
      </FinalCTASection>

      {/* Footer */}
      <Footer>
        <Container>
          <FooterContent>
            <FooterColumn>
              <FooterLogo>Escritor App</FooterLogo>
              <FooterText>
                A plataforma definitiva para escritores que querem viver de seus livros.
              </FooterText>
            </FooterColumn>
            
            <FooterColumn>
              <FooterTitle>Links Úteis</FooterTitle>
              <FooterLink href="#">Termos de Uso</FooterLink>
              <FooterLink href="#">Política de Privacidade</FooterLink>
              <FooterLink href="#">Suporte</FooterLink>
              <FooterLink href="#">Contato</FooterLink>
            </FooterColumn>
            
            <FooterColumn>
              <FooterTitle>Contato</FooterTitle>
              <FooterLink href="mailto:suporte@escritorapp.com">suporte@escritorapp.com</FooterLink>
              <FooterLink href="#">WhatsApp: (11) 99999-9999</FooterLink>
            </FooterColumn>
          </FooterContent>
          
          <FooterBottom>
            <p>© 2024 Escritor App. Todos os direitos reservados.</p>
            <PaymentBadge>
              <span>🔒 Pagamento 100% seguro</span>
            </PaymentBadge>
          </FooterBottom>
        </Container>
      </Footer>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

// Hero Section
const HeroSection = styled.section`
  padding: 100px 0 80px;
  background: linear-gradient(135deg, #f8fafc 0%, #e7f0ff 100%);
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const AttentionGrabber = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  font-weight: 600;
  display: inline-block;
`;

const HeroHeadline = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1a1a1a;
  
  span {
    color: #4361ee;
    display: block;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubheadline = styled.p`
  font-size: 1.25rem;
  color: #6c757d;
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 50px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #4361ee;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const HeroCTA = styled.div`
  margin-bottom: 20px;
`;

const CTAButton = styled.a<{ $secondary?: boolean }>`
  display: inline-block;
  background: ${props => props.$secondary ? 'white' : 'linear-gradient(90deg, #4361ee, #3f37c9)'};
  color: ${props => props.$secondary ? '#4361ee' : 'white'};
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(67, 97, 238, 0.3);
  transition: all 0.3s ease;
  border: ${props => props.$secondary ? '2px solid #4361ee' : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
  }
`;

const Guarantee = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  font-size: 1rem;
  color: #28a745;
  
  span {
    background: #28a745;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
`;

// Pain Section
const PainSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 40px;
  color: #1a1a1a;
`;

const PainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-bottom: 60px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PainCard = styled.div`
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
`;

const PainIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 15px;
`;

const PainTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #1a1a1a;
`;

const PainText = styled.p`
  color: #6c757d;
  line-height: 1.5;
`;

const PainCTA = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  
  h3 {
    font-size: 1.8rem;
    color: #28a745;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 1.2rem;
    color: #6c757d;
    line-height: 1.6;
  }
`;

// Solution Section
const SolutionSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(135deg, #f8f9ff 0%, #e7f0ff 100%);
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  text-align: center;
  color: #6c757d;
  max-width: 800px;
  margin: 0 auto 60px;
  line-height: 1.6;
`;

const SolutionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SolutionCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
`;

const SolutionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const SolutionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #1a1a1a;
`;

const SolutionText = styled.p`
  color: #6c757d;
  line-height: 1.6;
`;

// Results Section
const ResultsSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 60px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const ResultContent = styled.div`
  text-align: center;
`;

const ResultQuote = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #495057;
  font-style: italic;
  margin-bottom: 20px;
  
  &:before {
    content: """;
    font-size: 2rem;
    color: #4361ee;
    opacity: 0.5;
  }
`;

const ResultAuthor = styled.div`
  text-align: center;
`;

const ResultName = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #1a1a1a;
`;

const ResultIncome = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #28a745;
  margin-bottom: 10px;
`;

const ResultBooks = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const IncomeCalculator = styled.div`
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  
  h3 {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
  
  small {
    display: block;
    margin-top: 20px;
    color: #6c757d;
  }
`;

const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CalculatorItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  
  span {
    display: block;
    color: #6c757d;
    margin-bottom: 10px;
  }
  
  strong {
    display: block;
    font-size: 1.5rem;
    color: #28a745;
  }
`;

// Pricing Section
const PricingSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(135deg, #f8f9ff 0%, #e7f0ff 100%);
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 60px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PricingCard = styled.div<{ $featured?: boolean }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: ${props => props.$featured ? '0 8px 30px rgba(67, 97, 238, 0.3)' : '0 4px 12px rgba(0,0,0,0.05)'};
  transform: ${props => props.$featured ? 'scale(1.05)' : 'scale(1)'};
  
  ${props => props.$featured && `
    border: 2px solid #4361ee;
  `}
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #ff0a54;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
`;

const PricingHeader = styled.div`
  padding: 40px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a1a1a;
`;

const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 10px;
`;

const Currency = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4361ee;
  margin-right: 5px;
`;

const Price = styled.span`
  font-size: 3.5rem;
  font-weight: 800;
  color: #4361ee;
`;

const Period = styled.span`
  font-size: 1rem;
  color: #6c757d;
  margin-left: 5px;
`;

const PlanFeatures = styled.ul`
  padding: 40px;
  list-style: none;
`;

const Feature = styled.li`
  padding: 10px 0;
  color: #495057;
  display: flex;
  align-items: center;
  
  &:before {
    content: "✓";
    color: #28a745;
    font-weight: 700;
    margin-right: 10px;
  }
`;

const PlanCTA = styled.div`
  padding: 0 40px 40px;
  text-align: center;
  
  a {
    width: 100%;
  }
`;

const MoneyBackGuarantee = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const GuaranteeIcon = styled.div`
  font-size: 4rem;
`;

const GuaranteeContent = styled.div`
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c757d;
    line-height: 1.6;
  }
`;

// FAQ Section
const FAQSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FAQItem = styled.div`
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
`;

const FAQQuestion = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #1a1a1a;
`;

const FAQAnswer = styled.p`
  color: #6c757d;
  line-height: 1.6;
`;

// Final CTA Section
const FinalCTASection = styled.section`
  padding: 100px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const FinalCTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FinalCTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const FinalCTAText = styled.p`
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.95;
  line-height: 1.6;
`;

const CTAButtonSpecial = styled.a`
  display: inline-block;
  background: white;
  color: #4361ee;
  padding: 18px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 30px rgba(0,0,0,0.2);
  }
`;

const FinalGuarantee = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const FinalGuaranteeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  opacity: 0.95;
`;

const CheckIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
`;

// Footer
const Footer = styled.footer`
  background: #1a1a1a;
  color: white;
  padding: 60px 0 20px;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FooterColumn = styled.div``;

const FooterLogo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
`;

const FooterText = styled.p`
  color: #adb5bd;
  line-height: 1.6;
`;

const FooterTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const FooterLink = styled.a`
  display: block;
  color: #adb5bd;
  text-decoration: none;
  padding: 5px 0;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #343a40;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  
  p {
    margin: 0;
    color: #adb5bd;
  }
`;

const PaymentBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: #28a745;
    font-weight: 500;
  }
`;

export default LandingPage;