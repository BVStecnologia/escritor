import React from 'react';
import { Navigate } from 'react-router-dom';
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

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  redirectPath = '/login'
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <LoadingWrapper>
        <Spinner />
      </LoadingWrapper>
    );
  }

  // Verificação de autenticação mais rigorosa
  if (!user) {
    console.warn('Acesso não autorizado: usuário não autenticado');
    return <Navigate to={redirectPath} replace />;
  }

  // Verificação de sessão opcional para segurança adicional
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      console.warn('Acesso não autorizado: sessão inválida');
      return false;
    }
    return true;
  };

  // Não bloqueia o render, apenas registra a verificação
  checkSession();
  
  return <>{children}</>;
};

export default ProtectedRoute;