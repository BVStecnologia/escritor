import { supabase } from './supabaseClient';
import { authService } from './authService';

// Interface para o modelo User do Supabase
export interface UserPreferences {
  id?: bigint;
  created_at?: string;
  nome?: string;
  Sobrenome?: string;
  Tema?: string;
  palavras?: bigint;
  email?: string;
  user?: string;
  autocomplete?: boolean;
}

// Enum para temas disponíveis
export enum Tema {
  CLARO = 'claro',
  ESCURO = 'escuro'
}

export const userPreferencesService = {
  /**
   * Obter as preferências do usuário atual
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('Nenhum usuário logado para obter preferências');
        return null;
      }

      console.log('Buscando preferências para usuário:', currentUser.id);

      // Buscar pelo UUID do auth.users
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('user', currentUser.id);

      if (error) {
        console.error('Erro ao buscar User pelo UUID:', error);
      }
      
      if (data && data.length > 0) {
        console.log('Usuário encontrado pelo UUID:', data[0]);
        return data[0];
      }

      console.log('Usuário não encontrado pelo UUID, buscando pelo email:', currentUser.email);
      
      // Tenta buscar pelo email
      const { data: emailData, error: emailError } = await supabase
        .from('User')
        .select('*')
        .eq('email', currentUser.email);
      
      if (emailError) {
        console.error('Erro ao buscar User pelo email:', emailError);
      }
      
      if (emailData && emailData.length > 0) {
        console.log('Usuário encontrado pelo email:', emailData[0]);
        return emailData[0];
      }

      console.log('Usuário não encontrado por nenhum método');
      return null;
    } catch (error) {
      console.error('Erro ao obter preferências do usuário:', error);
      return null;
    }
  },

  /**
   * Obter o tema do usuário atual
   */
  async getUserTheme(): Promise<Tema> {
    try {
      const userPreferences = await this.getUserPreferences();

      // Se não encontrar preferências ou o tema não estiver definido, retornar tema padrão (claro)
      if (!userPreferences || !userPreferences.Tema) {
        console.log('Nenhuma preferência de tema encontrada, usando padrão (claro)');
        return Tema.CLARO;
      }

      console.log('Tema encontrado:', userPreferences.Tema);
      return userPreferences.Tema as Tema;
    } catch (error) {
      console.error('Erro ao obter tema do usuário:', error);
      return Tema.CLARO; // Tema padrão em caso de erro
    }
  },

  /**
   * Atualizar o tema do usuário
   */
  async updateUserTheme(tema: Tema): Promise<boolean> {
    try {
      console.log(`Atualizando tema para: ${tema}`);
      
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('Nenhum usuário logado para atualizar tema');
        return false;
      }

      // Tenta encontrar o registro existente
      const userPreferences = await this.getUserPreferences();
      
      if (userPreferences) {
        console.log(`Atualizando tema do usuário existente (ID: ${userPreferences.id})`);
        
        const { error } = await supabase
          .from('User')
          .update({ "Tema": tema })
          .eq('id', userPreferences.id);
        
        if (error) {
          console.error('Erro ao atualizar tema do usuário:', error);
          return false;
        }
        
        console.log('Tema atualizado com sucesso');
        return true;
      } else {
        console.log('Criando novo registro para o usuário');
        
        // Criar novo registro
        const { error } = await supabase
          .from('User')
          .insert([{
            user: currentUser.id,
            email: currentUser.email,
            "Tema": tema
          }]);
        
        if (error) {
          console.error('Erro ao criar registro de usuário:', error);
          return false;
        }
        
        console.log('Registro de usuário criado com tema:', tema);
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar tema do usuário:', error);
      return false;
    }
  },

  /**
   * Obter a preferência de autocomplete do usuário
   */
  async getUserAutocompletePreference(): Promise<boolean> {
    try {
      const userPreferences = await this.getUserPreferences();
      
      // Se não encontrar preferências ou o autocomplete não estiver definido, retornar padrão (ativado)
      if (!userPreferences || userPreferences.autocomplete === undefined || userPreferences.autocomplete === null) {
        console.log('Nenhuma preferência de autocomplete encontrada, usando padrão (ativado)');
        return true;
      }

      console.log('Preferência de autocomplete encontrada:', userPreferences.autocomplete);
      return !!userPreferences.autocomplete;
    } catch (error) {
      console.error('Erro ao obter preferência de autocomplete do usuário:', error);
      return true; // Padrão em caso de erro
    }
  },

  /**
   * Atualizar a preferência de autocomplete do usuário
   */
  async updateUserAutocompletePreference(enabled: boolean): Promise<boolean> {
    try {
      console.log(`Atualizando preferência de autocomplete para: ${enabled ? 'ativado' : 'desativado'}`);
      
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('Nenhum usuário logado para atualizar preferência de autocomplete');
        return false;
      }

      // Tenta encontrar o registro existente
      const userPreferences = await this.getUserPreferences();
      
      if (userPreferences) {
        console.log(`Atualizando preferência de autocomplete do usuário existente (ID: ${userPreferences.id})`);
        
        const { error } = await supabase
          .from('User')
          .update({ "autocomplete": enabled })
          .eq('id', userPreferences.id);
        
        if (error) {
          console.error('Erro ao atualizar preferência de autocomplete do usuário:', error);
          return false;
        }
        
        console.log('Preferência de autocomplete atualizada com sucesso');
        return true;
      } else {
        console.log('Criando novo registro para o usuário com preferência de autocomplete');
        
        // Criar novo registro
        const { error } = await supabase
          .from('User')
          .insert([{
            user: currentUser.id,
            email: currentUser.email,
            "autocomplete": enabled
          }]);
        
        if (error) {
          console.error('Erro ao criar registro de usuário com preferência de autocomplete:', error);
          return false;
        }
        
        console.log('Registro de usuário criado com preferência de autocomplete:', enabled);
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar preferência de autocomplete do usuário:', error);
      return false;
    }
  }
};