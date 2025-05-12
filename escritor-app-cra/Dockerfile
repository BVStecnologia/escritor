# Build stage
# hadolint ignore=DL3003,DL3018,DL3025
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Copiar arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci

# Copiar o resto do código fonte
COPY . .

# Construir a aplicação ignorando erros de TypeScript
ENV CI=false
ENV TSC_COMPILE_ON_ERROR=true
RUN npm run build

# Estágio de produção
# hadolint ignore=DL3003,DL3018,DL3025
FROM nginx:1.25.4-bookworm

# Copiar os arquivos de build para o diretório do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Configurar nginx para rotas do React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
