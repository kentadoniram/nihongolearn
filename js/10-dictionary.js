/* js/10-dictionary.js
 * Purpose: Dictionary and kanji views.
 * Defines (8): dv, dictLinks, dictBlock, dictExample, dictMemory, dict, kdHead, kd
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
function dv(h) {
  const d = $('#dv');
  d.innerHTML = `<div class="w"><button class="sec" onclick="dvClose()">Close</button>${h}</div>`;
  d.hidden = false;
  d.scrollTop = 0;
  dvOpen()
}

const dictLinks = list => list.map(x => `<a class="wl" onclick="dict(${W().indexOf(x)})">${e(x.w)}</a>`)
  .join(' ');

// A heading and the pieces under it, or nothing when there are none.
const dictBlock = (title, html) => html ? `<p>${title}</p>${html}` : '';
const dictExample = (ex, w) => ex ? `<div class="card"><b>Example</b><p>${ej(ex[0],w)}</p><p class="mu" style="text-align:left">${e(ex[1])}</p></div>` :
  '';
const dictMemory = it => it ? `<p class="mu" style="text-align:left">Your memory of this word: ${Math.round(ret(it,Date.now())*100)}%, seen ${it.n} times, missed ${it.l}.</p>` :
  '';
function dict(i) {
  const w = W()[i];
  if (!w || w.g) return;
  const ks = [...new Set([...w.w].filter(c => K.test(c)))],
    rel = W().filter(x => !x.g && x !== w && ks.some(c => x.w.includes(c)))
    .slice(0, 8),
    la = [...new Set(ks.flatMap(c => SIM.filter(g => g.includes(c)).join('')
        .split('')))].filter(x => !ks.includes(x)),
    kanji = ks.map(c => `<span class="kj" tabindex="0" data-k="${c}" data-w="${i}">${c}</span>`)
    .join(' ');
  dv(`<div class="big">${ruby(w,1)}</div><p class="mean">${e(w.m)} ${lvb(w)}</p><p class="mu">Reading ${e(w.r)} (${romaji(w.r)}). Audio comes later.</p>` + dictExample(exOf(w),
      w.w) + (ks.length ? dictBlock('Kanji', kanji) : '') + (rel.length ? dictBlock('Related words', dictLinks(rel)) :
      '') + (la.length ? dictBlock('Look-alike kanji', la.map(x => kc(x))
        .join(' ')) : '') + gr(w) + vtab(w) + dictMemory(S.i[w.w]))
}

// The top of a kanji page: the kanji with its meaning and readings.
const kdHead = (c, k) => `<div class="big">${c}</div>` + (k ? `<p class="mean">${e(k.m)} ${S.hl?'':'<span class="lv">N'+k.l+'</span>'}</p><p class="mu">On: ${e(k.on)}. Kun: ${e(k.kun)}.</p>` :
  '<p class="mu">No detailed entry yet.</p>');
function kd(c) {
  const k = KJ[c],
    ws = W().filter(x => !x.g && x.w.includes(c)),
    la = [...new Set(SIM.filter(g => g.includes(c)).join('').split(''))].filter(x => x != c);
  dv(kdHead(c, k) + `<p>Words in your deck</p>${dictLinks(ws)||'<span class="mu">none yet</span>'}` + (la
      .length ? dictBlock('Looks like', la.map(x => kc(x)).join(' ')) : ''))
}
