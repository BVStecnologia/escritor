import { supabase } from './supabaseClient';

/**
 * Serviço de depuração para verificar a estrutura do banco de dados
 */
export const debugService = {
  /**
   * Verificar as tabelas disponíveis no banco de dados
   */
  async listarTabelas() {
    try {
      // Esta consulta requer permissões de administrador no Supabase
      const { data, error } = await supabase
        .rpc('get_tables');
      
      if (error) {
        // Abordagem alternativa se a RPC não estiver disponível
        console.log('Tentando abordagem alternativa para listar tabelas...');
        
        // Lista de tabelas comuns para tentar
        const tabelasComuns = ['usuarios', 'users', 'perfis', 'profiles', 'livros', 'books', 'capitulos', 'chapters'];
        
        const resultados = await Promise.all(
          tabelasComuns.map(async (tabela) => {
            const { count, error } = await supabase
              .from(tabela)
              .select('*', { count: 'exact', head: true });
            
            return {
              tabela,
              existe: !error,
              erro: error ? error.message : null,
              contagem: count
            };
          })
        );
        
        return resultados;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao listar tabelas:', error);
      return { erro: 'Falha ao listar tabelas', detalhes: error };
    }
  },
  
  /**
   * Verificar a estrutura de uma tabela específica
   */
  async verificarEstrutura(tabela: string) {
    try {
      // Obter uma linha para ver os campos
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);
      
      if (error) {
        return { 
          tabela, 
          existe: false, 
          erro: error.message 
        };
      }
      
      const campos = data && data.length > 0 
        ? Object.keys(data[0]) 
        : [];
      
      return {
        tabela,
        existe: true,
        campos
      };
    } catch (error) {
      console.error(`Erro ao verificar estrutura da tabela ${tabela}:`, error);
      return { erro: `Falha ao verificar estrutura da tabela ${tabela}`, detalhes: error };
    }
  },
  
  /**
   * Testar a inserção em uma tabela
   */
  async testarInsercao(tabela: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { sucesso: false, erro: 'Usuário não autenticado' };
      }
      
      let dados = {};
      
      // Preparar dados diferentes dependendo da tabela
      if (tabela === 'livros' || tabela === 'books') {
        dados = {
          titulo: 'Teste de Inserção',
          descricao: 'Livro de teste para verificar a inserção',
          usuario_id: user.id,
          status: 'rascunho',
          publico: false,
          contagem_palavras: 0
        };
      } else if (tabela === 'perfis' || tabela === 'profiles') {
        dados = {
          id: user.id,
          nome: 'Usuário de Teste',
          atualizado_em: new Date().toISOString()
        };
      }
      
      // Tentar inserir
      const { data, error } = await supabase
        .from(tabela)
        .insert([dados])
        .select();
      
      if (error) {
        return { 
          sucesso: false, 
          erro: error.message,
          detalhes: error 
        };
      }
      
      // Limpar após o teste
      await supabase
        .from(tabela)
        .delete()
        .eq('id', data[0].id);
      
      return {
        sucesso: true,
        dados: data[0]
      };
    } catch (error) {
      console.error(`Erro ao testar inserção na tabela ${tabela}:`, error);
      return { erro: `Falha ao testar inserção na tabela ${tabela}`, detalhes: error };
    }
  },
  
  /**
   * Verificar o perfil do usuário atual
   */
  async verificarUsuario() {
    try {
      // Verificar dados da autenticação
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        return { sucesso: false, erro: 'Falha ao obter usuário autenticado', detalhes: authError };
      }
      
      const user = authData?.user;
      
      if (!user) {
        return { sucesso: false, erro: 'Usuário não autenticado' };
      }
      
      // Tentar obter perfil (tentando diferentes tabelas possíveis)
      const tabelasPerfil = ['perfis', 'profiles', 'usuarios', 'users'];
      let perfilData = null;
      let tabelaEncontrada = null;
      
      for (const tabela of tabelasPerfil) {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          perfilData = data;
          tabelaEncontrada = tabela;
          break;
        }
      }
      
      return {
        sucesso: true,
        usuario: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        perfil: perfilData,
        tabelaPerfil: tabelaEncontrada
      };
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return { sucesso: false, erro: 'Falha ao verificar usuário', detalhes: error };
    }
  }
};