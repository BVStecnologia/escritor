import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { auth } from '../lib/supabase';

// Define User type manually since it's not exported directly in v2
type User = {
  id: string;
  email?: string;
  app_metadata: any;
  user_metadata: any;
  aud: string;
  created_at: string;
};

// Na versão 2 do Supabase, Session é uma interface diferente
type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: User;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: { user: User | null; session: Session | null };
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: { user: User | null; session: Session | null };
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    const getInitialSession = async () => {
      setIsLoading(true);

      try {
        const { data } = await auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth change listener
    let cleanup = () => {};

    try {
      getInitialSession();

      const { data: authListener } = auth.onAuthStateChange((event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      cleanup = () => {
        try {
          authListener.subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth listener:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up auth context:', error);
      setIsLoading(false);
    }

    // Cleanup subscription on unmount
    return cleanup;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password);
      if (error) {
        return { error };
      }
      return { data, error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signUp(email, password);
      if (error) {
        return { error };
      }
      return { data, error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}