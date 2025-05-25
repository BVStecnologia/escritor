import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: ${({ theme }) => theme.colors.background.gradient};
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

interface SubscriptionRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  allowedTypes?: string[];
}

interface UserData {
  subscription_type: string;
  credits_balance: number;
}

const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ 
  children,
  requireSubscription = true,
  allowedTypes = ['basic', 'pro', 'premium']
}) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('User')
          .select('subscription_type, credits_balance')
          .eq('user', user.id)
          .single();

        if (error) throw error;
        
        setUserData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Configurar listener para mudanças em tempo real
    const subscription = supabase
      .channel('user_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `user=eq.${user?.id}`
        },
        (payload) => {
          console.log('Subscription atualizada:', payload.new);
          setUserData({
            subscription_type: payload.new.subscription_type,
            credits_balance: payload.new.credits_balance
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <LoadingWrapper>
        <Spinner />
      </LoadingWrapper>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requer assinatura e usuário é free, redireciona para página de planos
  if (requireSubscription && userData?.subscription_type === 'free') {
    return <Navigate to="/pricing" state={{ blocked: true, from: location }} replace />;
  }

  // Se tem tipo de assinatura específico permitido
  if (allowedTypes.length > 0 && userData && !allowedTypes.includes(userData.subscription_type)) {
    return <Navigate to="/pricing" state={{ upgrade: true, from: location }} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRoute;