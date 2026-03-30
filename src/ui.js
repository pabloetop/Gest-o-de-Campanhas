// ============================================================
// ETOP — ui.js  |  Componentes visuais reutilizáveis
// ============================================================

// =====================================================
// FORMATTERS
// =====================================================
const fmtR = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = s => { if (!s) return '—'; const [y, m, d] = s.split('-'); return `${d}/${m}`; };

// =====================================================
// SNACK TOAST (com tipo: info, success, error)
// =====================================================
function snack(txt, type = 'info') {
  const s = document.getElementById('snack');
  if (!s) return;
  s.textContent = txt;
  s.className = 'snack show';
  if (type === 'error')   s.style.background = '#E24B4A';
  else if (type === 'success') s.style.background = 'var(--accent)';
  else s.style.removeProperty('background');
  clearTimeout(snack._t);
  snack._t = setTimeout(() => s.classList.remove('show'), 2800);
}

// =====================================================
// MODAL
// =====================================================
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function trig(id)       { document.getElementById(id)?.click(); }

// =====================================================
// NOTIF PANEL TOGGLE
// =====================================================
function toggleNotif(e) {
  e.stopPropagation();
  document.getElementById('notif-panel')?.classList.toggle('open');
}
window.onclick = function (e) {
  if (!e.target.closest('.notif-panel') && !e.target.closest('.notif-btn'))
    document.getElementById('notif-panel')?.classList.remove('open');
};

// =====================================================
// NOTIFICATION DOTS
// =====================================================
function updateNotifDots(hasUnread) {
  document.querySelectorAll('.notif-dot').forEach(d => d.classList.toggle('show', !!hasUnread));
}

// =====================================================
// LOADING OVERLAY
// =====================================================
function showLoadingOverlay(msg = 'Carregando...') {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.innerHTML = `<div class="ld-spinner"></div><div class="ld-msg">${msg}</div>`;
    document.body.appendChild(el);
  } else {
    el.querySelector('.ld-msg').textContent = msg;
  }
  el.classList.add('show');
}
function hideLoadingOverlay() {
  document.getElementById('loading-overlay')?.classList.remove('show');
}

// =====================================================
// SKELETON LOADER
// =====================================================
function showSkeleton(containerId, rows = 3) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array(rows).fill(0).map(() =>
    `<div class="sk-card">
      <div class="sk-line wide"></div>
      <div class="sk-line medium"></div>
      <div class="sk-line short"></div>
    </div>`
  ).join('');
}

// =====================================================
// ZERO-STATE (HTML gerador)
// =====================================================
function zeroState({ icon, title, sub, btn, fn }) {
  return `
    <div class="zero-state">
      <div class="zero-icon">${icon}</div>
      <div class="zero-title">${title}</div>
      <div class="zero-sub">${sub}</div>
      ${btn ? `<button class="btn btn-p btn-sm" onclick="${fn}">${btn}</button>` : ''}
    </div>`;
}

// =====================================================
// THEME TOGGLE
// =====================================================
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('etop_theme', isDark ? 'dark' : 'light');
  // Redraw charts if visible
  if (typeof gerenteBarChart !== 'undefined' && gerenteBarChart) {
    const canvas = document.getElementById('chart-equipe');
    if (canvas) setTimeout(() => renderEquipeChart(VENDEDORES, getMinhasCampanhas()), 100);
  }
}
function loadTheme() {
  if (localStorage.getItem('etop_theme') === 'dark') document.body.classList.add('dark');
}

// =====================================================
// SYNC campos do perfil
// =====================================================
function sync(id, disp) {
  const el = document.getElementById(id);
  const dp = document.getElementById(disp);
  if (el && dp) dp.textContent = el.value;
}
function syncSobre(id, disp) {
  const el = document.getElementById(id);
  const dp = document.getElementById(disp);
  if (el && dp) dp.textContent = el.value || 'Adicione uma bio abaixo';
}
