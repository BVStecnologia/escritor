import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente ou valores fixos (apenas para desenvolvimento)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vuyjxxtxwweeobeyfkzr.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eWp4eHR4d3dlZW9iZXlma3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzYxODcsImV4cCI6MjA2MjIxMjE4N30.hcOHnocR9B4ogqt94ugJQw_mC1g40D3ZM7j_lJjuotU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);