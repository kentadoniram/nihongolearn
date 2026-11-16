/* js/23-checkup-vocab-roadmap.js
 * Purpose: Check-up builder, vocabulary list, Progress groups and roadmap.
 * Defines (16): diagBuild, vf, vocabStatus, vocabLevel, vocabBar, vocabChips, vocabSearch, vocab, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Randomised diagnostic: every check-up is built from fresh questions ----
function diagBuild() {
  const o = [],
    P = W().filter(w => !w.g && !w.t && w.l >= 4 && (TR[w.w] || 3) <= 2),
    kj = P.filter(w => K.test(w.w) && !/^[ァ-ヶー]+$/.test(w.w)),
    pk = (a, n) => shuffle(a).slice(0, n);
  pk(P, 5).forEach(w => {
    const z = opts(w, 'm'),
      x = exOf(w);
    o.push({ c: 'v', l: w.l, w: w.w, q: w.w + ' means…', o: z.map(v => v.m), a: z.indexOf(w), y: `${w.w} (${w.r}) means “${w.m}”.${x?' Example: '+x[0]+' ('+x[1]+')':''}` })
  });
  pk(kj, 3).forEach(w => {
    const z = opts(w, 'r');
    o.push({ c: 'r', l: w.l, w: w.w, q: `How do you read ${w.w}?`, o: z.map(v => v.r), a: z.indexOf(w),
        y: `${w.w} is read ${w.r} and means “${w.m}”.` })
  });
  pk(SIM.filter(g => g.length >= 3), 2).forEach(g => {
    const ks = [...g].filter(c => KJ[c]);
    if (ks.length < 2) return;
    const c1 = rnd(ks),
      oth = shuffle(Object.keys(KJ).filter(c => !g.includes(c))),
      opt = shuffle([c1, ...shuffle(ks.filter(c => c != c1)).slice(0, 3), ...oth])
      .filter((c, i, a) => a.indexOf(c) == i).slice(0, 4);
    if (!opt.includes(c1)) opt[0] = c1;
    const ix = shuffle(opt);
    o.push({ c: 'k', l: KJ[c1].l > 4 ? 5 : KJ[c1].l, q: `Which kanji means “${KJ[c1].m}”?`, o: ix, a: ix
        .indexOf(c1), y: ks.map(c => c + ' ' + KJ[c].m).join(', ') + '. These look alike, so check the strokes.' })
  });
  for (let i = 0; i < 3; i++) {
    const c = genLab({ gen: 'particle' });
    o.push({ c: 'g', l: 5, q: c.p, o: c.o, a: c.a, y: c.y })
  }
  const c = genLab({ gen: 'tense' });
  o.push({ c: 'g', l: 5, q: c.p, o: c.o, a: c.a, y: c.y });
  return o.sort((a, b) => b.l - a.l).slice(0, 14)
}

// ---- Vocabulary list with progress, and roadmap ----
function vf(k, v) {
  S.vf = S.vf || { lv: '', st: '', q: '', n: 40, ls: '' };
  S.vf[k] = v;
  S.vf.n = 40;
  vocab()
}

const vocabStatus = w => {
  const it = S.i[w.w];
  return !it ? 'new' : it.s >= 7 ? 'solid' : 'learning'
};
const vocabLevel = w => w.t ? 'W' : String(w.l);

// A level bar: words met, solid and in total.
function vocabBar(A, k) {
  const L = A.filter(w => vocabLevel(w) == k),
    m = L.filter(w => S.i[w.w]).length,
    sd = L.filter(w => vocabStatus(w) == 'solid').length;
  return L.length ? `<div class="stat"><span>${k=='W'?'Work':'N'+k}</span><span class="mu">${m} met, ${sd} solid, ${L.length} in total</span></div><div class="bar" style="margin:2px 0 8px"><i style="width:${m/L.length*100}%"></i></div>` :
    ''
}

// A row of filter chips: k is the filter, list the [value, label] pairs.
const vocabChips = (F, k, list) => `<div class="chips">${list.map(([v,t])=>`<a class="${(F[k]||'')==v?'on':''}" onclick="vf('${k}','${v}')">${t}</a>`).join('')}</div>`;
const vocabSearch = F => `<input id="vq" aria-label="Search the vocabulary" placeholder="Search word, reading, romaji or meaning" value="${e(F.q||'')}" oninput="S.vf.q=this.value;S.vf.n=40;vocabList()" ` + `style="width:100%;padding:10px;border:1px solid var(--bdc);border-radius:8px;background:var(--bg);color:var(--fg);font-size:1rem">`;
function vocab() {
  const F = S.vf = S.vf || { lv: '', st: '', q: '', n: 40, ls: '' },
    A = W().filter(w => !w.g),
    lss = [...new Set(A.map(w => w.ls).filter(Boolean))],
    ch = (k, list) => vocabChips(F, k, list);
  $('#m').innerHTML = `<div class="card"><b>Vocabulary</b>${['5','4','3','2','1','W'].map(k=>vocabBar(A,k)).join('')}` + ch('lv',
    [['', 'All'], ['5', 'N5'], ['4', 'N4'], ['3', 'N3'], ['2', 'N2'], ['1', 'N1'], ['W', 'Work']]) + ch('st',
    [['', 'Any status'], ['new', 'New'], ['learning', 'Learning'], ['solid', 'Solid']]) + (lss.length ?
    ch('ls', [['', 'All lessons'], ...lss.map(x => [x, x])]) : '') + vocabSearch(F) + `</div><div class="card" id="vl"></div><button class="sec" onclick="go('g')">Back to Progress</button>`;
  vocabList()
}

// One word of a list: reading and meaning, with how well you remember it.
function vocabRow(w, now) {
  const it = S.i[w.w],
    st = vocabStatus(w);
  return `<div class="vr" onclick="dict(${W().indexOf(w)})" style="cursor:pointer"><span>${ruby(w,1)} ${lvb(w)}<br><span class="mu">${e(w.m)}</span></span>` + `<span class="pill ${st=='solid'?'s':''}">${st=='new'?'new':Math.round(ret(it,now)*100)+'% '+st}</span></div>`
}

function vocabList() {
  const F = S.vf,
    A = W().filter(w => !w.g),
    q = (F.q || '').toLowerCase(),
    now = Date.now();
  const R = A.filter(w => (!F.lv || vocabLevel(w) == F.lv) && (!F.st || vocabStatus(w) == F.st) && (!F
      .ls || w.ls == F.ls) && (!q || (w.w + ' ' + w.r + ' ' + romaji(w.r) + ' ' + w.m)
      .toLowerCase().includes(q))).sort((a, b) => (ZR[a.w] || 999) - (ZR[b.w] || 999));
  $('#vl').innerHTML = `<p class="mu" style="text-align:left;margin:0 0 4px">${R.length} words, ordered by everyday use</p>` + R
    .slice(0, F.n).map(w => vocabRow(w, now)).join('') + (R.length > F.n ? `<button class="sec" onclick="S.vf.n+=40;vocabList()">Show more</button>` :
    '')
}

// ---- Progress tab: vocabulary in collapsible groups (JLPT level, difficulty, newly acquired) ----

// Difficulty of a word: what you have learned about it (item difficulty, 1 to 10) once you have met it, otherwise an estimate

// from its JLPT level, number of kanji and length.
function pgDiff(w) {
  const it = S.i[w.w];
  if (it) return Math.min(1, Math.max(0, it.d / 10));
  const k = [...w.w].filter(c => K.test(c)).length;
  return Math.min(1, ({ 5: .2, 4: .4, 3: .55, 2: .7, 1: .85 }[w.l] || .5) + Math.min(.2, k * .06) + Math
    .min(.1, Math.max(0, w.w.length - 3) * .02))
}

const PG = [['lv', 'By JLPT level', [['5', 'N5'], ['4', 'N4'], ['3', 'N3'], ['2', 'N2'], ['1', 'N1'],
      ['W', 'Work']]], ['df', 'By difficulty', [['e', 'Easy'], ['m', 'Medium'], ['h', 'Hard']]], ['nw',
    'Newly acquired', [['d', 'Today'], ['w', 'Last 7 days'], ['m', 'Last 30 days']]]];
function pgSet(kind, g) {
  const A = W().filter(w => !w.g),
    day = new Date().setHours(0, 0, 0, 0);
  if (kind == 'lv') return A.filter(w => (w.t ? 'W' : String(w.l)) == g);
  if (kind == 'df') return A.filter(w => {
    const d = pgDiff(w);
    return g == 'e' ? d < .4 : g == 'm' ? d >= .4 && d < .6 : d >= .6
  }).sort((a, b) => pgDiff(b) - pgDiff(a));
  const lim = { d: day, w: day - 6 * 864e5, m: day - 29 * 864e5 }[g];
  return A.filter(w => S.i[w.w] && S.i[w.w].f >= lim).sort((a, b) => S.i[b.w].f - S.i[a.w].f)
}

function pgGroups(kind) {
  const P = PG.find(x => x[0] == kind);
  return P[2].map(([g, t]) => {
    const L = pgSet(kind, g),
      m = L.filter(w => S.i[w.w]).length,
      sd = L.filter(w => S.i[w.w] && S.i[w.w].s >= 7).length;
    return `<details class="pgi" data-k="${kind}" data-g="${g}" ontoggle="pgList(this)"><summary>${t} <span class="mu">${L.length} words, ${m} met, ${sd} solid</span></summary><div class="pgl"></div></details>`
  }).join('')
}

// A group fills its list the first time it is opened (about 2,000 words would make the page slow).
function pgList(d, more) {
  if (!d.open) return;
  const box = d.querySelector('.pgl'),
    n = more ? +box.dataset.n + 40 : 40;
  if (!more && box.dataset.n) return;
  box.dataset.n = n;
  const L = pgSet(d.dataset.k, d.dataset.g),
    now = Date.now();
  box.innerHTML = (L.length ? L.slice(0, n).map(w => vocabRow(w, now)).join('') : '<p class="mu">No words here yet.</p>') + (L
    .length > n ? '<button class="sec" onclick="pgList(this.closest(\'details\'),1)">Show more</button>' :
    '')
}

function roadmap() {
  const R = RMP,
    c = k => R.filter(x => x.s == k),
    d = c('done').length,
    nm = { done: 'Done', doing: 'In progress', planned: 'Not started' },
    pc = Math.round(d / Math.max(1, R.length) * 100);
  $('#m').innerHTML = `<div class="card"><b>Roadmap</b><p class="mu" style="text-align:left">${d} of ${R.length} items done (${pc}%). App version ${e(VER.app)}.</p><div class="bar"><i style="width:${pc}%"></i></div></div>` + ['doing',
    'planned', 'done'].map(k => `<div class="card"><b>${nm[k]} (${c(k).length})</b>${c(k).map(x=>`<div class="stat"><span>${e(x.t)}<br><span class="mu">${e(x.a)}${x.n?': '+e(x.n):''}</span></span></div>`).join('')}</div>`)
    .join('') + `<button class="sec" onclick="go('g')">Back to Progress</button>`
}
