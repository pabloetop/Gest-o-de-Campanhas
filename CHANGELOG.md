# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.0] — 2026-03-31

### Adicionado
- **Integração Supabase**: Autenticação nativa (`auth.users`) e Banco de Dados relacional.
- **Camada de API**: Novo módulo `src/api.js` para isolar transações com o backend.
- **Camada de UI**: Novo módulo `src/ui.js` com Snackbars, Skeletons e componentes globais.
- **Dashboard Gerente**: Gráficos dinâmicos `Chart.js` comparando metas vs vendas por equipe.
- **Multi-tenant**: Isolamento real por `empresa_id` em todas as tabelas.
- **Storage**: Upload de fotos de perfil integrado ao Supabase Storage (`avatars`).

### Alterado
- Refatoração massiva do `app.js` reduzindo seu tamanho e desacoplando lógica de dados.
- Estrutura de arquivos: Migração para pasta `src/` com modularização JS.
- Schema SQL unificado e idempotente em `supabase_schema.sql`.

---

## [1.8.0] — 2026-03-30

### Adicionado
- Salvamento de foto de perfil em string Base64 persistida no banco de dados.
- Escopo de visualização de Campanhas e Equipes isolado automaticamente pelo ID da Empresa (`empresaId`).

### Alterado
- Os campos do Perfil (Email, CPF, Empresa, Cargo, Telefone, Cidade) agora são carregados dinamicamente dos dados da sessão do usuário atual.
- O cadastro de usuários (Vendedores/Gerentes) com o mesmo nome de empresa unifica ambos sob um mesmo `empresaId` primário.

### Corrigido
- Planejamento de campanhas agora é salvo corretamente usando a identificação isolada de cada vendedor (`currentUser.id`), e não mais fixado no ID `v1`.

---

## [1.7.0] — 2025-03-19

### Adicionado
- Sistema de notificações com sino na barra superior
- Ponto vermelho indicando notificações não lidas
- Painel de notificações com tipos: nova campanha, encerramento, lembrete
- Botão "Marcar todas como lidas"
- Ícones SVG minimalistas na bottom nav (substituindo emojis)

### Alterado
- Sistema de premiação migrado de "caixas planejadas" para "valor vendido (R$)"
- Prêmio agora é desbloqueado quando vendido ≥ planejado
- Três estados de premiação: bloqueado, superou plano, premiado
- Campo "Meta da campanha" agora em R$ no formulário do gerente

---

## [1.6.0] — 2025-03-18

### Adicionado
- Filtro de campanhas: Todas / Ativas / Encerradas (vendedor e gerente)
- Edição completa de clientes: responsável, qtd. de lojas, dia de visita
- Agenda Produtiva para gerentes (Seg–Sex) com tipos de atividade
- Bloqueio de edição em campanhas encerradas
- Badge "🔒 Encerrada — somente leitura" no detalhe da campanha

### Corrigido
- Campanhas encerradas não podem mais ser abertas para planejamento

---

## [1.5.0] — 2025-03-17

### Adicionado
- Criação de campanhas pelo gerente com persistência em estado global
- Planejamento de vendas por campanha com cálculo de meta em tempo real
- Vinculação de clientes ao planejamento via modal com checkboxes
- Tela de detalhe da campanha para gerente com desempenho por vendedor
- Barra de progresso individual por vendedor no detalhe da campanha

### Alterado
- Clientes cadastrados aparecem no modal de seleção do planejamento

---

## [1.4.0] — 2025-03-16

### Adicionado
- Foto de perfil com upload e preview em tempo real
- Avatar atualizado em todas as abas ao trocar foto
- Campo "Sobre mim" com bio sincronizada no card de perfil
- Campos adicionais: telefone, cidade/estado, cargo (gerente)
- Tela de Perfil separada para gerente e vendedor

### Corrigido
- Gerente ao clicar em "Perfil" não caia mais na tela do vendedor
- Bottom nav do gerente mantém contexto correto em todas as abas

---

## [1.3.0] — 2025-03-15

### Adicionado
- Botão "Sair" visível em todas as telas logadas
- Modal de confirmação de logout
- Feedback visual ao selecionar Vendedor/Gerente no login e cadastro
- Card de preview com descrição do perfil selecionado

### Alterado
- Nome do app alterado de "Pulsus" para "ETOP"

---

## [1.2.0] — 2025-03-14

### Adicionado
- Tela Home do Vendedor com estatísticas e ações rápidas
- Tela Campanhas do Vendedor com destaque para não participantes
- Tela Campanhas do Gerente com lista e criação
- Tela Clientes com cadastro funcional
- Tela Planejamento por campanha
- Bottom navigation com 4 abas (vendedor) e 5 abas (gerente)
- Tela de Equipe do Gerente

---

## [1.1.0] — 2025-03-13

### Adicionado
- Tela de login com toggle Vendedor/Gerente
- Tela de cadastro com campos: nome, email, CPF, empresa, senha
- Redirecionamento para Home correta conforme perfil

---

## [1.0.0] — 2025-03-12

### Adicionado
- Estrutura inicial do projeto
- Layout base com identidade visual ETOP
- Paleta de cores: laranja (#FF5C35), dark navy (#1A1A2E), verde (#00C896)
- Tipografia: Syne (títulos) + DM Sans (corpo)
