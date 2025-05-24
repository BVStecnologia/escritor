import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import SEO from '../components/SEO';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verificar estado de autenticação ao carregar a página
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Função para lidar com o clique no botão de login
  const handleLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      // Se já estiver autenticado, redirecionar para o dashboard
      navigate('/dashboard');
    } else {
      // Se não estiver autenticado, ir para a página de login
      navigate('/login');
    }
  };

  return (
    <PageWrapper>
      <SEO 
        title="Book Writer - Transforme suas ideias em livros profissionais com IA"
        description="Transforme suas ideias em livros profissionais com Book Writer. Plataforma brasileira que usa IA avançada com memória contextual para escrever livros de qualidade."
        canonicalUrl="https://bookwriter.com.br"
      />
      {/* Navigation */}
      <NavBar>
        <Container>
          <NavContent>
            <Logo>Book Writer</Logo>
            <NavButtons>
              {isAuthenticated ? (
                <DashboardButton to="/dashboard">Meu Painel</DashboardButton>
              ) : (
                <>
                  <LoginButton to="/login" onClick={handleLoginClick}>Entrar</LoginButton>
                  <SignupButton to="/signup">Criar Conta</SignupButton>
                </>
              )}
            </NavButtons>
          </NavContent>
        </Container>
      </NavBar>

      {/* Hero Section */}
      <HeroSection>
        <Container>
          <HeroContent>
            <AttentionGrabber>
              ⚡ O Segredo dos Autores que Faturam R$ 10.000+ por Mês na Amazon
            </AttentionGrabber>
            
            <HeroHeadline>
              Transforme Sua Paixão por Escrever em <span>Histórias Profissionais</span> com Book Writer
            </HeroHeadline>
            
            <HeroSubheadline>
              Descubra como autores iniciantes estão publicando livros profissionais em tempo recorde e gerando renda passiva de R$ 3.000 a R$ 50.000 por mês na Amazon KDP
            </HeroSubheadline>

            {/* Vídeo VSL - Opção 1: Vídeo único menor */}
            <VideoWrapper>
              <VideoContainer>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  poster="/videos/video-thumbnail.jpg"
                >
                  <source src="/videos/vsl-dashboard-vendas.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
              </VideoContainer>
              <VideoCaption>
                <PlayIcon>▶️</PlayIcon>
                Veja como nossos autores faturam 5 dígitos por mês
              </VideoCaption>
            </VideoWrapper>

            {/* Alternativa: Se preferir GIF ou imagem estática
            <DemoImageWrapper>
              <img src="/videos/dashboard-demo.gif" alt="Dashboard de vendas" />
              <DemoCaption>Dashboard real de um autor faturando R$ 10.543/mês</DemoCaption>
            </DemoImageWrapper>
            */}

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
              {isAuthenticated ? (
                <CTAButton as={Link} to="/dashboard">
                  ACESSAR MEU PAINEL
                </CTAButton>
              ) : (
                <CTAButton href="#planos">
                  QUERO COMEÇAR A GANHAR AGORA
                </CTAButton>
              )}
              <Guarantee>
                <span>✓</span> Garantia de 30 dias ou seu dinheiro de volta
              </Guarantee>
            </HeroCTA>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* App Showcase Section - Jornada Completa */}
      <AppShowcaseSection>
        <Container>
          <SectionTitle>Veja Como É Fácil Escrever com Bookwriter</SectionTitle>
          
          {/* Step 1: Editor Limpo */}
          <ShowcaseGrid>
            <ShowcaseContent>
              <h3>1. Comece com um <span>Editor Limpo e Intuitivo</span></h3>
              <p>
                Interface profissional sem distrações. Foque apenas no que importa: sua história.
              </p>
              <ul>
                <li>Editor profissional estilo Word</li>
                <li>Salvamento automático em nuvem</li>
                <li>Assistente IA sempre disponível</li>
                <li>Organização por capítulos</li>
              </ul>
            </ShowcaseContent>
            <ShowcaseImage>
              <img src="/Imagens/Captura de Tela 2025-05-24 às 14.57.57.png" alt="Editor limpo do Bookwriter" />
            </ShowcaseImage>
          </ShowcaseGrid>
          
          {/* Step 2: AI Autocomplete */}
          <ShowcaseGrid>
            <ShowcaseImage className="float-animation">
              <img src="/Imagens/Captura de Tela 2025-05-24 às 14.58.30.png" alt="Autocomplete IA em ação" />
            </ShowcaseImage>
            <ShowcaseContent>
              <h3>2. IA Escreve <span>Junto com Você</span></h3>
              <p>
                Nunca mais fique travado! Nossa IA sugere continuações inteligentes em tempo real.
              </p>
              <ul>
                <li>Sugestões contextuais instantâneas</li>
                <li>Mantém seu estilo de escrita</li>
                <li>Acelera sua produção em 10x</li>
                <li>Aprende com suas preferências</li>
              </ul>
            </ShowcaseContent>
          </ShowcaseGrid>
          
          {/* Feature Highlight */}
          <FeatureHighlight>
            <h3>Múltiplas Opções, Você Escolhe!</h3>
            <ShowcaseImage>
              <img src="/Imagens/Captura de Tela 2025-05-24 às 14.59.53.png" alt="Várias sugestões de autocomplete" />
            </ShowcaseImage>
            <p style={{ marginTop: '30px', fontSize: '1.2rem', color: '#6c757d' }}>
              Receba várias sugestões e escolha a que melhor se encaixa na sua narrativa
            </p>
          </FeatureHighlight>
          
          {/* Step 3: Book Customization */}
          <ShowcaseGrid>
            <ShowcaseContent>
              <h3>3. Personalize <span>Capas Profissionais</span></h3>
              <p>
                Crie capas que vendem! Interface simples para personalizar e visualizar em tempo real.
              </p>
              <ul>
                <li>Gerador de capas com IA</li>
                <li>Templates profissionais</li>
                <li>Pré-visualização instantânea</li>
                <li>Export para Amazon KDP</li>
              </ul>
            </ShowcaseContent>
            <ShowcaseImage>
              <img src="/Imagens/Captura de Tela 2025-05-24 às 15.16.14.png" alt="Editor de capas Bookwriter" />
            </ShowcaseImage>
          </ShowcaseGrid>
          
          {/* Step 4: Track Progress */}
          <ShowcaseGrid>
            <ShowcaseImage className="float-animation">
              <img src="/Imagens/Captura de Tela 2025-05-24 às 15.16.32.png" alt="Dashboard de progresso" />
            </ShowcaseImage>
            <ShowcaseContent>
              <h3>4. Acompanhe seu <span>Progresso em Tempo Real</span></h3>
              <p>
                Dashboard motivacional que mostra sua evolução diária e mantém você produtivo.
              </p>
              <ul>
                <li>Contadores de palavras e capítulos</li>
                <li>Metas diárias personalizadas</li>
                <li>Histórico de produção</li>
                <li>Sistema de recompensas</li>
              </ul>
            </ShowcaseContent>
          </ShowcaseGrid>
        </Container>
      </AppShowcaseSection>

      {/* Seção de Problemas/Dores */}
      <PainSection>
        <Container>
          <SectionTitle>Você Se Identifica Com Alguma Dessas Situações?</SectionTitle>
          
          {/* Imagem Antes/Depois */}
          <TransformationImage>
            <img src="/Imagens/OpenAI Playground 2025-05-24 at 14.33.09.png" alt="Transformação de escritor frustrado para autor de sucesso" />
          </TransformationImage>
          
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
          <SectionTitle>Apresentando o Bookwriter</SectionTitle>
          <SectionSubtitle>
            A primeira ferramenta brasileira de IA que entende e mantém o contexto da sua história do início ao fim
          </SectionSubtitle>

          <SolutionGrid>
            <SolutionCard>
              <SolutionIcon>🚀</SolutionIcon>
              <SolutionTitle>Escreva 10x Mais Rápido</SolutionTitle>
              <SolutionText>
                Book Writer gera textos profissionais instantaneamente. Termine capítulos em minutos, não horas.
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
              <SolutionIcon>🧠</SolutionIcon>
              <SolutionTitle>Memória Contextual</SolutionTitle>
              <SolutionText>
                Nossa IA lembra de personagens, tramas e detalhes anteriores, garantindo textos coerentes e consistentes.
              </SolutionText>
            </SolutionCard>
            
            <SolutionCard>
              <SolutionIcon>🖼️</SolutionIcon>
              <SolutionTitle>Geração de Imagens</SolutionTitle>
              <SolutionText>
                Crie capas e ilustrações únicas que combinam perfeitamente com o contexto da sua história.
              </SolutionText>
            </SolutionCard>
          </SolutionGrid>
        </Container>
      </SolutionSection>

      {/* Seção de Resultados */}
      <ResultsSection>
        <Container>
          <SectionTitle>Veja os Resultados de Quem Já Usa</SectionTitle>
          
          {/* Imagem Dashboard com Royalties */}
          <LifestyleImage>
            <img src="/Imagens/OpenAI Playground 2025-05-24 at 14.32.15.png" alt="Dashboard mostrando ganhos de royalties" />
            <ImageCaption>💰 Dashboard real mostrando R$ 10.543 em royalties - nossos autores faturam de verdade!</ImageCaption>
          </LifestyleImage>
          
          {/* Imagem de Lifestyle */}
          <LifestyleImage>
            <img src="/Imagens/OpenAI Playground 2025-05-24 at 14.32.57.png" alt="Autor trabalhando na praia recebendo royalties" />
            <ImageCaption>🏖️ Trabalhe de qualquer lugar enquanto os royalties entram automaticamente</ImageCaption>
          </LifestyleImage>
          
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
          
          {/* Imagem da Coleção de Livros */}
          <BooksShowcase>
            <img src="/Imagens/OpenAI Playground 2025-05-24 at 14.32.35.png" alt="Coleção de livros publicados" />
            <ShowcaseCaption>Alguns dos livros publicados por nossos autores</ShowcaseCaption>
          </BooksShowcase>
        </Container>
      </ResultsSection>

      {/* Seção de Planos e Preços */}
      <PricingSection id="planos">
        <Container>
          <SectionTitle>Escolha Seu Plano e Comece Hoje</SectionTitle>
          <SectionSubtitle>
            Todos os planos incluem acesso completo ao Book Writer e suporte em português
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
                <Feature>✓ Book Writer para escrita</Feature>
                <Feature>✓ 50.000 palavras/mês</Feature>
                <Feature>✓ Editor profissional</Feature>
                <Feature>✓ Corretor ortográfico</Feature>
                <Feature>✓ 1 livro por vez</Feature>
                <Feature>✓ Suporte por email</Feature>
              </PlanFeatures>
              
              <PlanCTA>
                {isAuthenticated ? (
                  <CTAButton as={Link} to="/dashboard">
                    ACESSAR PAINEL
                  </CTAButton>
                ) : (
                  <CTAButton as={Link} to="/signup">
                    COMEÇAR AGORA
                  </CTAButton>
                )}
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
                <Feature>✓ Geração de capas para livros</Feature>
                <Feature>✓ Suporte prioritário</Feature>
              </PlanFeatures>
              
              <PlanCTA>
                {isAuthenticated ? (
                  <CTAButton as={Link} to="/dashboard">
                    ACESSAR PAINEL
                  </CTAButton>
                ) : (
                  <CTAButton as={Link} to="/signup">
                    QUERO SER PROFISSIONAL
                  </CTAButton>
                )}
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
                <Feature>✓ Geração ilimitada de imagens</Feature>
                <Feature>✓ Memória contextual avançada</Feature>
                <Feature>✓ Acesso prioritário a novidades</Feature>
                <Feature>✓ Suporte VIP WhatsApp</Feature>
              </PlanFeatures>
              
              <PlanCTA>
                {isAuthenticated ? (
                  <CTAButton as={Link} to="/dashboard">
                    ACESSAR PAINEL
                  </CTAButton>
                ) : (
                  <CTAButton as={Link} to="/signup">
                    PLANO ILIMITADO
                  </CTAButton>
                )}
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
                Não! O Book Writer escreve por você. Você só precisa ter ideias e revisar o conteúdo gerado.
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
                Sim! Nossa tecnologia cria conteúdo único baseado nas suas instruções. Nunca haverá plágio.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Posso cancelar quando quiser?</FAQQuestion>
              <FAQAnswer>
                Sim, sem multas ou taxas. Cancele com 1 clique direto no painel.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Como funciona a memória contextual?</FAQQuestion>
              <FAQAnswer>
                Nossa tecnologia lembra personagens, tramas e detalhes do seu livro, garantindo que o texto permaneça coerente e consistente do início ao fim.
              </FAQAnswer>
            </FAQItem>
            
            <FAQItem>
              <FAQQuestion>Meus textos estão seguros na plataforma?</FAQQuestion>
              <FAQAnswer>
                Absolutamente! Seu conteúdo é protegido com criptografia e você mantém 100% dos direitos autorais sobre todo material gerado.
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
              Junte-se a centenas de autores que já estão transformando suas ideias em livros publicados e gerando renda passiva na Amazon
            </FinalCTAText>

            {isAuthenticated ? (
              <CTAButtonSpecial as={Link} to="/dashboard">
                ACESSAR MEUS PROJETOS
              </CTAButtonSpecial>
            ) : (
              <CTAButtonSpecial href="#planos">
                COMEÇAR AGORA COM DESCONTO ESPECIAL
              </CTAButtonSpecial>
            )}

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
              <FooterLogo>Book Writer</FooterLogo>
              <FooterText>
                A plataforma definitiva para autores que querem viver de seus livros.
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
              <FooterLink href="mailto:suporte@bookwriter.com">suporte@bookwriter.com</FooterLink>
              <FooterLink href="#">WhatsApp: (11) 99999-9999</FooterLink>
            </FooterColumn>
          </FooterContent>
          
          <FooterBottom>
            <p>© 2024 Book Writer. Todos os direitos reservados.</p>
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

// New components for showcasing the app
const AppShowcaseSection = styled.section`
  padding: 80px 0;
  background: white;
`;

const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin: 60px 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ShowcaseContent = styled.div`
  h3 {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 20px;
    color: #1a1a1a;
    
    span {
      color: #4361ee;
    }
  }
  
  p {
    font-size: 1.2rem;
    line-height: 1.8;
    color: #6c757d;
    margin-bottom: 30px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      padding: 12px 0;
      display: flex;
      align-items: center;
      font-size: 1.1rem;
      color: #495057;
      
      &:before {
        content: "✓";
        background: #28a745;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-weight: bold;
      }
    }
  }
`;

const ShowcaseImage = styled.div`
  position: relative;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(67, 97, 238, 0.1);
  }
  
  &.float-animation {
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
`;

const FeatureHighlight = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #e7f0ff 100%);
  padding: 60px 40px;
  border-radius: 20px;
  text-align: center;
  margin: 60px 0;
  
  h3 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 30px;
    background: linear-gradient(90deg, #4361ee, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

// Hero Section
const HeroSection = styled.section`
  padding: 150px 0 80px;
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
    background: linear-gradient(90deg, #4361ee, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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
    background: linear-gradient(90deg, #4361ee, #3f37c9);
    color: white;
    border: ${props => props.$secondary ? '2px solid #4361ee' : 'none'};
  }

  &:visited, &:active, &:focus {
    color: white;
    text-decoration: none;
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

// Video Components
const VideoWrapper = styled.div`
  margin: 40px auto;
  max-width: 600px; /* Reduzido de 800px para 600px */
  width: 100%;
  
  @media (max-width: 768px) {
    max-width: 100%;
    margin: 30px auto;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(67, 97, 238, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
    border-color: rgba(67, 97, 238, 0.4);
    transform: translateY(-2px);
  }
  
  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain; /* Mudado de cover para contain para não cortar */
    background: #000;
  }
  
  /* Indicador de qualidade HD */
  &::after {
    content: "HD";
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    backdrop-filter: blur(4px);
  }
`;

const VideoCaption = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
`;

const PlayIcon = styled.span`
  font-size: 1.2rem;
  color: #4361ee;
`;

// Image Components
const TransformationImage = styled.div`
  max-width: 800px;
  margin: 0 auto 60px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const LifestyleImage = styled.div`
  max-width: 900px;
  margin: 0 auto 60px;
  text-align: center;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const ImageCaption = styled.p`
  margin-top: 20px;
  font-size: 1.1rem;
  color: #6c757d;
  font-style: italic;
`;

const BooksShowcase = styled.div`
  max-width: 700px;
  margin: 60px auto 0;
  text-align: center;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }
`;

const ShowcaseCaption = styled.p`
  margin-top: 16px;
  font-size: 1rem;
  color: #6c757d;
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
  
  &:hover, &:visited, &:active, &:focus {
    background: #4361ee;
    color: white;
    text-decoration: none;
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

// Navigation Bar Styles
const NavBar = styled.nav`
  background: white;
  padding: 15px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4361ee;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 20px;
`;

const LoginButton = styled(Link)`
  padding: 8px 20px;
  color: #4361ee;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(67, 97, 238, 0.1);
  }
`;

const SignupButton = styled(Link)`
  padding: 8px 20px;
  background: #4361ee;
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;

  &:hover {
    background: #3a56d4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
  }
`;

const DashboardButton = styled(Link)`
  padding: 8px 20px;
  background: #7c3aed;
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;

  &:hover {
    background: #6d28d9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
    color: white;
  }

  &:visited, &:active, &:focus {
    color: white;
    text-decoration: none;
  }
`;

export default LandingPage;