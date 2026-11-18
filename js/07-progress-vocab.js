/* js/07-progress-vocab.js
 * Purpose: Progress: one vocabulary card with JLPT level, difficulty and newly acquired filters.
 * Defines (7): pgDiff, PV_LV, pvSet, pvBody, pvCard, pvf, pvMore
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Difficulty of a word: what you have learned about it (item difficulty, 1 to 10) once you have met it, otherwise an estimate

// from its JLPT level, number of kanji and length.
function pgDiff(w) {
  const it = S.i[w.w];
  if (it) return Math.min(1, Math.max(0, it.d / 10));
  const k = [...w.w].filter(c => K.test(c)).length;
  return Math.min(1, ({ 5: .2, 4: .4, 3: .55, 2: .7, 1: .85 }[w.l] || .5) + Math.min(.2, k * .06) + Math
    .min(.1, Math.max(0, w.w.length - 3) * .02))
}

const PV_LV = [['', 'All levels'], ['5', 'N5'], ['4', 'N4'], ['3', 'N3'], ['2', 'N2'], ['1', 'N1'], ['W',
    'Work']],
  PV_DF = [['', 'Any difficulty'], ['e', 'Easy'], ['m', 'Medium'], ['h', 'Hard']],
  PV_NW = [['', 'Any time'], ['d', 'Today'], ['w', 'Last 7 days'], ['m', 'Last 30 days']];

// The words that pass the three filters: newest first when a time is chosen, hardest first for a difficulty, otherwise by everyday use.
function pvSet(F) {
  const day = new Date().setHours(0, 0, 0, 0),
    lim = { d: day, w: day - 6 * 864e5, m: day - 29 * 864e5 }[F.nw],
    band = w => {
    const d = pgDiff(w);
    return d < .4 ? 'e' : d < .6 ? 'm' : 'h'
  }, L = W().filter(w => !w.g && (!F.lv || vocabLevel(w) == F.lv) && (!F.df || band(w) == F.df) && (!F
      .nw || S.i[w.w] && S.i[w.w].f >= lim));
  if (F.nw) return L.sort((a, b) => S.i[b.w].f - S.i[a.w].f);
  if (F.df) return L.sort((a, b) => pgDiff(b) - pgDiff(a));
  return L.sort((a, b) => (ZR[a.w] || 9e9) - (ZR[b.w] || 9e9))
}

// The filters, the count and the list (also what is redrawn when a filter changes).
function pvBody() {
  const F = S.pv = S.pv || { lv: '', df: '', nw: '', n: 40 },
    L = pvSet(F),
    now = Date.now(),
    ch = (k, list) => vocabChips(F, k, list, 'pvf'),
    met = L.filter(w => S.i[w.w]).length;
  return `<p class="mu" style="text-align:left;margin:6px 0 2px">JLPT level</p>${ch('lv', PV_LV)}<p class="mu" style="text-align:left;margin:6px 0 2px">Difficulty</p>${ch('df', PV_DF)}` + `<p class="mu" style="text-align:left;margin:6px 0 2px">Newly acquired</p>${ch('nw', PV_NW)}` + `<p class="mu" style="text-align:left;margin:8px 0 4px">${L.length} words, ${met} met</p>` + (L
    .length ? L.slice(0, F.n).map(w => vocabRow(w, now)).join('') : '<p class="mu">No words match these filters.</p>') + (L
    .length > F.n ? `<button class="sec" onclick="pvMore()">Show more</button>` : '')
}

const pvCard = () => `<div class="card" id="pv"><b>Vocabulary</b>${pvBody()}</div>`;
function pvf(k, v) {
  S.pv[k] = v;
  S.pv.n = 40;
  $('#pv').innerHTML = '<b>Vocabulary</b>' + pvBody();
  save()
}

function pvMore() {
  S.pv.n += 40;
  $('#pv').innerHTML = '<b>Vocabulary</b>' + pvBody()
}
