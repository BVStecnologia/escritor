# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

Este é o Escritor App (BookWriter), uma plataforma de escrita baseada em nuvem para autores com assistência de IA. É uma SPA React implantada no Fly.io com backend Supabase.

## Comandos de Desenvolvimento Comuns

```bash
# Desenvolvimento
npm start              # Inicia servidor dev em localhost:3000
npm run build         # Cria build de produção
npm test              # Executa testes

# Deploy (do diretório escritor-app-cra)
fly deploy            # Deploy para produção no Fly.io
```

## Arquitetura e Componentes Principais

### Stack Frontend
- **React 18** com TypeScript e Create React App
- **Lexical Editor**: Framework de editor de texto do Facebook para edição rich text
- **Styled Components**: CSS-in-JS para estilização com suporte a temas
- **React Router v6**: Roteamento client-side

### Backend e Serviços
- **Supabase**: Banco de dados PostgreSQL + Auth + Edge Functions
- **Edge Functions**: 
  - `Claude_embebedings`: Geração de texto/autocomplete com IA
  - `gerar-imagem`: Geração de imagens usando OpenAI

### Serviços Principais (src/services/)
- `authService.ts`: Autenticação de usuário e gerenciamento de sessão
- `dbService.ts`: Operações CRUD para livros, capítulos, personagens, notas
- `assistantService.ts`: Integração IA para geração/melhoria de texto
- `imageService.ts`: Geração de imagens com registro automático para evitar deleção

### Schema do Banco de Dados
- `perfis`: Perfis de usuários
- `Livros`: Livros/projetos (note o L maiúsculo)
- `capitulos`: Capítulos dos livros com conteúdo
- `personagens`: Personagens
- `notas`: Notas/pesquisas
- `imagens_geradas`: Rastreamento de imagens geradas (evita deleção por cron)
- `image_generations`: Histórico/métricas de geração de imagens

### Detalhes Críticos de Implementação

1. **Auto-save**: Capítulos salvam automaticamente a cada 2 segundos via `AutoSavePlugin`
2. **Gerenciamento de Imagens**: Imagens geradas devem ser registradas na tabela `imagens_geradas` ou serão deletadas pelo cron job
3. **Tema**: Suporta modo escuro/claro via `ThemeContext`
4. **Estado do Editor**: Estado do editor Lexical é armazenado como JSON no banco

### Variáveis de Ambiente

Necessárias no `.env`:
```
REACT_APP_SUPABASE_URL=<sua-url-supabase>
REACT_APP_SUPABASE_ANON_KEY=<sua-anon-key>
```

### Notas de Deploy

- Implantado no Fly.io com build Docker multi-stage
- Arquivos estáticos servidos pelo Nginx
- Domínio: bookwriter.work
- Edge Functions implantadas separadamente via Supabase CLI

## Testando Edge Functions Localmente

```bash
# Deploy da edge function
supabase functions deploy gerar-imagem

# Configurar secrets
supabase secrets set OPENAI_API_KEY="sua-chave"

# Ver logs
supabase functions logs gerar-imagem
```

## Padrões Importantes

1. **Tratamento de Erros**: Todos os métodos de serviço retornam objetos de sucesso/erro
2. **URLs de Imagem**: Extrair caminho de storage da URL pública para registro
3. **Uso de Context**: `AuthContext` fornece estado do usuário globalmente
4. **Plugins do Editor**: Plugins Lexical customizados em `src/components/LexicalEditor/plugins/`