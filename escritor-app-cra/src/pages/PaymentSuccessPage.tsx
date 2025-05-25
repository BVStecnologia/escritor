import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Container } from '../components/styled';
import { toast } from 'react-toastify';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 60px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a202c;
  margin-bottom: 16px;
  font-family: 'Playfair Display', serif;
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: #718096;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #7c3aed;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 20px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorCard = styled(SuccessCard)`
  svg {
    color: #ff6b6b;
  }
`;

// Ícone de check customizado
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PaymentSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkPaymentAndRedirect = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Aguardar um pouco para garantir que o webhook processou o pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // Verificar se o subscription_type foi atualizado
        const { data, error } = await supabase
          .from('User')
          .select('subscription_type')
          .eq('user', user.id)
          .single();

        if (error) throw error;

        if (data && data.subscription_type !== 'free') {
          // Sucesso! Usuário tem assinatura ativa
          toast.success('Assinatura ativada com sucesso!');
          
          // Aguardar um pouco antes de redirecionar
          setTimeout(() => {
            // Se veio de uma tentativa de acesso bloqueado, volta para lá
            const returnUrl = searchParams.get('return_url');
            if (returnUrl) {
              navigate(returnUrl);
            } else {
              navigate('/dashboard');
            }
          }, 3000);
        } else {
          // Ainda não processou, vamos tentar novamente
          let attempts = 0;
          const maxAttempts = 10;
          
          const checkInterval = setInterval(async () => {
            attempts++;
            
            const { data: retryData } = await supabase
              .from('User')
              .select('subscription_type')
              .eq('user', user.id)
              .single();
              
            if (retryData && retryData.subscription_type !== 'free') {
              clearInterval(checkInterval);
              toast.success('Assinatura ativada com sucesso!');
              
              setTimeout(() => {
                const returnUrl = searchParams.get('return_url');
                if (returnUrl) {
                  navigate(returnUrl);
                } else {
                  navigate('/dashboard');
                }
              }, 2000);
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              setError(true);
              setIsChecking(false);
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
        setError(true);
        setIsChecking(false);
      }
    };

    checkPaymentAndRedirect();
  }, [user, navigate, searchParams]);

  if (isChecking) {
    return (
      <PageWrapper>
        <SuccessCard>
          <LoadingSpinner />
          <Title>Processando seu pagamento...</Title>
          <Message>
            Estamos ativando sua assinatura. Isso pode levar alguns segundos.
          </Message>
        </SuccessCard>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorCard>
          <Title>Ops! Algo deu errado</Title>
          <Message>
            Não conseguimos confirmar seu pagamento. Se você foi cobrado, 
            entre em contato com nosso suporte. Caso contrário, tente novamente.
          </Message>
          <button onClick={() => navigate('/pricing')}>
            Voltar para Planos
          </button>
        </ErrorCard>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SuccessCard>
        <SuccessIcon>
          <CheckIcon />
        </SuccessIcon>
        <Title>Pagamento Confirmado!</Title>
        <Message>
          Sua assinatura foi ativada com sucesso. Você será redirecionado em instantes...
        </Message>
      </SuccessCard>
    </PageWrapper>
  );
};

export default PaymentSuccessPage;