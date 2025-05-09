# Integração com Supabase no Escritor App

Este documento descreve como o Escritor App utiliza as tabelas existentes no Supabase.

## Estrutura do Banco de Dados

A aplicação utiliza as seguintes tabelas:

- `perfis`: Armazena informações dos perfis de usuários
- `livros`: Contém todos os livros/projetos criados pelos usuários
- `capitulos`: Armazena capítulos associados a livros específicos
- `personagens`: Contém dados de personagens das histórias
- `notas`: Armazena notas e pesquisas para o processo criativo

## Autenticação

A autenticação é gerenciada pelo Supabase Auth:

1. Cadastro e login via email/senha
2. Perfil de usuário criado automaticamente após cadastro
3. Políticas de segurança Row Level Security (RLS) para proteger os dados

## Serviços Implementados

### 1. Serviço de Autenticação
- Cadastro de usuários
- Login
- Recuperação de senha
- Gerenciamento de sessão

### 2. Serviço de Banco de Dados
- CRUD completo para livros
- CRUD completo para capítulos
- Gerenciamento de personagens
- Sistema de notas
- Perfil de usuário

### 3. Integração com Claude AI
O sistema está preparado para integrar com o Claude AI através das edge functions do Supabase, oferecendo:

- Autocompletar texto enquanto o usuário escreve
- Gerar páginas completas com base em descrições
- Assistente de escrita para aprimorar trechos
- Geração de ideias criativas
- Sistema de busca avançada no conteúdo

## Como Usar

1. Configure as variáveis de ambiente para Supabase:
   ```
   REACT_APP_SUPABASE_URL=sua_url_do_supabase
   REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

2. A aplicação automaticamente se conectará às tabelas existentes no banco de dados Supabase.