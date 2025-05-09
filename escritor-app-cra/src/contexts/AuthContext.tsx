import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  isAuthenticated: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkUser = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        console.log('Estado de autenticação inicial:', isAuth);

        if (isAuth) {
          const currentUser = await authService.getCurrentUser();
          console.log('Usuário atual:', currentUser?.id);
          setUser(currentUser);
        } else {
          console.log('Nenhum usuário autenticado');
          setUser(null);
          // Se encontrou uma sessão inválida, fazer logout para limpar
          await authService.signOut();
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Configurar listener para alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Evento de autenticação:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuário logado:', session.user.id);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuário deslogado');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token atualizado');
          if (session?.user) {
            setUser(session.user);
          }
        }
      }
    );

    checkUser();

    // Cleanup do listener ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { session, user } = await authService.signIn({ email, password });
      if (user) setUser(user);
      return;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { user } = await authService.signUp({ email, password, name });
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      return await authService.updatePassword(password);
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = async () => {
    return await authService.isAuthenticated();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};