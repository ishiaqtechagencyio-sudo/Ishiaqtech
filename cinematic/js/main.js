/* IshiaqTech Agency — Cinematic v2
   Scroll engine: sets --p (0→1) on each pinned scene, --hp on the hero,
   scrubs the video timecode, tracks the active chapter and nav colour. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- timecode helpers ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const timecode = (seconds, fps = 24) => {
    const f = Math.floor(seconds * fps);
    return [Math.floor(f / (fps * 3600)), Math.floor(f / (fps * 60)) % 60, Math.floor(f / fps) % 60, f % fps].map(pad).join(':');
  };

  /* ---------- live hero timecode ---------- */
  const tc = $('#tc');
  const t0 = performance.now();
  const tickTc = () => { tc.textContent = timecode((performance.now() - t0) / 1000); };
  tickTc();
  if (!reduce) setInterval(tickTc, 1000 / 24);

  /* ---------- scroll engine ---------- */
  const hero = $('.hero');
  const pins = $$('.pin').map((el) => ({ el, scene: $('.scene', el), ch: +el.dataset.ch }));
  const themed = $$('[data-bg]');
  const nav = $('.nav');
  const rail = $('.rail');
  const railLinks = $$('a', rail);
  const vtc = $('#vtc');
  const VIDEO_SECONDS = 90;
  let ticking = false;

  function update() {
    const vh = innerHeight;

    // hero: words slide apart as you leave
    hero.style.setProperty('--hp', clamp(scrollY / vh).toFixed(4));

    // scenes: progress through the pinned range
    let active = -1;
    for (const p of pins) {
      const r = p.el.getBoundingClientRect();
      const pinned = getComputedStyle(p.scene).position === 'sticky';
      const range = r.height - vh;
      const prog = pinned && range > 0 ? clamp(-r.top / range) : 1;
      p.scene.style.setProperty('--p', prog.toFixed(4));
      if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) active = p.ch;
      if (p.ch === 3) vtc.textContent = timecode(prog * VIDEO_SECONDS);
    }

    // chapter rail
    rail.classList.toggle('show', active >= 0);
    railLinks.forEach((a) => a.classList.toggle('on', +a.dataset.ch === active));
    rail.classList.toggle('on-dark', active === 3);

    // nav colour follows whatever is under it:
    // data-on mirrors the section's data-bg: dark → paper text, light/red → black text
    let bg = 'dark';
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) { bg = s.dataset.bg; break; }
    }
    nav.dataset.on = bg;
  }
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- writing scene: cycle greetings ---------- */
  const say = $('#say');
  const lang = $('#lang');
  const words = [
    ['Hello', 'English', 'ltr'], ['مرحبا', 'Arabic', 'rtl'], ['Bonjour', 'French', 'ltr'],
    ['你好', 'Mandarin', 'ltr'], ['Hola', 'Spanish', 'ltr'], ['Bawo ni', 'Yoruba', 'ltr'],
  ];
  let wi = 0;
  const swap = () => {
    wi = (wi + 1) % words.length;
    say.classList.add('out');
    setTimeout(() => {
      const [w, l, d] = words[wi];
      say.textContent = w; say.dir = d; lang.textContent = l;
      say.classList.remove('out');
    }, 260);
  };
  if (!reduce) setInterval(swap, 1900);

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- contact form (Formspree, no page reload) ---------- */
  const form = $('#form');
  const note = $('#note');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.className = 'form-note';
    note.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      note.textContent = 'Thank you! We’ll be in touch soon.';
    } catch {
      note.className = 'form-note err';
      note.textContent = 'Something went wrong. Please email us directly.';
    }
  });

  $('#year').textContent = new Date().getFullYear();
})();
