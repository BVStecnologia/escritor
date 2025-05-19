# Função Edge para Geração de Imagens

Esta função Edge usa a API Google Imagen para gerar imagens a partir de prompts textuais.

## Implantação Manual (sem CLI)

1. Acesse o Painel do Supabase
2. Navegue até **Functions**
3. Clique em **New Function**
4. Nomeie a função como `Gera_imagem_goolgea` 
5. Selecione a pasta pai (se necessário)
6. Clique em **Create Function**
7. Na página da função, copie e cole o conteúdo do arquivo `index.ts` no editor
8. Clique em **Deploy** para salvar e implantar a função

## Como funciona

A função recebe um prompt, a chave de API e um número de imagens a gerar, faz a requisição para a API do Google e retorna as imagens geradas.

### Parâmetros:

- `prompt`: Descrição textual da imagem a ser gerada
- `apiKey`: Chave de API do Google Imagen
- `sampleCount`: Número de imagens a gerar (1-4)

### Exemplo de chamada:

```javascript
const { data, error } = await supabase.functions.invoke('Gera_imagem_goolgea', {
  body: JSON.stringify({
    prompt: "Uma paisagem montanhosa ao pôr do sol",
    apiKey: "SUA_CHAVE_DA_API_AQUI",
    sampleCount: 2
  })
});
```

## Testando a função

1. No painel do Supabase, navegue até **Functions** e selecione a função `Gera_imagem_goolgea`
2. Vá para a aba **Logs** para monitorar as chamadas e erros
3. Na aba **Edge Function URL**, copie a URL da função
4. Você pode testar a função usando ferramentas como Postman ou o seguinte comando curl:

```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/Gera_imagem_goolgea \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Uma paisagem montanhosa ao pôr do sol", "apiKey":"SUA_CHAVE_DA_API_AQUI", "sampleCount":1}'
``` 