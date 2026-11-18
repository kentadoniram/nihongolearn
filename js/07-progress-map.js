/* js/07-progress-map.js
 * Purpose: Progress: memory map as a colour gradient, grouped by JLPT level with See more.
 * Defines (7): MAP_SHOW, mapColor, mapCell, mapGroup, mapBody, progMap, mapMore
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const MAP_SHOW = 60;

// Gradient from red (nearly forgotten) through yellow to green (strong); words you have not met are grey.
const mapColor = r => `hsl(${Math.round(r*120)} 62% 78%)`;

// One word of the map: coloured by how well you remember it, with the percentage for screen readers.
function mapCell(w, i, now) {
  const it = S.i[w.w],
    r = it ? Math.max(0, Math.min(1, ret(it, now))) : null,
    txt = r == null ? 'not met yet' : Math.round(r * 100) + '% remembered';
  return `<span class="mc${r==null?' u':''}" onclick="dict(${i})" ${r==null?'':'style="background:'+mapColor(r)+'"'} title="${e(w.m||'')}: ${txt}" aria-label="${e(w.w)}, ${txt}">${e(w.w)}</span>`
}

// A level: its title with how many words you have met, the first cells, and a See more button.
function mapGroup(k, A, now) {
  const L = A.filter(w => !w.g && vocabLevel(w) == k).sort((a, b) => (ZR[a.w] || 9e9) - (ZR[b.w] || 9e9)),
    n = (S.pm = S.pm || {})[k] || MAP_SHOW;
  if (!L.length) return '';
  const met = L.filter(w => S.i[w.w]).length;
  return `<div class="mg"><div class="mgh"><b>${k=='W'?'Work':'N'+k}</b> <span class="mu">${met} of ${L.length} met</span></div><div class="grid">${L.slice(0,n).map(w=>mapCell(w,A.indexOf(w),now)).join('')}</div>` + (L
    .length > n ? `<button class="sec" onclick="mapMore('${k}')">See more (${L.length-n} more)</button>` :
    '') + `</div>`
}

const mapBody = () => {
  const A = W(),
    now = Date.now();
  return `<div class="legend"><span>forgotten</span><i class="gbar"></i><span>strong</span><span class="mc u">not met</span></div>` + ['5',
    '4', '3', '2', '1', 'W'].map(k => mapGroup(k, A, now)).join('')
};
const progMap = () => `<div class="card" id="pmap"><b>Memory map</b>${mapBody()}</div>`;
function mapMore(k) {
  S.pm[k] = (S.pm[k] || MAP_SHOW) + 120;
  $('#pmap').innerHTML = '<b>Memory map</b>' + mapBody()
}
