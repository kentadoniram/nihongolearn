/* js/07-level-strip.js
 * Purpose: Level names and the strip of level progress, built from small pieces.
 * Defines (4): LV, stripTop, stripRound, strip
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const LV = ['Seedling', 'Student', 'Reader', 'Decoder', 'Tracker', 'Sage'];

// The row at the top: back link, level, XP bar, combo, today's count and the add-a-word link.
function stripTop(l, lo, hi, q) {
  const back = hist.length && hi > 0 ? '<a class="wl" onclick="nav(-1)">‹ Back</a>' : '',
    bar = `<div class="xp" title="XP to next level"><i style="width:${(S.xp-lo)/(hi-lo)*100}%"></i></div>`;
  return `<div class="strip">${back}<span><b>Lv ${l+1}</b> ${LV[Math.min(l,5)]}</span>${bar}<span class="cmb">${cmb>1?'x'+cmb:''}</span>` + `<span class="mu" style="margin:0">${q}/12</span><a class="wl" onclick="practice(1)">+ word</a></div>`
}

const stripRound = () => `<div class="rb" title="round progress"><i style="width:${rd.n/8*100}%"></i></div>`;
function strip() {
  const x = S.xp,
    l = Math.floor(Math.sqrt(x / 40)),
    lo = 40 * l * l,
    hi = 40 * (l + 1) * (l + 1),
    q = S.q && S.q.d == new Date().toDateString() ? S.q.n : 0;
  $('#st').innerHTML = stripTop(l, lo, hi, q) + stripRound()
}
