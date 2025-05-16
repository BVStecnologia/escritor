import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // O Supabase já processa o hash da URL automaticamente
    // O AuthContext será atualizado pelo listener de onAuthStateChange
    if (!authLoading) {
      if (user) {
        toast.success('Login com Google realizado com sucesso!');
        setLoading(false);
        navigate('/dashboard');
      } else {
        toast.error('Falha na autenticação com Google. Tente novamente.');
        setLoading(false);
        navigate('/login');
      }
    }
    // eslint-disable-next-line
  }, [user, authLoading]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading ? <p>Processando autenticação...</p> : <p>Redirecionando...</p>}
    </div>
  );
};

export default AuthCallback; 