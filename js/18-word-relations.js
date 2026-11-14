/* js/18-word-relations.js
 * Purpose: Synonym, antonym and verb-pair relations.
 * Defines (4): rareOne, gr, relLab, paraLab
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Word relations: synonym, antonym, verb-pair graph and same-meaning questions ----
const rareOne = () => {
  const r = W().filter(w => !w.g && !S.i[w.w] && openW(w) && TR[w.w] >= 4);
  return r.length ? [rnd(r)] : []
};
const gr = w => {
  const T = TR[w.w] || 3,
    L = { s: 'Close in meaning', r: 'Related', a: 'Opposite', g: 'Opposite', p: 'Verb pair' },
    o = {};
  (G[w.w] || []).forEach(z => {
    (o[L[z.t]] = o[L[z.t]] || []).push(z.w)
  });
  return `<p class="mu" style="text-align:left;margin:6px 0">Everyday use ${'●'.repeat(6-T)}${'○'.repeat(T-1)}</p>` + Object
    .entries(o).map(([k, v]) => `<p style="margin:6px 0">${k}</p>${v.map(x=>`<a class="wl" onclick="dict(${W().indexOf(WM[x])})">${e(x)}</a>`).join(' ')}`)
    .join('')
};
function relLab(kind) {
  const E = REL.filter(r => (kind == 'syn' ? r[2] == 's' : r[2] == 'a' || r[2] == 'g') && WM[r[0]] &&
    WM[r[1]] && openW(WM[r[0]]) && openW(WM[r[1]]));
  if (!E.length) return paraLab();
  const e0 = rnd(E),
    fl = Math.random() < .5,
    w = WM[fl ? e0[1] : e0[0]],
    a = WM[fl ? e0[0] : e0[1]],
    ex = new Set((G[w.w] || []).map(z => z.w).concat(w.w)),
    pos = posOf(a),
    ds = shuffle(V.filter(x => !x.t && !ex.has(x.w) && posOf(x) == pos && openW(x) && x.w != a.w))
    .slice(0, 3),
    o = shuffle([a, ...ds]),
    ja = Math.random() < .5,
    mf = Math.random() < .3,
    syn = kind == 'syn';
  const q = mf ? (syn ? `Which meaning is close to ${w.w}?` : `Which meaning is the opposite of ${w.w}?`) :
    syn ? (ja ? `「${w.w}」と近い意味の言葉はどれですか。` : `Which word is closest in meaning to ${w.w}?`) : (ja ? `「${w.w}」の反対の意味の言葉はどれですか。` :
    `Choose the opposite of ${w.w}.`);
  return { t: syn ? 'Same meaning' : 'Opposite', p: '', aw: a, q, o: o.map(x => mf ? x.m : x.w), a: o
    .indexOf(a), y: `${w.w} (${w.m}) ${syn?'is close to':'is the opposite of'} ${a.w} (${a.m}).`, key: 'rel|' + kind + '|' + w
    .w + '|' + a.w + '|' + q }
}

function paraLab() {
  const ty = rnd(['cmp', 'neg', 'front', 'plain', 'because']),
    ok = g => WM[g[0]] && WM[g[1]],
    G9 = GRAD.filter(ok),
    F = FRM(),
    sj = GEN.subj,
    tm = GEN.tm;
  let base,
    right,
    wrong,
    y,
    fe = '',
    t = ty;
  if ((ty == 'cmp' || ty == 'neg') && !G9.length) t = 'front';
  if (t == 'plain' && !F.some(f => f.dc)) t = 'front';
  if (t == 'because' && !BEC.length) t = 'front';
  const ng = a => a.slice(0, -1) + 'くないです';
  if (t == 'cmp') {
    const g = rnd(G9),
      [A, B] = shuffle(g[2].split(',')).slice(0, 2);
    base = `${A}は${B}より${g[0]}です。`;
    right = `${B}は${A}より${g[1]}です。`;
    wrong = [`${B}は${A}より${g[0]}です。`, `${A}は${B}より${g[1]}です。`, `${A}は${B}ほど${ng(g[0])}。`.replace('くないです。',
        'くないです。')];
    y = `“A is more ${WM[g[0]].m} than B” and “B is more ${WM[g[1]].m} than A” say the same thing: swap the nouns and use the opposite word.`;
    fe = `The ${tn(B)} is ${g[4]} than the ${tn(A)}.`
  } else if (t == 'neg') {
    const g = rnd(G9),
      n = rnd(g[2].split(','));
    base = `この${n}は${g[1]}です。`;
    right = `この${n}は${ng(g[0])}。`;
    wrong = [`この${n}は${ng(g[1])}。`, `この${n}は${g[0]}です。`, `この${n}は${g[1]}でした。`];
    y = `${g[1]} (${WM[g[1]].m}) means about the same as “not ${WM[g[0]].m}”, so ${g[0].slice(0,-1)}くない keeps the meaning. Negating the same word, or changing the tense, does not.`;
    fe = `This ${tn(n)} is not ${WM[g[0]].m}.`
  } else if (t == 'plain') {
    const f = rnd(F.filter(z => z.dc)),
      s = rnd(sj),
      m = rnd(tm.filter(x => x.t != 1)),
      f2 = rnd(F.filter(z => z.dc && z.dc != f.dc)),
      past = f.te.replace(/て$/, 'た').replace(/で$/, 'だ');
    base = `${s.j}は${m.j}${f.n}${f.p}${f.vp}。`;
    right = `${s.j}は${m.j}${f.n}${f.p}${f.dc}。`;
    wrong = [`${s.j}は${m.j}${f.n}${f.p}${past}。`, `${s.j}は${m.j}${f.n}${f.p}${f.vp}か。`, `${s.j}は${m.j}${f2.n}${f2.p}${f2.dc}。`];
    y = 'The ます form is polite and the dictionary form is plain. They state the same fact, only the politeness changes. The た form is past, and か makes it a question.';
    fe = `${s.e} ${m.t==2?'will '+f.e1:s.j=='私'?f.e1:f.e3} ${m.e}.`
  } else if (t == 'because') {
    const [c, ef, ec, ee] = rnd(BEC);
    base = `${c}なので、${ef}。`;
    right = `${c}だから、${ef}。`;
    wrong = [`${c}なのに、${ef}。`, `${ef}ので、${c}です。`, `${c}だけど、${ef}。`];
    y = 'ので and だから both give a reason (because, so). なのに means “even though” and だけど means “but”, and reversing the two halves reverses cause and effect.';
    fe = `${ec[0].toUpperCase()+ec.slice(1)}, so ${ee}.`
  } else {
    const f = rnd(F),
      s = rnd(sj),
      m = rnd(tm),
      v = m.t == 1 ? f.va : f.vp,
      m2 = rnd(tm.filter(x => x !== m)),
      s2 = rnd(sj.filter(x => x !== s)),
      f3 = rnd(F.filter(z => z.p == f.p && z.n != f.n));
    base = `${s.j}は${m.j}${f.n}${f.p}${v}。`;
    right = `${m.j}、${s.j}は${f.n}${f.p}${v}。`;
    wrong = [`${m.j}、${s.j}は${f3.n}${f3.p}${m.t==1?f3.va:f3.vp}。`, `${m2.j}、${s.j}は${f.n}${f.p}${m2.t==1?f.va:f.vp}。`,
      `${m.j}、${s2.j}は${f.n}${f.p}${v}。`];
    y = 'A time word can move to the front. The topic marker は still follows the subject and the verb stays last, so the meaning is unchanged. Changing the thing, the time or the person changes the meaning.';
    fe = `${s.e} ${m.t==1?f.e2:m.t==2?'will '+f.e1:s.j=='私'?f.e1:f.e3} ${m.e}.`
  }
  const o = shuffle([right, ...wrong]);
  return { t: 'Same meaning, different structure', p: base, q: 'Which sentence means the same?', o, a: o
    .indexOf(right), y, key: 'para|' + t + '|' + base, full: right, fen: fe }
}
