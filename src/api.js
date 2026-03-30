// ============================================================
// ETOP — api.js  |  Camada de acesso ao Supabase (Auth + CRUD)
// ============================================================

const SUPABASE_URL = 'https://kudfexbgjwayxppnfcyh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZGZleGJnandheXhwcG5mY3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mzk3MzgsImV4cCI6MjA5MDIxNTczOH0.FrcUgasCCt2FRsLPO_d6RUDTZUbOMjWezl9LL_9oaXw';

let _supabase = null;

function initSupabase() {
  if (!window.supabase) { console.error('Supabase SDK não encontrado.'); return null; }
  if (!_supabase) _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _supabase;
}

function getClient() {
  return _supabase || initSupabase();
}

// =====================================================
// AUTH — Autenticação via Supabase
// =====================================================

async function apiSignIn(email, password) {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function apiSignUp(email, password, metadata) {
  const { data, error } = await getClient().auth.signUp({
    email, password,
    options: { data: metadata }
  });
  if (error) throw error;
  return data;
}

async function apiSignOut() {
  await getClient().auth.signOut();
}

async function apiGetSession() {
  const { data } = await getClient().auth.getSession();
  return data.session;
}

// =====================================================
// EMPRESA — Busca ou cria pelo nome
// =====================================================

async function apiGetOrCreateEmpresa(nome) {
  const client = getClient();
  const trimmed = nome.trim();
  // 1. Tenta achar por nome (case-insensitive)
  const { data: found } = await client.from('empresas').select('*').ilike('nome', trimmed).maybeSingle();
  if (found) return found;
  // 2. Cria nova empresa
  const id = 'emp_' + Date.now();
  const { data: created, error } = await client.from('empresas').insert({ id, nome: trimmed }).select().single();
  if (error) throw error;
  return created;
}

// =====================================================
// USERS — Perfis públicos
// =====================================================

async function apiGetProfile(userId) {
  const { data, error } = await getClient().from('users').select('*').eq('id', userId).single();
  if (error) throw error;
  return _normalizeUser(data);
}

async function apiGetUsersByEmpresa(empresaId) {
  const { data, error } = await getClient().from('users').select('*').eq('empresa_id', empresaId);
  if (error) { console.warn('apiGetUsersByEmpresa:', error); return []; }
  return (data || []).map(_normalizeUser);
}

async function apiUpsertProfile(profile) {
  const { error } = await getClient().from('users').upsert(profile);
  if (error) throw error;
}

// Normaliza campos legados (avClass vs av_class, empresaId vs empresa_id)
function _normalizeUser(u) {
  if (!u) return u;
  return {
    ...u,
    empresa_id: u.empresa_id || u.empresaId || null,
    av_class: u.av_class || u.avClass || 'av-o',
  };
}

// =====================================================
// STORAGE — Upload de avatar
// =====================================================

async function apiUploadAvatar(userId, file) {
  const client = getClient();
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await client.storage.from('avatars').upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = client.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl + '?t=' + Date.now(); // cache-busting
}

// =====================================================
// CAMPANHAS
// =====================================================

async function apiGetCampanhas(empresaId) {
  const { data, error } = await getClient().from('campanhas').select('*').eq('empresa_id', empresaId);
  if (error) { console.warn('apiGetCampanhas:', error); return []; }
  return (data || []).map(c => ({
    ...c,
    empresa_id: c.empresa_id || c.empresaId,
    planejamentos: typeof c.planejamentos === 'string'
      ? JSON.parse(c.planejamentos)
      : (c.planejamentos || {})
  }));
}

async function apiUpsertCampanha(campanha) {
  const { error } = await getClient().from('campanhas').upsert(campanha);
  if (error) throw error;
}

// =====================================================
// CLIENTES
// =====================================================

async function apiGetClientes(empresaId) {
  const { data, error } = await getClient().from('clientes').select('*').eq('empresa_id', empresaId);
  if (error) { console.warn('apiGetClientes:', error); return []; }
  return data || [];
}

async function apiUpsertCliente(cliente) {
  const { error } = await getClient().from('clientes').upsert(cliente);
  if (error) throw error;
}

// =====================================================
// AGENDA (multi-tenant: (empresa_id, dia) como PK)
// =====================================================

async function apiGetAgenda(empresaId) {
  const result = { seg: [], ter: [], qua: [], qui: [], sex: [] };
  try {
    // Suporte à tabela legada (PK = dia) e nova (PK composta)
    const { data } = await getClient().from('agenda').select('*');
    if (data) {
      data.forEach(row => {
        // Filtra somente os registros da empresa atual OU registros legados sem empresa_id
        const matchEmpresa = !row.empresa_id || row.empresa_id === empresaId;
        const dia = row.dia || row.id; // legado usa 'id' como chave do dia
        if (matchEmpresa && result.hasOwnProperty(dia)) {
          result[dia] = typeof row.tasks === 'string' ? JSON.parse(row.tasks) : (row.tasks || []);
        }
      });
    }
  } catch (e) { console.warn('apiGetAgenda:', e); }
  return result;
}

async function apiUpsertAgendaDia(empresaId, dia, tasks) {
  try {
    // Tenta upsert na tabela legada (id = dia, adiciona empresa_id se houver coluna)
    const payload = { id: dia, tasks, empresa_id: empresaId };
    const { error } = await getClient().from('agenda').upsert(payload);
    if (error) console.warn('apiUpsertAgendaDia:', error);
  } catch (e) { console.warn('apiUpsertAgendaDia:', e); }
}

// =====================================================
// PLANEJAMENTOS (tabela normalizada para analytics)
// =====================================================

async function apiUpsertPlanejamento(plan) {
  try {
    const { error } = await getClient().from('planejamentos').upsert(plan, { onConflict: 'campanha_id,vendedor_id' });
    if (error) console.warn('apiUpsertPlanejamento:', error);
  } catch (e) { console.warn('apiUpsertPlanejamento:', e); }
}

// =====================================================
// NOTIFICACOES
// =====================================================

async function apiGetNotificacoes(userId) {
  const { data, error } = await getClient().from('notificacoes')
    .select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
  if (error) { console.warn('apiGetNotificacoes:', error); return []; }
  return data || [];
}

async function apiInsertNotificacao(notif) {
  try {
    const { error } = await getClient().from('notificacoes').insert(notif);
    if (error) console.warn('apiInsertNotificacao:', error);
  } catch (e) { console.warn('apiInsertNotificacao:', e); }
}

async function apiMarkNotifRead(notifId) {
  try {
    await getClient().from('notificacoes').update({ unread: false }).eq('id', notifId);
  } catch (e) { console.warn('apiMarkNotifRead:', e); }
}

async function apiMarkAllNotifsRead(userId) {
  try {
    await getClient().from('notificacoes').update({ unread: false }).eq('user_id', userId);
  } catch (e) { console.warn('apiMarkAllNotifsRead:', e); }
}

// =====================================================
// LOAD ALL DATA (carrega todos os dados da empresa)
// =====================================================

async function loadAllData() {
  if (!currentUser || !currentUser.empresa_id) return;
  const eid = currentUser.empresa_id;

  const [usersData, clientesData, campanhasData, agendaData] = await Promise.all([
    apiGetUsersByEmpresa(eid),
    apiGetClientes(eid),
    apiGetCampanhas(eid),
    apiGetAgenda(eid)
  ]);

  USERS = usersData.length > 0 ? usersData : [...DEFAULT_USERS];
  CLIENTES = clientesData.length > 0 ? clientesData : [...DEFAULT_CLIENTES];
  CAMPANHAS = campanhasData.length > 0 ? campanhasData : [...DEFAULT_CAMPANHAS];
  AGENDA = { seg: [], ter: [], qua: [], qui: [], sex: [], ...agendaData };
  VENDEDORES = USERS.filter(u => u.role === 'v' && (u.empresa_id || u.empresaId) === eid);
}

// =====================================================
// SAVE ALL (compatibilidade com código legado)
// =====================================================

async function saveAll() {
  try {
    const client = getClient();
    if (!client || !currentUser) return;
    const eid = currentUser.empresa_id;

    // Upsert campanhas com empresa_id
    if (CAMPANHAS.length > 0) {
      await Promise.all(CAMPANHAS.map(c => apiUpsertCampanha({ ...c, empresa_id: c.empresa_id || eid })));
    }
    // Upsert clientes com empresa_id
    if (CLIENTES.length > 0) {
      await Promise.all(CLIENTES.map(c => apiUpsertCliente({ ...c, empresa_id: c.empresa_id || eid })));
    }
    // Upsert agenda
    for (const dia of ['seg','ter','qua','qui','sex']) {
      await apiUpsertAgendaDia(eid, dia, AGENDA[dia] || []);
    }
  } catch (e) {
    console.error('saveAll error:', e);
  }
}
