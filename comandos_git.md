# Comandos Git para o Repositório Escritor

## 1. Buscar e Redefinir o Repositório Local

```bash
git fetch --all
git reset --hard origin/main
git clean -fd  # Remove arquivos não rastreados (incluindo novos arquivos)
```

Este comando busca todas as atualizações do repositório remoto, redefine o branch local para corresponder exatamente ao branch remoto (origin/main) e remove quaisquer arquivos não rastreados.

## 2. Enviar Alterações para o GitHub

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

Este comando adiciona todas as alterações ao stage, cria um commit com uma mensagem descritiva e envia as alterações para o repositório remoto no GitHub.
