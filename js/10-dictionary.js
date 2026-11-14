/* js/10-dictionary.js
 * Purpose: Dictionary and kanji views.
 * Defines (3): dv, dict, kd
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
function dv(h) {
  const d = $('#dv');
  d.innerHTML = `<div class="w"><button class="sec" onclick="$('#dv').hidden=true">Close</button>${h}</div>`;
  d.hidden = false;
  d.scrollTop = 0
}

function dict(i) {
  const w = W()[i];
  if (!w || w.g) return;
  const ex = exOf(w),
    it = S.i[w.w],
    ks = [...new Set([...w.w].filter(c => K.test(c)))],
    rel = W().filter(x => !x.g && x !== w && ks.some(c => x.w.includes(c)))
    .slice(0, 8),
    la = [...new Set(ks.flatMap(c => SIM.filter(g => g.includes(c)).join('')
        .split('')))].filter(x => !ks.includes(x));
  dv(`<div class="big">${ruby(w,1)}</div><p class="mean">${e(w.m)} ${lvb(w)}</p><p class="mu">Reading ${e(w.r)} (${romaji(w.r)}). Audio comes later.</p>${ex?`<div class="card"><b>Example</b><p>${[...ex[0]].map(kc).join('')}</p><p class="mu" style="text-align:left">${e(ex[1])}</p></div>`:''}${ks.length?`<p>Kanji</p>${ks.map(c=>`<span class="kj" tabindex="0" data-k="${c}" data-w="${i}">${c}</span>`).join(' ')}`:''}${rel.length?`<p>Related words</p>${rel.map(x=>`<a class="wl" onclick="dict(${W().indexOf(x)})">${e(x.w)}</a>`).join(' ')}`:''}${la.length?`<p>Look-alike kanji</p>${la.map(x=>kc(x)).join(' ')}`:''}${gr(w)}${vtab(w)}${it?`<p class="mu" style="text-align:left">Your memory of this word: ${Math.round(ret(it,Date.now())*100)}%, seen ${it.n} times, missed ${it.l}.</p>`:''}`)
}

function kd(c) {
  const k = KJ[c],
    ws = W().filter(x => !x.g && x.w.includes(c)),
    la = [...new Set(SIM.filter(g => g.includes(c)).join('').split(''))].filter(x => x != c);
  dv(`<div class="big">${c}</div>${k?`<p class="mean">${e(k.m)} ${S.hl?'':'<span class="lv">N'+k.l+'</span>'}</p><p class="mu">On: ${e(k.on)}. Kun: ${e(k.kun)}.</p>`:'<p class="mu">No detailed entry yet.</p>'}<p>Words in your deck</p>${ws.map(x=>`<a class="wl" onclick="dict(${W().indexOf(x)})">${e(x.w)}</a>`).join(' ')||'<span class="mu">none yet</span>'}${la.length?`<p>Looks like</p>${la.map(x=>kc(x)).join(' ')}`:''}`)
}
