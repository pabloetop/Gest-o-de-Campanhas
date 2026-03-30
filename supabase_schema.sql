-- ============================================================
-- ETOP Plataforma — Schema Completo v2.0
-- Suporta: Multi-tenant por empresa, Supabase Auth, Storage
-- ============================================================

-- 0. Limpar tabelas antigas se necessário (cuidado em produção!)
-- DROP TABLE IF EXISTS notificacoes, planejamentos, agenda, campanhas, clientes, users, empresas CASCADE;

-- =====================================================
-- 1. EMPRESAS (Multi-tenant root)
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USERS (perfis públicos, vinculados ao supabase auth)
-- =====================================================
-- IMPORTANTE: id deve ser o mesmo UUID do auth.users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT,
  empresa TEXT,
  empresa_id TEXT REFERENCES empresas(id),
  role TEXT NOT NULL DEFAULT 'v' CHECK (role IN ('v','g')),
  initials TEXT,
  av_class TEXT,
  photo_url TEXT,
  telefone TEXT,
  cidade TEXT,
  cargo TEXT,
  sobre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CLIENTES (por empresa)
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  resp TEXT,
  lojas INTEGER DEFAULT 0,
  dia TEXT,
  tel TEXT,
  "end" TEXT,
  obs TEXT,
  empresa_id TEXT REFERENCES empresas(id),
  vendedor_id TEXT REFERENCES users(id)
);

-- =====================================================
-- 4. CAMPANHAS (por empresa)
-- =====================================================
CREATE TABLE IF NOT EXISTS campanhas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  emoji TEXT,
  produto TEXT,
  "desc" TEXT,
  meta NUMERIC DEFAULT 0,
  premio TEXT,
  ini TEXT,
  fim TEXT,
  status TEXT DEFAULT 'ativa',
  empresa_id TEXT REFERENCES empresas(id),
  planejamentos JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 5. PLANEJAMENTOS (tabela normalizada para analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS planejamentos (
  id TEXT PRIMARY KEY,
  campanha_id TEXT NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  vendedor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  valor_planejado NUMERIC DEFAULT 0,
  valor_vendido NUMERIC DEFAULT 0,
  clientes_vinculados JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campanha_id, vendedor_id)
);

-- =====================================================
-- 6. AGENDA (por empresa, chave composta)
-- =====================================================
CREATE TABLE IF NOT EXISTS agenda (
  empresa_id TEXT NOT NULL REFERENCES empresas(id),
  dia TEXT NOT NULL CHECK (dia IN ('seg','ter','qua','qui','sex')),
  tasks JSONB DEFAULT '[]'::jsonb,
  PRIMARY KEY (empresa_id, dia)
);

-- =====================================================
-- 7. NOTIFICACOES (persistidas por usuário)
-- =====================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'lembrete',
  title TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DADOS PADRÃO DE DEMONSTRAÇÃO
-- (Inserir empresa inicial para testes)
-- =====================================================
INSERT INTO empresas (id, nome) VALUES
  ('emp1', 'ABC Distribuidora')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DESABILITAR RLS (simplificado para fase de desenvolvimento)
-- Habilitar e configurar políticas antes de ir a produção
-- =====================================================
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas DISABLE ROW LEVEL SECURITY;
ALTER TABLE planejamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE agenda DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SCRIPT DE MIGRAÇÃO (rodar se as tabelas já existiam antes)
-- Execute apenas se estiver atualizando de uma versão anterior
-- =====================================================

-- Renomear coluna empresaId para empresa_id em users
-- ALTER TABLE users RENAME COLUMN "empresaId" TO empresa_id;

-- Renomear coluna empresaId para empresa_id em campanhas
-- ALTER TABLE campanhas RENAME COLUMN "empresaId" TO empresa_id;

-- Adicionar colunas novas em users (se não existirem)
ALTER TABLE users ADD COLUMN IF NOT EXISTS empresa_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sobre TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS av_class TEXT;

-- Criar coluna empresa_id em campanhas (se não existir, converte de empresaId)
ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS empresa_id TEXT;
UPDATE campanhas SET empresa_id = "empresaId" WHERE empresa_id IS NULL AND "empresaId" IS NOT NULL;

-- Adicionar empresa_id em clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS empresa_id TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vendedor_id TEXT;

-- Recriar agenda com suporte multi-tenant
-- ATENÇÃO: Os dados existentes de agenda serão perdidos nesta migração!
-- Faça backup antes se necessário.
-- DROP TABLE IF EXISTS agenda;
-- CREATE TABLE IF NOT EXISTS agenda (
--   empresa_id TEXT NOT NULL,
--   dia TEXT NOT NULL CHECK (dia IN ('seg','ter','qua','qui','sex')),
--   tasks JSONB DEFAULT '[]'::jsonb,
--   PRIMARY KEY (empresa_id, dia)
-- );

-- Criar tabela planejamentos se não existir
CREATE TABLE IF NOT EXISTS planejamentos (
  id TEXT PRIMARY KEY,
  campanha_id TEXT,
  vendedor_id TEXT,
  valor_planejado NUMERIC DEFAULT 0,
  valor_vendido NUMERIC DEFAULT 0,
  clientes_vinculados JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campanha_id, vendedor_id)
);

-- Criar tabela notificacoes se não existir
CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT DEFAULT 'lembrete',
  title TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela empresas se não existir
CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO empresas (id, nome) VALUES ('emp1', 'ABC Distribuidora') ON CONFLICT DO NOTHING;
