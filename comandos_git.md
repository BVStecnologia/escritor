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

### 3. Recuperação Segura (sem perder alterações)

Se precisar reverter para o estado do repositório remoto:

```bash
# Salvar alterações locais em um stash
git stash save "Salvando alterações locais"

# Atualizar com o remoto
git pull

# Recuperar alterações locais (se necessário)
git stash apply
```

### 4. Trabalhando com Branches

```bash
# Criar e mudar para uma nova branch
git checkout -b nome-da-nova-branch

# Enviar a branch para o GitHub
git push -u origin nome-da-nova-branch

# Juntar as alterações com o main
git checkout main
git merge nome-da-nova-branch
git push
```

## Em Caso de Emergência (Recuperar após reset)

Se você fez `git reset --hard` e perdeu alterações que já havia commitado:

```bash
# Ver histórico de todas as ações (mesmo após reset)
git reflog

# Criar uma nova branch a partir de um commit perdido
git branch recuperacao-branch HASH-DO-COMMIT
```

## Dicas de Segurança

1. **NUNCA** use `git reset --hard` a menos que esteja 100% certo que quer descartar alterações locais
2. Use `git stash` para guardar alterações não commitadas antes de operações arriscadas
3. Commit frequentemente, mesmo se o código não estiver perfeito
4. Push para o GitHub regularmente para ter backup
5. Crie branches separadas para experimentos

## Alias Útil para Evitar Reset Destrutivo

Configure este alias para fazer stash automático antes de reset:

```bash
git config --global alias.safe-reset "!f() { git stash save 'Auto-stash before reset' && git reset $@; }; f"
```

Depois use `git safe-reset --hard origin/main` em vez de `git reset --hard origin/main`.
