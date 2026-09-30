/* Shared interaction layer for the portfolio pages. Everything is attribute-driven:
   data-reveal, data-count, data-parallax, data-float, data-tilt, data-magnetic,
   data-hover-root/data-hover, data-cursor, data-marquee, data-progress, data-spy,
   data-lightbox, data-panzoom, data-transition. */
(function () {
  if (window.Site) return;
  const SHELL = window.name === 'hk-shell';
  let WIRE = null, wireUrl = null;
  let hashDone = false;
  if (SHELL) addEventListener('message', e => { const d = e.data || {}; if (typeof d.hkWire === 'string') WIRE = d.hkWire; if (d.hkHash && !hashDone) { hashDone = true; const id = d.hkHash.slice(1); [100, 700].forEach(t => setTimeout(() => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH(), behavior: 'auto' }); }, t)); } });
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;
  const ORANGE = '#2F7A45', INK = '#204654', CREAM = '#FAF9F6';
  const S = { mx: innerWidth / 2, my: innerHeight / 2, floats: [], paras: [], marquees: [], progress: [], spies: [], t0: performance.now() };
  addEventListener('mousemove', e => { S.mx = e.clientX; S.my = e.clientY; }, { passive: true });
  const ease = t => 1 - Math.pow(1 - t, 3);
  const parseCss = t => { const o = {}; (t || '').split(';').forEach(p => { const i = p.indexOf(':'); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }); return o; };
  const once = (el, k) => { if (el.dataset[k]) return false; el.dataset[k] = '1'; return true; };

  /* ---------- reveal ---------- */
  const HIDDEN = { up: 'translate3d(0,16px,0)', down: 'translate3d(0,-12px,0)', left: 'translate3d(-14px,0,0)', right: 'translate3d(14px,0,0)', scale: 'translate3d(0,10px,0)', bar: 'scaleX(0)', barY: 'scaleY(0)', fade: '' };
  const pending = new Set();
  function show(el) {
    if (!pending.has(el)) return; pending.delete(el); io.unobserve(el);
    
    if (el.dataset.reveal == null || !el._rvb) return;
    const d = +(el.dataset.delay || 0);
    el.style.opacity = el._rvOp; el.style.transform = el._rvTf; if (el._rvClip) el.style.clipPath = 'inset(0 0% 0 0)';
    setTimeout(() => { el.style.transition = el._rvTr; if (el._rvClip) el.style.clipPath = ''; }, 1400 + d);
  }
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) show(en.target); }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  function track(el) { pending.add(el); io.observe(el); }
  function checkPending() { const lim = innerHeight * .96; for (const el of [...pending]) { const r = el.getBoundingClientRect(); if (r.top < lim && r.bottom > 0) show(el); } }
  addEventListener('beforeprint', () => [...pending].forEach(show));
  function bindReveal(el) {
    if (!once(el, 'rvb')) return;
    if (RM) return;
    const type = el.dataset.reveal || 'up', d = +(el.dataset.delay || 0);
    el._rvTr = el.style.transition; el._rvOp = el.style.opacity || ''; el._rvTf = el.style.transform || '';
    el.style.transition = 'none';
    { el.style.opacity = type === 'bar' || type === 'barY' ? el._rvOp : '0'; el.style.transform = (HIDDEN[type] || '') + ' ' + el._rvTf; }
    if (type === 'bar') el.style.transformOrigin = 'left center';
    if (type === 'barY') el.style.transformOrigin = 'center bottom';
    void el.offsetWidth;
    const cur = false ? 'clip-path 1.3s cubic-bezier(.65,.05,.25,1) ' + d + 'ms' : 'opacity .7s ease ' + d * .6 + 'ms, transform .8s cubic-bezier(.2,.7,.2,1) ' + d * .6 + 'ms';
    el.style.transition = cur; el._rvb = 1;
    track(el);
  }
  function runCount(el) {
    const node = el.firstChild; if (!node || node.nodeType !== 3 || el._counted) return; el._counted = 1;
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), final = node.nodeValue;
    if (RM) return;
    const dur = 1600, t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / dur); node.nodeValue = p >= 1 ? final : (target * ease(p)).toFixed(dec); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- hover groups ---------- */
  function bindHoverRoot(root) {
    if (!once(root, 'hvb')) return;
    const targets = () => [root, ...root.querySelectorAll('[data-hover]')].filter(n => n.dataset.hover);
    root.addEventListener('mouseenter', () => targets().forEach(n => { const o = parseCss(n.dataset.hover); n._hv = n._hv || {}; for (const k in o) { if (!(k in n._hv)) n._hv[k] = n.style.getPropertyValue(k); n.style.setProperty(k, o[k]); } }));
    root.addEventListener('mouseleave', () => targets().forEach(n => { if (!n._hv) return; for (const k in n._hv) n.style.setProperty(k, n._hv[k]); n._hv = null; }));
  }

  /* ---------- tilt / magnetic ---------- */
  function bindTilt(el) {
    return;
    if (!once(el, 'tlb') || RM || !FINE) return;
    const max = +(el.dataset.tilt || 8);
    el.style.transition = (el.style.transition ? el.style.transition + ',' : '') + 'transform .5s cubic-bezier(.2,.7,.2,1)';
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`; });
    el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)'; });
  }
  function bindMagnet(el) {
    return;
    if (!once(el, 'mgb') || RM || !FINE) return;
    const k = +(el.dataset.magnetic || .35);
    el.style.transition = (el.style.transition ? el.style.transition + ',' : '') + 'transform .45s cubic-bezier(.2,.7,.2,1)';
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * k}px, ${(e.clientY - r.top - r.height / 2) * k}px)`; });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
  }

  /* ---------- cursor ---------- */
  let ring, dot, label, cx = S.mx, cy = S.my, cursorMode = '';
  function makeCursor() {
    if (!FINE || ring) return;
    ring = document.createElement('div'); dot = document.createElement('div'); label = document.createElement('span');
    Object.assign(ring.style, { position: 'fixed', left: 0, top: 0, width: '34px', height: '34px', marginLeft: '-17px', marginTop: '-17px', borderRadius: '50%', border: '1px solid ' + INK, pointerEvents: 'none', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width .35s cubic-bezier(.2,.7,.2,1), height .35s cubic-bezier(.2,.7,.2,1), margin .35s cubic-bezier(.2,.7,.2,1), background .3s, border-color .3s', mixBlendMode: 'normal' });
    Object.assign(label.style, { font: '500 12px/1 "Instrument Sans", sans-serif', letterSpacing: '.06em', textTransform: 'uppercase', color: CREAM, opacity: 0, transition: 'opacity .2s', whiteSpace: 'nowrap' });
    Object.assign(dot.style, { position: 'fixed', left: 0, top: 0, width: '6px', height: '6px', marginLeft: '-3px', marginTop: '-3px', borderRadius: '50%', background: ORANGE, pointerEvents: 'none', zIndex: 9999 });
    ring.appendChild(label); document.body.append(ring, dot);
    document.addEventListener('mouseover', e => {
      const t = e.target.closest && e.target.closest('[data-cursor], a, button, [data-lightbox]');
      let mode = '';
      if (t) mode = t.dataset.cursor || (t.dataset.lightbox != null ? 'Zoom' : 'link');
      if (mode === cursorMode) return; cursorMode = mode;
      const big = mode && mode !== 'link';
      if (big) {
        label.textContent = mode + ' →';
        Object.assign(ring.style, { width: 'auto', height: '34px', marginLeft: '14px', marginTop: '14px', borderRadius: '8px', background: INK, borderColor: INK, padding: '0 14px', whiteSpace: 'nowrap' });
        label.style.opacity = 1; dot.style.opacity = 1;
      } else {
        const size = mode === 'link' ? 44 : 34;
        label.textContent = '';
        Object.assign(ring.style, { width: size + 'px', height: size + 'px', marginLeft: -size / 2 + 'px', marginTop: -size / 2 + 'px', borderRadius: '50%', background: 'transparent', borderColor: mode === 'link' ? ORANGE : INK, padding: '0' });
        label.style.opacity = 0;
      }
    });
    document.addEventListener('mouseleave', () => { ring.style.opacity = 0; dot.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { ring.style.opacity = 1; dot.style.opacity = 1; });
  }

  /* ---------- lightbox with pan/zoom ---------- */
  function panZoom(view, content, opts) {
    const st = { s: 1, x: 0, y: 0, min: .2, max: 6 }, ptrs = new Map(); let pinch0 = null, drag = null;
    const apply = anim => { content.style.transition = anim ? 'transform .35s cubic-bezier(.2,.7,.2,1)' : 'none'; content.style.transform = `translate(${st.x}px,${st.y}px) scale(${st.s})`; };
    const size = () => ({ w: content.naturalWidth || content.scrollWidth, h: content.naturalHeight || content.scrollHeight });
    const fit = anim => { const r = view.getBoundingClientRect(), z = size(); if (!z.w) return; const s = Math.min(r.width / z.w, r.height / z.h) * (opts.fitPad || .92); st.s = s; st.min = s * .6; st.x = (r.width - z.w * s) / 2; st.y = (r.height - z.h * s) / 2; apply(anim); };
    const zoomAt = (f, px, py, anim) => { const ns = Math.max(st.min, Math.min(st.max, st.s * f)); const k = ns / st.s; st.x = px - (px - st.x) * k; st.y = py - (py - st.y) * k; st.s = ns; apply(anim); };
    content.style.transformOrigin = '0 0'; content.style.position = 'absolute'; content.style.left = 0; content.style.top = 0; content.style.maxWidth = 'none'; content.draggable = false;
    view.style.touchAction = 'none'; view.style.overflow = 'hidden';
    view.addEventListener('wheel', e => { if (!opts.freeWheel && !e.ctrlKey && !e.metaKey) return; e.preventDefault(); const r = view.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * .0025), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    view.addEventListener('pointerdown', e => { view.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, e); if (ptrs.size === 1) drag = { x: e.clientX - st.x, y: e.clientY - st.y }; view.style.cursor = 'grabbing'; });
    view.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, e);
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); const r = view.getBoundingClientRect(); const mx = (a.clientX + b.clientX) / 2 - r.left, my = (a.clientY + b.clientY) / 2 - r.top; if (pinch0) zoomAt(d / pinch0, mx, my); pinch0 = d; return; }
      if (drag) { st.x = e.clientX - drag.x; st.y = e.clientY - drag.y; apply(); }
    });
    const up = e => { ptrs.delete(e.pointerId); pinch0 = null; if (ptrs.size === 1) { const p = [...ptrs.values()][0]; drag = { x: p.clientX - st.x, y: p.clientY - st.y }; } else drag = null; view.style.cursor = 'grab'; };
    view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
    view.style.cursor = 'grab';
    const center = () => { const r = view.getBoundingClientRect(); return [r.width / 2, r.height / 2]; };
    const api = { fit, zoomIn: () => zoomAt(1.4, ...center(), true), zoomOut: () => zoomAt(1 / 1.4, ...center(), true), zoomTo: (s) => { const [px, py] = center(); zoomAt(s / st.s, px, py, true); } };
    if (content.complete === false) content.addEventListener('load', () => fit()); else requestAnimationFrame(() => fit());
    addEventListener('resize', () => fit());
    return api;
  }
  function btn(txt, title) { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.title = title; Object.assign(b.style, { width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(250,249,246,.35)', background: 'transparent', color: CREAM, font: '400 20px/1 "Instrument Sans", sans-serif', cursor: 'pointer' }); b.onmouseenter = () => { b.style.background = ORANGE; b.style.borderColor = ORANGE; }; b.onmouseleave = () => { b.style.background = 'transparent'; b.style.borderColor = 'rgba(250,249,246,.35)'; }; return b; }
  function openLightbox(src, caption, opts = {}) {
    const ov = document.createElement('div');
    Object.assign(ov.style, { position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(32,70,84,.96)', opacity: 0, transition: 'opacity .35s', display: 'flex', flexDirection: 'column' });
    const view = document.createElement('div'); Object.assign(view.style, { position: 'relative', flex: 1, margin: '64px 16px 8px' });
    const img = new Image(); img.src = src; img.alt = caption || '';
    Object.assign(img.style, { userSelect: 'none', background: opts.bg || 'transparent', borderRadius: opts.bg ? '6px' : '0' });
    view.appendChild(img);
    const bar = document.createElement('div'); Object.assign(bar.style, { display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 20px', color: CREAM, font: '400 14px/1.4 "Instrument Sans", sans-serif', flexWrap: 'wrap' });
    const cap = document.createElement('span'); cap.textContent = caption || ''; cap.style.opacity = .75;
    const ctr = document.createElement('div'); Object.assign(ctr.style, { display: 'flex', gap: '8px' });
    const bOut = btn('−', 'Zoom out'), bIn = btn('+', 'Zoom in'), bFit = btn('⤢', 'Fit'), bX = btn('×', 'Close');
    ctr.append(bOut, bIn, bFit, bX); bar.append(cap, ctr); ov.append(view, bar);
    const hint = document.createElement('div'); hint.textContent = 'Scroll or pinch to zoom · drag to pan · Esc to close'; Object.assign(hint.style, { position: 'absolute', top: '22px', left: '20px', color: 'rgba(250,249,246,.6)', font: '400 13px "Instrument Sans", sans-serif' }); ov.appendChild(hint);
    document.body.appendChild(ov); document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => { ov.style.opacity = 1; });
    const pz = panZoom(view, img, { freeWheel: true, fitPad: .96 });
    bIn.onclick = pz.zoomIn; bOut.onclick = pz.zoomOut; bFit.onclick = () => pz.fit(true);
    const close = () => { ov.style.opacity = 0; document.documentElement.style.overflow = ''; removeEventListener('keydown', key); setTimeout(() => ov.remove(), 350); };
    const key = e => { if (e.key === 'Escape') close(); if (e.key === '+' || e.key === '=') pz.zoomIn(); if (e.key === '-') pz.zoomOut(); };
    addEventListener('keydown', key); bX.onclick = close;
    let downAt = null; view.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
    view.addEventListener('click', e => { if (e.target === view && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4 && !opts.keepOnBg) close(); });
    bX.focus();
  }
  function bindLightbox(el) {
    if (!once(el, 'lbb')) return;
    el.style.cursor = FINE ? el.style.cursor : 'zoom-in';
    el.addEventListener('click', e => { e.preventDefault(); openLightbox(el.dataset.full || el.currentSrc || el.src || el.dataset.lightbox, el.dataset.caption || el.alt, { bg: el.dataset.lbBg }); });
  }
  function bindPanZoom(root) {
    if (!once(root, 'pzb')) return;
    const view = root.querySelector('[data-pz-view]'), img = root.querySelector('[data-pz-content]');
    if (!view || !img) return;
    const pz = panZoom(view, img, { freeWheel: false, fitPad: .96 });
    root.querySelectorAll('[data-pz-btn]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.pzBtn;
      if (a === 'in') pz.zoomIn(); else if (a === 'out') pz.zoomOut(); else if (a === 'fit') pz.fit(true);
      else if (a === 'open') openLightbox(img.currentSrc || img.src, img.alt, { bg: '#fff' });
    }));
  }

  /* ---------- in-page frame viewer ---------- */
  function openFrame(src, title) {
    const ov = document.createElement('div');
    Object.assign(ov.style, { position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(32,70,84,.96)', opacity: 0, transition: 'opacity .35s', display: 'flex', flexDirection: 'column' });
    const bar = document.createElement('div'); Object.assign(bar.style, { display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', color: CREAM, font: '500 14px/1.4 "Instrument Sans", sans-serif', flexWrap: 'wrap' });
    const t = document.createElement('span'); t.textContent = title || '';
    const ctr = document.createElement('div'); Object.assign(ctr.style, { display: 'flex', gap: '10px', alignItems: 'center' });
    const nt = document.createElement('a'); nt.href = src; nt.target = '_blank'; nt.rel = 'noopener'; nt.textContent = 'Open in new tab ↗'; Object.assign(nt.style, { color: CREAM, fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase', padding: '10px 16px', border: '1px solid rgba(250,249,246,.35)', borderRadius: '8px' });
    const x = btn('×', 'Close');
    ctr.append(nt, x); bar.append(t, ctr);
    const fr = document.createElement('iframe'); fr.src = src; fr.title = title || 'Embedded page'; Object.assign(fr.style, { flex: 1, border: 0, margin: '0 16px 16px', borderRadius: '8px', background: '#faf9f5' });
    ov.append(bar, fr); document.body.appendChild(ov); document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => { ov.style.opacity = 1; });
    const close = () => { ov.style.opacity = 0; document.documentElement.style.overflow = ''; removeEventListener('keydown', key); setTimeout(() => ov.remove(), 350); };
    const key = e => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', key); x.onclick = close; x.focus();
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-frame]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    let src = a.dataset.frame;
    if (SHELL && WIRE) { if (!wireUrl) wireUrl = URL.createObjectURL(new Blob([WIRE], { type: 'text/html' })); src = wireUrl; }
    openFrame(src, a.dataset.frameTitle);
  });

  function toast(msg) { const t = document.createElement('div'); t.textContent = msg; Object.assign(t.style, { position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', background: INK, color: CREAM, font: '400 14px/1.4 "Instrument Sans", sans-serif', padding: '12px 18px', borderRadius: '8px', zIndex: 9999, maxWidth: '90vw', textAlign: 'center' }); document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
  document.addEventListener('click', e => {
    const c = e.target.closest && e.target.closest('[data-copy]');
    if (!c) return; e.preventDefault(); e.stopPropagation();
    const v = c.dataset.copy; const done = () => toast('Copied: ' + v.replace(/^https?:\/\//, ''));
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, () => toast(v)); else toast(v);
  });

  /* ---------- external links: open reliably, even inside sandboxed previews ---------- */
  function toast(msg) {
    const t = document.createElement('div'); t.textContent = msg;
    Object.assign(t.style, { position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 9999, background: INK, color: CREAM, font: '500 14px/1.4 Instrument Sans, sans-serif', padding: '12px 18px', borderRadius: '8px', maxWidth: '90vw', textAlign: 'center' });
    document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-ext]');
    if (!a) return;
    e.preventDefault();
    const url = a.href;
    let w = null;
    try { w = window.open(url, '_blank'); if (w) w.opener = null; } catch (er) {}
    if (w) return;
    try { window.top.location.href = url; return; } catch (er) {}
    try { navigator.clipboard.writeText(url); toast('Pop-ups are blocked here — link copied to clipboard'); } catch (er) { toast(url); }
  });

  if (SHELL) document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-transition') || a.hasAttribute('data-ext') || a.hasAttribute('data-frame')) return;
    const href = a.getAttribute('href') || '';
    if (!/\.html(#.*)?$/.test(href) || /^[a-z]+:/i.test(href)) return;
    e.preventDefault(); try { window.parent.postMessage({ hkNav: href }, '*'); } catch (er) {}
  });

  /* ---------- in-page anchor links (nav pill etc.) ---------- */
  function navH() { const n = document.querySelector('nav'); return n ? n.getBoundingClientRect().height : 0; }
  function scrollToId(id) {
    const el = id === 'top' ? null : document.getElementById(id);
    const top = el ? el.getBoundingClientRect().top + window.scrollY - navH() : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: RM ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1)); if (!id) return;
    if (id !== 'top' && !document.getElementById(id)) return;
    e.preventDefault();
    const p = a.closest('[data-pill]');
    if (p && !p.dataset.pillStatic) { S.pillLock = a.dataset.pillLink; clearTimeout(S.pillT); S.pillT = setTimeout(() => { S.pillLock = null; pillNav(); }, 1200); pillNav(); }
    scrollToId(id);
  });

  /* ---------- page transitions ---------- */
  let curtain;
  function makeCurtain() {
    if (curtain) return;
    curtain = document.createElement('div');
    Object.assign(curtain.style, { position: 'fixed', inset: 0, background: INK, zIndex: 9995, pointerEvents: 'none', transform: 'translateY(101%)', transition: 'transform .6s cubic-bezier(.75,0,.2,1)', visibility: 'hidden' });
    document.body.appendChild(curtain);
    let came = false; try { came = sessionStorage.getItem('hk-trans') === '1'; sessionStorage.removeItem('hk-trans'); } catch (e) {}
    if (came && !RM) { curtain.style.visibility = 'visible'; setTimeout(() => { curtain.style.visibility = 'hidden'; }, 1000); curtain.style.transition = 'none'; curtain.style.transform = 'translateY(0)'; void curtain.offsetWidth; curtain.style.transition = 'transform .7s cubic-bezier(.75,0,.2,1) .1s'; curtain.style.transform = 'translateY(-101%)'; }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href'); if (!href || href.startsWith('#')) return;
    e.preventDefault();
    makeCurtain();
    if (SHELL) {
      if (!RM) { curtain.style.visibility = 'visible'; curtain.style.transition = 'none'; curtain.style.transform = 'translateY(101%)'; void curtain.offsetWidth; curtain.style.transition = 'transform .6s cubic-bezier(.75,0,.2,1)'; curtain.style.transform = 'translateY(0)'; }
      try { sessionStorage.setItem('hk-trans', '1'); } catch (er) {}
      setTimeout(() => { try { window.parent.postMessage({ hkNav: href }, '*'); } catch (er) {} }, RM ? 0 : 620);
      return;
    }
    try { sessionStorage.setItem('hk-trans', '1'); } catch (er) {}
    if (RM) { location.href = a.href; return; }
    curtain.style.visibility = 'visible'; curtain.style.transition = 'none'; curtain.style.transform = 'translateY(101%)'; void curtain.offsetWidth;
    curtain.style.transition = 'transform .6s cubic-bezier(.75,0,.2,1)'; curtain.style.transform = 'translateY(0)';
    setTimeout(() => { location.href = a.href; }, 620);
  });

  /* ---------- loop ---------- */
  function frame(now) {
    const t = (now - S.t0) / 1000, vh = innerHeight, vw = innerWidth;
    if (ring) { cx += (S.mx - cx) * .18; cy += (S.my - cy) * .18; ring.style.transform = `translate(${cx}px,${cy}px)`; dot.style.transform = `translate(${S.mx}px,${S.my}px)`; }
    if (!RM) {
      const nx = S.mx / vw - .5, ny = S.my / vh - .5;
      for (const f of S.floats) {
        const d = +(f.dataset.float || 10), ph = +(f.dataset.phase || 0), idle = +(f.dataset.idle || 0);
        f._x = (f._x || 0) + (nx * d - (f._x || 0)) * .07; f._y = (f._y || 0) + (ny * d - (f._y || 0)) * .07;
        const iy = idle ? Math.sin(t * 1.1 + ph) * idle : 0, ir = f.dataset.rot ? Math.sin(t * .8 + ph) * +f.dataset.rot : 0;
        f.style.transform = `translate3d(${f._x.toFixed(2)}px,${(f._y + iy).toFixed(2)}px,0) rotate(${(ir + nx * (+f.dataset.rotm || 0)).toFixed(2)}deg)`;
      }
      for (const p of S.paras) { const r = p.parentElement.getBoundingClientRect(); const c = r.top + r.height / 2 - vh / 2; p.style.transform = `translate3d(0,${(c * -(+p.dataset.parallax)).toFixed(1)}px,0)`; }
      for (const m of S.marquees) { const tr = m.firstElementChild; if (!tr) continue; m._o = ((m._o || 0) + (+(m.dataset.marquee || 40)) / 60) % (tr.scrollWidth / 2 || 1); tr.style.transform = `translate3d(${-m._o}px,0,0)`; }
    }
    requestAnimationFrame(frame);
  }
  function pillNav() {
    document.querySelectorAll('[data-hide-narrow]').forEach(b => { b.style.visibility = innerWidth < 640 ? 'hidden' : 'visible'; });
    document.querySelectorAll('[data-pill]').forEach(p => {
      let act = p.dataset.pillStatic;
      if (!act && S.pillLock) act = S.pillLock;
      if (!act) { act = 'top'; const lim = navH() + innerHeight * .3; ['work', 'about'].forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < lim) act = id; }); const c = document.getElementById('contact'); if (c && c.getBoundingClientRect().top < lim) act = 'about'; if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) act = 'about'; }
      p.querySelectorAll('[data-pill-link]').forEach(a => { if (!a._hb) { a._hb = 1; a.addEventListener('mouseenter', () => { if (!a._on) a.style.color = '#204654'; }); a.addEventListener('mouseleave', () => { if (!a._on) a.style.color = '#4C6873'; }); } const on = a.dataset.pillLink === act; if (a._on === on) return; a._on = on; a.style.background = on ? '#2F7A45' : 'transparent'; a.style.color = on ? '#FAF9F6' : '#4C6873'; a.style.fontWeight = on ? '500' : '400'; a.style.boxShadow = 'none'; if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    });
  }
  function onScroll() {
    checkPending();
    pillNav();
    document.querySelectorAll('[data-rail]').forEach(r => { r.style.display = innerWidth < 760 ? 'none' : 'flex'; });
    if (!S.stickyDone) { S.stickyDone = 1; const fixSticky = () => document.querySelectorAll('[data-sticky-wide]').forEach(r => { r.style.position = 'static'; const sib = r.nextElementSibling; const sameRow = sib && Math.abs(sib.offsetTop - r.offsetTop) < 8; r.style.position = sameRow ? 'sticky' : 'static'; }); fixSticky(); addEventListener('resize', fixSticky); setTimeout(fixSticky, 600); setTimeout(fixSticky, 2000); }
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
    for (const el of S.progress) el.style.transform = `scaleX(${p})`;
    if (S.spies.length) {
      let active = null;
      for (const a of S.spies) { const id = a.getAttribute('href').slice(1); const sec = document.getElementById(id); if (sec && sec.getBoundingClientRect().top < innerHeight * .45) active = a; }
      for (const a of S.spies) { const on = a === active; if (a._on === on) continue; a._on = on; const l = a.querySelector('[data-spy-label]'), m = a.querySelector('[data-spy-mark]'); if (m) { m.style.width = on ? '16px' : '8px'; m.style.background = on ? ORANGE : 'currentColor'; m.style.height = on ? '3px' : '2px'; } a.style.opacity = on ? 1 : .8; }
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  function bind(root) {
    root = root || document;
    root.querySelectorAll('[data-reveal]').forEach(bindReveal);
    root.querySelectorAll('[data-count]').forEach(el => { if (once(el, 'ctb') && el.dataset.reveal == null) track(el); });
    root.querySelectorAll('[data-hover-root]').forEach(bindHoverRoot);
    root.querySelectorAll('[data-tilt]').forEach(bindTilt);
    root.querySelectorAll('[data-magnetic]').forEach(bindMagnet);
    root.querySelectorAll('[data-lightbox]').forEach(bindLightbox);
    root.querySelectorAll('[data-panzoom]').forEach(bindPanZoom);
    root.querySelectorAll('[data-rail]').forEach(r => { if (!once(r, 'rlb')) return; const set = v => r.querySelectorAll('[data-spy-label]').forEach(l => { l.style.opacity = v; }); r.addEventListener('mouseenter', () => set(1)); r.addEventListener('mouseleave', () => set(0)); });
    S.floats = [];
    S.paras = [];
    S.marquees = [...document.querySelectorAll('[data-marquee]')];
    S.progress = [...document.querySelectorAll('[data-progress]')];
    S.spies = [...document.querySelectorAll('a[data-spy]')];
    onScroll();
  }
  let started = false, mt;
  function init() {
    bind(document);
    if (started) return; started = true;
    if (location.hash && location.hash.length > 1) { const id = decodeURIComponent(location.hash.slice(1)); [300, 900].forEach(t => setTimeout(() => { const el = document.getElementById(id); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - navH(), behavior: 'auto' }); }, t)); }
    makeCurtain();
    requestAnimationFrame(frame);
    new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(() => bind(document), 120); }).observe(document.body, { childList: true, subtree: true });
  }
  addEventListener('pageshow', e => { if (e.persisted && curtain) { curtain.style.transition = 'none'; curtain.style.transform = 'translateY(101%)'; curtain.style.visibility = 'hidden'; } });
  window.Site = { init, openLightbox, openFrame, reducedMotion: RM };
})();
