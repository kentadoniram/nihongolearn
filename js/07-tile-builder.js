/* js/07-tile-builder.js
 * Purpose: Tile builder helpers: odd-one-out words and kana tiles.
 * Defines (4): oddg, bshow, bp, bu
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
function oddg(w) {
  const A = W().filter(x => !x.g && (lvOpen(x.l) || S.i[x.w])),
    ks = [...w.w].filter(c => K.test(c) && A.filter(x => x.w.includes(c))
    .length >= 3);
  if (!ks.length) return null;
  const ch = rnd(ks),
    g = shuffle(A.filter(x => x.w.includes(ch) && x.w != w.w)).slice(0, 2)
    .concat(w),
    od = rnd(A.filter(x => !x.w.includes(ch)).sort((a, b) => sim(g[0], b) - sim(g[0], a))
    .slice(0, 5));
  return { ch, odd: od, o: shuffle(g.concat(od)) }
}

function bshow() {
  const c = cur;
  $('#bs').innerHTML = c.sel.map((k, i) => `<button class="tile on" onclick="bu(${i})">${e(c.pool[k])}</button>`)
    .join('') || '<span class="mu">Tap the kana in order</span>';
  $('#bp').innerHTML = c.pool.map((ch, k) => `<button class="tile" ${c.sel.includes(k)?'disabled':''} onclick="bp(${k})">${e(ch)}</button>`)
    .join('')
}

function bp(k) {
  cur.sel.push(k);
  bshow()
}

function bu(i) {
  cur.sel.splice(i, 1);
  bshow()
}
