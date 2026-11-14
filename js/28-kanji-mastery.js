/* js/28-kanji-mastery.js
 * Purpose: Kanji reading mastery from help requests and independent reading in passages.
 * Defines (16): KMP, kmRec, kmScore, kmLevel, kmMastered, kmAdd, kmHelp, kmDone, kmWeak, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Mastery model. Every kanji keeps weighted evidence: a = independent reading, b = needing help. The score is the mean of a Beta

// distribution, (A0 + a) / (A0 + B0 + a + b), so a new kanji starts low (A0 = 1, B0 = 2) and needing help pulls it down.

// Evidence fades with a time constant of 60 days (what you read a long time ago counts less).
const KMP = { A0: 1, B0: 2, tau: 60, w: { tap: 1, more: 2, rep: 0, ok: 1, rom: .5, miss: .25 }, mastered: .8,
  familiar: .6, minOk: 4 };
let PKR = new Set(),
  PKK = new Set(),
  PKH = new Set();

// Evidence for one kanji, faded to now. Never changes the saved record.
function kmRec(c, now) {
  const r = (S.km || {})[c];
  if (!r) return { a: 0, b: 0, h: 0, d: 0, i: 0, n: 0 };
  const f = Math.exp(-Math.max(0, (now || Date.now()) - (r.t || 0)) / 864e5 / KMP.tau);
  return { a: r.a * f, b: r.b * f, h: r.h || 0, d: r.d || 0, i: r.i || 0, n: r.n || 0 }
}

// Words you know well that contain the kanji add a little independent evidence (at most 4 words, half a point each).
const kmWords = c => Math.min(4, W().filter(w => !w.g && w.w.includes(c) && S.i[w.w] && S.i[w.w].s >= 7)
  .length) * .5;
function kmScore(c, now) {
  const r = kmRec(c, now),
    a = r.a + kmWords(c);
  return (KMP.A0 + a) / (KMP.A0 + KMP.B0 + a + r.b)
}

// 0 new, 1 learning, 2 familiar, 3 mastered (needs a good score and at least 4 independent readings).
function kmLevel(c) {
  const r = kmRec(c),
    sc = kmScore(c);
  if (!r.n && !kmWords(c)) return 0;
  if (sc >= KMP.mastered && r.a + kmWords(c) >= KMP.minOk) return 3;
  return sc >= KMP.familiar ? 2 : 1
}

const kmMastered = c => kmLevel(c) == 3;

// Record one learning event for a kanji: tap, more (See more), rep (repeat tap in the same passage, logged only),

// ok (read without help and answered correctly), rom (understood from romaji only), miss (no help, wrong answer).
function kmAdd(c, kind) {
  if (!K.test(c)) return;
  const now = Date.now(),
    km = S.km = S.km || {},
    r = kmRec(c, now),
    w = KMP.w[kind] || 0,
    help = kind == 'tap' || kind == 'more' || kind == 'miss',
    x = km[c] = { a: r.a + (help ? 0 : w), b: r.b + (help ? w : 0), h: r.h + (kind == 'tap' ? 1 : 0),
    d: r.d + (kind == 'more' ? 1 : 0), i: r.i + (kind == 'ok' || kind == 'rom' ? 1 : 0), n: r.n + 1, t: now };
  const lg = S.kl = S.kl || [];
  lg.push({ t: now, c, k: kind });
  if (lg.length > 300) lg.shift();
  return x
}

// A help request: level 0 = first tap on a word in a passage, 1 = See more (full entry).
function kmHelp(chars, deep, rep) {
  chars.forEach(c => {
    PKH.add(c);
    kmAdd(c, rep ? 'rep' : deep ? 'more' : 'tap')
  })
}

// Called when a passage question is answered: kanji read without help get independent credit (full credit if the kanji

// was shown, half credit if only the romaji was shown), or a small deduction when the answer was wrong.
function kmDone(c, ok) {
  const ks = [...new Set([...(c.p || '')].filter(x => K.test(x) && KJ[x]))].filter(x => !PKH.has(x));
  if (!ks.length) return '';
  const before = new Map(ks.map(x => [x, kmScore(x)]));
  ks.forEach(x => kmAdd(x, ok ? (PKK.has(x) || !PKR.has(x) ? 'ok' : 'rom') : 'miss'));
  save();
  const up = ks.filter(x => kmScore(x) > before.get(x) + .005).length;
  return `<p class="mu" style="text-align:left">Kanji check: ${ks.length} kanji read without help${ok?`, ${up} gained`:' (answer was wrong, so they count for little)'}. ${kmWeak(3).length?'To practise: '+kmWeak(3).map(x=>x+' '+Math.round(kmScore(x)*100)+'%').join(', ')+'.':''}</p>`
}

// Kanji you have met but not mastered, weakest first.
function kmWeak(n) {
  return Object.keys(S.km || {}).filter(c => KJ[c] && kmRec(c).n && kmLevel(c) < 3)
    .sort((a, b) => kmScore(a) - kmScore(b)).slice(0, n || 5)
}

// A word you already know that contains a weak kanji, to bring that kanji back in practice.
function kmWeakWord(L) {
  const wk = new Set(kmWeak(12).filter(c => kmLevel(c) < 2));
  if (!wk.size) return null;
  const c = L.filter(w => [...w.w].some(x => wk.has(x)) && !S.rec.includes(w.w));
  return c.length ? rnd(c) : null
}

function kmStatus() {
  const ks = Object.keys(S.km || {}).filter(c => kmRec(c).n),
    m = ks.filter(kmMastered).length,
    wk = kmWeak(5);
  if (!ks.length) return 'No kanji tracked yet. Reading passages show unmastered kanji as romaji; tap one to see the kanji, and See more for its meaning and readings.';
  return `${ks.length} kanji tracked, ${m} mastered. Needs practice: ${wk.length?wk.map(c=>c+' '+Math.round(kmScore(c)*100)+'%').join(', '):'none'}. Each tap costs a little, See more costs more, reading without help earns it back.`
}

function kmCard() {
  const wk = kmWeak(6);
  return wk.length ? `<div class="card"><b>Kanji to practise</b><p class="mu" style="text-align:left;margin:4px 0">You needed help with these in reading passages:</p><div>${wk.map(c=>kc(c)+'<small class="mu"> '+Math.round(kmScore(c)*100)+'% </small>').join(' ')}</div></div>` :
    ''
}

// Passage text: words with a kanji you have not mastered are shown as romaji only (tap for the kanji, See more for the meaning and readings).
function pj(s) {
  if (!LEXRE) mkLex();
  PKR = new Set();
  PKK = new Set();
  return String(s).split(LEXRE).map((p, i) => {
    if (i % 2) {
      const m = LEXM[p],
        rd = m[0] == 'r' ? RDX[p] : m[0] == 'w' ? (WM[m[1]] || {}).r : '',
        ks = [...p].filter(c => K.test(c));
      if (ks.length && rd && ks.some(c => !kmMastered(c))) {
        ks.forEach(c => PKR.add(c));
        return `<span class="jp lx kr" tabindex="0" role="button" aria-label="Show the kanji" data-lx="${m[0]}:${m[0]=='w'?e(m[1]):m[1]}" data-kj="${e(ks.join(''))}">${romaji(rd)}</span>`
      }
      ks.forEach(c => PKK.add(c))
    }
    return ej(p, 1)
  }).join('')
}
