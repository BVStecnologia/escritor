import { supabase } from '../services/supabaseClient';

// Função de diagnóstico simplificada que não deve causar problemas de TypeScript
export async function testarConexao() {
  try {
    // Tenta buscar uma tabela que provavelmente não existe
    const { error } = await supabase.from('_test_').select('*').limit(1);
    
    // Se o erro for específico de "tabela não existe", a conexão está funcionando
    if (error && error.code === 'PGRST116') {
      return {
        status: 'OK',
        mensagem: 'Conexão com Supabase estabelecida com sucesso'
      };
    }
    
    return {
      status: 'Erro',
      mensagem: error ? `Erro: ${error.message}` : 'Erro desconhecido'
    };
  } catch (e: any) {
    return {
      status: 'Falha',
      mensagem: `Exceção: ${e.message}`
    };
  }
}

// Verifica a autenticação atual
export async function verificarAutenticacao() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        status: 'Erro',
        mensagem: `Erro de autenticação: ${error.message}`
      };
    }
    
    if (!data.session) {
      return {
        status: 'Não autenticado',
        mensagem: 'Nenhuma sessão ativa encontrada'
      };
    }
    
    return {
      status: 'Autenticado',
      mensagem: `Usuário autenticado: ${data.session.user.email || data.session.user.id}`
    };
  } catch (e: any) {
    return {
      status: 'Falha',
      mensagem: `Exceção: ${e.message}`
    };
  }
}

// Tenta ler a tabela de livros
export async function verificarTabelaLivros() {
  try {
    const { data, error } = await supabase.from('Livros').select('*').limit(5);
    
    if (error) {
      return {
        status: 'Erro',
        mensagem: `Erro ao acessar tabela: ${error.message}`
      };
    }
    
    return {
      status: 'OK',
      mensagem: `Tabela Livros acessada com sucesso. ${data.length} registros encontrados.`,
      dados: data
    };
  } catch (e: any) {
    return {
      status: 'Falha',
      mensagem: `Exceção: ${e.message}`
    };
  }
}

// Tenta buscar livros por email
export async function buscarLivrosPorEmail() {
  try {
    // Primeiro verifica se há um usuário logado
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;
    
    if (!email) {
      return {
        status: 'Erro',
        mensagem: 'Usuário não está logado ou não tem email'
      };
    }
    
    // Tenta buscar os livros do usuário
    const { data, error } = await supabase
      .from('Livros')
      .select('*')
      .eq('email_user', email);
    
    if (error) {
      return {
        status: 'Erro',
        mensagem: `Erro ao buscar livros: ${error.message}`
      };
    }
    
    return {
      status: 'OK',
      mensagem: `${data.length} livros encontrados para o email ${email}`,
      dados: data
    };
  } catch (e: any) {
    return {
      status: 'Falha',
      mensagem: `Exceção: ${e.message}`
    };
  }
}

// Busca todos os dados
export async function executarDiagnosticoSimples() {
  const conexao = await testarConexao();
  const autenticacao = await verificarAutenticacao();
  const tabelaLivros = await verificarTabelaLivros();
  const livrosUsuario = await buscarLivrosPorEmail();
  
  return {
    timestamp: new Date().toISOString(),
    conexao,
    autenticacao,
    tabelaLivros,
    livrosUsuario
  };
}