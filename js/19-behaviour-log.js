/* js/19-behaviour-log.js
 * Purpose: Behaviour log: engaged time, skips and slow-question context.
 * Defines (17): ET, etTouch, etStart, etEnd, robZ, logEv, ctxP, ctxL, skipQ, lskip, tskip, sskip, cxTile, hardTop, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Behaviour log: engaged time versus idle time, skips, slow-question context, sentence-building behaviour ----
const ET = { t0: 0, last: 0, act: 0, idle: 0, pause: 0, hid: 0 },
  IDLE = 20000;
function etTouch() {
  const n = Date.now();
  if (!ET.t0) return;
  const g = n - ET.last;
  ET.act += Math.min(g, IDLE);
  if (g > IDLE) {
    ET.idle += g - IDLE;
    ET.pause++
  }
  ET.last = n
}

function etStart() {
  const n = Date.now();
  Object.assign(ET, { t0: n, last: n, act: 0, idle: 0, pause: 0, hid: 0 })
}

function etEnd() {
  if (!ET.t0) return { act: 1000, wall: 0, idle: 0, pause: 0 };
  etTouch();
  const o = { act: Math.max(300, ET.act), wall: Date.now() - ET.t0, idle: ET.idle, pause: ET.pause };
  ET.t0 = 0;
  return o
}

if (document.addEventListener) {
  ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart'].forEach(v => document.addEventListener(v,
      etTouch, true));
  document.addEventListener('visibilitychange', () => {
    const n = Date.now();
    if (document.hidden) {
      etTouch();
      ET.hid = n
    } else if (ET.hid && ET.t0) {
      ET.idle += n - ET.hid;
      ET.last = n;
      ET.hid = 0
    }
  })
}

function robZ(ty, act) {
  const lg = Math.log(act),
    r = (S.rt = S.rt || {})[ty] || (S.rt[ty] = []);
  let z = 0;
  if (r.length >= 15) {
    const m = med(r),
      d = med(r.map(x => Math.abs(x - m))) || .25;
    z = .6745 * (lg - m) / d
  }
  r.push(lg);
  if (r.length > 200) r.shift();
  return z
}

function logEv(o) {
  const E = o.E || { act: 0, wall: 0, idle: 0, pause: 0 },
    z = o.sk ? 0 : (o.z != null ? o.z : robZ(o.ty, Math.max(300, E.act))),
    fl = [];
  if (!o.sk) {
    if (z > 2) fl.push('slow');
    if (z < -1.5 && E.act < 1500) fl.push('fast')
  }
  if (E.pause) fl.push('pause');
  const r = { t: Date.now(), k: o.k, id: o.id, ty: o.ty, ok: o.sk ? null : o.ok ? 1 : 0, sk: o.sk ? 1 :
    0, a: Math.round(E.act), w: Math.round(E.wall), i: Math.round(E.idle), z: +z.toFixed(2), f: fl.join(',') };
  (S.lg = S.lg || []).push(r);
  if (S.lg.length > 800) S.lg.shift();
  const hk = S.hk = S.hk || {};
  (o.keys || []).forEach(k => {
    const h = hk[k] || (hk[k] = [0, 0, 0, 0]);
    h[0]++;
    if (fl.includes('slow')) h[1]++;
    if (o.sk) h[2]++;
    if (o.ok === 0 && !o.sk) h[3]++
  });
  if (fl.includes('slow')) {
    (S.hd = S.hd || []).push({ t: r.t, k: o.k, id: o.id, ty: o.ty, a: r.a, z: r.z, c: (o.ctx || '')
        .slice(0, 200) });
    if (S.hd.length > 150) S.hd.shift()
  }
  return r
}

const ctxP = (w, t, o, i, val) => {
  const L = x => x ? (x.w || x.t || '') : '';
  return `${w.g?w.q:w.w+' '+(w.m||'')}|${t}|${(o||[]).map(L).join('/')}|pick ${i!=null&&o?L(o[i]):val}`
    .slice(0, 200)
};
const ctxL = (c, j) => `${c.t}|${(c.p||c.big||'').slice(0,60)}|${c.q}|${c.o.join('/')}|pick ${c.o[j]||''}`
  .slice(0, 200);
function skipQ() {
  if (!cur || cur.done || cur.study) return;
  cur.done = 1;
  const { w, t, o } = cur,
    it = S.i[w.w];
  logEv({ k: 'p', id: w.w, ty: t, sk: 1, E: etEnd(), keys: [w.w, 'ty:' + t], ctx: ctxP(w, t, o, null,
        '') });
  if (it) {
    it.sk = (it.sk || 0) + 1;
    if (!S.bq.some(b => b.id == w.w)) S.bq.push({ id: w.w, at: S.cnt + 6 })
  }
  S.skips = (S.skips || 0) + 1;
  document.querySelectorAll('.opt').forEach((b, j) => {
    b.disabled = true;
    if (o && (t == 'gq' ? o[j].c : t == 'oo' ? o[j] === cur.odd : o[j].w == w.w)) b.classList.add('ok')
  });
  $('#fb').innerHTML = `<div class="card fb"><b>Skipped</b> <span class="mu">(recorded separately from mistakes)</span><br>${t=='gq'?e(cur.y||w.y):t=='oo'?e(cur.ch)+' is in the other three. '+lk(cur.odd):trioW(w)}<div class="row2"><button class="sec" onclick="nav(-1)">‹ Back</button><button class="pri" onclick="nq()">Next</button></div></div>`;
  save()
}

function lskip() {
  const c = lcur;
  if (!c || c.done) return;
  c.done = 1;
  const id = c.x.id,
    it = S.i[id] || (S.i[id] = { s: .5, d: 5, t: Date.now(), f: Date.now(), n: 0, l: 0, x: {} });
  logEv({ k: 'l', id, ty: c.x.gen || 'lab', sk: 1, E: etEnd(), keys: [id], ctx: ctxL(c, -1) });
  it.sk = (it.sk || 0) + 1;
  S.skips = (S.skips || 0) + 1;
  S.lrec = S.lrec || [];
  S.lrec.push(id);
  document.querySelectorAll('#lq .opt').forEach((b, k) => {
    b.disabled = true;
    if (k == c.a) b.classList.add('ok')
  });
  $('#fb').innerHTML = `<div class="card fb"><b>Skipped</b><p>${ej(c.y)}</p>${c.aw?trioW(c.aw):c.full?trioS(c.full,c.fen):''}<button class="pri" onclick="adv('l')">Next</button></div>`;
  save()
}

function tskip() {
  const q = tq;
  if (!q || q.done) return;
  q.done = 1;
  logEv({ k: 't', id: q.en, ty: 'type', sk: 1, E: etEnd(), keys: ['f:' + q.f, 'ty:type'], ctx: q.en });
  S.skips = (S.skips || 0) + 1;
  $('#fb').innerHTML = `<div class="card fb"><b>Skipped</b>${trioT(q)}<button class="pri" onclick="adv('t')">Next</button></div>`;
  save()
}

function sskip() {
  const b = bq;
  if (!b || b.done) return;
  b.done = 1;
  logEv({ k: 'b', id: b.q.en, ty: 'tile', sk: 1, E: etEnd(), keys: ['f:' + b.q.f, 'ty:tile'], ctx: b.q
      .en });
  S.skips = (S.skips || 0) + 1;
  $('#fb').innerHTML = `<div class="card fb"><b>Skipped</b>${trioT(b.q)}<p class="mu" style="text-align:left">${ej(b.q.y||'')}</p><button class="pri" onclick="adv('b')">Next sentence</button></div>`;
  save()
}

function cxTile(q, t, ok) {
  const b = bq,
    tail = q.t.slice(-q.tail).join(' '),
    fs = b.fs || '',
    eng = fs && !fs.endsWith(tail) ? 1 : 0,
    r = { t: Date.now(), k: 'tile', id: q.en, first: fs.slice(0, 80), final: t.join(' ')
    .slice(0, 80), mv: b.ev.length, rm: b.ev.filter(x => x[0] == '-').length, tf: b.tfs || 0, eng, ok: ok ?
    1 : 0 };
  (S.cx = S.cx || []).push(r);
  if (S.cx.length > 200) S.cx.shift();
  if (eng && q.f) S.cxw = Object.assign(S.cxw || {}, { [q.f]: ((S.cxw || {})[q.f] || 0) + 1 });
  logEv({ k: 'b', id: q.en, ty: 'tile', ok, E: etEnd(), keys: ['f:' + q.f, 'ty:tile'], ctx: `${q.en}|${fs}|${t.join(' ')}`
      .slice(0, 200) })
}

function hardTop() {
  return Object.entries(S.hk || {}).filter(([k, h]) => h[0] >= 3 && h[1] / h[0] >= .3)
    .sort((a, b) => b[1][1] / b[1][0] - a[1][1] / a[1][0]).slice(0, 5).map(([k, h]) => `${k} (${h[1]} of ${h[0]} slow)`)
    .join(', ') || 'not enough data yet'
}

function behSummary() {
  const L = S.lg || [];
  if (L.length < 5) return 'Timing and skip analysis starts after a few answers.';
  const A = L.filter(x => !x.sk).map(x => x.a),
    C = S.cx || [],
    T = C.filter(x => x.k == 'tile');
  return `Behaviour indicators, not diagnoses: median engaged time ${(med(A)/1000).toFixed(1)}s, ${L.filter(x=>x.f.includes('slow')).length} slow, ${L.filter(x=>x.f.includes('fast')).length} fast, ${L.filter(x=>x.f.includes('pause')).length} with long pauses, ${S.skips||0} skips. Slow-prone: ${hardTop()}. Sentence building: ${T.length?Math.round(T.filter(x=>x.eng).length/T.length*100)+'% of first tries used English word order, ':''}${C.filter(x=>x.first&&x.first!=x.final).length} of ${C.length} were revised before checking.`
}

const dataCard = () => `<p class="mu" style="text-align:left">${(S.lg||[]).length} timed answers, ${(S.hd||[]).length} slow-question records, ${(S.cx||[]).length} sentence-building records, ${S.skips||0} skips. Stored: ${Math.round(JSON.stringify(S).length/1024)} KB of roughly 5000 KB available in this browser. Old detail is trimmed automatically and summaries stay. Everything is included in Download my memory.</p><button class="sec" onclick="expLog()">Download learning log only</button>`;
function expLog() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: VER.app, lg: S.lg, hd: S.hd, cx: S.cx,
        hk: S.hk, skips: S.skips, days: S.days })], { type: 'application/json' }));
  a.download = 'nihongo-lab-log-' + dk() + '.json';
  a.click()
}
