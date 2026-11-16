/* js/12-tooltips.js
 * Purpose: Part of speech, kanji tooltips and tap handling.
 * Defines (4): posOf, tipHTML, wordCtx, showTip
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const posOf = w => w.p || (/^to /.test(w.m) ? 'verb' : /い$/.test(w.w) && /い$/.test(w.r) && K.test(w.w) ?
  'i-adjective' : /^[ァ-ヶー]+$/.test(w.w) ? 'noun (loanword)' : 'noun');

// sen = the kanji was tapped inside a sentence: always show the hiragana reading and the meaning, and the word it is in (ctx).
function tipHTML(c, wi, sen, ctx) {
  const k = KJ[c],
    w = wi == null || isNaN(wi) ? null : W()[wi],
    f = sen ? Object.assign({}, S.tf, { r: 1, m: 1 }) : S.tf,
    o = [];
  if (!k) return `<b class="tg">${c}</b><div class="mu">No entry yet</div>${ctx||''}`;
  const ws = W().filter(x => !x.g && x.w.includes(c)).slice(0, 4),
    la = [...new Set(SIM.filter(g => g.includes(c)).join('').split(''))].filter(x => x != c);
  o.push(`<b class="tg">${c}</b>${f.l&&!S.hl?` <span class="lv">N${k.l}</span>`:''}`);
  if (f.r) o.push(sen ? `<div>On ${e(hira(k.on))}<br>Kun ${e(k.kun)}</div>` : `<div>On ${e(k.on)}<br>Kun ${e(k.kun)}</div>`);
  if (f.m) o.push(`<div>${e(k.m)}</div>`);
  if (ctx) o.push(ctx);
  if (f.p && w) o.push(`<div class="mu">${e(w.w)}: ${posOf(w)}</div>`);
  if (f.w && ws.length) o.push(`<div class="mu">${ws.map(x=>e(x.w)).join(' ')}</div>`);
  if (f.s && la.length) o.push(`<div class="mu">Looks like ${la.map(e).join(' ')}</div>`);
  return o.join('')
}

// The word a tapped kanji belongs to, as a line for the tip: 宿題 (しゅくだい): homework.
function wordCtx(el) {
  const lx = el.closest && el.closest('.lx');
  if (!lx || !lx.dataset.lx) return '';
  const i = lx.dataset.lx.indexOf(':'),
    ty = lx.dataset.lx.slice(0, i),
    v = lx.dataset.lx.slice(i + 1),
    w = ty == 'w' ? WM[v] : null;
  return w ? `<div class="mu">In ${e(w.w)} (${e(w.r)}): ${e(w.m)}</div>` : ty == 'r' && RDX[v] ? `<div class="mu">In ${e(v)} (${e(RDX[v])})</div>` :
    ''
}

function showTip(el) {
  const t = $('#tip');
  t.innerHTML = tipHTML(el.dataset.k, el.dataset.w == null ? null : +el.dataset.w, el.dataset.s == '1',
    wordCtx(el));
  t.hidden = false;
  t.dataset.open = 'k:' + el.dataset.k;
  const r = el.getBoundingClientRect(),
    h = t.offsetHeight,
    w = t.offsetWidth;
  t.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  t.style.top = (r.bottom + h + 12 > innerHeight ? Math.max(8, r.top - h - 8) : r.bottom + 8) + 'px'
}

if (document.addEventListener) {
  document.addEventListener('click', ev => {
    const t = ev.target,
      tp = $('#tip'),
      k = t.closest && t.closest('.kj,.lx');
    if (t.closest && t.closest('#tip')) {
      const o = tp.dataset.open;
      if (o) {
        tp.hidden = true;
        tp.dataset.open = '';
        if (LKE) kLook(LKE, 1);
        openX(o)
      }
      return
    }
    if (k) {
      ev.stopPropagation();
      ev.preventDefault();
      k.classList.contains('lx') ? showLx(k) : showTip(k);
      kLook(k, 0)
    } else tp.hidden = true
  }, true);
  document.addEventListener('dblclick', ev => {
    const k = ev.target.closest && ev.target.closest('.kj,.lx');
    if (k && k.closest('.pass')) {
      ev.preventDefault();
      kLook(k, 1);
      $('#tip').hidden = true;
      openX(k.classList.contains('lx') ? k.dataset.lx : 'k:' + k.dataset.k)
    }
  }, true);
  document.addEventListener('keydown', ev => {
    if (ev.key == 'Escape') {
      if (!$('#tip').hidden) $('#tip').hidden = true;
      else if (!$('#dv').hidden) dvClose()
    } else if (!/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName || '') && $('#dv')
      .hidden) {
      if (ev.key == 'ArrowRight') nav(1);
      else if (ev.key == 'ArrowLeft') nav(-1)
    }
  });
  document.addEventListener('scroll', () => {
    $('#tip').hidden = true
  }, true)
}
