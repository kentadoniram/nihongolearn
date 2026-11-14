/* js/05-question-builder.js
 * Purpose: Difficulty stages, building questions and checking answers.
 * Defines (8): sEff, stg, cloze, build, build0, show, ans, nq
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Difficulty stage from memory stability: 0 recognise, 1 mixed, 2 produce and context, 3 hardest forms and sharpest distractors.
const sEff = (it, now) => it.s * Math.min(1, Math.pow(ret(it, now) / .9, 1.5));
const stg = (it, now) => {
  const s = now ? sEff(it, now) : it.s;
  return s < 2 ? 0 : s < 6 ? 1 : s < 15 ? 2 : 3
};
function cloze(w) {
  if (w.g) return null;
  const x = exOf(w);
  if (x && x[0].includes(w.w)) return { jp: x[0].replace(w.w, '＿＿＿'), en: x[1] };
  const q = SN.find(z => z.t.includes(w.w));
  return q ? { jp: q.t.map(z => z == w.w ? '＿＿＿' : z).join(''), en: q.en } : null
}

function build(w, t) {
  let b,
    k = 0,
    fp;
  do {
    b = build0(w, t);
    fp = b.t + '|' + w.w + '|' + (b.o ? b.o.map(x => x.w || x.t).sort().join(',') : b.pool ? b.pool.slice()
      .sort().join('') : '')
  }
  while (S.fp.includes(fp) && ++k < 14);
  S.fp.push(fp);
  if (S.fp.length > 400) S.fp.shift();
  return b
}

function build0(w, t) {
  const it = S.i[w.w],
    k = K.test(w.w);
  if (w.g) {
    it.lt = 'gq';
    return { w, t: 'gq', o: shuffle(w.o.map((x, i) => ({ t: x, c: i == w.a }))), qv: w.q.replace(/^私/,
        rnd(['私', '父', '母', '兄', '姉', '友達'])) }
  }
  const g = stg(it, Date.now()),
    H = it.h || (it.h = []),
    cz = cloze(w);
  let ts = [['jm', 'mj', 'rw'], ['jm', 'mj', 'jr', 'rw', 'bt', 'oo', 'tr'], ['mj', 'jr', 'rw', 'bt', 'oo',
      'tr', 'ty', 'cl'], ['oo', 'tr', 'ty', 'cl', 'jr', 'rw', 'bt']][g].filter(x => !['jr', 'tr', 'rw']
    .includes(x) || k).filter(x => x != 'bt' || (w.r.length >= 3 && w.r.length <= 8))
    .filter(x => x != 'oo' || oddg(w)).filter(x => x != 'cl' || cz);
  if (!k && g >= 1) ts.push('ty');
  if (!ts.length) ts = ['jm'];
  const tc = it.tc || (it.tc = {}),
    mn = Math.min(...ts.map(x => tc[x] || 0));
  ts = ts.filter(x => (tc[x] || 0) <= mn);
  const fr = ts.filter(x => !H.slice(-2).includes(x));
  ts = fr.length ? fr : ts;
  ts = ts.map(x => [Math.abs(pc(feat(w, x, it), w.w) - .8), x]).sort((a, b) => a[0] - b[0])
    .slice(0, 3).map(x => x[1]);
  t = t || rnd(ts);
  tc[t] = (tc[t] || 0) + 1;
  H.push(t);
  if (H.length > 8) H.shift();
  it.lt = t;
  if (t == 'cl' && cz) {
    const c = W().filter(x => !x.g && x !== w && posOf(x) == posOf(w) && (x.l >= 4 || S.i[x.w] || S.n3)),
      o = [w],
      pw = [.6, 1.6, 2, 3][g];
    while (o.length < 4 && c.length) {
      const z = wpick(c, x => 1 + Math.pow(sim(w, x), pw));
      c.splice(c.indexOf(z), 1);
      o.push(z)
    }
    return { w, t: 'gq', o: shuffle(o.map(z => ({ t: z.w, c: z === w }))), qv: cz.jp + '  ' + cz.en, y: `${w.w} (${w.r}) means “${w.m}”. ${cz.en}` }
  }
  if (t == 'oo') {
    const og = oddg(w);
    if (og) return { w, t, o: og.o, odd: og.odd, ch: og.ch }
  }
  if (t == 'bt') {
    const sm = W().filter(x => !x.g && x.w != w.w).sort((a, b) => sim(w, b) - sim(w, a))[0],
      pool = [...w.r];
    [...sm.r].filter(c => !pool.includes(c)).slice(0, 2).forEach(c => pool.push(c));
    return { w, t, o: 0, pool: shuffle(pool), sel: [] }
  }
  if (t == 'tr' || t == 'ty') return { w, t, o: 0 };
  let o = opts(w, { jm: 'm', mj: 'w', jr: 'r', rw: 'w' }[t], g);
  if (o.map(x => x.w).join('|') == it.ls) o = shuffle(o);
  it.ls = o.map(x => x.w).join('|');
  return { w, t, o }
}

function show() {
  cur.t0 = Date.now();
  etStart();
  const { w, t, o } = cur,
    it = S.i[w.w],
    pct = Math.round(ret(it, Date.now()) * 100);
  const q = { rw: `<div class="big">${e(w.r)}</div><p class="mu">Which word is read like this?</p>`, ty: `<div class="big">${e(w.m)}</div><p class="mu">Type the Japanese word: romaji, hiragana or kanji</p>`,
    oo: `<p style="font-size:1.25rem;text-align:center;margin:8px 0">Three of these share a kanji. Which one is the odd one out?</p>`,
    bt: `<div class="big">${e(w.m)}</div><p class="mu">Build the reading of ${e(w.w)} from kana tiles</p>`,
    gq: `<p style="font-size:1.25rem;text-align:center;margin:8px 0">${e(cur.qv||w.q)}</p><p class="mu">Choose the best fit</p>`,
    mj: `<div class="big">${e(w.m)}</div><p class="mu">Which word is this?</p>`, jm: `<div class="big">${ruby(w,it.s<6)}</div><p class="mu">What does it mean?</p>`,
    jr: `<div class="big">${e(w.w)}</div><p class="mu">How is it read?</p>`, tr: `<div class="big">${e(w.w)}</div><p class="mu">Type the reading: romaji or kana</p>` }[t];
  let h = (cur.fresh ? `<div class="card nw"><span class="mu">New word</span> <b style="font-size:1.5rem">${ruby(w,1)}</b> <span>${e(w.m)}</span> ${lvb(w)} <a class="wl" onclick="dict(${W().indexOf(w)})">details</a></div>` :
    '') + `<div class="card q-${t}">${q}<div class="bar" title="how well you hold this word"><i style="width:${pct}%"></i></div>`;
  h += t == 'bt' ? `<div id="bs"></div><div id="bp"></div><button class="pri" onclick="ans(0,cur.sel.map(k=>cur.pool[k]).join(''))">Check</button>` :
    ['tr', 'ty'].includes(t) ? `<input id="ti" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="romaji, hiragana or kanji" aria-label="answer"><button class="pri" onclick="ans(0,$('#ti').value)">Check</button>` :
    o.map((x, i) => `<button class="opt" onclick="ans(${i})">${e(t=='gq'?x.t:{jm:x.m,mj:x.w,jr:x.r,oo:x.w,rw:x.w}[t])}</button>`)
    .join('');
  $('#m').innerHTML = h + '<button class="skip" onclick="skipQ()">Skip</button></div><div id="fb"></div>';
  if (t == 'bt') bshow();
  if (['tr', 'ty'].includes(t)) {
    const i = $('#ti');
    i.focus();
    i.onkeydown = ev => {
      if (ev.key == 'Enter') ans(0, i.value)
    }
  }
}

function ans(i, val) {
  if (cur.done) return;
  cur.done = 1;
  const { w, t, o } = cur,
    it = S.i[w.w],
    ty = ['tr', 'bt', 'ty'].includes(t),
    x = ty ? null : o[i];
  const ok = ty ? rkOk(val, t, w) : t == 'gq' ? x.c : t == 'oo' ? x === cur.odd : x.w == w.w,
    R = ret(it, Date.now()),
    ls = learn(feat(w, t, it), ok ? 1 : 0, w.w);
  if (it.n >= 1) rvPush((Date.now() - it.t) / 864e5, it.s, ok ? 1 : 0);
  S.la = Date.now();
  S.ab = null;
  if (!ok && ls > 1.3 && !S.bq.some(b => b.id == w.w)) S.bq.push({ id: w.w, at: S.cnt + 2 });
  const E = etEnd(),
    z = robZ(t, E.act),
    slip = !ok && z < -1.5 && E.act < 1500,
    slow = ok && z > 2;
  if (slip) S.slips = (S.slips || 0) + 1;
  logEv({ k: 'p', id: w.w, ty: t, ok, E, z, keys: [w.w, 'ty:' + t].concat(w.f ? ['f:' + w.f] : []), ctx: ctxP(w,
        t, o, i, val) });
  if (ok) {
    it.s *= (slow ? .75 : 1) * (1.3 + 2.2 * (1 - R) + .15 * (10 - it.d));
    it.d = Math.max(1, it.d - .2)
  } else {
    it.s = Math.max(.4, it.s * (slip ? .5 : .25));
    it.d = Math.min(10, it.d + 1);
    if (!slip) it.l++;
    if (x && x.w) {
      it.x[x.w] = (it.x[x.w] || 0) + 1;
      if (S.i[x.w] && !S.bq.some(b => b.id == x.w)) S.bq.push({ id: x.w, at: S.cnt + 3 })
    }
  }
  it.t = Date.now();
  it.n++;
  S.cnt++;
  tick();
  S.rec.push(w.w);
  if (S.rec.length > 12) S.rec.shift();
  cmb = ok ? cmb + 1 : 0;
  const gain = ok ? 10 + Math.min(cmb, 10) * 2 : 0,
    d = new Date().toDateString();
  S.xp += gain;
  if (ok) {
    S.q = S.q && S.q.d == d ? S.q : { d, n: 0 };
    S.q.n++
  }
  rd.n++;
  rd.ok += ok ? 1 : 0;
  rd.xp += gain;
  rd.bc = Math.max(rd.bc, cmb);
  save();
  strip();
  document.querySelectorAll('.opt').forEach((b, j) => {
    b.disabled = true;
    if (o && (t == 'gq' ? o[j].c : t == 'oo' ? o[j] === cur.odd : o[j].w == w.w)) b.classList.add('ok');
    else if (j == i) b.classList.add('bad')
  });
  const info = t == 'gq' ? ej(cur.y || w.y) + ' ' + lvb(w) : t == 'oo' ? `${ej(cur.ch)} is in the other three.${trioW(cur.odd)}` :
    trioW(w);
  $('#fb').innerHTML = `<div class="card fb ${ok?'':'r'}"><b>${ok?'✓ '+(cmb>2?'Combo x'+cmb+'! +'+gain+' XP':'Correct, +'+gain+' XP'):'✗ Not quite'}</b><br>${info}${!ok&&t!='gq'&&t!='oo'?'<br>'+(ty?tyWhy(w,val):why(w,x)):''}${!S.diag&&S.mdl.n>=20&&S.mdl.n<24?'<p class="mu" style="text-align:left">Curious where you stand? There is a check-up in the Patterns tab.</p>':''}<div class="row2"><button class="sec" onclick="nav(-1)">‹ Back</button><button class="pri" onclick="nq()">Next</button></div></div>`;
  if (ok && S.aa !== false) {
    const c0 = cur;
    setTimeout(() => {
      if (cur === c0 && hi >= hist.length && $('nav .on') && $('nav .on')
        .dataset.v == 'p') nq()
    }, 1900)
  }
}

function nq() {
  if (hi < hist.length) {
    nav(1);
    return
  }
  snap();
  hi = hist.length;
  if (MX.on && mixNext()) return;
  if (rd.n >= 8) {
    const r = rd;
    rd = { n: 0, ok: 0, xp: 0, bc: 0 };
    $('#m').innerHTML = `<div class="card"><b>Round complete</b><p>${r.ok} of ${r.n} correct. +${r.xp} XP. Best combo x${r.bc}.</p><p class="mu" style="text-align:left">Stop here or keep going. Your words are rescheduled either way.</p><button class="pri" onclick="practice()">Another round</button></div>`;
    return
  }
  practice()
}
