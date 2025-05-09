# Escritor App

Aplicativo de escrita com assistente de IA integrado para ajudar na criação de textos e histórias.

## Como Iniciar a Aplicação

Para abrir a aplicação no navegador:

1. Navegue até a pasta do projeto:
   ```
   cd "/Users/valdair/Documents/Projetos/Escritor   gabi/escritor-app-temp"
   ```

2. Instale as dependências (apenas na primeira vez):
   ```
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```
   npm run dev -- --host
   ```

4. Acesse a aplicação no navegador:
   - Local: http://localhost:5173/
   - Rede: http://seu-ip-local:5173/ (para acessar de outros dispositivos na mesma rede)

5. Se tiver problemas com a porta 5173, você pode especificar uma porta alternativa:
   ```
   npm run dev -- --port 3000 --host
   ```

## Recursos Principais

- Editor de texto com formatação
- Assistente de IA integrado para melhorar seus textos
- Organização por capítulos
- Estatísticas de escrita
- Modos claro e escuro

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Claude AI API