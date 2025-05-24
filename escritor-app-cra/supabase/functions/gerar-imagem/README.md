# Deploy da Edge Function gerar-imagem

## Pré-requisitos

1. Instalar Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Login no Supabase:
```bash
supabase login
```

3. Link com seu projeto:
```bash
supabase link --project-ref vuyjxxtxwweeobeyfkzr
```

## Deploy da Função

1. Na raiz do projeto, executar:
```bash
supabase functions deploy gerar-imagem
```

2. Configurar as variáveis de ambiente:
```bash
supabase secrets set OPENAI_API_KEY="sua-chave-openai-aqui"
```

## Verificar Deploy

```bash
supabase functions list
```

## Testar a Função

```bash
curl -i --location --request POST 'https://vuyjxxtxwweeobeyfkzr.supabase.co/functions/v1/gerar-imagem' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"Um gato astronauta","quality":"medium","sampleCount":1}'
```

## Estrutura de Requisição

```json
{
  "prompt": "Descrição da imagem",
  "sampleCount": 1,
  "type": "square|landscape|portrait|book-cover",
  "quality": "low|medium|high"
}
```

## Estrutura de Resposta

```json
{
  "success": true,
  "imageUrls": ["https://..."],
  "totalImages": 1,
  "estimatedCredits": 100,
  "processingTimeMs": 3500
}
```

## Troubleshooting

### Erro de CORS
Se receber erro de CORS, verifique se a função está retornando os headers corretos no OPTIONS.

### Erro 500
Verifique os logs:
```bash
supabase functions logs gerar-imagem
```

### Variáveis não definidas
Liste as secrets configuradas:
```bash
supabase secrets list
```