import { supabase } from './supabaseClient';

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Cadastrar um novo usuário
   */
  async signUp({ email, password, name }: SignUpCredentials) {
    try {
      console.log('Iniciando cadastro de usuário:', email);

      // Prosseguir com o cadastro
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Importante: Garantir que o email seja verificado (ou mudar nas configurações)
          emailRedirectTo: window.location.origin + '/login',
        }
      });

      if (error) {
        console.error('Erro no signUp do Supabase:', error);
        throw error;
      }

      console.log('Resultado do cadastro:', data);

      // Verificar se o usuário foi realmente criado
      if (!data.user || !data.user.id) {
        throw new Error('Falha ao criar usuário. Por favor, tente novamente.');
      }

      // Se o usuário não precisa de verificação (confirmed_at já existe),
      // realizar login automático
      if (data.user.confirmed_at) {
        console.log('Usuário criado e já confirmado, realizando login automático');
        // A sessão já deve estar criada pelo próprio processo de signup
      }

      return data;
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      throw error;
    }
  },

  /**
   * Fazer login com um usuário existente
   */
  async signIn({ email, password }: LoginCredentials) {
    try {
      console.log('Tentando login com:', email);

      // Verificar se o usuário existe no Supabase
      const { data: existingSessionData } = await supabase.auth.getSession();
      if (existingSessionData.session) {
        // Já existe uma sessão ativa
        console.log('Sessão já existe:', existingSessionData.session);
        await supabase.auth.signOut(); // Deslogar primeiro para evitar conflitos
      }

      // Fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro de autenticação do Supabase:', error);
        throw error;
      }

      // Verificar se a sessão foi realmente criada
      if (!data.session) {
        console.error('Login falhou: nenhuma sessão criada');
        throw new Error('Falha na autenticação. Tente novamente mais tarde.');
      }

      console.log('Login bem-sucedido:', data.user?.id);
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  /**
   * Fazer logout do usuário atual
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  /**
   * Obter o usuário logado atualmente
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  },

  /**
   * Recuperar senha
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      throw error;
    }
  },

  /**
   * Atualizar senha do usuário logado
   */
  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  },

  /**
   * Verificar se o usuário está autenticado
   */
  async isAuthenticated() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!session) {
        console.log('Sem sessão ativa');
        return false;
      }

      // Verificar se a sessão é válida
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Sessão inválida - sem usuário');
        return false;
      }

      console.log('Autenticado como:', user.id);
      return true;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }
};