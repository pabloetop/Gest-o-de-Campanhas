-- Schema para a aplicação ETOP (Supabase)

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT,
    empresa TEXT,
    pass TEXT NOT NULL,
    role TEXT NOT NULL,
    initials TEXT,
    "avClass" TEXT
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    resp TEXT,
    lojas INTEGER DEFAULT 0,
    dia TEXT,
    tel TEXT,
    "end" TEXT,
    obs TEXT
);

-- 3. Tabela de Campanhas
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
    planejamentos JSONB DEFAULT '{}'::jsonb
);

-- 4. Tabela de Agenda (Simples, como chave-valor)
CREATE TABLE IF NOT EXISTS agenda (
    id TEXT PRIMARY KEY,
    tasks JSONB DEFAULT '[]'::jsonb
);

-- INSERIR DADOS PADRÃO (Para testar no início, igual ao JS)
INSERT INTO users (id, nome, email, pass, role, initials, "avClass", empresa) VALUES
('v1', 'Rafael Mendes', 'rafael@abc.com', '1234', 'v', 'RM', 'av-o', 'ABC Distribuidora'),
('g1', 'Ana Gerente', 'ana@abc.com', '1234', 'g', 'AG', 'av-d', 'ABC Distribuidora')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clientes (id, nome, resp, lojas, dia, tel, "end") VALUES
('c1', 'Mercadinho do João', 'João Silva', 1, 'Segunda-feira', '(81) 98877-6655', 'Rua das Flores, 12, Centro'),
('c2', 'Rede Econômica', 'Marta Souza', 4, 'Terça-feira', '(81) 3456-7890', 'Av. Principal, 500, Boa Viagem'),
('c3', 'Armazém Porto', 'Ricardo Porto', 1, 'Quarta-feira', '(81) 99221-3344', 'Rua do Sol, 88, Olinda')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campanhas (id, nome, emoji, produto, meta, premio, ini, fim, status, planejamentos) VALUES
('camp1', 'Mega Verão 2025', '☀️', 'Refrigerante 2L', 12000, 'R$ 1.500 + Voucher', '2025-01-01', '2025-02-28', 'ativa', '{"v1": {"vendido": 5200, "clientes": ["c1", "c2"], "planejado": 5000}, "v2": {"vendido": 2100, "clientes": ["c2"], "planejado": 4000}}'::jsonb),
('camp2', 'Festival de Limpeza', '✨', 'Sabão em Pó 1kg', 8000, 'iPhone 15', '2025-02-15', '2025-03-31', 'ativa', '{"v1": {"vendido": 800, "clientes": ["c1", "c3"], "planejado": 3000}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agenda (id, tasks) VALUES
('seg', '[]'::jsonb),
('ter', '[{"id": "t1", "text": "Visita Rede Econômica", "type": "visita"}]'::jsonb),
('qua', '[]'::jsonb),
('qui', '[]'::jsonb),
('sex', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Bypassing RLS (Row Level Security) for initial frontend communication
-- As policies would make fetching complex right now.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas DISABLE ROW LEVEL SECURITY;
ALTER TABLE agenda DISABLE ROW LEVEL SECURITY;
