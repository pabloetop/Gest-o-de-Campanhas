# Guia de Contribuição — ETOP

## Fluxo de trabalho

### 1. Clone e configure

```bash
git clone https://github.com/SEU_USUARIO/etop.git
cd etop
git checkout -b develop
```

### 2. Crie sua branch

```bash
# Nova funcionalidade
git checkout -b feature/nome-da-feature

# Correção de bug
git checkout -b fix/descricao-do-bug

# Preparação de release
git checkout -b release/v1.x.0
```

### 3. Commits com padrão Conventional Commits

```
tipo(escopo): descrição curta

Exemplos:
  feat(campanhas): adicionar filtro por período
  fix(notificacoes): corrigir duplicação ao notificar
  style(nav): ajustar espaçamento dos ícones
  docs(readme): atualizar instruções de deploy
  refactor(auth): separar lógica de login em módulo
  chore(deps): atualizar dependências
```

**Tipos aceitos:**
| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `style` | Mudanças visuais sem impacto funcional |
| `refactor` | Refatoração sem nova feature ou fix |
| `docs` | Apenas documentação |
| `test` | Testes |
| `chore` | Tarefas de manutenção |

### 4. Abrindo Pull Request

- Sempre abra PR para `develop`, nunca direto para `main`
- Descreva o que foi feito e por quê
- Adicione screenshots se for mudança visual
- Atualize o `CHANGELOG.md` na seção `[Não lançado]`

### 5. Release

```bash
# Prepare a release
git checkout -b release/v1.x.0
# Atualize versão no CHANGELOG, mova "[Não lançado]" para "[1.x.0] — DATA"
git commit -m "chore(release): prepare v1.x.0"

# Merge para main e develop
git checkout main && git merge release/v1.x.0
git tag -a v1.x.0 -m "Release v1.x.0"
git push origin main --tags

git checkout develop && git merge release/v1.x.0
git push origin develop
```
