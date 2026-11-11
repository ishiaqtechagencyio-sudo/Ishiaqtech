const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const scenes=$$('.scene'),bar=$('.progress');let tick=false;
function update(){const vh=innerHeight;
 scenes.forEach(s=>{const r=s.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));s.style.setProperty('--p',p.toFixed(4));
  if(s.classList.contains('steps')){const it=$$('.step-item',s),i=Math.min(it.length-1,Math.floor(p*it.length));it.forEach((e,k)=>e.classList.toggle('on',k===i));const b=$('.big',s);if(b)b.textContent='0'+(i+1)}});
 const max=document.documentElement.scrollHeight-vh;bar.style.width=(max>0?scrollY/max*100:0)+'%'}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(()=>{update();tick=false})}},{passive:true});addEventListener('resize',update);update();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});$$('.reveal').forEach(e=>io.observe(e));
$$('.bgvid').forEach(v=>{v.addEventListener('loadeddata',()=>v.classList.add('ready'));v.addEventListener('error',()=>v.remove());$$('source',v).forEach(s=>s.addEventListener('error',()=>v.remove()))});
const m=$('.menu');if(m)m.onclick=()=>$('.nav nav').classList.toggle('open');
const f=$('#form');if(f)f.addEventListener('submit',e=>{e.preventDefault();const b=f.querySelector('button'),t=b.textContent;b.disabled=true;b.textContent='Sending…';
 fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}}).then(r=>{if(r.ok){$('#ok').style.display='block';f.reset()}else throw 0}).catch(()=>alert('Something went wrong. Please try again or email us directly.')).finally(()=>{b.disabled=false;b.textContent=t})});
