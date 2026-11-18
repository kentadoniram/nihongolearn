/* js/07-progress-patterns.js
 * Purpose: Progress: sentence patterns with JLPT level and difficulty filters.
 * Defines (7): PP_D, ppSet, ppCount, ppRow, ppBody, ppCard, ppf
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Difficulty bands of a pattern, 1 to 5.
const PP_D = ['', 'Beginner', 'Pre-intermediate', 'Intermediate', 'Upper-intermediate', 'Advanced'],
  PP_LV = [['', 'All levels'], ['5', 'N5'], ['4', 'N4'], ['3', 'N3']],
  PP_DF = [['', 'Any difficulty']].concat(PP_D.slice(1).map((t, i) => [String(i + 1), t]));

// Patterns that pass the filters, easiest first.
const ppSet = F => FM.filter(f => (!F.lv || String(f.l) == F.lv) && (!F.d || String(f.d) == F.d))
  .sort((a, b) => a.d - b.d || b.l - a.l || a.name.localeCompare(b.name));

// Practice sentences that train a pattern (to build or to type).
const ppCount = f => SN.filter(x => x.f == f.id).length + TY.filter(x => x.f == f.id)
  .length;
const ppRow = f => `<div class="vr" onclick="pat('${f.id}')" style="cursor:pointer"><span><b>${e(f.name)}</b>${S.hl?'':' <span class="lv">N'+f.l+'</span>'}<br><span class="mu">${f.blocks.map(e).join(' + ')}</span><br>` + `<span class="mu">${ppCount(f)} practice sentences</span></span><span class="pill">${PP_D[f.d]}</span></div>`;
function ppBody() {
  const F = S.pp = S.pp || { lv: '', d: '' },
    L = ppSet(F),
    ch = (k, list) => vocabChips(F, k, list, 'ppf');
  return `<p class="mu" style="text-align:left;margin:6px 0 2px">JLPT level</p>${ch('lv', PP_LV)}<p class="mu" style="text-align:left;margin:6px 0 2px">Difficulty</p>${ch('d', PP_DF)}` + `<p class="mu" style="text-align:left;margin:8px 0 4px">${L.length} patterns. Tap one to see how it works.</p>` + (L
    .length ? L.map(ppRow).join('') : '<p class="mu">No patterns match these filters.</p>')
}

const ppCard = () => `<div class="card" id="pp"><b>Sentence patterns</b>${ppBody()}</div>`;
function ppf(k, v) {
  S.pp[k] = v;
  $('#pp').innerHTML = '<b>Sentence patterns</b>' + ppBody();
  save()
}
