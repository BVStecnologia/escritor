# Deploy da Edge Function via Dashboard Supabase

## Opção 1: Via Dashboard (Mais Fácil)

1. Acesse: https://app.supabase.com/project/vuyjxxtxwweeobeyfkzr/functions

2. Clique em "New Function"

3. Nome: `gerar-imagem`

4. Copie todo o conteúdo de `supabase/functions/gerar-imagem/index.ts`

5. Cole no editor

6. Clique em "Deploy"

7. Após deploy, vá em "Secrets" e adicione:
   - `OPENAI_API_KEY` = sua chave da OpenAI

## Opção 2: Verificar se já está deployed

1. No Dashboard, vá em Functions
2. Procure por `gerar-imagem`
3. Se existir, clique nela
4. Veja os logs para identificar erros

## Teste Rápido

No Dashboard, na aba "Functions":
1. Clique em `gerar-imagem`
2. Vá na aba "Invoke"
3. Cole este JSON:
```json
{
  "prompt": "Um gato astronauta",
  "sampleCount": 1,
  "type": "square",
  "quality": "medium"
}
```
4. Clique em "Run"

## Debug de Erros Comuns

### "OPENAI_API_KEY não configurada"
- Vá em Secrets e adicione a chave

### CORS Error
- Verifique se a função está rodando
- Veja os logs para erros

### 500 Internal Server Error
- Geralmente é API key inválida ou ausente
- Verifique os logs da função