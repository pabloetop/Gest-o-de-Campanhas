-- ============================================================
-- ETOP Plataforma — Schema Consolidado v2.0
-- Suporta: Multi-tenant por empresa, Supabase Auth, Storage
-- Data: 31/03/2026
-- ============================================================

-- -----------------------------------------------------
-- 1. ESTRUTURA CORE (Tabelas e Relacionamentos)
-- -----------------------------------------------------

-- Empresas (Tenant Root)
CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usuários (Perfis vinculados ao Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Deve ser o UUID do auth.users
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

-- Clientes
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

-- Campanhas
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
  planejamentos JSONB DEFAULT '{}'::jsonb -- Backup de segurança em JSONB
);

-- Planejamentos (Tabela normalizada para Performance/Analytics)
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

-- Agenda (Multi-tenant por empresa e dia)
CREATE TABLE IF NOT EXISTS agenda (
  empresa_id TEXT NOT NULL REFERENCES empresas(id),
  dia TEXT NOT NULL CHECK (dia IN ('seg','ter','qua','qui','sex')),
  tasks JSONB DEFAULT '[]'::jsonb,
  PRIMARY KEY (empresa_id, dia)
);

-- Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'lembrete',
  title TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------
-- 2. SCRIPTS DE MIGRAÇÃO (Idempotentes)
-- -----------------------------------------------------

-- Adição de colunas novas em users (caso venha da v1.0)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='empresa_id') THEN
    ALTER TABLE users ADD COLUMN empresa_id TEXT REFERENCES empresas(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='photo_url') THEN
    ALTER TABLE users ADD COLUMN photo_url TEXT;
  END IF;
END $$;

-- Correção de campos em campanhas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campanhas' AND column_name='empresaId') THEN
    UPDATE campanhas SET empresa_id = "empresaId" WHERE empresa_id IS NULL;
  END IF;
END $$;

-- -----------------------------------------------------
-- 3. DADOS INICIAIS E SEGURANÇA
-- -----------------------------------------------------

-- Empresa padrão para testes
INSERT INTO empresas (id, nome) VALUES ('emp1', 'ABC Distribuidora')
ON CONFLICT (id) DO NOTHING;

-- RLS (Row Level Security)
-- Por padrão, desabilitado para facilidade em desenvolvimento.
-- Ative no console se for para produção.
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas DISABLE ROW LEVEL SECURITY;
ALTER TABLE planejamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE agenda DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes DISABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- [EXTRAS: TEMPLATE POLICIES RLS — NÃO EXECUTAR AINDA] --
-- -----------------------------------------------------
-- CREATE POLICY "Apenas membros da mesma empresa visualizam usuários"
-- ON users FOR SELECT USING (empresa_id = (SELECT empresa_id FROM users WHERE id = auth.uid()));
