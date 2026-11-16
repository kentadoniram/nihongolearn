/* js/14-typed-translation.js
 * Purpose: Typed translation screen, answer tracking and checking.
 * Defines (11): tq, typPick, typPattern, typCard, typ, TB, tbIn, tbRec, pctOf, tcFeedback, tc
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
let tq = null;

// Pick the next sentence: not one of the last few, favouring patterns you get wrong and the ones you have done less.
function typPick() {
  const P = TY.filter(open3),
    rc = S.trec,
    pf = S.pf = S.pf || {},
    last = rc.length ? TY.find(x => x.en == rc[rc.length - 1]) : null,
    c = P.filter(x => !rc.includes(x.en)),
    A = c.length ? c : P,
    w = x => (1 + ((S.cxw || {})[x.f] || 0) * .4) * (last && x.k == last.k ? .3 : 1) / (1 + (pf['t' + x
        .en] || 0) * .7) + .05;
  let r = Math.random() * A.reduce((a, x) => a + w(x), 0),
    q = A[A.length - 1];
  for (const x of A) {
    r -= w(x);
    if (r <= 0) {
      q = x;
      break
    }
  }
  if (GEN.frames && Math.random() < .6) q = gs();
  return { ...q }
}

// The pattern card above the sentence.
const typPattern = f => f ? `<div class="card pat" onclick="pat('${f.id}')"><div class="mu" style="text-align:left;margin:0">Pattern: <b>${e(f.name)}</b> <a class="wl">how it works</a></div><div class="blks">${blk(f)}</div></div>` :
  '';

// Sentence card: the English sentence, the answer box and the buttons.
const typCard = q => `<div class="card q-tr"><div class="mu" style="display:flex;justify-content:space-between;margin:0"><span>Translate into Japanese${S.hl?'':' <span class="lv">N'+q.l+'</span>'}</span>` + `<a class="wl" onclick="S.bm='tile';save();bld()">Tiles</a></div><div class="mean">${e(q.en)}</div>` + `<input id="ti2" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="romaji, hiragana or kanji" aria-label="your answer">` + `<button class="pri" onclick="tc()">Check</button><button class="skip" onclick="tskip()">Skip</button></div><div id="fb" role="status"></div>`;
function typ() {
  S.bm = 'type';
  if (!TY.filter(open3).length) {
    $('#m').innerHTML = '<div class="card">No typing exercises yet.</div>';
    return
  }
  const q = tq = typPick();
  $('#m').innerHTML = typPattern(fm(q.f)) + typCard(q);
  const i = $('#ti2');
  i.focus();
  etStart();
  TB = { tf: 0, dr: '', snaps: [], del: 0, rev: 0, pk: 0, lt: 0, ll: 0, pv: '' };
  i.oninput = tbIn;
  i.onkeydown = ev => {
    if (ev.key == 'Enter') tc()
  }
}

let TB = { tf: 0, dr: '', snaps: [], del: 0, rev: 0, pk: 0, lt: 0, ll: 0, pv: '' };
function tbIn() {
  const i = $('#ti2'),
    n = Date.now(),
    v = i.value;
  if (!TB.tf) TB.tf = n - ET.t0;
  if (TB.lt && n - TB.lt > 1500 && TB.ll > 2 && TB.snaps[TB.snaps.length - 1] !== TB.pv) {
    TB.snaps.push(TB.pv);
    if (!TB.dr) TB.dr = TB.pv
  }
  if (v.length < TB.ll) {
    TB.del += TB.ll - v.length;
    if (TB.ll - v.length > 3) TB.rev++
  }
  TB.pk = Math.max(TB.pk, v.length);
  TB.lt = n;
  TB.ll = v.length;
  TB.pv = v
}

function tbRec(q, v, E, r) {
  const T = TB,
    rec = { t: Date.now(), k: 'type', id: q.en, dr: (T.dr || v).slice(0, 80), fin: v.slice(0, 80), sn: T
    .snaps.slice(0, 4).map(x => x.slice(0, 60)), del: T.del, rev: T.rev, pk: T.pk, tf: Math.round(T.tf),
    ta: Math.round(E.act), ok: r.ok ? 1 : 0, pct: r.pct, alt: r.alt.length };
  (S.cx = S.cx || []).push(rec);
  if (S.cx.length > 200) S.cx.shift();
  logEv({ k: 't', id: q.en, ty: 'type', ok: r.ok, E, keys: ['f:' + q.f, 'ty:type'].concat(r.msg.length ?
        ['err:' + r.msg[0].slice(0, 24)] : []), ctx: `${q.en}|${v}|${q.t.join('')}`.slice(0, 200) })
}

const pctOf = x => Math.round(x * 100),
  tcNote = t => `<p class="mu" style="text-align:left;margin:4px 0">${t}</p>`;

// Feedback card after a typed answer: how close, both answers, what differs, and sentences with the same idea.
function tcFeedback(q, v, r, al, sib) {
  const ok = r.ok,
    head = ok ? '✓ Correct' + (r.alt.length ? ' (accepted variation)' : '') + ', +20 XP' : '✗ ' + r.pct + '% close',
    miss = ok ? '' : tcNote(`Words ${pctOf(r.p.w)}%, particles ${pctOf(r.p.p)}%, form ${pctOf(r.p.f)}%, order ${pctOf(r.p.o)}%`) + tcNote('Japanese verbs do not change for I, you, he or they, so there is no subject-verb agreement to get wrong. The form depends on tense and politeness.');
  return `<div class="card fb ${ok?'':'r'}"><b>${head}</b>${revTyped(q,v,r)}${miss}` + (al ? tcNote(`Word choice: ${ej(al)}`) :
    '') + (ok && q.ex ? tcNote(`Other natural orders: ${ej(q.ex.join('   '))}`) : '') + trioT(q) + (sib
    .length ? tcNote(`Same idea, other structures: ${sib.map(x=>e(x.en+' '+x.t.join(''))).join(' / ')}`) :
    '') + `<button class="pri" onclick="adv('t')">Next</button></div>`
}

function tc() {
  const q = tq,
    v = $('#ti2').value;
  if (!q || q.done || !v.trim()) return;
  q.done = 1;
  const E = etEnd(),
    r = evalT(q, v),
    ok = r.ok,
    pf = S.pf = S.pf || {};
  tbRec(q, v, E, r);
  if (ok) {
    S.xp += 20;
    pf['t' + q.en] = (pf['t' + q.en] || 0) + 1
  } else if (q.f) S.cxw = Object.assign(S.cxw || {}, { [q.f]: ((S.cxw || {})[q.f] || 0) + (r.pct < 70 ?
        1 : .5) });
  tick();
  S.trec.push(q.en);
  if (S.trec.length > 8) S.trec.shift();
  save();
  const sib = q.sib || TY.filter(x => x.k == q.k && x.en != q.en && open3(x))
    .slice(0, 3),
    al = r.alt.map(a => `${a.from} → ${a.to} (${a.m})${a.n?': '+a.n:''}`)
    .join('; ');
  $('#fb').innerHTML = tcFeedback(q, v, r, al, sib);
  if (ok && S.aa !== false) {
    const q0 = q;
    setTimeout(() => {
      if (tq === q0 && $('nav .on') && $('nav .on').dataset.v == 'b') adv('t')
    }, 3200)
  }
}
