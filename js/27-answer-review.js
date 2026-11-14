/* js/27-answer-review.js
 * Purpose: Answer review for sentence writing, with highlighted differences.
 * Defines (6): diffTok, revMark, revBox, revTyped, revTiles, revNote
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Longest common subsequence of two lists; returns which items of each list are shared (1) or different (0).
function diffTok(a, b) {
  const n = a.length,
    m = b.length,
    L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)),
    fa = new Array(n).fill(0),
    fb = new Array(m).fill(0);
  for (let i = n - 1; i >= 0; i--)
  for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j],
    L[i][j + 1]);
  let i = 0,
    j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      fa[i] = fb[j] = 1;
      i++;
      j++
    } else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++
  }
  return { a: fa, b: fb }
}

// Items that are not shared get a <mark> (class d = yours differs, i = what the correct sentence has instead).
const revMark = (items, flags, cls, sep) => items.map((x, i) => flags[i] ? e(x) : `<mark class="${cls}">${e(x)}</mark>`)
  .join(sep || '');

// One block with both answers; the correct answer is always shown, whether or not the user got it right.
const revBox = (yours, correct, notes, ok, extra) => `<div class="rev"><div class="rv"><small>Your answer</small><div class="${ok?'':'wrongline'}">${yours}</div></div><div class="rv"><small>Correct answer</small><div>${correct}</div></div>${notes.length?`<ul class="rn">${notes.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}${extra||''}</div>`;
const revNote = (t, i, L, prev, tail) => {
  const k = L.indexOf(t),
    before = k > 0 ? L[k - 1] : null;
  if (k < 0) return `${e(t)} is not part of this sentence.`;
  if (k >= L.length - tail) return `${e(t)} belongs to the ending, so it must come last.`;
  if (PT.includes(t) && t.length == 1) return `${e(t)} must come right after ${e(before||'the first word')} (${e((before||'')+t)}), but in your sentence it ${prev?'follows '+e(prev):'comes first'}.`;
  return `${e(t)} should come ${before?'after '+e(before):'first'}, but in your sentence it comes ${prev?'after '+e(prev):'first'}.`
};

// Tile builder: compare the order of the tiles.
function revTiles(q, t, ok) {
  const L = q.t,
    d = diffTok(t, L),
    tail = q.tail || 1,
    notes = [];
  t.forEach((x, i) => {
    if (!d.a[i]) notes.push(revNote(x, i, L, i ? t[i - 1] : '', tail))
  });
  if (ok && notes.length) notes.unshift('Your order is also natural Japanese, so it counts as correct. This is how it differs from the usual order:');
  if (!notes.length) notes.push('Your order matches the correct sentence.');
  return revBox(revMark(t, d.a, 'd', ' '), revMark(L, d.b, 'i', ' '), notes, ok)
}

// Typed sentence: compare the kana of your answer with the kana of the target (romaji, hiragana and katakana all count).
function revTyped(q, v, r) {
  const P = /[。、！？.,!?\s]/g,
    shown = x => [...hira(x).replace(P, '')],
    tu = shown(r.ur || ''),
    nu = [...r.un],
    tc = shown(q.r.join('')),
    nt = [...nkana(q.r.join(''))];
  if (tu.length != nu.length || tc.length != nt.length) return revBox(e(v), ej(q.t.join(' ')), [], r.ok);
  const d = diffTok(nu, nt),
    notes = [];
  q.t.forEach((t, i) => {
    const rd = nkana(q.r[i]);
    if (rd && !r.un.includes(rd) && !r.alt.some(a => a.from == t)) notes.push(`${ej(t)} (${e(q.r[i])}, ${romaji(q.r[i])}) is missing or written differently.`)
  });
  const runs = [];
  let cur = '';
  tu.forEach((c, i) => {
    if (!d.a[i]) cur += c;
    else if (cur) {
      runs.push(cur);
      cur = ''
    }
  });
  if (cur) runs.push(cur);
  if (runs.length && !r.ok) notes.push(`In your answer these parts do not match the correct sentence: ${runs.map(x=>'<b>'+e(x)+'</b>').join(', ')}.`);
  r.msg.slice(0, 3).forEach(m => notes.push(ej(m)));
  if (r.ok && !notes.length) notes.push('Your sentence matches.');
  if (r.ok && r.alt.length) notes.unshift('Accepted: you used a different but fitting word or form.');
  const yours = `${e(v)}<div class="mu" style="text-align:left;margin:2px 0">In kana: ${revMark(tu,d.a,'d')}</div>`,
    corr = `${ej(q.t.join(' '))}<div class="mu" style="text-align:left;margin:2px 0">In kana: ${revMark(tc,d.b,'i')}<br>${romajiS(q.r)}</div>`;
  return revBox(yours, corr, notes, r.ok)
}
