import { supabase } from './supabaseClient';

export interface UserCredits {
  user_id: string;
  credits: number;
  last_updated: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  created_at: string;
}

export const creditsService = {
  // Buscar saldo de créditos do usuário
  async getUserCredits(userId: string): Promise<{ success: boolean; data?: UserCredits; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar créditos:', error);
      return { success: false, error };
    }
  },

  // Deduzir créditos do usuário
  async deductCredits(userId: string, amount: number, description: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Buscar saldo atual
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      if (!currentCredits || currentCredits.credits < amount) {
        throw new Error('Créditos insuficientes');
      }

      // Atualizar saldo
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits: currentCredits.credits - amount,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Registrar transação
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: -amount,
          type: 'usage',
          description
        });

      if (transactionError) throw transactionError;

      return { success: true };
    } catch (error) {
      console.error('Erro ao deduzir créditos:', error);
      return { success: false, error };
    }
  },

  // Adicionar créditos ao usuário (após compra)
  async addCredits(userId: string, amount: number, description: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Buscar saldo atual ou criar registro se não existir
      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const newBalance = (currentCredits?.credits || 0) + amount;

      // Upsert (inserir ou atualizar) saldo
      const { error: upsertError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newBalance,
          last_updated: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      // Registrar transação
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'purchase',
          description
        });

      if (transactionError) throw transactionError;

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
      return { success: false, error };
    }
  },

  // Buscar histórico de transações
  async getTransactionHistory(userId: string, limit = 50): Promise<{ success: boolean; data?: CreditTransaction[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return { success: false, error };
    }
  },

  // Verificar se usuário tem créditos suficientes
  async hasEnoughCredits(userId: string, requiredAmount: number): Promise<boolean> {
    const result = await this.getUserCredits(userId);
    if (!result.success || !result.data) return false;
    return result.data.credits >= requiredAmount;
  }
};

// Custos de operações em créditos
export const OPERATION_COSTS = {
  autocomplete: 6,
  generate_page: 60,
  writing_assistant: 20,
  creative_ideas: 12,
  search: 8,
  custom: 40,
  image_high: 160,
  image_medium: 100,
  image_low: 60
} as const;

export type OperationType = keyof typeof OPERATION_COSTS;