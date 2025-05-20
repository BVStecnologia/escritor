# Comandos Git - Guia de Referência

## Fluxo Recomendado de Trabalho

### 1. Antes de começar a trabalhar (atualizar repositório local)

```bash
git fetch --all
git merge origin/main
```
Essa abordagem é mais segura que `git reset --hard origin/main` porque não descarta suas alterações locais.

### 2. Durante o desenvolvimento (salvar alterações com frequência)

```bash
# Verificar status
git status

# Adicionar arquivos modificados
git add .

# Commit das alterações
git commit -m "Descrição das alterações"

# Enviar para o GitHub
git push
```