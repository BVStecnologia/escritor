import { supabase } from './supabaseClient';
import { toast } from 'react-toastify';

// Interface para a resposta do token do Google OAuth
interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

// Interface para a resposta do Google One Tap Sign-In
interface GoogleCredentialResponse {
  clientId: string;
  credential: string;  // Este é o JWT (token ID) 
  select_by: string;
}

// Declaração para TypeScript reconhecer a API do Google
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            [key: string]: any;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: GoogleTokenResponse) => void;
            prompt?: string;
            ux_mode?: string;
            state?: string;
            select_account?: boolean;
            [key: string]: any;  // Para outras propriedades que possam ser adicionadas no futuro
          }) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        }
      }
    };
  }
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Função para gerar um nonce aleatório
const generateNonce = () => {
  // Gera uma string aleatória de 16 caracteres
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

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
  },

  /**
   * Login com Google (OAuth)
   * Detecta ambiente (localhost ou produção) para redirectTo
   * Exemplo de uso: await authService.loginComGoogle();
   * @deprecated Use loginComGoogleDireto() para melhor experiência
   */
  async loginComGoogle() {
    try {
      // Detecta ambiente para definir o redirectTo correto
      const isLocalhost = window.location.hostname === 'localhost';
      const redirectTo = isLocalhost
        ? 'http://localhost:3000/auth/callback'
        : 'https://bookwriter.work/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) {
        // Mostrar mensagem de erro com toast
        toast.error('Erro ao iniciar login com Google: ' + error.message);
        throw error;
      }
    } catch (error: any) {
      // Tratamento de erro global
      toast.error('Erro ao iniciar login com Google: ' + error.message);
      throw error;
    }
  },
  
  /**
   * Login com Google usando Google Identity Services
   * Usa a API oficial do Google Identity Services para autenticação
   */
  async loginComGoogleDireto() {
    try {
      console.log('Iniciando processo de login com Google Identity Services');
      
      // 1. Carregar a API do Google se ainda não estiver carregada
      if (!window.google) {
        console.log('Carregando script da API do Google');
        // Adicionar o script do Google se ainda não estiver carregado
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        // Esperar o script carregar
        await new Promise<void>((resolve) => {
          script.onload = () => {
            console.log('Script do Google carregado com sucesso');
            resolve();
          };
          script.onerror = () => {
            console.error('Erro ao carregar script do Google');
            toast.error('Erro ao carregar recursos do Google. Tente novamente.');
            resolve(); // Resolve mesmo com erro para não travar a promessa
          };
        });
      }
      
      // Verificar se o script foi carregado corretamente
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        throw new Error('API do Google não foi carregada corretamente');
      }
      
      // 2. Gerar um nonce seguro
      const nonce = generateNonce();
      
      // 3. Usar a API google.accounts.id em vez de OAuth
      console.log('Inicializando Google Identity Services com google.accounts.id');
      
      // Criar uma promessa que será resolvida quando o callback do Google for chamado
      return new Promise<void>((resolve, reject) => {
        // Inicializar o cliente Google Identity Services
        window.google?.accounts?.id?.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1018081357112-8uk47osqt9m54rdcrqncas76cn3or2f2.apps.googleusercontent.com',
          callback: async (response: GoogleCredentialResponse) => {
            try {
              // Verificar se recebemos um credential (id_token) do Google
              if (!response.credential) {
                console.error('Resposta do Google sem credential (id_token):', response);
                toast.error('Falha na autenticação: Token de ID não recebido do Google');
                reject(new Error('Credential não recebido do Google'));
                return;
              }
              
              console.log('ID Token (credential) recebido com sucesso, iniciando autenticação no Supabase');
              
              // Usar o token para autenticar no Supabase
              console.log('Tentando autenticar com Supabase usando id_token');
              
              // Método correto de acordo com a documentação mais recente do Supabase
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential, // Este é o id_token do Google
                nonce: nonce
              });
              
              // Se encontrarmos um erro com o ID token
              if (error) {
                console.log('Erro ao autenticar com método direto:', error.message);
                console.error('Erro detalhado do Supabase:', error);
                
                console.log('Tentando método tradicional de login como fallback');
                
                // Mostrar toast de erro apenas em desenvolvimento para depuração
                if (process.env.NODE_ENV === 'development') {
                  toast.error('Erro no método direto, tentando fallback: ' + error.message);
                }
                
                // Tentar o método tradicional como fallback silenciosamente
                await this.loginComGoogle();
                resolve();
                return;
              }
              
              toast.success('Login com Google realizado com sucesso!');
              
              // O usuário está autenticado, redirecionar para o dashboard
              window.location.href = '/dashboard';
              resolve();
            } catch (err: any) {
              toast.error('Erro ao processar login com Google: ' + (err.message || 'Erro desconhecido'));
              console.error('Erro durante autenticação com Google:', err);
              reject(err);
            }
          },
          auto_select: false
        });
        
        // Iniciar o prompt do Google Identity Services
        window.google?.accounts?.id?.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('O prompt do Google não foi exibido:', notification.getNotDisplayedReason() || notification.getSkippedReason());
            // Fallback para o método tradicional se o prompt não for exibido
            this.loginComGoogle().then(resolve).catch(reject);
          }
        });
      });
    } catch (error: any) {
      // Mensagem mais amigável para o usuário
      let mensagemErro = 'Erro ao iniciar login com Google';
      
      // Personalizar mensagens de erro específicas
      if (error.message && error.message.includes('API do Google não foi carregada')) {
        mensagemErro = 'Não foi possível carregar a API do Google. Verifique sua conexão com a internet.';
      } else if (error.message && error.message.includes('id_token required')) {
        mensagemErro = 'Falha na autenticação: token não recebido do Google.';
      } else if (error.message && error.message.includes('network error')) {
        mensagemErro = 'Erro de rede. Verifique sua conexão com a internet.';
      } else if (error.message) {
        mensagemErro += ': ' + error.message;
      }
      
      // Mostrar mensagem de erro para o usuário
      toast.error(mensagemErro);
      
      // Registrar detalhes técnicos no console para depuração
      console.error('Erro completo na autenticação com Google:', error);
      
      throw error;
    }
  }
};