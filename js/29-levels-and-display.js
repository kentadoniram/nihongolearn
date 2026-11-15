/* js/29-levels-and-display.js
 * Purpose: Which JLPT levels are open, and furigana for kanji above your level.
 * Defines (10): GATE, gateLv, lvOpen, lvIntro, ulv, kjLv, kjOk, needFg, rdOf, jw
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Level gate. Content of a level opens once you have met 70 percent of the level above it (N4 and N5 are always open).

// "My JLPT level" in the settings (S.jl) opens that level at once. General = questions and distractors, intro = new words.
const GATE = { t: 0, v: 4, i: 4, u: 5, k: null };
function gateLv() {
  const now = Date.now();
  if (now - GATE.t < 4000) return GATE;
  const A = W().filter(w => !w.g && !w.t),
    cov = ok => {
    const L = A.filter(ok);
    return L.length ? L.filter(w => S.i[w.w]).length / L.length : 0
  };
  let v = S.n3 || S.cnt > 120 ? 3 : 4,
    i = S.n3 || cov(w => w.l >= 4) > .7 ? 3 : 4,
    u = 5;
  [5, 4, 3, 2].forEach(l => {
    if (u == l && cov(w => w.l == l) > .7) u = l - 1
  });
  if (i == 3 && cov(w => w.l == 3) > .7) i = 2;
  if (i == 2 && cov(w => w.l == 2) > .7) i = 1;
  if (v == 3 && cov(w => w.l == 3) > .7) v = 2;
  if (v == 2 && cov(w => w.l == 2) > .7) v = 1;
  if (S.jl) {
    v = Math.min(v, S.jl);
    i = Math.min(i, S.jl)
  }
  Object.assign(GATE, { t: now, v, i, u, k: null });
  return GATE
}

const lvOpen = l => l >= gateLv().v,
  lvIntro = l => l >= gateLv().i;

// Your JLPT level (5 to 1): the one you chose in the settings, otherwise the level you are working on (N5 until you know 70

// percent of the N5 words, then N4, and so on).
const ulv = () => +S.jl || gateLv().u;

// Level of a kanji: its own entry, otherwise the easiest word that uses it, otherwise N1.
function kjLv(c) {
  const g = gateLv();
  if (!g.k) {
    g.k = {};
    W().forEach(w => {
      if (!w.g)[...w.w].forEach(x => {
        if (K.test(x) && !KJ[x]) g.k[x] = Math.max(g.k[x] || 0, w.l)
      })
    })
  }
  return KJ[c] ? KJ[c].l : g.k[c] || 1
}

// A kanji is shown as it is when it belongs to your level or an easier one (even if you have not studied it yet).
const kjOk = c => !K.test(c) || kjLv(c) >= ulv(),
  needFg = w => [...w].some(c => !kjOk(c));

// Reading of a word or word stem from the deck when the sentence does not carry one.
function rdOf(w) {
  if (!LEXRE) mkLex();
  return (WM[w] || {}).r || RDX[w] || ''
}

// A word in a sentence: kanji within your level as they are, anything above your level with furigana (hiragana).
const jw = (w, r) => (r = r || rdOf(w)) && K.test(w) && needFg(w) ? `<ruby>${e(w)}<rt>${e(r)}</rt></ruby>` :
  e(w);
