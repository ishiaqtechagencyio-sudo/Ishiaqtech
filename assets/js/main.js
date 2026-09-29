(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuBtn');
  var navLinks = $('#navLinks');
  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!navLinks.classList.contains('open')); });
  $$('a', navLinks).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll: progress bar, nav border, back-to-top ---------- */
  var progress = $('#progress');
  var nav = $('#nav');
  var toTop = $('#toTop');
  var ticking = false;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var y = h.scrollTop;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- Active nav link ---------- */
  var sectionLinks = $$('a', navLinks);
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sectionLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) navObs.observe(s);
    });
  }

  /* ---------- Reveal on scroll + counters ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = pre + target.toFixed(dec) + suf; return; }
    var start = null;
    var dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (target * eased).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('[data-count]', en.target).forEach(countUp);
        revealObs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal, .step').forEach(function (el, i) {
      // Stagger siblings in grids
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(idx, 5) * 70 + 'ms';
      revealObs.observe(el);
    });
  } else {
    $$('.reveal, .step').forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(countUp);
  }

  /* ---------- Hero word rotator ---------- */
  var rotEl = $('#rotWord');
  var words = ['clarity', 'insight', 'growth', 'progress'];
  if (!reduceMotion && rotEl) {
    var wi = 0;
    var ci = words[0].length;
    var deleting = true;
    var pause = 2200;
    (function tick() {
      var word = words[wi];
      if (deleting) {
        ci--;
        rotEl.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
        setTimeout(tick, 60);
      } else {
        word = words[wi];
        ci++;
        rotEl.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, pause); }
        else setTimeout(tick, 90);
      }
    })();
  }

  /* ---------- Hero mini chart (live-updating) ---------- */
  var heroLine = $('#heroLine');
  var heroArea = $('#heroArea');
  var heroBars = $('#heroBars');
  var heroPts = [];
  for (var i = 0; i < 14; i++) heroPts.push(120 - i * 5 + Math.sin(i * 1.3) * 18);
  for (var b = 0; b < 12; b++) {
    var bar = document.createElement('i');
    bar.style.setProperty('--h', (25 + Math.random() * 70) + '%');
    heroBars.appendChild(bar);
  }
  function drawHero() {
    var w = 400, step = w / (heroPts.length - 1);
    var d = heroPts.map(function (y, i) {
      if (i === 0) return 'M0 ' + y.toFixed(1);
      var px = (i - 1) * step, x = i * step, cx = (px + x) / 2;
      return 'C' + cx.toFixed(1) + ' ' + heroPts[i - 1].toFixed(1) + ' ' + cx.toFixed(1) + ' ' + y.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    heroLine.setAttribute('d', d);
    heroArea.setAttribute('d', d + ' L400 190 L0 190 Z');
  }
  drawHero();
  if (!reduceMotion) {
    setInterval(function () {
      if (document.hidden) return;
      var last = heroPts[heroPts.length - 1];
      var next = Math.max(20, Math.min(170, last + (Math.random() - 0.58) * 26));
      heroPts.shift(); heroPts.push(next);
      drawHero();
      var bars = heroBars.children;
      var hi = Math.floor(Math.random() * bars.length);
      for (var j = 0; j < bars.length; j++) {
        if (Math.random() > 0.6) bars[j].style.setProperty('--h', (25 + Math.random() * 70) + '%');
        bars[j].classList.toggle('hi', j === hi);
      }
    }, 1600);
  }

  /* ---------- Service card spotlight ---------- */
  $$('.service').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Interactive demo dashboard ---------- */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var METRICS = {
    revenue:   { label: 'Revenue',       base: 42000, fmt: function (v) { return '$' + (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : (v / 1e3).toFixed(1) + 'k'); } },
    orders:    { label: 'Orders',        base: 860,   fmt: function (v) { return Math.round(v).toLocaleString(); } },
    customers: { label: 'New customers', base: 310,   fmt: function (v) { return Math.round(v).toLocaleString(); } }
  };
  var REGIONS = {
    all:      { mult: 1,    growth: 0.035, season: 0.12, seed: 1 },
    africa:   { mult: 0.34, growth: 0.06,  season: 0.08, seed: 7 },
    europe:   { mult: 0.38, growth: 0.02,  season: 0.18, seed: 13 },
    americas: { mult: 0.28, growth: 0.03,  season: 0.1,  seed: 21 }
  };
  var state = { metric: 'revenue', region: 'all', period: 12 };

  // Deterministic pseudo-random so each view is stable
  function rng(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }

  function series() {
    var m = METRICS[state.metric], r = REGIONS[state.region];
    var rand = rng(r.seed + state.metric.length * 3);
    var data = [];
    for (var i = 0; i < 12; i++) {
      var trend = Math.pow(1 + r.growth, i);
      var season = 1 + r.season * Math.sin((i - 2) / 12 * Math.PI * 2);
      var noise = 0.9 + rand() * 0.2;
      var val = m.base * r.mult * trend * season * noise;
      var target = m.base * r.mult * Math.pow(1 + r.growth * 0.9, i) * 1.04;
      data.push({ month: MONTHS[i], value: val, target: target });
    }
    return data.slice(12 - state.period);
  }

  var svg = $('#demoSvg');
  var tooltip = $('#tooltip');
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function renderDemo() {
    var m = METRICS[state.metric];
    var data = series();
    var W = svg.clientWidth || 700, H = 300;
    var pad = { l: 52, r: 10, t: 14, b: 28 };
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var max = Math.max.apply(null, data.map(function (d) { return Math.max(d.value, d.target); })) * 1.12;
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var bw = iw / data.length;
    var y = function (v) { return pad.t + ih - (v / max) * ih; };

    // Axis / gridlines
    var axis = el('g', { class: 'axis' }, svg);
    for (var g = 0; g <= 4; g++) {
      var v = (max / 4) * g, yy = y(v);
      el('line', { x1: pad.l, x2: W - pad.r, y1: yy, y2: yy, 'stroke-dasharray': g ? '3 4' : '' }, axis);
      var t = el('text', { x: pad.l - 8, y: yy + 4, 'text-anchor': 'end' }, axis);
      t.textContent = m.fmt(v);
    }

    // Bars
    var bars = el('g', {}, svg);
    data.forEach(function (d, i) {
      var x = pad.l + i * bw + bw * 0.18;
      var w = bw * 0.64;
      var r = el('rect', {
        class: 'bar', x: x, width: w, rx: 4,
        y: reduceMotion ? y(d.value) : pad.t + ih,
        height: reduceMotion ? pad.t + ih - y(d.value) : 0,
        tabindex: 0, 'aria-label': d.month + ': ' + m.fmt(d.value)
      }, bars);
      if (!reduceMotion) {
        el('animate', { attributeName: 'y', from: pad.t + ih, to: y(d.value), dur: '0.6s', begin: (i * 0.03) + 's', fill: 'freeze', calcMode: 'spline', keySplines: '0.2 0.8 0.2 1', keyTimes: '0;1' }, r);
        el('animate', { attributeName: 'height', from: 0, to: pad.t + ih - y(d.value), dur: '0.6s', begin: (i * 0.03) + 's', fill: 'freeze', calcMode: 'spline', keySplines: '0.2 0.8 0.2 1', keyTimes: '0;1' }, r);
      }
      var tl = el('text', { x: x + w / 2, y: H - 8, 'text-anchor': 'middle' }, axis);
      tl.textContent = d.month;

      function show() {
        $$('.bar', svg).forEach(function (b) { b.classList.remove('active'); });
        r.classList.add('active');
        var diff = (d.value / d.target - 1) * 100;
        tooltip.innerHTML = '<b>' + d.month + '</b> · ' + m.fmt(d.value) + '<br><span style="color:var(--muted)">' +
          (diff >= 0 ? '+' : '') + diff.toFixed(1) + '% vs target</span>';
        var sr = svg.getBoundingClientRect();
        var cr = tooltip.offsetParent.getBoundingClientRect();
        tooltip.style.left = (sr.left - cr.left + (x + w / 2) / W * sr.width) + 'px';
        tooltip.style.top = (sr.top - cr.top + y(d.value) / H * sr.height - 6) + 'px';
        tooltip.style.opacity = 1;
      }
      function hide() { r.classList.remove('active'); tooltip.style.opacity = 0; }
      r.addEventListener('pointerenter', show);
      r.addEventListener('pointerleave', hide);
      r.addEventListener('focus', show);
      r.addEventListener('blur', hide);
    });

    // Target line
    var pts = data.map(function (d, i) { return (pad.l + i * bw + bw / 2).toFixed(1) + ',' + y(d.target).toFixed(1); });
    el('polyline', { class: 'target', points: pts.join(' ') }, svg);

    // KPIs
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    var tTotal = data.reduce(function (s, d) { return s + d.target; }, 0);
    var best = data.reduce(function (a, d) { return d.value > a.value ? d : a; }, data[0]);
    var vs = (total / tTotal - 1) * 100;
    $('#kTotalLabel').textContent = 'Total ' + m.label.toLowerCase();
    $('#kTotal').textContent = m.fmt(total);
    $('#kAvg').textContent = m.fmt(total / data.length);
    $('#kBest').textContent = best.month;
    var kt = $('#kTarget');
    kt.innerHTML = (vs >= 0 ? '+' : '') + vs.toFixed(1) + '%' + '<span class="' + (vs >= 0 ? 'up' : 'down') + '">' + (vs >= 0 ? '▲' : '▼') + '</span>';
    $('#chartTitle').textContent = m.label + ' by month' + (state.region !== 'all' ? ' — ' + state.region.charAt(0).toUpperCase() + state.region.slice(1) : '');

    // Auto-generated insight
    var first = data[0].value, last = data[data.length - 1].value;
    var change = (last / first - 1) * 100;
    var beat = data.filter(function (d) { return d.value >= d.target; }).length;
    var regionName = state.region === 'all' ? 'across all regions' : 'in ' + state.region.charAt(0).toUpperCase() + state.region.slice(1);
    $('#insightText').textContent =
      m.label + ' ' + regionName + ' ' + (change >= 0 ? 'grew' : 'fell') + ' ' + Math.abs(change).toFixed(0) +
      '% over the last ' + state.period + ' months, peaking in ' + best.month + '. Target was met in ' + beat +
      ' of ' + data.length + ' months' + (beat < data.length / 2 ? ' — worth investigating what changed.' : ' — momentum is strong.');
  }

  $$('.demo-side .seg').forEach(function (group) {
    var key = group.dataset.group;
    $$('button', group).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('button', group).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        state[key] = key === 'period' ? parseInt(btn.dataset.value, 10) : btn.dataset.value;
        renderDemo();
      });
    });
  });

  var resizeT;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(renderDemo, 150); });
  renderDemo();

  /* ---------- Work filter ---------- */
  var chips = $$('.work-filters .chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      var f = chip.dataset.filter;
      $$('.case').forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.cat === f); });
    });
  });

  /* ---------- Package → prefill form ---------- */
  $$('[data-package]').forEach(function (a) {
    a.addEventListener('click', function () { $('#fPackage').value = a.dataset.package; });
  });

  /* ---------- Contact form ---------- */
  var form = $('#contactForm');
  var status = $('#formStatus');

  function validateField(input) {
    var field = input.closest('.field');
    var err = field && $('.error', field);
    var msg = '';
    if (input.validity.valueMissing) msg = 'This field is required.';
    else if (input.validity.typeMismatch) msg = 'Please enter a valid email address.';
    else if (input.validity.tooShort) msg = 'Please add a little more detail.';
    if (field) field.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }
  $$('input[required], textarea[required]', form).forEach(function (inp) {
    inp.addEventListener('blur', function () { validateField(inp); });
    inp.addEventListener('input', function () { if (inp.closest('.field').classList.contains('invalid')) validateField(inp); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = $$('input[required], textarea[required]', form);
    var ok = fields.map(validateField).every(Boolean);
    if (!ok) {
      status.className = 'form-status err';
      status.textContent = 'Please fix the highlighted fields.';
      var firstBad = $('.field.invalid input, .field.invalid textarea', form);
      if (firstBad) firstBad.focus();
      return;
    }

    var data = new FormData(form);
    // Formspree handles repeated keys, but join services for a cleaner email
    var services = data.getAll('services');
    data.delete('services');
    data.append('services', services.length ? services.join(', ') : 'Not specified');

    var btn = $('button[type="submit"]', form);
    var original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Thank you! Your enquiry has been received — we’ll be in touch soon.';
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Something went wrong. Please try again or email Ishiaqtechagency.io@gmail.com directly.';
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = original;
      });
  });
})();
