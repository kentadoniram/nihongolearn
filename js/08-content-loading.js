/* js/08-content-loading.js
 * Purpose: Loading data packs into the shared content tables.
 * Defines (3): rows, applyPacks, loadContent
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Content comes from data/*.json packs (see data/SCHEMA.md) plus any packs imported by the user.
const rows = t => Array.isArray(t) ? t : (t.rows || []).map(r => Object.fromEntries(t.cols.map((c, i) => [c,
      r[i]])));
function applyPacks(ps) {
  CAS = { rules: [], phrases: [] };
  V = [];
  DIAG = [];
  KJ = {};
  SN = [];
  LAB = [];
  SIM = [];
  FM = [];
  TY = [];
  GEN = {};
  REL = [];
  GRAD = [];
  BEC = [];
  TR = {};
  FI = {};
  RMP = [];
  EXPR = [];
  const seen = new Set();
  ps.forEach(p => {
    const L = +p.level || 5;
    rows(p.words || []).forEach(w => {
      if (w.w && w.r && w.m && !seen.has(w.w)) {
        seen.add(w.w);
        V.push({ w: w.w, r: w.r, m: w.m, l: +w.l || L, e: w.e || undefined, p: w.p || undefined, t: p
            .track, ls: w.ls || undefined, fr: w.fr || undefined, auto: (!w.l && p.autolevel) ? 1 : undefined })
      }
    });
    rows(p.kanji || []).forEach(k => {
      KJ[k.k] = { m: k.m, on: k.on, kun: k.kun, l: +k.l || L }
    });
    (p.questions || []).forEach(q => DIAG.push(q));
    (p.sentences || []).forEach(x => SN.push({ en: x.en, t: x.t, tail: +x.tail || 1, y: x.y, l: +x.l ||
          L, f: x.f }));
    (p.patterns || []).concat(p.reading || []).forEach(u => LAB.push({ ...u, ex: u.ex || [], l: u.l ||
          L }));
    if (p.casual) {
      CAS.rules.push(...(p.casual.rules || []));
      rows(p.casual.phrases || []).forEach(x => CAS.phrases.push(x))
    }(p.passages || []).forEach(ps => (ps.qs || []).forEach((q, i) => LAB.push({ t: 'Reading', l: +ps
          .l || L, p: ps.p, ex: [], q: q.q, o: q.o, a: q.a, y: q.y, id: ps.id + '-' + i })));
    (p.lookalike || []).forEach(g => SIM.push(g));
    rows(p.translate || []).forEach(x => TY.push({ en: x.en, t: x.t.split(' '), r: x.r.split(' '), l: +x
          .l || L, f: x.f, k: x.k }));
    if (p.gen) {
      const g = p.gen;
      if (g.subj) GEN.subj = g.subj;
      if (g.tm) GEN.tm = g.tm;
      if (g.cues) GEN.cues = g.cues;
      if (g.frames) GEN.frames = rows(g.frames);
      if (g.ident) GEN.ident = g.ident;
      GEN.reads = (GEN.reads || []).concat(g.reads || [])
    }
    if (p.roadmap) RMP = RMP.concat(p.roadmap);
    if (p.expr) EXPR = EXPR.concat(p.expr);
    if (p.rel) REL = REL.concat(rows(p.rel).map(r => [r.a, r.b, r.t, r.n]));
    if (p.grad) GRAD = GRAD.concat(p.grad);
    if (p.bec) BEC = BEC.concat(p.bec);
    if (p.freq) Object.entries(p.freq).forEach(([t, l]) => l.split(',').forEach((w, i) => {
      TR[w] = +t;
      FI[w] = i
    }));
    (p.forms || []).forEach(f => FM.push({ ...f, l: +f.l || L }))
  });
  {
    const vm = new Map(V.map(w => [w.w, w]));
    ps.forEach(p => rows(p.examples || []).forEach(x => {
      const w = vm.get(x.w);
      if (w && !w.e) w.e = [x.j, x.en]
    }))
  }
  GI = DIAG.filter(q => q.c == 'g' && q.id).map(q => ({ w: q.id, g: 1, l: q.l, q: q.q, o: q.o, a: q.a,
        y: q.y }));
  DX = DIAG.filter(q => !q.x);
  post()
}

async function loadContent() {
  fetch('version.json').then(r => r.json()).then(j => {
    VER.app = j.app;
    VER.content = j.content
  }).catch (() => {});
  const get = async u => {
    const r = await fetch(u);
    if (!r.ok) throw new Error('Could not load ' + u + ' (error ' + r.status + ')');
    return r.json()
  };
  let b = 'data/',
    m;
  try {
    m = await get(b + 'content.json')
  } catch (x) {
    b = '';
    m = await get('content.json')
  }
  PK = await Promise.all(m.packs.map(f => get(b + f)));
  applyPacks(PK.concat(S.cp))
}
