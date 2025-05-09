# Escritor App

Uma plataforma moderna para escritores, com sincronização na nuvem, assistente de IA e ferramentas avançadas de escrita.

## Tecnologias Utilizadas

- React (Create React App)
- TypeScript
- Styled Components
- React Router
- Supabase (Autenticação e Banco de Dados)

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Supabase (para configurar o backend)

## Configuração

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/escritor-app.git
   cd escritor-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   REACT_APP_SUPABASE_URL=sua_url_do_supabase
   REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

4. Configure o banco de dados Supabase:
   Siga as instruções no arquivo `SUPABASE_SETUP.md` para configurar as tabelas e políticas de segurança.

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm start
# ou
yarn start
```

O aplicativo estará disponível em http://localhost:3000.

## Build para Produção

Para criar uma build de produção:

```bash
npm run build
# ou
yarn build
```

Os arquivos de produção estarão disponíveis no diretório `build`.

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
  - `components/` - Componentes reutilizáveis
  - `contexts/` - Contextos React (Auth, etc.)
  - `pages/` - Páginas da aplicação
  - `services/` - Serviços para comunicação com API
  - `styles/` - Configurações de estilo global e tema
- `public/` - Arquivos estáticos
- `supabase/` - Scripts SQL para configuração do Supabase

## Funcionalidades Principais

- **Autenticação**: Sistema de login/cadastro com Supabase
- **Editor**: Interface intuitiva para escrita de livros e capítulos
- **Organização**: Organize seus livros, capítulos e notas
- **Sincronização**: Todos os dados são salvos na nuvem automaticamente
- **Segurança**: Políticas de segurança Row Level Security (RLS)

## Contribuição

Contribuições são bem-vindas! Abra uma issue para discutir novos recursos ou envie um pull request com suas alterações.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).