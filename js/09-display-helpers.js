/* js/09-display-helpers.js
 * Purpose: Romaji output, tappable kanji and level labels.
 * Defines (5): RM, romaji, kc, lk, lvb
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
    if (n && 'ぁぃぅぇぉ'.includes(n)) {
      // foreign-sound kana: ふぉ fo, てぃ thi, でぃ dhi, しぇ she, うぃ wi
      const v = 'aiueo'['ぁぃぅぇぉ'.indexOf(n)];
      b = c == 'ふ' ? 'f' + v : c == 'て' ? 'th' + v : c == 'で' ? 'dh' + v : c == 'う' ? 'w' + v : b.slice(0,
        -1) + v;
      i++;
      o += b;
      continue
    }
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
  return x ? `<span class="mu">Correct usage: ${ej(x[0],w.w)} (${e(x[1])})</span>` : ''
};
