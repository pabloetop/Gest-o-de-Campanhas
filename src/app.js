// ======================== DATA & STATE ========================
let userRole='v'; // 'v' vendedor, 'g' gerente
let currentScreen='s-login';
let screenStack=['s-login'];
let vFiltro='todas';
let campFiltro='todas';
let campAtiva=null;
let planTemp=null;
let clientesTempSel=[];
let editandoClienteId=null;
let agendaTaskType={};

// --- Storage Key Names ---
const ST_CAMP = 'etop_campanhas';
const ST_CLI = 'etop_clientes';
const ST_AGENDA = 'etop_agenda';
const ST_THEME = 'etop_theme';
const ST_USERS = 'etop_users';

let currentUser = null;


// --- Default Data ---
const DEFAULT_USERS=[
  {id:'v1',nome:'Rafael Mendes',initials:'RM',avClass:'av-o',email:'rafael@abc.com',pass:'1234',role:'v',empresa:'ABC Distribuidora'},
  {id:'g1',nome:'Ana Gerente',initials:'AG',avClass:'av-d',email:'ana@abc.com',pass:'1234',role:'g',empresa:'ABC Distribuidora'}
];
const VENDEDORES_INFO = [
  {id:'v1',nome:'Rafael Mendes',initials:'RM',avClass:'av-o'},
  {id:'v2',nome:'Bruna Silveira',initials:'BS',avClass:'av-g'},
  {id:'v3',nome:'Carlos Porto',initials:'CP',avClass:'av-gold'},
  {id:'v4',nome:'Danielle Lima',initials:'DL',avClass:'av-gray'}
];


const DEFAULT_CLIENTES=[
  {id:'c1',nome:'Mercadinho do João',resp:'João Silva',lojas:1,dia:'Segunda-feira',tel:'(81) 98877-6655',end:'Rua das Flores, 12, Centro'},
  {id:'c2',nome:'Rede Econômica',resp:'Marta Souza',lojas:4,dia:'Terça-feira',tel:'(81) 3456-7890',end:'Av. Principal, 500, Boa Viagem'},
  {id:'c3',nome:'Armazém Porto',resp:'Ricardo Porto',lojas:1,dia:'Quarta-feira',tel:'(81) 99221-3344',end:'Rua do Sol, 88, Olinda'}
];

const DEFAULT_CAMPANHAS=[
  {id:'camp1',nome:'Mega Verão 2025',emoji:'☀️',produto:'Refrigerante 2L',meta:12000,premio:'R$ 1.500 + Voucher',ini:'2025-01-01',fim:'2025-02-28',status:'ativa',planejamentos:{
    'v1':{planejado:5000,vendido:5200,clientes:['c1','c2']},
    'v2':{planejado:4000,vendido:2100,clientes:['c2']}
  }},
  {id:'camp2',nome:'Festival de Limpeza',emoji:'✨',produto:'Sabão em Pó 1kg',meta:8000,premio:'iPhone 15',ini:'2025-02-15',fim:'2025-03-31',status:'ativa',planejamentos:{
    'v1':{planejado:3000,vendido:800,clientes:['c1','c3']}
  }},
  {id:'camp3',nome:'Junho Premiado',emoji:'🌽',produto:'Milho de Pipoca',meta:5000,premio:'R$ 500',ini:'2024-06-01',fim:'2024-06-30',status:'encerrada',planejamentos:{
    'v1':{planejado:2000,vendido:2500,clientes:['c2']},
    'v2':{planejado:2000,vendido:1800,clientes:['c1']}
  }}
];

// --- Live Data (Initialized from Storage or Defaults) ---
let USERS = JSON.parse(localStorage.getItem(ST_USERS)) || [...DEFAULT_USERS];
let CLIENTES = JSON.parse(localStorage.getItem(ST_CLI)) || [...DEFAULT_CLIENTES];
let CAMPANHAS = JSON.parse(localStorage.getItem(ST_CAMP)) || [...DEFAULT_CAMPANHAS];
let AGENDA = JSON.parse(localStorage.getItem(ST_AGENDA)) || {seg:[],ter:[{id:'t1',text:'Visita Rede Econômica',type:'visita'}],qua:[],qui:[],sex:[]};

// Compatibility with existing code
let VENDEDORES = VENDEDORES_INFO; 


const DAYS=['seg','ter','qua','qui','sex'];
const DAY_NAMES={seg:'Segunda',ter:'Terça',qua:'Quarta',qui:'Quinta',sex:'Sexta'};
const DAY_DATES={seg:'10/02',ter:'11/02',qua:'12/02',qui:'13/02',sex:'14/02'};

// --- Persistence Helpers ---
function saveAll(){
  localStorage.setItem(ST_CLI, JSON.stringify(CLIENTES));
  localStorage.setItem(ST_CAMP, JSON.stringify(CAMPANHAS));
  localStorage.setItem(ST_AGENDA, JSON.stringify(AGENDA));
  localStorage.setItem(ST_USERS, JSON.stringify(USERS));
}
function toggleTheme(){
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(ST_THEME, isDark ? 'dark' : 'light');
}
function loadTheme(){
  const theme = localStorage.getItem(ST_THEME);
  if(theme==='dark') document.body.classList.add('dark');
}

// ======================== CORE ENGINE ========================
function go(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById(id);
  if(el)el.classList.add('active');
  currentScreen=id;
  if(screenStack[screenStack.length-1]!==id)screenStack.push(id);
}
function back(){
  if(screenStack.length<=1)return;
  screenStack.pop();
  go(screenStack[screenStack.length-1]);
}
function trig(id){document.getElementById(id).click();}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function snack(txt){const s=document.getElementById('snack');s.textContent=txt;s.classList.add('show');setTimeout(()=>s.classList.remove('show'),2400);}
function toggleNotif(e){e.stopPropagation();document.getElementById('notif-panel').classList.toggle('open');}
window.onclick=function(e){if(!e.target.closest('.notif-panel')&&!e.target.closest('.notif-btn')){document.getElementById('notif-panel').classList.remove('open');}}

// ======================== HELPERS ========================
const fmtR=v=>(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate=s=>{if(!s)return'—';const[y,m,d]=s.split('-');return `${d}/${m}`;}
function myPlan(c){return c.planejamentos['v1'];}
function calcPremio(c,p){
  const planejado=p.planejado||0;
  const vendido=p.vendido||0;
  const pct=Math.min(100,Math.round(vendido/c.meta*100));
  let status='bloqueado';
  if(vendido>=c.meta)status='premiado';
  else if(vendido>=planejado&&planejado>0)status='superou_plan';
  return {status,pct,faltaMeta:c.meta-vendido,faltaPlan:planejado-vendido};
}

// ======================== ACTIONS ========================
function setRole(r,toggleId,btn){
  userRole=r;
  const parent=document.getElementById(toggleId);
  parent.querySelectorAll('.rbtn').forEach(b=>b.classList.remove('av','ag'));
  btn.classList.add(r==='v'?'av':'ag');
  const preview=document.getElementById(toggleId==='rt-login'?'rp-login':'rp-cad');
  const btnCad=document.getElementById('btn-cad');
  if(r==='v'){preview.className='rpreview rv';preview.innerHTML=`<div class="rpreview-icon">🎯</div><div><div class="rpreview-title">${toggleId==='rt-login'?'Acesso Vendedor':'Perfil Vendedor'}</div><div class="rpreview-desc">${toggleId==='rt-login'?'Visualize campanhas, planeje suas vendas e acompanhe seus ganhos.':'Participe de campanhas, cadastre clientes e planeje suas metas.'}</div></div>`;if(btnCad)btnCad.textContent='Cadastrar como Vendedor';}
  else{preview.className='rpreview rg';preview.innerHTML=`<div class="rpreview-icon">💼</div><div><div class="rpreview-title">${toggleId==='rt-login'?'Acesso Gerente':'Perfil Gerente'}</div><div class="rpreview-desc">${toggleId==='rt-login'?'Gerencie sua equipe, crie campanhas e analise resultados em tempo real.':'Crie campanhas para sua equipe, acompanhe vendas e bata metas.'}</div></div>`;if(btnCad)btnCad.textContent='Cadastrar como Gerente';}
  renderSidebar(); // Update sidebar content if role changes
}

function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  
  if(!email || !pass){ snack('Preencha todos os campos!'); return; }
  
  snack('Autenticando...');
  
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.pass === pass);
  
  setTimeout(()=>{
    if(!user){
      snack('E-mail ou senha incorretos.');
      return;
    }
    
    currentUser = user;
    userRole = user.role;
    
    syncUserUI();
    
    if(userRole==='v'){screenStack=['s-hv'];renderHV();go('s-hv');}
    else{screenStack=['s-hg'];renderHG();go('s-hg');}
    renderSidebar();
    updateNotifDots();
    snack(`Bem-vindo, ${user.nome}!`);
  },800);
}

function doRegister(){
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const cpf = document.getElementById('reg-cpf').value.trim();
  const empresa = document.getElementById('reg-empresa').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  
  if(!nome || !email || !pass){ snack('Preencha os campos obrigatórios!'); return; }
  if(USERS.some(u => u.email.toLowerCase() === email.toLowerCase())){ snack('Este e-mail já está cadastrado.'); return; }
  
  const id = (userRole==='v'?'v':'g') + Date.now();
  const initials = nome.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  const avClass = userRole==='v' ? 'av-o' : 'av-d';
  
  const newUser = { id, nome, email, cpf, empresa, pass, role: userRole, initials, avClass };
  USERS.push(newUser);
  saveAll();
  
  snack('Conta criada com sucesso!');
  setTimeout(()=>go('s-login'), 1000);
}

function syncUserUI(){
  if(!currentUser) return;
  const name = currentUser.nome;
  const init = currentUser.initials;
  
  const firstName = name.split(' ')[0];
  document.querySelectorAll('.nav-name').forEach(el => el.textContent = `Oi, ${firstName}`);
  
  document.querySelectorAll('.nav-avatar, .photo-circle').forEach(el => {
    if(!el.querySelector('img')) el.textContent = init;
  });
  
  // Profile screens
  if(userRole==='v'){
    document.getElementById('pv-nome').textContent = name;
    document.getElementById('pv-nome-i').value = name;
  } else {
    document.getElementById('pg-nome').textContent = name;
    document.getElementById('pg-nome-i').value = name;
  }
}


function askLogout(){document.getElementById('modal-logout').classList.add('open');}
function confirmLogout(){closeModal('modal-logout');screenStack=['s-login'];go('s-login');currentUser=null;renderSidebar();}

function vtab(tab){
  const screens={home:'s-hv',campanhas:'s-cv',clientes:'s-clientes',perfil:'s-pv'};
  const btns=['home','campanhas','clientes','perfil'];
  btns.forEach(b=>{
    document.querySelectorAll('[id$="bv-'+b+'"],[id$="bv2-'+b+'"],[id$="bv3-'+b+'"],[id$="bv4-'+b+'"]').forEach(el=>el.classList.toggle('active',b===tab));
  });
  document.querySelectorAll('.sb-item').forEach(el=>el.classList.toggle('active', el.dataset.tab === tab));

  if(tab==='home')renderHV();
  if(tab==='campanhas')renderCV();
  if(tab==='clientes')renderClientesList();
  go(screens[tab]);
}

function gtab(tab){
  const screens={home:'s-hg',campanhas:'s-cg',agenda:'s-agenda',equipe:'s-equipe',perfil:'s-pg'};
  const btns=['home','campanhas','agenda','equipe','perfil'];
  btns.forEach(b=>{
    document.querySelectorAll('[id$="bg-'+b+'"],[id$="bg2-'+b+'"],[id$="bg3-'+b+'"],[id$="bg4-'+b+'"],[id$="bg5-'+b+'"]').forEach(el=>el.classList.toggle('active',b===tab));
  });
  document.querySelectorAll('.sb-item').forEach(el=>el.classList.toggle('active', el.dataset.tab === tab));

  if(tab==='home')renderHG();
  if(tab==='campanhas')renderCG();
  if(tab==='agenda')renderAgenda();
  if(tab==='equipe')renderEquipe();
  go(screens[tab]);
}

function sync(id,disp){document.getElementById(disp).textContent=document.getElementById(id).value;}
function syncSobre(id,disp){const val=document.getElementById(id).value;document.getElementById(disp).textContent=val||'Adicione uma bio abaixo';}
function prevPhoto(input,circId,navIds){
  if(input.files&&input.files[0]){
    const reader=new FileReader();
    reader.onload=e=>{
      document.getElementById(circId).innerHTML=`<img src="${e.target.result}">`;
      navIds.forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=`<img src="${e.target.result}">`;});
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ======================== SIDEBAR ========================
function renderSidebar(){
  const sb = document.getElementById('sidebar');
  const nav = document.getElementById('sb-nav-content');
  if(!['s-hv','s-cv','s-clientes','s-pv','s-hg','s-cg','s-agenda','s-equipe','s-pg'].includes(currentScreen)){
    sb.style.display='none';
    return;
  }
  sb.style.display=''; // Let CSS media query handle flex/none based on screen width
  
  if(userRole==='v'){
    nav.innerHTML=`
      <button class="sb-item" data-tab="home" onclick="vtab('home')"><svg class="ico"><use href="#ico-home"/></svg> Início</button>
      <button class="sb-item" data-tab="campanhas" onclick="vtab('campanhas')"><svg class="ico"><use href="#ico-camp"/></svg> Campanhas</button>
      <button class="sb-item" data-tab="clientes" onclick="vtab('clientes')"><svg class="ico"><use href="#ico-people"/></svg> Clientes</button>
      <button class="sb-item" data-tab="perfil" onclick="vtab('perfil')"><svg class="ico"><use href="#ico-user"/></svg> Meu Perfil</button>
    `;
  } else {
    nav.innerHTML=`
      <button class="sb-item" data-tab="home" onclick="gtab('home')"><svg class="ico"><use href="#ico-home"/></svg> Dashboard</button>
      <button class="sb-item" data-tab="campanhas" onclick="gtab('campanhas')"><svg class="ico"><use href="#ico-camp"/></svg> Campanhas</button>
      <button class="sb-item" data-tab="agenda" onclick="gtab('agenda')"><svg class="ico"><use href="#ico-cal"/></svg> Agenda</button>
      <button class="sb-item" data-tab="equipe" onclick="gtab('equipe')"><svg class="ico"><use href="#ico-people"/></svg> Equipe</button>
      <button class="sb-item" data-tab="perfil" onclick="gtab('perfil')"><svg class="ico"><use href="#ico-user"/></svg> Meu Perfil</button>
    `;
  }
}


// ======================== NOTIFICAÇÕES ========================
function renderNotifs(){
  const list=document.getElementById('notif-list');
  if(!NOTIFS.length){list.innerHTML='<div class="notif-empty"><div class="muted">Nenhuma notificação por enquanto</div></div>';return;}
  list.innerHTML=NOTIFS.map(n=>`
    <div class="notif-item ${n.unread?'unread':''}" onclick="readNotif('${n.id}')">
      <div class="notif-icon ${n.type}">${n.type==='camp'?'✨':n.type==='enc'?'🔒':'🔔'}</div>
      <div class="notif-text"><div class="notif-title">${n.title}</div><div class="notif-time">${n.time}</div></div>
      ${n.unread?'<div class="notif-unread-dot"></div>':''}
    </div>`).join('');
}
function readNotif(id){const n=NOTIFS.find(x=>x.id===id);if(n)n.unread=false;renderNotifs();updateNotifDots();}
function clearNotifs(){NOTIFS.forEach(n=>n.unread=false);renderNotifs();updateNotifDots();}
function updateNotifDots(){
  const hasUnread=NOTIFS.some(n=>n.unread);
  document.querySelectorAll('.notif-dot').forEach(d=>d.classList.toggle('show',hasUnread));
  renderNotifs();
}
function pushNotif(type,title){NOTIFS.unshift({id:'n'+Date.now(),type,title,time:'Agora',unread:true});updateNotifDots();}

// ======================== RENDER VENDEDOR ========================
function renderHV(){
  const ativas=CAMPANHAS.filter(c=>c.status==='ativa');
  const comPlan=ativas.filter(c=>myPlan(c));
  const semPlan=ativas.filter(c=>!myPlan(c));
  const premiadas=ativas.filter(c=>{const p=myPlan(c);return p&&p.vendido>=c.meta;});
  const totalGanhos=premiadas.length*800; // Simulação: R$ 800 fixo por prêmio
  
  document.getElementById('hv-body').innerHTML=`
    <div class="hero">
      <div class="hero-title">Bora bater as metas? 🔥</div>
      <div class="hero-sub">Você tem ${semPlan.length} campanha${semPlan.length!==1?'s':''} aguardando planejamento.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="camp-stat"><div class="camp-stat-num">${ativas.length}</div><div class="camp-stat-label">Campanhas</div></div>
        <div class="camp-stat"><div class="camp-stat-num" style="color:var(--accent);">${premiadas.length}</div><div class="camp-stat-label">Premiadas</div></div>
      </div>
    </div>
    <div class="sgrid">
      <div class="sbox"><div class="snum">${comPlan.length}</div><div class="slabel">Ativas</div></div>
      <div class="sbox"><div class="snum" style="color:var(--accent);">${fmtR(totalGanhos)}</div><div class="slabel">Prêmios</div></div>
    </div>
    ${semPlan.length?`<div><div class="sec-title" style="margin-bottom:10px;">⚠️ Pendente: Planeje agora</div><div class="col">${semPlan.map(c=>`
      <div class="ccard hl" onclick="abrirPlanejamento('${c.id}')">
        <div style="display:flex;justify-content:space-between;"><h3>${c.emoji} ${c.nome}</h3><span class="badge-new">NOVA</span></div>
        <p class="muted" style="margin-top:3px;">Produto: ${c.produto} · Meta: ${fmtR(c.meta)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;"><span class="tag t-o">Aguardando plano</span><span style="font-size:11px;font-weight:600;color:var(--brand);">Planejar →</span></div>
      </div>`).join('')}</div></div>`:''}
    <div><div class="sec-title" style="margin-bottom:10px;">Suas Campanhas Ativas</div><div class="col">${comPlan.length?comPlan.map(c=>{
      const p=myPlan(c);const pr=calcPremio(c,p);
      return`<div class="ccard" onclick="abrirPlanejamento('${c.id}')">
        <div style="display:flex;justify-content:space-between;"><h3>${c.emoji} ${c.nome}</h3><span class="tag ${pr.status==='premiado'?'t-g':pr.status==='superou_plan'?'t-gold':'t-o'}">${pr.status==='premiado'?'Premiado':pr.status==='superou_plan'?'Plano superado':'Em andamento'}</span></div>
        <div class="pbar" style="margin-top:10px;"><div class="pfill ${pr.status==='premiado'?'green':''}" style="width:${pr.pct}%;"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;"><span class="muted">${fmtR(p.vendido)} de ${fmtR(c.meta)}</span><span class="muted">${pr.pct}%</span></div>
      </div>`;}).join(''):`<div class="card-sm" style="text-align:center;padding:24px 0;"><div class="muted">Nenhuma campanha planejada</div><button class="btn btn-o btn-sm" style="margin-top:10px;" onclick="vtab('campanhas')">Ver todas</button></div>`}</div></div>
  `;}

function renderCV(){
  const search = document.getElementById('search-cv').value.toLowerCase();
  const ativas=CAMPANHAS.filter(c=>c.status==='ativa');
  const comPlan=ativas.filter(c=>myPlan(c));
  const semPlan=ativas.filter(c=>!myPlan(c));
  const encerradas=CAMPANHAS.filter(c=>c.status==='encerrada');
  let filtradas=vFiltro==='ativas'?ativas:vFiltro==='encerradas'?encerradas:CAMPANHAS;
  
  if(search) filtradas = filtradas.filter(c => c.nome.toLowerCase().includes(search) || c.produto.toLowerCase().includes(search));

  document.getElementById('cv-body').innerHTML=`
    <div><h2>Minhas Campanhas</h2><p class="muted" style="margin-top:2px;">Acompanhe seu progresso e conquiste prêmios</p></div>
    <div class="filter-tabs">
      <button class="ftab ${vFiltro==='todas'?'active':''}" onclick="setVFiltro('todas')">Todas</button>
      <button class="ftab ${vFiltro==='ativas'?'active':''}" onclick="setVFiltro('ativas')">Ativas</button>
      <button class="ftab ${vFiltro==='encerradas'?'active':''}" onclick="setVFiltro('encerradas')">Encerradas</button>
    </div>
    ${semPlan.length&&vFiltro!=='encerradas'?`<div><div class="sec-title" style="margin-bottom:10px;">Disponíveis para planejar</div><div class="col">${semPlan.map(c=>`<div class="ccard hl" onclick="abrirPlanejamento('${c.id}')"><h3>${c.emoji} ${c.nome}</h3><p class="muted" style="margin-top:3px;">Meta: ${fmtR(c.meta)} · Prêmio: ${c.premio}</p></div>`).join('')}</div></div>`:''}
    ${filtradas.length?`<div class="col">${filtradas.filter(c=>myPlan(c)||c.status==='encerrada').map(c=>{
      const p=myPlan(c)||{planejado:0,vendido:0};const pr=calcPremio(c,p);const enc=c.status==='encerrada';
      const statusLabel=enc?(p.vendido>=c.meta?'🏆 Concluído':'🔒 Encerrado'):(pr.status==='premiado'?'🏆 Premiado!':pr.status==='superou_plan'?'✅ Plano superado':'🚀 Em andamento');
      const statusColor=enc?(p.vendido>=c.meta?'var(--accent)':'var(--muted)'):(pr.status==='premiado'?'var(--accent)':pr.status==='superou_plan'?'var(--gold)':'var(--brand)');
      return`<div class="ccard ${enc?'encerrada':''}" onclick="abrirPlanejamento('${c.id}')">
        <div style="display:flex;justify-content:space-between;"><h3>${c.emoji} ${c.nome}</h3><span class="muted">${fmtDate(c.fim)}</span></div>
        <p class="muted" style="margin-top:2px;font-size:12px;">Meta: ${fmtR(c.meta)} · Seu plano: ${fmtR(p.planejado)}</p>
        <div class="pbar" style="margin-top:8px;"><div class="pfill ${pr.status==='premiado'?'green':''}" style="width:${pr.pct}%;background:${statusColor};"></div></div>
        <div style="margin-top:5px;font-size:11px;font-weight:500;color:${statusColor};">${statusLabel}</div>
      </div>`;}).join('')}</div>`:''}
    ${!semPlan.length&&!comPlan.length?`<div style="text-align:center;padding:40px 0;"><div class="muted">Nenhuma campanha encontrada</div></div>`:''}
  `;}

function setVFiltro(f){vFiltro=f;renderCV();}
function setCFiltro(f){campFiltro=f;renderCG();}

// ======================== PLANEJAMENTO ========================
function abrirPlanejamento(campId){
  const c=CAMPANHAS.find(x=>x.id===campId);
  if(c.status==='encerrada'){snack('Campanha encerrada 🔒');return;}
  campAtiva=c;
  const p=myPlan(c)||{planejado:0,vendido:0,clientes:[]};
  planTemp={planejado:p.planejado,vendido:p.vendido,clientes:[...p.clientes]};
  renderPlan();go('s-plan');
}

function renderPlan(){
  const c=campAtiva,p=planTemp;
  const pr=calcPremio(c,p);
  const clientesSel=CLIENTES.filter(cl=>p.clientes.includes(cl.id));
  const boxClass=pr.status==='premiado'?'unlocked':pr.status==='superou_plan'?'close':'locked';
  const boxMsg=pr.status==='premiado'?`🏆 Prêmio desbloqueado! Você vendeu ${fmtR(p.vendido)} e superou seu plano de ${fmtR(p.planejado)}.`:
    pr.status==='superou_plan'?`🎯 Plano superado! Faltam ${fmtR(pr.faltaMeta)} para atingir a meta da campanha (${fmtR(c.meta)}).`:
    p.planejado?`⚠️ Suas vendas (${fmtR(p.vendido)}) ainda não superaram o planejado (${fmtR(p.planejado)}). Continue vendendo!`:`Defina seu planejamento de vendas abaixo.`;
  document.getElementById('plan-body').innerHTML=`
    <div class="hero" style="padding:18px;">
      <span class="tag" style="background:rgba(255,255,255,.15);color:white;margin-bottom:8px;display:inline-flex;">${c.emoji} ${c.nome}</span>
      <div style="color:white;font-size:13px;line-height:1.7;">Produto: <strong>${c.produto}</strong><br>Meta da campanha: <strong>${fmtR(c.meta)}</strong><br><span style="color:var(--accent);font-size:14px;font-weight:600;">Prêmio: ${c.premio}</span></div>
    </div>
    <div class="premio-box ${boxClass}">
      <div style="font-size:12px;font-weight:500;color:${pr.status==='premiado'?'#007A5A':pr.status==='superou_plan'?'#8A6200':'var(--muted)'};">${boxMsg}</div>
      ${p.planejado?`<div class="pbar" style="margin-top:10px;"><div class="pfill ${pr.status==='premiado'?'green':''}" style="width:${pr.pct}%;background:${pr.status==='premiado'?'var(--accent)':pr.status==='superou_plan'?'var(--gold)':'var(--brand)'};"></div></div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${pr.pct}% da meta atingida</div>`:''}
    </div>
    <div class="card col">
      <h3>Seu planejamento</h3>
      <div class="field"><label>Valor que planejo vender (R$)</label><input type="number" id="plan-planejado" value="${p.planejado||''}" min="0" placeholder="Ex: 5000" oninput="updatePlanCalc()"></div>
      <div class="field"><label>Valor já vendido (R$)</label><input type="number" id="plan-vendido" value="${p.vendido||''}" min="0" placeholder="Ex: 3200" oninput="updatePlanCalc()"></div>
      <div style="background:var(--bg);border-radius:var(--radius-sm);padding:11px;" id="plan-resumo">
        ${p.planejado?`<div style="display:flex;justify-content:space-between;"><span class="muted">Situação</span><span style="font-size:12px;font-weight:500;color:${p.vendido>=p.planejado?'var(--accent)':'var(--brand)'};">${p.vendido>=p.planejado?'✅ Superou o plano!':'⚠️ Faltam '+fmtR(p.planejado-p.vendido)}</span></div>`:'<span class="muted">Preencha os valores acima</span>'}
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3>Clientes vinculados</h3><button class="btn btn-s btn-sm" onclick="abrirModalClientes()">+ Adicionar</button></div>
      ${clientesSel.length?clientesSel.map(cl=>`<div class="srow"><div class="av av-o" style="width:32px;height:32px;font-size:11px;">${cl.nome.slice(0,2).toUpperCase()}</div><div style="flex:1;"><div class="strong">${cl.nome}</div><div class="muted">${cl.resp||''}</div></div><button style="background:none;border:none;cursor:pointer;font-size:13px;color:var(--muted);" onclick="removerClientePlan('${cl.id}')">✕</button></div>`).join(''):`<div class="muted" style="text-align:center;padding:10px 0;">Nenhum cliente vinculado</div>`}
    </div>
    <button class="btn btn-p btn-full" onclick="salvarPlanejamento()">Salvar planejamento</button>
  `;}

function updatePlanCalc(){
  const plan=parseInt(document.getElementById('plan-planejado').value)||0;
  const vend=parseInt(document.getElementById('plan-vendido').value)||0;
  planTemp.planejado=plan;planTemp.vendido=vend;
  const resumo=document.getElementById('plan-resumo');
  if(!resumo)return;
  if(plan){
    const falta=plan-vend;
    resumo.innerHTML=`<div style="display:flex;justify-content:space-between;"><span class="muted">Situação</span><span style="font-size:12px;font-weight:500;color:${vend>=plan?'var(--accent)':'var(--brand)'};">${vend>=plan?'✅ Superou o plano!':'⚠️ Faltam '+fmtR(falta)}</span></div>`;
  }else{resumo.innerHTML='<span class="muted">Preencha os valores acima</span>';}
}

function salvarPlanejamento(){
  const plan=parseInt(document.getElementById('plan-planejado').value)||0;
  const vend=parseInt(document.getElementById('plan-vendido').value)||0;
  if(!plan){snack('Informe o valor planejado!');return;}
  planTemp.planejado=plan;planTemp.vendido=vend;
  campAtiva.planejamentos['v1']=JSON.parse(JSON.stringify(planTemp));
  saveAll();
  snack('Planejamento salvo!');back();renderCV();renderHV();
}

function removerClientePlan(cid){planTemp.clientes=planTemp.clientes.filter(id=>id!==cid);renderPlan();}

// ======================== MODAL CLIENTES ========================
function abrirModalClientes(){
  clientesTempSel=[...planTemp.clientes];
  document.getElementById('modal-cli-list').innerHTML=CLIENTES.map(c=>`
    <div class="cli-item" onclick="toggleCliModal('${c.id}')">
      <div class="cli-check ${clientesTempSel.includes(c.id)?'checked':''}" id="chk-${c.id}">${clientesTempSel.includes(c.id)?'✓':''}</div>
      <div class="av av-o" style="width:30px;height:30px;font-size:10px;">${c.nome.slice(0,2).toUpperCase()}</div>
      <div><div class="strong">${c.nome}</div><div class="muted">${c.resp||''}${c.lojas?' · '+c.lojas+' loja(s)':''}</div></div>
    </div>`).join('');
  document.getElementById('modal-clientes').classList.add('open');
}
function toggleCliModal(cid){const idx=clientesTempSel.indexOf(cid);if(idx>=0)clientesTempSel.splice(idx,1);else clientesTempSel.push(cid);const chk=document.getElementById('chk-'+cid);if(chk){chk.classList.toggle('checked',clientesTempSel.includes(cid));chk.textContent=clientesTempSel.includes(cid)?'✓':'';};}
function confirmClientes(){planTemp.clientes=[...clientesTempSel];closeModal('modal-clientes');renderPlan();}

// ======================== CLIENTES ========================
function renderClientesList(){
  const search = document.getElementById('search-cli').value.toLowerCase();
  const filtrados = CLIENTES.filter(c => c.nome.toLowerCase().includes(search) || (c.resp && c.resp.toLowerCase().includes(search)));
  
  document.getElementById('clientes-count').textContent=filtrados.length+' encontrados';
  document.getElementById('lista-clientes').innerHTML=filtrados.map(c=>`
    <div class="srow">
      <div class="av av-o">${c.nome.slice(0,2).toUpperCase()}</div>
      <div style="flex:1;">
        <div class="strong">${c.nome}</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:3px;">
          ${c.resp?`<span class="info-chip">${c.resp}</span>`:''}
          ${c.lojas?`<span class="info-chip">${c.lojas} loja${c.lojas>1?'s':''}</span>`:''}
          ${c.dia?`<span class="info-chip">${c.dia.split('-')[0]}</span>`:''}
        </div>
      </div>
      <button class="btn btn-s btn-sm" onclick="abrirEdicaoCliente('${c.id}')">Editar</button>
    </div>`).join('');}

function abrirEdicaoCliente(cid){
  const c=CLIENTES.find(x=>x.id===cid);if(!c)return;
  editandoClienteId=cid;
  ['nome','resp','end','tel','obs'].forEach(f=>{const el=document.getElementById('ec-'+f);if(el)el.value=c[f]||'';});
  const lojas=document.getElementById('ec-lojas');if(lojas)lojas.value=c.lojas||'';
  const dia=document.getElementById('ec-dia');if(dia)dia.value=c.dia||'';
  document.getElementById('modal-editar-cliente').classList.add('open');
}
function salvarEdicaoCliente(){
  const c=CLIENTES.find(x=>x.id===editandoClienteId);if(!c)return;
  ['nome','resp','end','tel','obs'].forEach(f=>{const el=document.getElementById('ec-'+f);if(el)c[f]=el.value.trim();});
  const lojas=document.getElementById('ec-lojas');if(lojas)c.lojas=parseInt(lojas.value)||0;
  const dia=document.getElementById('ec-dia');if(dia)c.dia=dia.value;
  saveAll();
  closeModal('modal-editar-cliente');renderClientesList();snack('Cliente atualizado!');
}
function addCliente(){
  const nome=document.getElementById('nc-nome').value.trim();
  if(!nome){snack('Informe o nome do cliente!');return;}
  const id='c'+Date.now();
  CLIENTES.push({id,nome,resp:document.getElementById('nc-resp').value.trim(),end:document.getElementById('nc-end').value.trim(),tel:document.getElementById('nc-tel').value.trim(),lojas:parseInt(document.getElementById('nc-lojas').value)||0,dia:document.getElementById('nc-dia').value,obs:document.getElementById('nc-obs').value.trim()});
  saveAll();
  ['nc-nome','nc-resp','nc-doc','nc-end','nc-tel','nc-lojas','nc-obs'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});
  const d=document.getElementById('nc-dia');if(d)d.value='';
  renderClientesList();snack('Cliente adicionado!');back();
}

// ======================== RENDER GERENTE ========================
function renderHG(){
  const ativas=CAMPANHAS.filter(c=>c.status==='ativa');
  const comPlanVs=VENDEDORES.filter(v=>ativas.some(c=>c.planejamentos[v.id]));
  const semPlan=VENDEDORES.filter(v=>!ativas.some(c=>c.planejamentos[v.id]));
  // premiados = vendeu acima do planejado em pelo menos 1 campanha
  const premiados=VENDEDORES.filter(v=>ativas.some(c=>{const p=c.planejamentos[v.id];return p&&p.vendido>=p.planejado&&p.planejado>0;}));
  document.getElementById('hg-body').innerHTML=`
    <div class="hero">
      <div class="hero-title">Desempenho da equipe 📊</div>
      <div class="hero-sub">${comPlanVs.length} de ${VENDEDORES.length} planejaram. ${premiados.length} já superaram o plano!</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px;">
        <div class="camp-stat"><div class="camp-stat-num">${VENDEDORES.length}</div><div class="camp-stat-label">Vendedores</div></div>
        <div class="camp-stat"><div class="camp-stat-num" style="color:var(--accent);">${comPlanVs.length}</div><div class="camp-stat-label">Planejaram</div></div>
        <div class="camp-stat"><div class="camp-stat-num" style="color:var(--gold);">${premiados.length}</div><div class="camp-stat-label">Premiados</div></div>
      </div>
    </div>
    ${semPlan.length?`<div><div class="sec-title" style="margin-bottom:8px;">Sem planejamento</div><div class="card-sm">${semPlan.map(v=>`<div class="srow" style="padding:8px 0;"><div class="av ${v.avClass}">${v.initials}</div><div style="flex:1;"><div class="strong">${v.nome}</div><div class="muted">Nenhuma campanha planejada</div></div><button class="btn-notify" onclick="notificarVendedor('${v.nome}')">Notificar</button></div>`).join('')}</div></div>`:''}
    ${comPlanVs.length?`<div><div class="sec-title" style="margin-bottom:8px;">Com planejamento</div><div class="card-sm">${comPlanVs.map(v=>{
      const totalVend=ativas.reduce((a,c)=>{const p=c.planejamentos[v.id];return a+(p?p.vendido:0);},0);
      const totalPlan=ativas.reduce((a,c)=>{const p=c.planejamentos[v.id];return a+(p?p.planejado:0);},0);
      const superou=totalVend>=totalPlan&&totalPlan>0;
      return`<div class="srow" style="padding:8px 0;"><div class="av ${v.avClass}">${v.initials}</div><div style="flex:1;"><div class="strong">${v.nome}</div><div class="muted">${fmtR(totalVend)} vendido / ${fmtR(totalPlan)} planejado</div></div><span class="tag ${superou?'t-g':'t-o'}">${superou?'Premiado':'Em andamento'}</span></div>`;}).join('')}</div></div>`:''}
  `;}

function notificarVendedor(nome){
  pushNotif('lembrete','Lembrete enviado para '+nome+': planejamento pendente!');
  snack('Lembrete enviado para '+nome+'!');
  updateNotifDots();
}

function renderCG(){
  const search = document.getElementById('search-cg').value.toLowerCase();
  let filtradas=CAMPANHAS.filter(c=>campFiltro==='todas'||c.status===campFiltro);
  if(search) filtradas = filtradas.filter(c => c.nome.toLowerCase().includes(search) || c.produto.toLowerCase().includes(search));

  document.getElementById('cg-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><h2>Campanhas</h2><p class="muted" style="margin-top:2px;">${filtradas.length} encontradas</p></div>
      <button class="btn btn-p btn-sm" onclick="go('s-nova-camp')">+ Nova</button>
    </div>
    <div class="filter-tabs">
      <button class="ftab ${campFiltro==='todas'?'active':''}" onclick="setCFiltro('todas')">Todas</button>
      <button class="ftab ${campFiltro==='ativa'?'active':''}" onclick="setCFiltro('ativa')">Ativas</button>
      <button class="ftab ${campFiltro==='encerrada'?'active':''}" onclick="setCFiltro('encerrada')">Encerradas</button>
    </div>
    ${filtradas.length?filtradas.map(c=>{
      const nPlan=Object.keys(c.planejamentos).length;
      const totalVend=Object.values(c.planejamentos).reduce((a,p)=>a+p.vendido,0);
      const premiados=Object.values(c.planejamentos).filter(p=>p.vendido>=p.planejado&&p.planejado>0).length;
      const pct=Math.min(100,Math.round(totalVend/c.meta*100));
      const enc=c.status==='encerrada';
      return`<div class="ccard" onclick="abrirDetalhe('${c.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;"><h3>${c.emoji} ${c.nome}</h3><span class="tag ${enc?'t-gold':'t-g'}">${enc?'Encerrada':'Ativa'}</span></div>
        <p class="muted" style="margin-top:3px;font-size:12px;">${c.produto} · Meta: ${fmtR(c.meta)} · ${c.premio}</p>
        <div style="display:flex;justify-content:space-between;margin-top:8px;">
          <span class="muted">${nPlan}/${VENDEDORES.length} planejaram</span>
          <span style="font-size:12px;color:${premiados?'var(--accent)':'var(--muted)'};">${premiados} premiado${premiados!==1?'s':''}</span>
        </div>
        <div class="pbar" style="margin-top:6px;"><div class="pfill ${enc?'gold':'green'}" style="width:${pct}%;"></div></div>
        <div style="font-size:11px;color:var(--muted);margin-top:3px;">${fmtR(totalVend)} vendido de ${fmtR(c.meta)} meta</div>
        ${enc?`<div style="margin-top:6px;"><span class="lock-badge">🔒 Encerrada</span></div>`:''}
      </div>`;}).join(''):`<div style="text-align:center;padding:40px 0;"><div class="muted">Nenhuma campanha</div></div>`}
  `;}

function renderEquipe(){
  document.getElementById('equipe-body').innerHTML=`
    <div><h2>Equipe</h2><p class="muted" style="margin-top:2px;">${VENDEDORES.length} vendedores · ABC Distribuidora</p></div>
    <div class="card" style="padding:12px 14px;">${VENDEDORES.map(v=>{
      const totalVend=CAMPANHAS.reduce((a,c)=>{const p=c.planejamentos[v.id];return a+(p?p.vendido:0);},0);
      const totalPlan=CAMPANHAS.reduce((a,c)=>{const p=c.planejamentos[v.id];return a+(p?p.planejado:0);},0);
      const superou=totalVend>=totalPlan&&totalPlan>0;
      const nCamp=CAMPANHAS.filter(c=>c.planejamentos[v.id]).length;
      return`<div class="srow"><div class="av ${v.avClass}">${v.initials}</div><div style="flex:1;"><div class="strong">${v.nome}</div><div class="muted">${nCamp} camp. · ${fmtR(totalVend)} vendido</div></div><span class="tag ${superou?'t-g':nCamp?'t-o':'t-d'}">${superou?'Premiado':nCamp?'Em andamento':'—'}</span></div>`;}).join('')}</div>
  `;}

// ======================== DETALHE CAMPANHA ========================
function abrirDetalhe(campId){
  const c=CAMPANHAS.find(x=>x.id===campId);
  const enc=c.status==='encerrada';
  document.getElementById('cd-title').textContent=c.nome;
  const totalVend=Object.values(c.planejamentos).reduce((a,p)=>a+p.vendido,0);
  const totalPlan=Object.values(c.planejamentos).reduce((a,p)=>a+p.planejado,0);
  const nPlan=Object.keys(c.planejamentos).length;
  const premiados=Object.values(c.planejamentos).filter(p=>p.vendido>=p.planejado&&p.planejado>0).length;
  const pctMeta=Math.min(100,Math.round(totalVend/c.meta*100));
  const rows=VENDEDORES.map(v=>{
    const p=c.planejamentos[v.id];
    const pr=p?calcPremio(c,p):{status:'sem_plano'};
    const cliNames=p?(p.clientes||[]).map(cid=>{const cl=CLIENTES.find(x=>x.id===cid);return cl?cl.nome:'';}).filter(Boolean).join(', '):'—';
    return`<div class="srow" style="align-items:flex-start;padding:12px 0;">
      <div class="av ${v.avClass}">${v.initials}</div>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span class="strong">${v.nome}</span>
          <span class="tag ${pr.status==='premiado'?'t-g':pr.status==='superou_plan'?'t-gold':p?'t-o':'t-d'}" style="font-size:10px;">${pr.status==='premiado'?'Premiado':pr.status==='superou_plan'?'Superou plano':p?'Em andamento':'Não planejou'}</span>
        </div>
        ${p?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
          <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;"><div style="font-size:10px;color:var(--muted);">Planejado</div><div style="font-size:12px;font-weight:600;">${fmtR(p.planejado)}</div></div>
          <div style="background:var(--bg);border-radius:6px;padding:6px;text-align:center;"><div style="font-size:10px;color:var(--muted);">Vendido</div><div style="font-size:12px;font-weight:600;color:${p.vendido>=p.planejado?'var(--accent)':'var(--brand)'};">${fmtR(p.vendido)}</div></div>
        </div>
        <div class="pbar"><div class="pfill ${pr.status==='premiado'?'green':''}" style="width:${Math.min(100,Math.round(p.vendido/c.meta*100))}%;"></div></div>
        <div class="muted" style="margin-top:3px;">Clientes: ${cliNames}</div>`:`<div class="muted">Aguardando planejamento</div>`}
      </div>
    </div>`;}).join('');
  document.getElementById('cd-body').innerHTML=`
    <div class="hero" style="padding:18px;">
      ${enc?`<span class="tag" style="background:rgba(255,180,0,.2);color:var(--gold);margin-bottom:8px;display:inline-flex;">🔒 Encerrada</span>`:''}
      <div class="hero-title" style="font-size:17px;">${c.emoji} ${c.nome}</div>
      <div class="hero-sub" style="margin-bottom:10px;">${c.produto} · ${fmtDate(c.ini)} – ${fmtDate(c.fim)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
        <div class="camp-stat"><div class="camp-stat-num">${nPlan}</div><div class="camp-stat-label">Planejaram</div></div>
        <div class="camp-stat"><div class="camp-stat-num" style="color:var(--gold);">${premiados}</div><div class="camp-stat-label">Premiados</div></div>
        <div class="camp-stat"><div class="camp-stat-num">${pctMeta}%</div><div class="camp-stat-label">Meta geral</div></div>
      </div>
    </div>
    <div class="card-sm col">
      <div style="display:flex;justify-content:space-between;"><span class="muted">Meta da campanha</span><span class="strong">${fmtR(c.meta)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span class="muted">Total vendido</span><span class="strong" style="color:${totalVend>=c.meta?'var(--accent)':'var(--text)'};">${fmtR(totalVend)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span class="muted">Total planejado</span><span class="strong">${fmtR(totalPlan)}</span></div>
      <div style="display:flex;justify-content:space-between;"><span class="muted">Prêmio</span><span class="strong">${c.premio}</span></div>
      <div class="pbar"><div class="pfill ${totalVend>=c.meta?'green':''}" style="width:${pctMeta}%;"></div></div>
      <button class="btn btn-o btn-sm btn-full" style="margin-top:10px;" onclick="exportCampaignCSV('${c.id}')">📊 Exportar Resultados (CSV)</button>
    </div>
    <div><div class="sec-title" style="margin-bottom:8px;">Desempenho por vendedor</div><div class="card" style="padding:12px 14px;">${rows}</div></div>
  `;
  go('s-camp-detail');
}

// ======================== NOVA CAMPANHA ========================
function exportCampaignCSV(campId){
  const c = CAMPANHAS.find(x => x.id === campId);
  const rows = [
    ["Vendedor", "Planejado", "Vendido", "Meta Atingida (%)", "Premiado"],
    ...VENDEDORES.map(v => {
      const p = c.planejamentos[v.id] || {planejado:0, vendido:0};
      const pct = p.planejado ? Math.round((p.vendido/p.planejado)*100) : 0;
      return [v.nome, p.planejado, p.vendido, pct + "%", p.vendido >= p.planejado && p.planejado > 0 ? "Sim" : "Não"];
    })
  ];
  let csvContent = "\uFEFF"; // UTF-8 BOM
  rows.forEach(r => csvContent += r.join(";") + "\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `resultados_${c.nome.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  snack('Exportação concluída!');
}

function criarCampanha(){
  const nome=document.getElementById('nc-campnome').value.trim();
  const prod=document.getElementById('nc-prod').value.trim();
  const ini=document.getElementById('nc-ini').value;
  const fim=document.getElementById('nc-fim').value;
  const meta=parseFloat(document.getElementById('nc-meta').value)||0;
  const premio=document.getElementById('nc-premio').value.trim();
  const desc=document.getElementById('nc-desc').value.trim();
  if(!nome||!prod||!ini||!fim||!meta){snack('Preencha todos os campos obrigatórios!');return;}
  const id='camp'+Date.now();
  const emojis=['🎯','⭐','🚀','🏆','💥'];
  const emoji=emojis[Math.floor(Math.random()*emojis.length)];
  CAMPANHAS.unshift({id,nome,emoji,produto:prod,desc,meta,premio:premio||'A definir',ini,fim,status:'ativa',planejamentos:{}});
  saveAll();
  ['nc-campnome','nc-prod','nc-desc','nc-ini','nc-fim','nc-meta','nc-premio'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});
  pushNotif('camp',`Nova campanha criada: ${nome}`);
  snack(`Campanha "${nome}" criada!`);back();renderCG();renderHG();
}

// ======================== AGENDA ========================
function renderAgenda(){
  const total=Object.values(AGENDA).reduce((a,t)=>a+t.length,0);
  const typeColors={rota:'var(--brand)',visita:'var(--accent)',reuniao:'var(--gold)',outro:'var(--muted)'};
  const typeLabels={rota:'Rota',visita:'Visita',reuniao:'Reunião',outro:'Outro'};
  document.getElementById('agenda-body').innerHTML=`
    <div><h2>Agenda Produtiva</h2><p class="muted" style="margin-top:3px;">${total} atividade${total!==1?'s':''} esta semana</p></div>
    <div style="background:var(--brand-light);border-radius:var(--radius-sm);padding:12px 14px;border:1.5px solid var(--brand);">
      <div style="font-size:12px;color:var(--brand);margin-bottom:4px;font-weight:500;">Dica</div>
      <div class="muted">Planeje suas rotas com antecedência para maximizar o tempo com a equipe!</div>
    </div>
    ${DAYS.map(day=>`
      <div class="agenda-day">
        <div class="agenda-day-header">
          <div><div class="agenda-day-name">${DAY_NAMES[day]}</div><div style="font-size:11px;color:var(--muted);">${DAY_DATES[day]}/2025</div></div>
          <span class="tag t-d">${AGENDA[day].length} item${AGENDA[day].length!==1?'s':''}</span>
        </div>
        <div style="padding:4px 14px 2px;">
          ${AGENDA[day].length?AGENDA[day].map(t=>`
            <div class="agenda-task">
              <div class="task-dot" style="background:${typeColors[t.type]};"></div>
              <div class="task-text">${t.text} <span style="font-size:10px;color:var(--muted);">${typeLabels[t.type]}</span></div>
              <button class="task-del" onclick="delTask('${day}','${t.id}')">✕</button>
            </div>`).join(''):`<div class="muted" style="padding:10px 0;text-align:center;font-size:12px;">Vazio — adicione abaixo</div>`}
        </div>
        <div class="ttype-row">
          ${Object.entries(typeLabels).map(([k,v])=>`<button class="ttype ${(agendaTaskType[day]||'rota')===k?'active':''}" onclick="setTaskType('${day}','${k}')">${v}</button>`).join('')}
        </div>
        <div class="agenda-add">
          <input id="ti-${day}" placeholder="Ex: Rota com João..." onkeydown="if(event.key==='Enter')addTask('${day}')">
          <button onclick="addTask('${day}')">+</button>
        </div>
      </div>`).join('')}
  `;}

function setTaskType(day,type){agendaTaskType[day]=type;renderAgenda();}
function addTask(day){const input=document.getElementById('ti-'+day);const text=input?input.value.trim():'';if(!text){snack('Escreva a atividade!');return;}AGENDA[day].push({id:'t'+Date.now(),text,type:agendaTaskType[day]||'rota'});saveAll();renderAgenda();}
function delTask(day,id){AGENDA[day]=AGENDA[day].filter(t=>t.id!==id);saveAll();renderAgenda();}

// Initialize App
window.onload = () => {
  loadTheme();
  renderNotifs();
};
