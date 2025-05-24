# 📝 Notas de Deploy - Sistema de Geração de Imagens

## Status Atual

### ✅ Implementado
- Nova Edge Function `gerar-imagem` com OpenAI GPT-Image-1
- Sistema de rastreamento de uso (tabelas no banco)
- Modal com estimativa de custos
- Suporte a tema claro/escuro

### ⚠️ Pendente
- Deploy da Edge Function `gerar-imagem`
- Migração das tabelas de tracking no banco de produção

## Como Fazer o Deploy

### 1. Edge Function
```bash
# Instalar Supabase CLI se necessário
brew install supabase/tap/supabase

# Login
supabase login

# Link com projeto
supabase link --project-ref vuyjxxtxwweeobeyfkzr

# Deploy da função
supabase functions deploy gerar-imagem

# Configurar secret da OpenAI
supabase secrets set OPENAI_API_KEY="sk-..."
```

### 2. Migração do Banco
```bash
# Rodar migration
supabase db push
```

Ou manualmente no Supabase Dashboard:
1. SQL Editor
2. Colar conteúdo de `supabase/migrations/image_generation_tracking.sql`
3. Executar

### 3. Criar Bucket no Storage
No Supabase Dashboard:
1. Storage → New Bucket
2. Nome: `ai-generated-images`
3. Public: ✅

### 4. Atualizar imageService.ts
Depois do deploy, descomentar o código novo e remover o fallback:
```typescript
// Remover o código da função antiga Gera_imagem_goolgea
// Usar apenas gerar-imagem
```

## Testando

1. Verificar função deployed:
```bash
supabase functions list
```

2. Ver logs:
```bash
supabase functions logs gerar-imagem --tail
```

3. Testar no app:
- Criar/editar livro → Gerar capa
- Verificar tabela `image_generations` no banco

## Monitoramento

- Ver uso: `SELECT * FROM image_generations ORDER BY created_at DESC`
- Ver custos: `SELECT * FROM user_image_generation_stats`