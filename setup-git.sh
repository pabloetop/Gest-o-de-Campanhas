#!/bin/bash
# ==============================================
# ETOP — Script de inicialização do repositório
# ==============================================
# Execute: bash setup-git.sh
# ==============================================

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  _____ _____ ___  ____  "
echo " | ____|_   _/ _ \|  _ \ "
echo " |  _|   | || | | | |_) |"
echo " | |___  | || |_| |  __/ "
echo " |_____| |_| \___/|_|    "
echo -e "${NC}"
echo "  Setup do repositório Git"
echo ""

# ---- 1. Inicializa git ----
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}► Inicializando repositório Git...${NC}"
  git init
  git branch -M main
else
  echo -e "${GREEN}✓ Repositório Git já existe${NC}"
fi

# ---- 2. Configura branches ----
echo -e "${YELLOW}► Criando branch develop...${NC}"
git checkout -b develop 2>/dev/null || git checkout develop

# ---- 3. Primeiro commit ----
echo -e "${YELLOW}► Adicionando arquivos...${NC}"
git add .
git commit -m "feat: initial commit — ETOP v1.7.0

- Sistema de login com perfis Vendedor e Gerente
- Campanhas com premiação baseada em valor vendido
- Planejamento: prêmio desbloqueado ao superar o planejado
- Gestão de clientes com responsável, lojas e dia de visita
- Agenda Produtiva semanal para gerentes
- Sistema de notificações com painel e ponto indicador
- Ícones SVG minimalistas na navegação
- Filtros de campanhas: Todas / Ativas / Encerradas
- Deploy automático via GitHub Actions para GitHub Pages"

# ---- 4. Tag da versão ----
echo -e "${YELLOW}► Criando tag v1.7.0...${NC}"
git tag -a v1.7.0 -m "Release v1.7.0 — Versão inicial publicada"

# ---- 5. Volta para main ----
git checkout main
git merge develop --no-ff -m "chore: merge develop into main for v1.7.0"
git tag -a v1.7.0-main -m "v1.7.0 on main" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Repositório configurado com sucesso!${NC}"
echo ""
echo -e "${CYAN}Próximos passos:${NC}"
echo ""
echo "  1. Crie o repositório no GitHub:"
echo "     https://github.com/new"
echo "     Nome sugerido: etop"
echo ""
echo "  2. Conecte ao remoto:"
echo "     git remote add origin https://github.com/SEU_USUARIO/etop.git"
echo ""
echo "  3. Envie tudo:"
echo "     git push -u origin main"
echo "     git push origin develop"
echo "     git push origin --tags"
echo ""
echo "  4. Ative o GitHub Pages:"
echo "     Repositório → Settings → Pages → Source: GitHub Actions"
echo ""
echo -e "${CYAN}Branches criadas:${NC}"
git branch -v
echo ""
echo -e "${CYAN}Tags criadas:${NC}"
git tag -l
