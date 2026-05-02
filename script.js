const cur = document.getElementById('cursor');
const cr = document.getElementById('cring');
document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
  setTimeout(() => { cr.style.left = e.clientX + 'px'; cr.style.top = e.clientY + 'px'; }, 75);
});
document.querySelectorAll('button,a,.fc,.oc,.step,.gc,.vc,.fuc').forEach(el => {
  el.addEventListener('mouseenter', () => { cr.style.transform = 'translate(-50%,-50%) scale(1.8)'; cr.style.borderColor = 'rgba(0,255,204,0.75)'; });
  el.addEventListener('mouseleave', () => { cr.style.transform = 'translate(-50%,-50%) scale(1)'; cr.style.borderColor = 'rgba(0,255,204,0.35)'; });
});

function go(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }) }

let meds = JSON.parse(localStorage.getItem('mtp2_meds') || '[]');
let health = JSON.parse(localStorage.getItem('mtp2_health') || '[]');
let routine = JSON.parse(localStorage.getItem('mtp2_routine') || '[]');
let diet = JSON.parse(localStorage.getItem('mtp2_diet') || 'null');

// Load Theme
const savedTheme = localStorage.getItem('mtp2_theme') || 'violet';
document.documentElement.setAttribute('data-theme', savedTheme);
if(document.getElementById('theme-sel')) document.getElementById('theme-sel').value = savedTheme;

function changeTheme(val) {
  document.documentElement.setAttribute('data-theme', val);
  localStorage.setItem('mtp2_theme', val);
}

document.getElementById('hDt').valueAsDate = new Date();

const TC = { Morning: 'var(--c5)', Afternoon: 'var(--c3)', Night: 'var(--c2)', Anytime: 'var(--c1)' };
const TK = { Morning: 'tm', Afternoon: 'ta', Night: 'tn', Anytime: 'tany' };
const SC = { Normal: 'var(--c1)', High: 'var(--c4)', Low: 'var(--c5)', Critical: '#ff2255' };

function save() {
  localStorage.setItem('mtp2_meds', JSON.stringify(meds));
  localStorage.setItem('mtp2_health', JSON.stringify(health));
  localStorage.setItem('mtp2_routine', JSON.stringify(routine));
  if(diet) localStorage.setItem('mtp2_diet', JSON.stringify(diet));
  updateAll();
}

function toast(id) { const t = document.getElementById(id); t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }

function addMed() {
  const n = document.getElementById('mN').value.trim();
  if (!n) { alert('Please enter medicine name'); return; }
  meds.unshift({ id: Date.now(), name: n, dose: document.getElementById('mD').value || '—', freq: document.getElementById('mF').value, time: document.getElementById('mTi').value, dur: document.getElementById('mDu').value || '—', cat: document.getElementById('mC').value, notes: document.getElementById('mNo').value });
  save(); renderMeds(); renderSched(); toast('mT');
  ['mN', 'mD', 'mDu', 'mNo'].forEach(i => document.getElementById(i).value = '');
}

function delMed(id) { meds = meds.filter(m => m.id !== id); save(); renderMeds(); renderSched(); }

function renderMeds() {
  const el = document.getElementById('mL');
  if (!meds.length) { el.innerHTML = '<div class="empty"><div class="eico">💊</div>No medicines added yet</div>'; return; }
  el.innerHTML = meds.map(m => `
    <div class="ri">
      <div class="ric" style="background:${TC[m.time] || '#00ffcc'}"></div>
      <div class="rii">
        <div class="rin">${m.name}</div>
        <div class="rim">
          <span>💉 ${m.dose}</span><span>🔁 ${m.freq}</span>
          ${m.dur !== '—' ? `<span>📅 ${m.dur}d</span>` : ''}
          <span>🏷️ ${m.cat}</span>
        </div>
        ${m.notes ? `<div style="color:var(--muted);font-size:0.75rem;margin-top:3px">📝 ${m.notes}</div>` : ''}
      </div>
      <div class="rir">
        <span class="tb ${TK[m.time] || 'tany'}">${m.time}</span>
        <button class="dbtn" onclick="delMed(${m.id})">Delete</button>
      </div>
    </div>`).join('');
}

function addHealth() {
  const v = document.getElementById('hV').value.trim();
  if (!v) { alert('Please enter a value'); return; }
  health.unshift({ id: Date.now(), type: document.getElementById('hTy').value, value: v, unit: document.getElementById('hU').value || '', date: document.getElementById('hDt').value || new Date().toISOString().split('T')[0], status: document.getElementById('hSt').value, notes: document.getElementById('hNo').value });
  save(); renderHealth(); updateVitals(); toast('hT');
  ['hV', 'hU', 'hNo'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('hDt').valueAsDate = new Date();
}

function delHealth(id) { health = health.filter(r => r.id !== id); save(); renderHealth(); updateVitals(); }

function renderHealth() {
  const el = document.getElementById('hL');
  if (!health.length) { el.innerHTML = '<div class="empty"><div class="eico">❤️</div>No health records yet</div>'; return; }
  el.innerHTML = health.map(r => `
    <div class="ri">
      <div class="ric" style="background:${SC[r.status] || 'var(--c2)'}"></div>
      <div class="rii">
        <div class="rin">${r.type}</div>
        <div class="rim">
          <span style="font-family:'Clash Display',sans-serif;font-size:0.95rem;color:var(--c2)">${r.value} ${r.unit}</span>
          <span>📅 ${r.date}</span>
        </div>
        ${r.notes ? `<div style="color:var(--muted);font-size:0.75rem;margin-top:3px">📝 ${r.notes}</div>` : ''}
      </div>
      <div class="rir">
        <span class="tb" style="background:${SC[r.status]}18;color:${SC[r.status]}">${r.status}</span>
        <button class="dbtn" onclick="delHealth(${r.id})">Delete</button>
      </div>
    </div>`).join('');
}

function updateVitals() {
  const map = { 'Blood Pressure': 'vBP', 'Blood Sugar': 'vBS', 'Weight': 'vW', 'Heart Rate': 'vHR', 'Temperature': 'vT', 'Oxygen Level': 'vO2' };
  Object.keys(map).forEach(t => {
    const r = health.find(h => h.type === t);
    const el = document.getElementById(map[t]);
    if (el) el.textContent = r ? r.value : '—';
  });
}

function renderSched() {
  [['Morning', 'sM'], ['Afternoon', 'sA'], ['Night', 'sN']].forEach(([t, id]) => {
    const list = meds.filter(m => m.time === t);
    const el = document.getElementById(id);
    if (!list.length) { el.innerHTML = `<div style="color:var(--muted);font-size:0.82rem;text-align:center;padding:18px">No ${t.toLowerCase()} medicines</div>`; return; }
    el.innerHTML = list.map(m => `<div class="sit"><div class="smn">${m.name}</div><div class="smd">${m.dose} · ${m.freq}</div></div>`).join('');
  });
}

function saveDietGoal() {
  const c = document.getElementById('dWc').value;
  const t = document.getElementById('dWt').value;
  if(!c || !t) { alert("Enter current and target weight!"); return; }
  diet = { current: c, target: t, type: document.getElementById('dGt').value, pref: document.getElementById('dDp').value };
  save(); renderDiet(); toast('dT');
}

function renderDiet() {
  const el = document.getElementById('dL');
  if(!diet) { el.innerHTML = '<div class="empty"><div class="eico">🥑</div>Set your goal to get a diet plan</div>'; return; }
  
  let diff = Math.abs(diet.current - diet.target);
  let status = diet.type === 'loss' ? `Aiming to lose ${diff}kg` : diet.type === 'gain' ? `Aiming to gain ${diff}kg` : "Maintaining weight";
  document.getElementById('dGbg').textContent = status;
  
  let tips = diet.type === 'loss' ? 
    "<li>Caloric Deficit: Eat 300-500 calories less.</li><li>High Protein: Chicken, Tofu, Eggs to preserve muscle.</li><li>Cardio: 3-4 times a week.</li>" : 
    diet.type === 'gain' ? 
    "<li>Caloric Surplus: Eat 300-500 calories extra.</li><li>Carbs & Fats: Rice, Peanut butter, Nuts.</li><li>Heavy Lifting: Focus on compound gym movements.</li>" : 
    "<li>Balanced Diet: Keep calories equal to TDEE.</li><li>Consistency is key.</li>";
    
  el.innerHTML = `<div style="background:var(--glass); border:1px solid var(--gb); padding:15px; border-radius:15px;">
    <h4 style="color:var(--c1); margin-bottom:10px;">${diet.pref} Plan Activated</h4>
    <ul style="padding-left:20px; display:flex; flex-direction:column; gap:8px;">${tips}</ul>
  </div>`;
}

function addRoutine() {
  const a = document.getElementById('rA').value.trim();
  const m = document.getElementById('rM').value;
  if(!a) { alert("Enter exercise!"); return; }
  routine.unshift({ id: Date.now(), act: a, mgrp: m, int: document.getElementById('rI').value, date: new Date().toLocaleDateString() });
  
  // Simulate muscle fatigue
  if(m === 'Chest') { document.getElementById('mChest').innerHTML = 'Requires Recovery <span style="color:var(--c4)">0%</span>'; }
  if(m === 'Back') { document.getElementById('mBack').innerHTML = 'Requires Recovery <span style="color:var(--c4)">0%</span>'; }
  if(m === 'Legs') { document.getElementById('mLegs').innerHTML = 'Requires Recovery <span style="color:var(--c4)">0%</span>'; }
  
  save(); renderRoutine(); toast('rT');
  document.getElementById('rA').value = '';
}
function delRoutine(id) { routine = routine.filter(r => r.id !== id); save(); renderRoutine(); }

function renderRoutine() {
  const el = document.getElementById('rL');
  document.getElementById('rBg').textContent = routine.length + ' workouts';
  if (!routine.length) { el.innerHTML = '<div class="empty"><div class="eico">👟</div>No workouts logged</div>'; return; }
  el.innerHTML = routine.map(r => `
    <div class="ri">
      <div class="ric" style="background:var(--c3)"></div>
      <div class="rii">
        <div class="rin">${r.act}</div>
        <div class="rim"><span>💪 ${r.mgrp}</span><span>🔥 ${r.int}</span><span>📅 ${r.date}</span></div>
      </div>
      <div class="rir"><button class="dbtn" onclick="delRoutine(${r.id})">Del</button></div>
    </div>`).join('');
}

// PRO GYM FEATURES
function calc1RM() {
  const w = parseFloat(document.getElementById('gW').value);
  const r = parseInt(document.getElementById('gR').value);
  if(!w || !r || r < 1) { alert("Enter valid weight and reps!"); return; }
  let max = w * (36 / (37 - r)); // Brzycki Formula
  if(r === 1) max = w;
  document.getElementById('g1Res').textContent = Math.round(max) + " kg 1RM";
}

function genSplit() {
  const d = document.getElementById('gDays').value;
  let res = "";
  if(d == 3) res = "Day 1: Full Body A<br>Day 2: Rest<br>Day 3: Full Body B<br>Day 4: Rest<br>Day 5: Full Body C";
  if(d == 4) res = "Day 1: Upper Body<br>Day 2: Lower Body<br>Day 3: Rest<br>Day 4: Upper Body<br>Day 5: Lower Body";
  if(d == 5) res = "Day 1: Chest & Tris<br>Day 2: Back & Bis<br>Day 3: Legs<br>Day 4: Shoulders<br>Day 5: Arms & Core";
  if(d == 6) res = "Day 1: Push<br>Day 2: Pull<br>Day 3: Legs<br>Day 4: Push<br>Day 5: Pull<br>Day 6: Legs";
  document.getElementById('gSpRes').innerHTML = res;
}

function updateAll() {
  const today = meds.filter(m => m.time !== 'Anytime').length;
  ['s1', 'hcm'].forEach(id => document.getElementById(id).textContent = meds.length);
  ['s2', 'hch'].forEach(id => document.getElementById(id).textContent = health.length);
  document.getElementById('s3').textContent = today;
  document.getElementById('mBg').textContent = meds.length + ' medicine' + (meds.length !== 1 ? 's' : '');
  document.getElementById('hBg').textContent = health.length + ' record' + (health.length !== 1 ? 's' : '');
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let c = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) c = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + c));
});

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
}, { threshold: 0.07 });
document.querySelectorAll('.fu').forEach(el => obs.observe(el));

renderMeds(); renderHealth(); renderSched(); renderDiet(); renderRoutine(); updateAll(); updateVitals();

/* =========================================
   EXTREME 3D TILT EFFECT
   ========================================= */
document.querySelectorAll('.sb, .gc, .fc, .sc, .vc, .oc, .step, .h3d').forEach(el => {
  el.classList.add('tilt-3d');
  
  // Wrap inner content to apply Z-translation for 3D depth
  Array.from(el.children).forEach(child => {
    child.classList.add('tilt-inner');
  });

  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    
    // Calculate rotation with intensity
    const rotateY = (dx / rect.width) * 30; // Max 15deg rotation
    const rotateX = -(dy / rect.height) * 30;
    
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    
    // Dynamic shadow based on mouse position
    const shadowX = (dx / rect.width) * -30;
    const shadowY = (dy / rect.height) * -30;
    el.style.boxShadow = `${shadowX}px ${shadowY}px 45px rgba(0, 255, 204, 0.25), inset 0 2px 10px rgba(255,255,255,0.1)`;
  });
  
  el.addEventListener('mouseleave', () => {
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    el.style.boxShadow = ``;
  });
});

/* =========================================
   AI CHATBOT LOGIC
   ========================================= */
function toggleChat() {
  document.getElementById('ai-chat').classList.toggle('active');
}

function handleAI(e) {
  if (e.key === 'Enter') sendAI();
}

function sendAI() {
  const inp = document.getElementById('ai-inp');
  const txt = inp.value.trim();
  if (!txt) return;
  
  const cb = document.getElementById('cbod');
  cb.innerHTML += `<div class="msg usr">${txt}</div>`;
  inp.value = '';
  cb.scrollTop = cb.scrollHeight;
  
  // Simulate AI typing delay
  setTimeout(() => {
    let reply = "I'm MedAI! Try asking me about your 'medicines', 'vitals', or 'schedule'.";
    const t = txt.toLowerCase();
    
    // PRO GYM AI COACH TRAINING
    if (t.includes('gym') || t.includes('workout') || t.includes('train') || t.includes('lift')) {
      reply = `<strong>Gym Coach Mode:</strong> You've logged ${routine.length} workouts. Tip: To maximize hypertrophy, stay within 1-3 reps of failure. Are you focusing on bulking or cutting right now?`;
    } else if (t.includes('1rm') || t.includes('max') || t.includes('strength')) {
      reply = `<strong>1-Rep Max (1RM):</strong> Your 1RM is the maximum weight you can lift for a single repetition. Use the 1RM Calculator in the FitPro Hub. To get stronger, focus on lifting 80-90% of your 1RM for 3-5 reps.`;
    } else if (t.includes('chest') || t.includes('bench')) {
      reply = `<strong>Chest Workout:</strong> For a massive chest, focus on Flat Bench Press, Incline Dumbbell Press, and Cable Crossovers. Make sure to squeeze at the top!`;
    } else if (t.includes('back') || t.includes('deadlift')) {
      reply = `<strong>Back Workout:</strong> To build a wide back, do Pull-ups, Barbell Rows, and Lat Pulldowns. Remember to pull with your elbows, not your hands!`;
    } else if (t.includes('leg') || t.includes('squat')) {
      reply = `<strong>Leg Day:</strong> Never skip leg day! Barbell Squats, Romanian Deadlifts, and Leg Presses are your best friends.`;
    } else if (t.includes('split') || t.includes('routine')) {
      reply = `<strong>Workout Split:</strong> If you train 3 days, do Full Body. 4 days = Upper/Lower. 6 days = Push/Pull/Legs (PPL). Use the Split Generator above!`;
    } else if (t.includes('protein') || t.includes('creatine') || t.includes('supplement')) {
      reply = `<strong>Supplements:</strong> Aim for 1.6g - 2.2g of protein per kg of body weight. Creatine Monohydrate (5g/day) is highly recommended for strength and muscle volume.`;
    } else if (t.includes('medicine') || t.includes('med')) {
      if (meds.length > 0) {
        reply = `You have <strong>${meds.length} medicines</strong>. Next is <strong>${meds[0].name}</strong> at <strong>${meds[0].time}</strong>.`;
      } else {
        reply = "No medicines added. Track your supplements or meds in the Medicine section!";
      }
    } else if (t.includes('diet') || t.includes('weight') || t.includes('food')) {
      if (diet) {
        let gl = diet.type === 'loss' ? 'lose' : diet.type === 'gain' ? 'gain' : 'maintain';
        reply = `<strong>Diet Coach:</strong> Your goal is to ${gl} weight. Keep protein high, stay hydrated, and stick to your caloric ${diet.type === 'loss' ? 'deficit' : 'surplus'}!`;
      } else {
        reply = "Set a weight goal in the Diet section, and I'll act as your personal nutritionist!";
      }
    } else if (t.includes('hello') || t.includes('hi') || t.includes('hey')) {
      reply = "What's up! 👋 I am your Pro AI Coach. I specialize in Gym, Diet, and Health Tracking. Ask me about your 1RM, splits, or diet!";
    } else if (t.includes('aasif') || t.includes('creator')) {
      reply = "Aasif is the genius creator behind MedTrack & FitPro! He built this entire 3D ecosystem.";
    } else if (t.includes('thank')) {
      reply = "You're welcome! Keep grinding, stay disciplined, and get those gains! 💪🔥";
    }
    
    cb.innerHTML += `<div class="msg ai">${reply}</div>`;
    cb.scrollTop = cb.scrollHeight;
  }, 600 + Math.random() * 400); // Random delay for realism
}
