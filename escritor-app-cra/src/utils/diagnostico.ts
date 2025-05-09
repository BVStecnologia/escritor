import { supabase } from '../services/supabaseClient';

// Função para verificar a conexão com o Supabase e as tabelas disponíveis
export async function diagnosticarSupabase() {
  const resultados: Record<string, any> = {};
  
  // 1. Verificar conexão
  try {
    const { data, error } = await supabase.from('_unknown_table_').select('*').limit(1);
    resultados.conexao = {
      status: error ? (error.code === 'PGRST116' ? 'OK (Tabela não existe, mas conexão funciona)' : 'Erro') : 'OK',
      erro: error ? `${error.code}: ${error.message}` : null,
    };
  } catch (error: any) {
    resultados.conexao = {
      status: 'Falha',
      erro: error.message,
    };
  }
  
  // 2. Verificar autenticação
  try {
    const { data, error } = await supabase.auth.getSession();
    resultados.autenticacao = {
      status: data.session ? 'Autenticado' : 'Não autenticado',
      sessao: data.session ? {
        id: data.session.user.id,
        email: data.session.user.email,
        criado_em: data.session.user.created_at,
      } : null,
      erro: error ? error.message : null,
    };
  } catch (error: any) {
    resultados.autenticacao = {
      status: 'Falha',
      erro: error.message,
    };
  }
  
  // 3. Verificar tabela Livros
  try {
    const authResult = await supabase.auth.getUser();
    const email = authResult.data.user?.email;
    
    const { data, error, status, statusText } = await supabase
      .from('Livros')
      .select('*')
      .limit(10);
    
    resultados.tabela_livros = {
      status: error ? 'Erro' : 'OK',
      codigo_http: status,
      mensagem_http: statusText,
      total_registros: data?.length || 0,
      dados: data,
      erro: error ? `${error.code}: ${error.message}` : null,
    };
    
    // Verificar consulta com filtro por email
    if (email) {
      const { data: livrosDoUsuario, error: errorFiltered } = await supabase
        .from('Livros')
        .select('*')
        .eq('email_user', email)
        .limit(10);
      
      resultados.livros_do_usuario = {
        email_usuario: email,
        total_registros: livrosDoUsuario?.length || 0,
        dados: livrosDoUsuario,
        erro: errorFiltered ? `${errorFiltered.code}: ${errorFiltered.message}` : null,
      };
    }
  } catch (error: any) {
    resultados.tabela_livros = {
      status: 'Falha',
      erro: error.message,
    };
  }
  
  // 4. Inserir livro de teste
  if (resultados.autenticacao.status === 'Autenticado') {
    try {
      const email = resultados.autenticacao.sessao.email;
      const timestamp = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('Livros')
        .insert([{
          "Nome do livro": `Livro de Teste ${timestamp}`,
          "Autor": "Teste Automático",
          email_user: email
        }])
        .select();
      
      resultados.inserir_teste = {
        status: error ? 'Erro' : 'OK',
        dados: data,
        erro: error ? `${error.code}: ${error.message}` : null,
      };
      
      // Tentar excluir o livro de teste se foi inserido com sucesso
      if (data && data.length > 0) {
        const { error: deleteError } = await supabase
          .from('Livros')
          .delete()
          .eq('id', data[0].id);
        
        resultados.excluir_teste = {
          status: deleteError ? 'Erro' : 'OK',
          erro: deleteError ? `${deleteError.code}: ${deleteError.message}` : null,
        };
      }
    } catch (error: any) {
      resultados.inserir_teste = {
        status: 'Falha',
        erro: error.message,
      };
    }
  }
  
  // 5. Verificar todas as tabelas públicas
  try {
    const { data, error } = await supabase
      .from('_todos_tabelas_')
      .select('*');
    
    const tabelas = ['Livros', 'Capitulo', 'Usuario', 'Nota', 'Personagem'];
    const verificacoes = await Promise.all(tabelas.map(async (tabela) => {
      try {
        const { data, error } = await supabase.from(tabela).select('count').limit(1);
        return {
          tabela,
          status: error ? 'Erro' : 'OK',
          erro: error ? `${error.code}: ${error.message}` : null,
        };
      } catch (e: any) {
        return {
          tabela,
          status: 'Falha',
          erro: e.message,
        };
      }
    }));
    
    resultados.tabelas = verificacoes;
  } catch (error: any) {
    resultados.tabelas = {
      status: 'Falha',
      erro: error.message,
    };
  }
  
  return resultados;
}

// Função para corrigir problemas comuns
export async function corrigirProblemas() {
  const resultados: Record<string, any> = {};
  
  // Verificar a configuração, mas sem tentar acessar propriedades protegidas
  const configInfo = {
    status: 'OK',
    mensagem: 'Usando configuração atual do Supabase'
  };
  resultados.configuracao = configInfo;
  
  // 2. Tentar criar tabela Livros se não existir
  try {
    const { data, error } = await supabase.rpc('criar_tabela_livros_se_nao_existir');
    resultados.criar_tabela = {
      status: error ? 'Erro' : 'OK',
      mensagem: data,
      erro: error ? error.message : null,
    };
  } catch (error: any) {
    // Não temos permissão para criar tabelas, então isso é esperado
    resultados.criar_tabela = {
      status: 'Permissão negada',
      erro: error.message,
    };
  }
  
  return resultados;
}

// Função para realizar operações básicas de CRUD para validar
export async function testarCRUD() {
  const resultados: Record<string, any> = {};
  
  // 1. Obter usuário atual
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      status: 'Erro',
      mensagem: 'Usuário não autenticado',
    };
  }
  
  const email = userData.user.email;
  resultados.usuario = {
    id: userData.user.id,
    email,
  };
  
  // 2. Criar um livro
  try {
    const timestamp = new Date().toISOString();
    const { data, error } = await supabase
      .from('Livros')
      .insert([{
        "Nome do livro": `Teste CRUD ${timestamp}`,
        "Autor": "Sistema de Diagnóstico",
        email_user: email
      }])
      .select();
    
    if (error) throw error;
    
    const livroId = data[0].id;
    resultados.criar = {
      status: 'OK',
      livro: data[0],
    };
    
    // 3. Ler o livro criado
    const { data: readData, error: readError } = await supabase
      .from('Livros')
      .select('*')
      .eq('id', livroId)
      .single();
    
    if (readError) throw readError;
    
    resultados.ler = {
      status: 'OK',
      livro: readData,
    };
    
    // 4. Atualizar o livro
    const { data: updateData, error: updateError } = await supabase
      .from('Livros')
      .update({ "Nome do livro": `Teste CRUD Atualizado ${timestamp}` })
      .eq('id', livroId)
      .select();
    
    if (updateError) throw updateError;
    
    resultados.atualizar = {
      status: 'OK',
      livro: updateData[0],
    };
    
    // 5. Excluir o livro
    const { error: deleteError } = await supabase
      .from('Livros')
      .delete()
      .eq('id', livroId);
    
    if (deleteError) throw deleteError;
    
    resultados.excluir = {
      status: 'OK',
    };
    
    return {
      status: 'OK',
      resultados,
    };
  } catch (error: any) {
    return {
      status: 'Erro',
      mensagem: error.message,
      resultados,
    };
  }
}