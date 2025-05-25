import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container } from '../components/styled';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-toastify';

// Ícones customizados como componentes
const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
  </svg>
);

const QuestionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
  </svg>
);

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  savings: number;
  savingsPercent: number;
  popular?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 49.90,
    credits: 3000,
    savings: 10.10,
    savingsPercent: 17,
    features: [
      '3.000 créditos por mês',
      'Ideal para ~50 páginas completas/mês',
      'Ou ~500 autocompletions/mês',
      'Acesso a todas as ferramentas de IA',
      'Suporte via email',
      'Cancele quando quiser'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79.90,
    credits: 5000,
    savings: 20.10,
    savingsPercent: 20,
    popular: true,
    features: [
      '5.000 créditos por mês',
      'Ideal para ~83 páginas completas/mês',
      'Ou ~833 autocompletions/mês',
      'Acesso a todas as ferramentas de IA',
      'Suporte prioritário',
      'Exportação em múltiplos formatos',
      'Cancele quando quiser'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 119.90,
    credits: 8000,
    savings: 40.10,
    savingsPercent: 25,
    features: [
      '8.000 créditos por mês',
      'Ideal para ~133 páginas completas/mês',
      'Ou ~1.333 autocompletions/mês',
      'Acesso a todas as ferramentas de IA',
      'Suporte VIP 24/7',
      'Exportação em múltiplos formatos',
      'Acesso prioritário a novas features',
      'Cancele quando quiser'
    ]
  }
];

const operationCosts = [
  { name: 'Autocomplete', credits: 6, price: 0.06 },
  { name: 'Página completa', credits: 60, price: 0.60 },
  { name: 'Assistente escrita', credits: 20, price: 0.20 },
  { name: 'Ideias criativas', credits: 12, price: 0.12 },
  { name: 'Busca', credits: 8, price: 0.08 },
  { name: 'Personalizado', credits: 40, price: 0.40 },
  { name: 'Imagem alta qualidade', credits: 160, price: 1.60 },
  { name: 'Imagem média', credits: 100, price: 1.00 },
  { name: 'Imagem baixa', credits: 60, price: 0.60 }
];

const PageWrapper = styled.div<{ $hasTestBanner?: boolean }>`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: ${props => props.$hasTestBanner ? '120px 0 40px' : '80px 0 40px'};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 16px;
  font-family: 'Playfair Display', serif;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
`;

const CurrentBalance = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 15px;
  
  svg {
    color: #7c3aed;
    font-size: 24px;
  }
`;

const BalanceText = styled.div`
  font-size: 1.1rem;
  color: #4a5568;
  
  strong {
    color: #7c3aed;
    font-size: 1.5rem;
    margin-left: 8px;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PlanCard = styled.div<{ $popular?: boolean }>`
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$popular 
    ? '0 20px 40px rgba(124, 58, 237, 0.15)' 
    : '0 10px 25px rgba(0, 0, 0, 0.08)'};
  border: ${props => props.$popular ? '2px solid #7c3aed' : '2px solid transparent'};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${props => props.$popular 
      ? '0 25px 50px rgba(124, 58, 237, 0.2)' 
      : '0 15px 35px rgba(0, 0, 0, 0.12)'};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -15px;
  right: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const PlanName = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
`;

const PlanPrice = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 4px;
  
  span {
    font-size: 1.25rem;
    font-weight: 400;
    color: #718096;
  }
`;

const PlanPeriod = styled.div`
  font-size: 1rem;
  color: #718096;
  margin-bottom: 8px;
`;

const Credits = styled.div`
  font-size: 1.25rem;
  color: #7c3aed;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Savings = styled.div`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  margin-bottom: 30px;
  text-align: center;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  color: #4a5568;
  
  svg {
    color: #48bb78;
    flex-shrink: 0;
  }
`;

const CTAButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
    }
  ` : `
    background: #f7fafc;
    color: #4a5568;
    border: 2px solid #e2e8f0;
    
    &:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }
  `}
`;

const CalculatorSection = styled.section`
  max-width: 1200px;
  margin: 80px auto 0;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 30px;
  text-align: center;
`;

const OperationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const OperationCard = styled.div`
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #7c3aed;
    transform: translateY(-2px);
  }
`;

const OperationName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const OperationCost = styled.div`
  color: #718096;
  font-size: 0.875rem;
  
  strong {
    color: #7c3aed;
    font-size: 1rem;
  }
`;

const EstimatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const EstimateCard = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
`;

const EstimatePlan = styled.h5`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const EstimateValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
`;

const EstimateLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const BlockedAlert = styled.div`
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  margin-bottom: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: 700;
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.95;
  }
`;

const TestModeBanner = styled.div`
  background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(255, 152, 0, 0.3);
`;

const FAQSection = styled.section`
  max-width: 800px;
  margin: 80px auto 0;
`;

const FAQItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const FAQQuestion = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #7c3aed;
  }
`;

const FAQAnswer = styled.p`
  color: #718096;
  line-height: 1.6;
`;

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userCredits, setUserCredits] = useState<number>(0);
  const [selectedOperation, setSelectedOperation] = useState<string>('Página completa');
  const [subscriptionType, setSubscriptionType] = useState<string>('free');
  
  const isBlocked = location.state?.blocked === true;
  
  // Detectar modo de pagamento automaticamente
  const getPaymentMode = () => {
    // Em desenvolvimento sempre usa test
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return 'test';
    }
    
    // Em produção usa live
    return 'live';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('User')
            .select('credits_balance, subscription_type')
            .eq('user', user.id)
            .single();
            
          if (data) {
            setUserCredits(data.credits_balance || 0);
            setSubscriptionType(data.subscription_type || 'free');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      toast.info('Redirecionando para o checkout...');
      
      const { data, error } = await supabase.functions.invoke('checkoutstripe', {
        body: {
          plan_type: planId,
          mode: getPaymentMode()
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    }
  };

  const calculateOperations = (credits: number) => {
    const operation = operationCosts.find(op => op.name === selectedOperation) || operationCosts[1];
    return Math.floor(credits / operation.credits);
  };

  return (
    <>
      {getPaymentMode() === 'test' && (
        <TestModeBanner>
          🚧 Modo de Teste - Os pagamentos não serão processados de verdade
        </TestModeBanner>
      )}
      <PageWrapper $hasTestBanner={getPaymentMode() === 'test'}>
        <Container>
        <Header>
          <Title>Escolha sua Assinatura</Title>
          <Subtitle>
            Assine agora e receba créditos mensais para transformar suas ideias em histórias incríveis
          </Subtitle>
          
          {isBlocked && (
            <BlockedAlert>
              <h3>Acesso Bloqueado</h3>
              <p>Você precisa de uma assinatura ativa para acessar o editor. Escolha um plano abaixo para continuar.</p>
            </BlockedAlert>
          )}
          
          {user && subscriptionType !== 'free' && (
            <CurrentBalance>
              <LightningIcon />
              <BalanceText>
                Saldo atual: <strong>{userCredits.toLocaleString('pt-BR')} créditos</strong>
              </BalanceText>
            </CurrentBalance>
          )}
        </Header>

        <PlansGrid>
          {plans.map(plan => (
            <PlanCard key={plan.id} $popular={plan.popular}>
              {plan.popular && <PopularBadge>Mais Popular</PopularBadge>}
              
              <PlanName>{plan.name}</PlanName>
              <PlanPrice>
                R$ {plan.price.toFixed(2).replace('.', ',')}
              </PlanPrice>
              <PlanPeriod>por mês</PlanPeriod>
              <Credits>{plan.credits.toLocaleString('pt-BR')} créditos/mês</Credits>
              
              <Savings>
                Economia de R$ {plan.savings.toFixed(2).replace('.', ',')} ({plan.savingsPercent}%)
              </Savings>
              
              <FeaturesList>
                {plan.features.map((feature, index) => (
                  <Feature key={index}>
                    <CheckIcon />
                    {feature}
                  </Feature>
                ))}
              </FeaturesList>
              
              <CTAButton 
                $primary={plan.popular}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.popular ? 'Assinar Agora' : 'Escolher Este Plano'}
              </CTAButton>
            </PlanCard>
          ))}
        </PlansGrid>

        <CalculatorSection>
          <SectionTitle>Custos por Operação</SectionTitle>
          
          <OperationsGrid>
            {operationCosts.map(operation => (
              <OperationCard 
                key={operation.name}
                onClick={() => setSelectedOperation(operation.name)}
                style={{ 
                  borderColor: selectedOperation === operation.name ? '#7c3aed' : '#e2e8f0',
                  background: selectedOperation === operation.name ? '#f9f5ff' : '#f7fafc'
                }}
              >
                <OperationName>{operation.name}</OperationName>
                <OperationCost>
                  <strong>{operation.credits} créditos</strong> ≈ R$ {operation.price.toFixed(2).replace('.', ',')}
                </OperationCost>
              </OperationCard>
            ))}
          </OperationsGrid>
          
          <SectionTitle>Estimativa de Uso</SectionTitle>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '20px' }}>
            Quantas operações "{selectedOperation}" você pode fazer com cada plano:
          </p>
          
          <EstimatesGrid>
            {plans.map(plan => (
              <EstimateCard key={plan.id}>
                <EstimatePlan>Plano {plan.name}</EstimatePlan>
                <EstimateValue>{calculateOperations(plan.credits).toLocaleString('pt-BR')}</EstimateValue>
                <EstimateLabel>operações</EstimateLabel>
              </EstimateCard>
            ))}
          </EstimatesGrid>
        </CalculatorSection>

        <FAQSection>
          <SectionTitle>Perguntas Frequentes</SectionTitle>
          
          <FAQItem>
            <FAQQuestion>
              <QuestionIcon />
              Como funcionam os créditos?
            </FAQQuestion>
            <FAQAnswer>
              Cada operação de IA consome uma quantidade específica de créditos. 
              Por exemplo, gerar uma página completa consome 60 créditos, enquanto 
              o autocomplete usa apenas 6. Seus créditos são renovados automaticamente 
              todo mês de acordo com seu plano.
            </FAQAnswer>
          </FAQItem>
          
          <FAQItem>
            <FAQQuestion>
              <QuestionIcon />
              Posso trocar de plano depois?
            </FAQQuestion>
            <FAQAnswer>
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
              As mudanças entram em vigor no próximo ciclo de cobrança. Você também pode 
              cancelar sua assinatura quando quiser.
            </FAQAnswer>
          </FAQItem>
          
          <FAQItem>
            <FAQQuestion>
              <QuestionIcon />
              Os créditos expiram?
            </FAQQuestion>
            <FAQAnswer>
              Seus créditos são renovados mensalmente. Os créditos não utilizados em um mês 
              não são acumulados para o próximo. Por isso, escolha o plano que melhor se 
              adequa ao seu ritmo de escrita.
            </FAQAnswer>
          </FAQItem>
          
          <FAQItem>
            <FAQQuestion>
              <QuestionIcon />
              Como funciona o pagamento?
            </FAQQuestion>
            <FAQAnswer>
              Utilizamos o Stripe para processar pagamentos com segurança. Aceitamos 
              cartões de crédito, débito e PIX. Sua assinatura é renovada automaticamente 
              todo mês e seus créditos são recarregados instantaneamente.
            </FAQAnswer>
          </FAQItem>
          
          <FAQItem>
            <FAQQuestion>
              <QuestionIcon />
              Posso cancelar minha assinatura?
            </FAQQuestion>
            <FAQAnswer>
              Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas. 
              Você continuará tendo acesso aos seus créditos até o final do período já pago. 
              Após o cancelamento, você pode reativar quando quiser.
            </FAQAnswer>
          </FAQItem>
        </FAQSection>
      </Container>
    </PageWrapper>
    </>
  );
};

export default PricingPage;