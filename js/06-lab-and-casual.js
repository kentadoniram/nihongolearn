/* js/06-lab-and-casual.js
 * Purpose: Lab activities, casual speech rules and phrases.
 * Defines (12): wpick, labObj, CAS, tev, CAS_FN, ruleQ, phraseQ, labItems, labPick, lcur, lab, lq
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Lab: activities are static pattern units plus word-decoding puzzles generated from the data. The same models drive selection.
const wpick = (a, f) => {
  const t = a.map(f);
  let r = Math.random() * t.reduce((x, y) => x + y, 0),
    i = 0;
  for (; i < a.length - 1; i++) {
    r -= t[i];
    if (r <= 0) break
  }
  return a[i]
};
const labObj = x => x.w || { w: x.id, g: 1, l: x.l };

// Casual speech: rules applied to your own verbs, plus common casual and office phrases.
let CAS = { rules: [], phrases: [] };
const tev = d => conj(d, 'te').s,
  cj = s => s.replace(/て$/, 'ちゃ').replace(/で$/, 'じゃ'),
  swp = s => s.replace(/て$/, 'じゃ').replace(/で$/, 'ちゃ');
const CAS_FN = { shimau: d => {
  const t = tev(d);
  return { f: t + 'しまった', c: cj(t) + 'った', w: [t + 'ちゃった', swp(t) + 'った', cj(t) + 'た'] }
}, teiru: d => {
  const t = tev(d);
  return { f: t + 'いる', c: t + 'る', w: [t + 'れる', t.replace(/[てで]$/, '') + 'る', t + 'ちる'] }
}, teoku: d => {
  const t = tev(d);
  return { f: t + 'おく', c: t.replace(/て$/, 'と').replace(/で$/, 'ど') + 'く', w: [t.replace(/て$/, 'ど')
      .replace(/で$/, 'と') + 'く', t + 'く', t + 'とく'] }
}, nakya: d => {
  const n = conj(d, 'nai').s;
  return { f: n.replace(/い$/, 'ければならない'), c: n.replace(/い$/, 'きゃ'), w: [n.replace(/ない$/, '') + 'きゃ', n + 'きゃ',
      n.replace(/い$/, 'けや')] }
}, tewa: d => {
  const t = tev(d);
  return { f: t + 'はだめ', c: t.replace(/て$/, 'ちゃ').replace(/で$/, 'じゃ') + 'だめ', w: [t + 'ちゃだめ', swp(t) + 'だめ',
      cj(t) + 'ない'] }
}
};
function ruleQ(x) {
  const r = x.r,
    vs = V.filter(d => !d.t && posOf(d) == 'verb' && vclass(d) && vclass(d) != 'suru'),
    met = vs.filter(d => S.i[d.w]),
    d = rnd(met.length > 3 ? met : vs),
    m = CAS_FN[r.id](d),
    o = shuffle([m.c, ...m.w].filter((v, i, a) => a.indexOf(v) == i));
  return { t: 'Casual speech: ' + r.title, big: m.f, q: 'How do people say this casually?', o, a: o.indexOf(m
      .c), y: `${m.f} becomes ${m.c}. ${r.note}`, l: 4, ex: [] }
}

function phraseQ(x) {
  const p = x.p,
    o = shuffle([p.m, ...shuffle(CAS.phrases.filter(z => z.m != p.m)).slice(0, 3)
      .map(z => z.m)]);
  return { t: 'Casual speech and office phrases', big: p.c, q: 'What does it mean?', o, a: o.indexOf(p
      .m), y: `${p.c} means “${p.m}”. More polite: ${p.p}. ${p.n||''}`, l: 4, ex: [] }
}

function labItems() {
  const op = l => l >= 4 || S.n3 || S.cnt > 120;
  const U = LAB.map((u, k) => ({ id: 'u' + (u.id || k), u, l: u.l || 5 }))
    .filter(x => op(x.l)),
    C = W().filter(w => !w.g && op(w.l) && [...w.w].filter(c => K.test(c))
    .length >= 2 && [...w.w].every(c => !K.test(c) || KJ[c])).map(w => ({ id: 'c' + w.w, w, l: w.l }));
  const G = [];
  if (FRM().length) G.push({ id: 'fp', gen: 'particle', l: 5 }, { id: 'ft', gen: 'tense', l: 5 });
  if (REL.length) G.push({ id: 'sy', gen: 'syn', l: 4 }, { id: 'an', gen: 'ant', l: 4 }, { id: 'pa', gen: 'para',
      l: 4 });
  (GEN.reads || []).forEach(r => {
    if (op(r.l) && !(r.tr && S.wk === false)) G.push({ id: 'fr' + r.id, gen: 'read', r, l: r.l })
  });
  return U.concat(C, G, CAS.rules.map(r => ({ id: 'kr-' + r.id, k: 'r', r, l: 4 })), CAS.phrases.map(p => ({ id: 'kp-' + p
        .c, k: 'p', p, l: 4 })))
}

function labPick() {
  const now = Date.now(),
    A0 = labItems(),
    gk = S.lf || wpick(['r', 'g', 'm', 'w'].filter(k => A0.some(x => kindOf(x) == k)), k => ({ r: .3,
        g: .25, m: .25, w: .2 }[k])),
    A1 = A0.filter(x => kindOf(x) == gk),
    A = A1.length ? A1 : A0,
    rc = S.lrec || (S.lrec = []),
    F = A.filter(x => !rc.includes(x.id)),
    L = F.filter(x => S.i[x.id]),
    un = F.filter(x => !S.i[x.id]),
    R = x => ret(S.i[x.id], now),
    th = a => a.reduce((b, x) => {
    const it = S.i[x.id],
      m = rb(1 + Math.max(0, it.n - it.l) * R(x), 1 + it.l);
    return !b || m < b.m ? { x, m } : b
  }, 0).x, due = L.filter(x => R(x) < .9);
  if (due.length && Math.random() < .6) return th(due);
  if (un.length) return wpick(un, x => Math.exp(-4 * Math.abs(pc(feat(labObj(x), 'gq', null), x.id) - .75)));
  return L.length ? th(L) : F.length ? rnd(F) : rnd(A)
}

let lcur = null;
function lab() {
  PLK = {};
  PKH = new Set();
  const x = labPick();
  if (!x) {
    $('#m').innerHTML = '<div class="card">No lab activities yet.</div>';
    return
  }
  let c;
  if (x.k) {
    c = x.k == 'r' ? ruleQ(x) : phraseQ(x);
    c.x = x;
    c.clue = ''
  } else if (x.u) {
    const u = x.u,
      ix = shuffle(u.o.map((_, i) => i));
    c = { x, t: u.t, p: u.p, ex: u.ex || [], q: u.q, o: ix.map(i => u.o[i]), a: ix.indexOf(u.a), y: u
      .y, l: u.l }
  } else if (x.gen) {
    let k = 0;
    do {
      c = genLab(x)
    }
    while (S.fp.includes(c.key) && ++k < 8);
    S.fp.push(c.key);
    if (S.fp.length > 400) S.fp.shift()
  } else {
    const w = x.w,
      ps = [...w.w].filter(k => K.test(k)),
      o = opts(w, 'm');
    c = { x, t: 'Decode the word', big: w.w, clue: ps.map(k => k + ' ' + KJ[k].m)
      .join(' + '), q: 'What does it mean?', o: o.map(z => z.m), a: o.indexOf(w), y: `${ps.map(k=>k+' ('+KJ[k].m+')').join(' + ')} gives ${w.w} (${w.r}) = ${w.m}. Compounds usually blend their parts, so use the pieces you know to guess the rest.`,
      l: w.l, ex: [] }
  }
  lcur = c;
  c.done = 0;
  etStart();
  $('#m').innerHTML = `<div class="card q-oo"><div class="mu" style="display:flex;justify-content:space-between;margin:0 0 6px"><span>${labChips()}${c.l&&!S.hl?' <span class="lv">N'+c.l+'</span>':''}</span><a class="wl" onclick="diag()">Check-up</a></div><b>${e(c.t)}</b>${c.big?`<div class="big">${e(c.big)}</div><p class="mu">${e(c.clue)}</p>`:''}${c.p?`<p class="pass">${pj(c.p)}</p>`:''}<div class="ex">${c.ex.map(z=>`<span><big>${e(z[0])}</big><small>${e(z[1])}</small></span>`).join('')}</div><p>${e(c.q)}</p>${c.en?`<p class="mu" style="margin:0 0 6px">${e(c.en)}</p>`:''}<div id="lq">${c.o.map((o,j)=>`<button class="opt" onclick="lq(${j})">${e(o)}</button>`).join('')}</div><button class="skip" onclick="lskip()">Skip</button></div><div id="fb"></div>`
}

function lq(j) {
  const c = lcur;
  if (!c || c.done) return;
  c.done = 1;
  const ok = j == c.a,
    id = c.x.id,
    now = Date.now(),
    it = S.i[id] || (S.i[id] = { s: .5, d: 5, t: now, f: now, n: 0, l: 0, x: {} }),
    R = ret(it, now);
  if (it.n >= 1) rvPush((now - it.t) / 864e5, it.s, ok ? 1 : 0);
  S.la = now;
  S.ab = null;
  learn(feat(labObj(c.x), 'gq', null), ok ? 1 : 0, id);
  logEv({ k: 'l', id, ty: c.x.gen || (c.x.u ? 'u' : 'c'), ok, E: etEnd(), keys: [id, 'ty:' + (c.x.gen ||
        'lab')].concat(c.key ? ['k:' + c.key.split('|').slice(0, 2).join('|')] : []), ctx: ctxL(c, j) });
  if (ok) {
    it.s *= 1.3 + 2.2 * (1 - R) + .15 * (10 - it.d);
    it.d = Math.max(1, it.d - .2);
    S.xp += 10
  } else {
    it.s = Math.max(.4, it.s * .25);
    it.d = Math.min(10, it.d + 1);
    it.l++
  }
  it.t = now;
  it.n++;
  tick();
  S.lrec.push(id);
  if (S.lrec.length > 10) S.lrec.shift();
  if (c.x.u) S.lab[c.x.u.id || 0] = ok ? 1 : 0;
  save();
  document.querySelectorAll('#lq .opt').forEach((b, k) => {
    b.disabled = true;
    if (k == c.a) b.classList.add('ok');
    else if (k == j) b.classList.add('bad')
  });
  const kmh = c.p ? kmDone(c, ok) : '';
  $('#fb').innerHTML = `<div class="card fb ${ok?'':'r'}"><b>${ok?'✓ Correct':'✗ Not quite'}</b><p>${ej(c.y)}</p>${c.p&&PLK.n?`<p class="mu" style="text-align:left">Lookups in this passage earned ${PLK.n} point${PLK.n>1?'s':''}.</p>`:''}${kmh}${c.aw?trioW(c.aw):c.full?trioS(c.full,c.fen):''}<button class="pri" onclick="adv('l')">Next</button></div>`;
  if (ok && S.aa !== false) setTimeout(() => {
    if (lcur === c && $('nav .on') && $('nav .on').dataset.v == 'l') adv('l')
  }, 2600)
}
