
// Vee v4.5 - core client-side logic (localStorage) + assistant UI
(function(){
  // data helpers
  function dget(){ return JSON.parse(localStorage.getItem('vee_v4_5')||'null'); }
  function dset(d){ localStorage.setItem('vee_v4_5', JSON.stringify(d)); }
  function ensure(){ if(dget()) return; dset({
    users:[{id:1,username:'Vee',password:'411',accountNumber:'ADMIN001A',isAdmin:true,points:300,purchases:[],reads:0,history:[]}],
    sections:[
      {id:'terminal',name:'ترمكس',subsections:[{id:'basics',name:'اساسيات الترمكس',paid:false,price:0,content:'تعلم الأساسيات...'}]},
      {id:'whatsapp',name:'واتساب',subsections:[{id:'reverse',name:'نسخة عكس',paid:false,price:0,content:'نسخة عكس...'}]}
    ],
    achievements:[{id:'a1',name:'قارئ مبتدئ',rule:{type:'reads',value:5}},{id:'a2',name:'مشتري 3',rule:{type:'purchases',value:3}}],
    broadcasts:[]
  }); }
  ensure();

  function toast(msg,t=2200){ const el=document.getElementById('toast'); if(!el) return; el.innerText=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),t); }

  // preloader hide (if present)
  window.addEventListener('load', ()=>{
    const pre=document.getElementById('preloader'); if(pre) pre.style.display='none';
  });

  // account generation
  function genAcc(users){ const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let acc; do{ acc='12'+(100+Math.floor(Math.random()*900))+letters.charAt(Math.floor(Math.random()*letters.length)); }while(users.some(u=>u.accountNumber===acc)); return acc; }

  // AUTH
  const lf=document.getElementById('loginForm');
  if(lf){
    document.getElementById('openRegister').addEventListener('click', ()=> document.getElementById('registerModal').classList.remove('hidden'));
    document.getElementById('closeRegister').addEventListener('click', ()=> document.getElementById('registerModal').classList.add('hidden'));
    document.getElementById('registerForm').addEventListener('submit', function(e){ e.preventDefault(); const name=document.getElementById('regName').value.trim(); const pass=document.getElementById('regPass').value; const data=dget(); if(data.users.some(u=>u.username.toLowerCase()===name.toLowerCase())){ alert('اسم المستخدم موجود'); return; } const acc=genAcc(data.users); const nu={id:data.users.length+1,username:name,password:pass,accountNumber:acc,isAdmin:false,points:50,purchases:[],reads:0,history:[]}; data.users.push(nu); dset(data); localStorage.setItem('vee_session', JSON.stringify({id:nu.id})); toast('تم إنشاء الحساب وتسجيل الدخول'); setTimeout(()=> location.href='dashboard.html',700); });
    lf.addEventListener('submit', function(e){ e.preventDefault(); const name=document.getElementById('loginUsername').value.trim(); const pass=document.getElementById('loginPassword').value; const data=dget(); const u=data.users.find(x=>x.username===name && x.password===pass); if(!u){ alert('بيانات تسجيل الدخول غير صحيحة'); return; } localStorage.setItem('vee_session', JSON.stringify({id:u.id})); toast('تم تسجيل الدخول'); setTimeout(()=> location.href = u.isAdmin ? 'admin.html' : 'dashboard.html',700); });
  }

  // Dashboard
  if(location.pathname.endsWith('dashboard.html')){
    const sess=JSON.parse(localStorage.getItem('vee_session')||'null'); if(!sess) location.href='login.html'; const data=dget(); const user=data.users.find(u=>u.id===sess.id); if(!user){ localStorage.removeItem('vee_session'); location.href='login.html'; }
    document.getElementById('pName').innerText = user.username; document.getElementById('pAccount').innerText = user.accountNumber; document.getElementById('pPoints').innerText = (user.points||0)+' نقطة';
    const badges = document.getElementById('badges'); const history = document.getElementById('history');
    user.reads = user.reads || 0;
    const totalItems = data.sections.reduce((acc,s)=>acc+s.subsections.length,0);
    const completed = (user.purchases||[]).length + (user.reads||0);
    const pct = Math.min(100, Math.round((completed/totalItems)*100));
    document.getElementById('progressFill').style.width = pct+'%';
    badges.innerHTML=''; data.achievements.forEach(a=>{ let earned=false; if(a.rule.type==='reads' && user.reads>=a.rule.value) earned=true; if(a.rule.type==='purchases' && (user.purchases||[]).length>=a.rule.value) earned=true; const el=document.createElement('div'); el.className='badge'; el.innerText = (earned? '🏅 ':'') + a.name; badges.appendChild(el); });
    history.innerHTML=''; (user.purchases||[]).concat(user.history||[]).forEach(h=>{ const r=document.createElement('div'); r.innerText = h; history.appendChild(r); });
    document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('vee_session'); toast('تم تسجيل الخروج'); setTimeout(()=> location.href='index.html',700); });
  }

  // Store
  if(location.pathname.endsWith('store.html')){
    const data=dget(); const sess=JSON.parse(localStorage.getItem('vee_session')||'null'); const user = sess? data.users.find(u=>u.id===sess.id):null; const area=document.getElementById('storeArea'); area.innerHTML=''; data.sections.forEach(sec=> sec.subsections.filter(s=>s.paid).forEach(sub=>{ const c=document.createElement('div'); c.className='card'; c.innerHTML = '<h4>'+sub.name+'</h4><div>'+sec.name+'</div><div>'+sub.price+' نقطة</div>'; const btn=document.createElement('button'); btn.className='btn primary'; btn.innerText = user ? 'شراء' : 'سجل للدفع'; btn.addEventListener('click', ()=>{ if(!user){ alert('سجل الدخول أولاً'); return; } if((user.points||0) < sub.price){ alert('نقاط غير كافية'); return; } if(confirm('شراء المحتوى؟')){ user.points=(user.points||0)-sub.price; user.purchases=(user.purchases||[]).concat([sec.id+'-'+sub.id]); user.history = (user.history||[]).concat(['اشتريت '+sub.name]); dset(data); toast('تم الشراء'); } }); c.appendChild(btn); area.appendChild(c); })); }

  // Admin
  if(location.pathname.endsWith('admin.html')){
    const sess=JSON.parse(localStorage.getItem('vee_session')||'null'); if(!sess) location.href='login.html'; const data=dget(); const admin=data.users.find(u=>u.id===sess.id && u.isAdmin); if(!admin){ localStorage.removeItem('vee_session'); location.href='login.html'; }
    document.getElementById('userCount').innerText = data.users.length;
    const content=document.getElementById('adminContent');
    function render(panel){ if(panel==='dashboard'){ content.innerHTML = '<h3>لوحة الأدمن</h3><div class=\"grid\"><div class=\"card\">المستخدمين: '+data.users.length+'</div><div class=\"card\">الأقسام: '+data.sections.length+'</div></div>'; }
      if(panel==='sections'){ let html='<h3>الأقسام</h3>'; data.sections.forEach((sec,si)=>{ html += '<div class=\"card\"><strong>'+sec.name+'</strong>'; sec.subsections.forEach((sub,subi)=> html += '<div>'+sub.name+' '+(sub.paid?('('+sub.price+' نقطة)'):'')+' <button data-si=\"'+si+'\" data-sub=\"'+subi+'\" class=\"btn">تعديل</button></div>'); html += '<div class=\"row\"><button data-add=\"'+si+'\" class=\"btn success\">إضافة أداة</button></div></div>'; }); content.innerHTML = html; content.querySelectorAll('button[data-add]').forEach(b=> b.addEventListener('click', e=> openTool({si:parseInt(e.target.getAttribute('data-add'))}))); content.querySelectorAll('button[data-si]').forEach(b=> b.addEventListener('click', e=> openTool({si:parseInt(e.target.getAttribute('data-si')), subIndex:parseInt(e.target.getAttribute('data-sub')), mode:'edit'}))); }
      if(panel==='users'){ let html='<h3>المستخدمون</h3>'; data.users.forEach((u,ui)=> html += '<div class=\"card\">'+u.username+' '+(u.isAdmin?'<span>(أدمن)</span>':'')+'<div>'+u.accountNumber+'</div><div>نقاط: '+(u.points||0)+'</div></div>'); content.innerHTML = html; } }
    document.querySelectorAll('button[data-panel]').forEach(b=> b.addEventListener('click', ()=> render(b.getAttribute('data-panel'))));
    render('dashboard');
    window.openTool = function(opts){ const si=opts.si; const title = prompt('اسم الأداة'); if(!title) return; const isPaid = confirm('هل الأداة مدفوعة؟ OK = نعم'); const price = isPaid ? parseFloat(prompt('ادخل السعر (نقطة)'))||0 : 0; const content = prompt('محتوى الأداة'); const img = null; data.sections[si].subsections.push({ id:'sub'+Date.now(), name:title, paid:isPaid, price:price, content:content, image:img }); dset(data); toast('تم الإضافة'); render('sections'); };
    document.getElementById('adminLogout').addEventListener('click', ()=>{ localStorage.removeItem('vee_session'); toast('تم تسجيل الخروج'); setTimeout(()=> location.href='login.html',700); });
  }

  // Code explainer interactions (simple heuristics) - on code_explain.html
  if(location.pathname.endsWith('code_explain.html')){
    function detectLang(code){ const first = code.trim().split('\\n')[0]; if(/\\bdef\\b|:\\s*$/.test(first)) return 'python'; if(/<\\/?(html|div|script)/i.test(code)) return 'html'; if(/function\\s+|=>|console\\.log/.test(code)) return 'javascript'; if(/\\{[^}]*\\}/.test(code) && /:\\s*[^;]+;/.test(code)) return 'css'; return 'text'; }
    document.getElementById('explainBtn').addEventListener('click', ()=>{
      const code = document.getElementById('codeInput').value || '';
      let lang = document.getElementById('codeLang').value || detectLang(code);
      const out = document.getElementById('explainOutput');
      if(!code.trim()){ alert('ألصق الكود أولاً'); return; }
      // basic line-by-line naive explainer
      const lines = code.split('\\n');
      const explanations = lines.map((ln,i)=>{ ln = ln.replace(/</g,'&lt;'); if(lang==='python'){ if(/def\\s+/.test(ln)) return (i+1)+'. تعريف دالة: '+ln; if(/print\\(/.test(ln)) return (i+1)+'. طباعة إلى الشاشة: '+ln; return (i+1)+'. '+ln; } if(lang==='javascript'){ if(/console\\.log\\(/.test(ln)) return (i+1)+'. تسجيل/طباعة: '+ln; if(/function\\s+/.test(ln)) return (i+1)+'. تعريف دالة: '+ln; return (i+1)+'. '+ln; } if(lang==='html'){ if(/<\\w+/.test(ln)) return (i+1)+'. عنصر HTML: '+ln; return (i+1)+'. '+ln; } if(lang==='css'){ if(/\\{/.test(ln)) return (i+1)+'. بداية قاعدة CSS: '+ln; return (i+1)+'. '+ln; } return (i+1)+'. '+ln; });
      out.innerText = explanations.join('\\n');
    });
    // voice explain - uses simple TTS of the explanation
    document.getElementById('voiceExplain').addEventListener('click', ()=>{
      document.getElementById('explainBtn').click();
      const text = document.getElementById('explainOutput').innerText || 'لا يوجد شرح';
      if('speechSynthesis' in window){ const ut = new SpeechSynthesisUtterance(text); ut.lang='ar-SA'; speechSynthesis.speak(ut); } else alert('المتصفح لا يدعم النطق');
    });
  }

  // Assistant UI
  const assistantBtn = document.getElementById('assistantBtn');
  if(assistantBtn){
    // build panel
    const panel = document.createElement('div'); panel.className='assistant-panel hidden'; panel.id='assistantPanel';
    panel.innerHTML = '<div class="assistant-header"><strong>Vee Assistant</strong><button id="assistantClose" class="btn">X</button></div><div class="assistant-messages" id="assistantMessages"></div><div class="assistant-input"><input id="assistantInput" placeholder="اسأل Vee..." /><button id="assistantSend" class="btn primary">إرسال</button></div>';
    document.body.appendChild(panel);
    const messages = document.getElementById('assistantMessages');
    document.getElementById('assistantClose').addEventListener('click', ()=> panel.classList.add('hidden'));
    assistantBtn.addEventListener('click', ()=> panel.classList.toggle('hidden'));

    function addMsg(text, who='bot'){ const d = document.createElement('div'); d.className = 'msg '+(who==='user'?'user':'bot'); d.innerText = text; messages.appendChild(d); messages.scrollTop = messages.scrollHeight; }
    document.getElementById('assistantSend').addEventListener('click', async ()=>{
      const input = document.getElementById('assistantInput'); const text = input.value.trim(); if(!text) return;
      addMsg(text,'user'); input.value='';
      // local simple intelligence: pattern matching
      let response = await localAssistantReply(text);
      addMsg(response,'bot');
      // try TTS
      if('speechSynthesis' in window){ const ut=new SpeechSynthesisUtterance(response); ut.lang='ar-SA'; speechSynthesis.speak(ut); }
    });
    // simple assistant logic (local)
    async function localAssistantReply(text){
      const t = text.toLowerCase();
      const d = dget();
      if(t.includes('كيف') && t.includes('ترمكس')) return 'افتح قسم ترمكس من لوحة الأقسام، ثم اختر الأداة التي تريدها. إذا لم تجد الأداة، اطلب من الأدمن إضافتها.';
      if(t.includes('شراء') || t.includes('اشتريت')) return 'يمكنك شراء الأدوات من صفحة المتجر. تحتاج نقاط كافية. اذهب إلى المتجر من الشريط العلوي.';
      if(t.includes('نقاط') || t.includes('رصيد')){ const sess=JSON.parse(localStorage.getItem('vee_session')||'null'); if(sess){ const u = d.users.find(x=>x.id===sess.id); return 'رصيدك الحالي: '+(u.points||0)+' نقطة'; } return 'سجّل الدخول أولًا لعرض رصيدك.'; }
      if(t.includes('شرح كود') || t.includes('اقرأ كود')) return 'اذهب إلى صفحة "شرح الأكواد" وألصق الكود، ثم اضغط "اشرح الكود". أستطيع أن أشرح سطورًا بسيطة الآن.';
      // fallback: suggest closest section/tool
      for(const sec of d.sections){ if(t.includes(sec.name) || t.includes(sec.id)) return 'هل تقصد قسم '+sec.name+'؟ يمكنك فتحه من لوحة الأقسام.'; for(const sub of sec.subsections){ if(t.includes(sub.name) || t.includes(sub.id)) return 'الأداة '+sub.name+' موجودة في قسم '+sec.name+' — اضغط فتح لعرض الشرح.'; } }
      // if looks like code, run code explainer heuristics
      if(/[;{}()<>]/.test(text) && text.split('\n').length>1){ // multi-line guess
        // use same logic as code_explain: split and explain few lines
        const lines = text.split('\n').slice(0,20); const expl = lines.map((ln,i)=> (i+1)+'. '+ln.trim()).join('\\n'); return 'أرى كوداً — هذه أول سطور مع تفسير مبسط:\\n'+expl;
      }
      // final fallback
      return 'أستطيع مساعدتك في الأدوات، الشروحات، والبحث داخل الأقسام. اسأل مثلاً: "كيف أستخدم بوتات واتساب؟"';
    }
  }

  // ai_bridge.js is separate for future LLM integration
})();