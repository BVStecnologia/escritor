import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuyjxxtxwweeobeyfkzr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eWp4eHR4d3dlZW9iZXlma3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzYxODcsImV4cCI6MjA2MjIxMjE4N30.hcOHnocR9B4ogqt94ugJQw_mC1g40D3ZM7j_lJjuotU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    // Listar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Erro ao listar tabelas:', tablesError);
      return;
    }

    console.log('Tabelas encontradas:', tables);

    // Para cada tabela, obter sua estrutura
    for (const table of tables) {
      const tableName = table.table_name;
      
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);

      if (columnsError) {
        console.error(`Erro ao obter colunas para ${tableName}:`, columnsError);
        continue;
      }

      console.log(`Estrutura da tabela ${tableName}:`, columns);
    }
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

checkTables();