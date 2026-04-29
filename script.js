const cur = document.getElementById('cursor');
const cr = document.getElementById('cring');
document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX+'px'; cur.style.top = e.clientY+'px';
  setTimeout(() => { cr.style.left = e.clientX+'px'; cr.style.top = e.clientY+'px'; }, 75);
});
document.querySelectorAll('button,a,.fc,.oc,.step,.gc,.vc,.fuc').forEach(el => {
  el.addEventListener('mouseenter', () => { cr.style.transform = 'translate(-50%,-50%) scale(1.8)'; cr.style.borderColor = 'rgba(0,255,204,0.75)'; });
  el.addEventListener('mouseleave', () => { cr.style.transform = 'translate(-50%,-50%) scale(1)'; cr.style.borderColor = 'rgba(0,255,204,0.35)'; });
});

function go(id){ document.getElementById(id).scrollIntoView({behavior:'smooth'}) }

let meds = JSON.parse(localStorage.getItem('mtp2_meds') || '[]');
let health = JSON.parse(localStorage.getItem('mtp2_health') || '[]');

document.getElementById('hDt').valueAsDate = new Date();

const TC = {Morning:'#ffbe0b',Afternoon:'#0099ff',Night:'#7c3aed',Anytime:'#ff6b6b'};
const TK = {Morning:'tm',Afternoon:'ta',Night:'tn',Anytime:'tany'};
const SC = {Normal:'var(--c1)',High:'var(--c4)',Low:'var(--c5)',Critical:'#ff2255'};

function save(){
  localStorage.setItem('mtp2_meds', JSON.stringify(meds));
  localStorage.setItem('mtp2_health', JSON.stringify(health));
  updateAll();
}

function toast(id){ const t=document.getElementById(id); t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

function addMed(){
  const n = document.getElementById('mN').value.trim();
  if(!n){ alert('Please enter medicine name'); return; }
  meds.unshift({ id:Date.now(), name:n, dose:document.getElementById('mD').value||'—', freq:document.getElementById('mF').value, time:document.getElementById('mTi').value, dur:document.getElementById('mDu').value||'—', cat:document.getElementById('mC').value, notes:document.getElementById('mNo').value });
  save(); renderMeds(); renderSched(); toast('mT');
  ['mN','mD','mDu','mNo'].forEach(i=>document.getElementById(i).value='');
}

function delMed(id){ meds=meds.filter(m=>m.id!==id); save(); renderMeds(); renderSched(); }

function renderMeds(){
  const el = document.getElementById('mL');
  if(!meds.length){ el.innerHTML='<div class="empty"><div class="eico">💊</div>No medicines added yet</div>'; return; }
  el.innerHTML = meds.map(m=>`
    <div class="ri">
      <div class="ric" style="background:${TC[m.time]||'#00ffcc'}"></div>
      <div class="rii">
        <div class="rin">${m.name}</div>
        <div class="rim">
          <span>💉 ${m.dose}</span><span>🔁 ${m.freq}</span>
          ${m.dur!=='—'?`<span>📅 ${m.dur}d</span>`:''}
          <span>🏷️ ${m.cat}</span>
        </div>
        ${m.notes?`<div style="color:var(--muted);font-size:0.75rem;margin-top:3px">📝 ${m.notes}</div>`:''}
      </div>
      <div class="rir">
        <span class="tb ${TK[m.time]||'tany'}">${m.time}</span>
        <button class="dbtn" onclick="delMed(${m.id})">Delete</button>
      </div>
    </div>`).join('');
}

function addHealth(){
  const v = document.getElementById('hV').value.trim();
  if(!v){ alert('Please enter a value'); return; }
  health.unshift({ id:Date.now(), type:document.getElementById('hTy').value, value:v, unit:document.getElementById('hU').value||'', date:document.getElementById('hDt').value||new Date().toISOString().split('T')[0], status:document.getElementById('hSt').value, notes:document.getElementById('hNo').value });
  save(); renderHealth(); updateVitals(); toast('hT');
  ['hV','hU','hNo'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('hDt').valueAsDate = new Date();
}

function delHealth(id){ health=health.filter(r=>r.id!==id); save(); renderHealth(); updateVitals(); }

function renderHealth(){
  const el = document.getElementById('hL');
  if(!health.length){ el.innerHTML='<div class="empty"><div class="eico">❤️</div>No health records yet</div>'; return; }
  el.innerHTML = health.map(r=>`
    <div class="ri">
      <div class="ric" style="background:${SC[r.status]||'var(--c2)'}"></div>
      <div class="rii">
        <div class="rin">${r.type}</div>
        <div class="rim">
          <span style="font-family:'Clash Display',sans-serif;font-size:0.95rem;color:var(--c2)">${r.value} ${r.unit}</span>
          <span>📅 ${r.date}</span>
        </div>
        ${r.notes?`<div style="color:var(--muted);font-size:0.75rem;margin-top:3px">📝 ${r.notes}</div>`:''}
      </div>
      <div class="rir">
        <span class="tb" style="background:${SC[r.status]}18;color:${SC[r.status]}">${r.status}</span>
        <button class="dbtn" onclick="delHealth(${r.id})">Delete</button>
      </div>
    </div>`).join('');
}

function updateVitals(){
  const map = {'Blood Pressure':'vBP','Blood Sugar':'vBS','Weight':'vW','Heart Rate':'vHR','Temperature':'vT','Oxygen Level':'vO2'};
  Object.keys(map).forEach(t => {
    const r = health.find(h=>h.type===t);
    const el = document.getElementById(map[t]);
    if(el) el.textContent = r ? r.value : '—';
  });
}

function renderSched(){
  [['Morning','sM'],['Afternoon','sA'],['Night','sN']].forEach(([t,id]) => {
    const list = meds.filter(m=>m.time===t);
    const el = document.getElementById(id);
    if(!list.length){ el.innerHTML=`<div style="color:var(--muted);font-size:0.82rem;text-align:center;padding:18px">No ${t.toLowerCase()} medicines</div>`; return; }
    el.innerHTML = list.map(m=>`<div class="sit"><div class="smn">${m.name}</div><div class="smd">${m.dose} · ${m.freq}</div></div>`).join('');
  });
}

function updateAll(){
  const today = meds.filter(m=>m.time!=='Anytime').length;
  ['s1','hcm'].forEach(id=>document.getElementById(id).textContent=meds.length);
  ['s2','hch'].forEach(id=>document.getElementById(id).textContent=health.length);
  document.getElementById('s3').textContent=today;
  document.getElementById('mBg').textContent=meds.length+' medicine'+(meds.length!==1?'s':'');
  document.getElementById('hBg').textContent=health.length+' record'+(health.length!==1?'s':'');
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let c='';
  sections.forEach(s=>{ if(window.scrollY>=s.offsetTop-100) c=s.id; });
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+c));
});

const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); obs.unobserve(e.target); } });
},{threshold:0.07});
document.querySelectorAll('.fu').forEach(el=>obs.observe(el));

renderMeds(); renderHealth(); renderSched(); updateAll(); updateVitals();
