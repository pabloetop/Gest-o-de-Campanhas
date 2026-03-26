# 📈 ETOP — Plataforma de Campanhas de Vendas

> Plataforma web para gerenciamento de campanhas comerciais, planejamento de metas e acompanhamento de desempenho de equipes de vendas.

---

## 📋 Sobre o Projeto

O **ETOP** conecta gerentes e vendedores em torno de campanhas de vendas com premiação baseada em desempenho real. O vendedor planeja seu volume de vendas e recebe o prêmio somente quando supera o valor planejado.

---

## ✨ Funcionalidades

### 👤 Vendedor
- Login e cadastro com seleção de perfil
- Home com progresso geral e ações rápidas
- Visualização de campanhas ativas e encerradas (com filtro)
- Planejamento de vendas por campanha (valor planejado × valor vendido)
- Sistema de premiação: prêmio desbloqueado ao superar o planejado
- Cadastro e edição de clientes (responsável, lojas, dia de visita)
- Vinculação de clientes ao planejamento
- Perfil com foto, bio e informações pessoais

### 🏢 Gerente
- Home com painel da equipe em tempo real
- Criação de campanhas com meta em R$, prêmio e produto
- Visualização de desempenho por vendedor em cada campanha
- Campanhas encerradas bloqueadas para edição (somente leitura)
- Filtro de campanhas: Todas / Ativas / Encerradas
- Agenda Produtiva semanal (rotas, visitas, reuniões)
- Notificação de vendedores sem planejamento
- Perfil com foto, bio e cargo

### 🔔 Sistema de Notificações
- Sino na barra superior com ponto vermelho para não lidas
- Tipos: nova campanha, campanha encerrada, lembrete de planejamento
- Painel deslizante com marcação individual e "marcar todas como lidas"

---

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/etop.git
cd etop

# Abra diretamente no navegador (sem build necessário)
open src/index.html

# Ou use um servidor local simples
npx serve src/
# ou
python3 -m http.server 3000 --directory src/
```

---

## 📁 Estrutura de Pastas

```
etop/
├── src/
│   ├── index.html        # Entrada da aplicação
│   ├── styles.css        # Estilos globais
│   └── app.js            # Lógica principal e renderização
├── public/
│   └── favicon.svg       # Ícone do app
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD para GitHub Pages
├── CHANGELOG.md          # Histórico de versões
├── .gitignore
└── README.md
```

---

## 🗂️ Versionamento

Este projeto segue o padrão [Semantic Versioning](https://semver.org/lang/pt-BR/):

```
MAJOR.MINOR.PATCH

Exemplos:
  1.0.0  → Lançamento inicial
  1.1.0  → Nova funcionalidade (ex: agenda produtiva)
  1.1.1  → Correção de bug
  2.0.0  → Mudança que quebra compatibilidade
```

### Tags Git

```bash
# Criar uma nova versão
git tag -a v1.0.0 -m "Release v1.0.0 — Lançamento inicial"
git push origin v1.0.0

# Listar versões
git tag -l

# Ver detalhes de uma versão
git show v1.0.0
```

---

## 🌿 Fluxo de Branches

```
main          → produção estável
develop       → integração de novas features
feature/*     → novas funcionalidades
fix/*         → correções de bugs
release/*     → preparação de release
```

### Exemplos de branches

```bash
git checkout -b feature/ranking-vendedores
git checkout -b fix/notificacao-duplicada
git checkout -b release/v1.2.0
```

---

## 🔄 Deploy Automático

O deploy para **GitHub Pages** é feito automaticamente via GitHub Actions ao fazer push na branch `main`.

URL de produção: `https://SEU_USUARIO.github.io/etop`

---

## 📄 Licença

MIT © ETOP
