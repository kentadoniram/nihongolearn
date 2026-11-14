/* js/09-display-helpers.js
 * Purpose: Romaji output, tappable kanji and explanations for wrong answers.
 * Defines (7): RM, romaji, kc, lk, lvb, why, tyWhy
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const RM = {};
'あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto なna にni ぬnu ねne のno はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya ゆyu よyo らra りri るru れre ろro わwa をo んn がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda ぢji づzu でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo'
  .split(' ').forEach(p => RM[p[0]] = p.slice(1));
function romaji(r) {
  r = hira(r);
  let o = '';
  for (let i = 0; i < r.length; i++) {
    const c = r[i],
      n = r[i + 1];
    if (c == 'っ') {
      const nx = RM[n] || '';
      o += nx.startsWith('ch') ? 't' : nx[0] || '';
      continue
    }
    if (c == 'ー') {
      o += o.slice(-1);
      continue
    }
    if (c == 'ん') {
      o += /[あいうえおやゆよ]/.test(n || '') ? "n'" : 'n';
      continue
    }
    let b = RM[c] || c;
    if (n && 'ゃゅょ'.includes(n)) {
      b = (b == 'shi' ? 'sh' : b == 'chi' ? 'ch' : b == 'ji' ? 'j' : b.slice(0, -1) + 'y') + { ゃ: 'a',
        ゅ: 'u', ょ: 'o' }[n];
      i++
    }
    o += b
  }
  return o
}

const kc = c => K.test(c) && KJ[c] ? `<span class="kj" tabindex="0" data-k="${c}">${c}</span>` : e(c);
const lk = w => `<a class="wl lx" data-lx="w:${e(w.w)}">${[...w.w].map(c=>K.test(c)&&KJ[c]?`<span class="kj" tabindex="0" data-k="${c}" data-w="${W().indexOf(w)}">${c}</span>`:e(c)).join('')}</a>`;
const lvb = w => (S.hl && !w.t) || !w.l ? '' : `<span class="lv">${w.t?'Work':'N'+w.l}</span>`,
  exOf = w => w.e,
  exLine = w => {
  const x = exOf(w);
  return x ? `<span class="mu">Correct usage: ${ej(x[0])} (${e(x[1])})</span>` : ''
};
function why(w, x) {
  const e = ej,
    A = [...x.w].filter(c => K.test(c)),
    B = [...w.w].filter(c => K.test(c)),
    lkp = [];
  A.forEach(a => B.forEach(b => {
    if (a != b && look(a, b)) lkp.push([a, b])
  }));
  let r;
  if (lkp.length) r = `${e(lkp[0][0])} and ${e(lkp[0][1])} look alike, so they are easy to swap. ${e(x.w)} means “${e(x.m)}”, while ${e(w.w)} means “${e(w.m)}”.`;
  else if (A.some(a => B.includes(a))) r = `Both words share a kanji, which is why they feel alike. ${e(x.w)} means “${e(x.m)}”, while ${e(w.w)} means “${e(w.m)}”.`;
  else if ([...bg(x.r)].some(b => bg(w.r).has(b))) r = `They sound alike (${e(x.r)} and ${e(w.r)}), so listen for the difference. ${e(x.w)} means “${e(x.m)}”.`;
  else r = `${e(x.w)} (${romaji(x.r)}) means “${e(x.m)}”, which is a different word.`;
  return r + '<br>' + (exLine(w) || `${e(w.w)} (${e(w.r)}) means “${e(w.m)}”.`)
}

const tyWhy = (w, v) => `You wrote ${e(v||'nothing')}. The reading is ${ej(w.r)} (${romaji(w.r)}). Long vowels (ou, ei) and the small っ pause are the usual traps.<br>${exLine(w)}`;
