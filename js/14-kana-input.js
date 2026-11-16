/* js/14-kana-input.js
 * Purpose: Fonts, and romaji, hiragana and katakana input converted to kana.
 * Defines (5): RK, FONTS, setFont, toKana, toK1
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Typed translation: romaji/hiragana/kanji answers are normalised to hiragana, then compared with the target reading.
const RK = new Map(),
  VW = 'aiueo',
  cs = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[a.length - 1 - i] == b[b.length - 1 - i]) i++;
  return i
};
Object.entries({ '': 'あいうえお', k: 'かきくけこ', s: 'さしすせそ', t: 'たちつてと', n: 'なにぬねの', h: 'はひふへほ', m: 'まみむめも',
    r: 'らりるれろ', g: 'がぎぐげご', z: 'ざじずぜぞ', d: 'だぢづでど', b: 'ばびぶべぼ', p: 'ぱぴぷぺぽ' })
  .forEach(([c, r]) => [...r].forEach((k, j) => RK.set(c + VW[j], k)));
Object.entries({ ya: 'や', yu: 'ゆ', yo: 'よ', wa: 'わ', wo: 'を', shi: 'し', chi: 'ち', tsu: 'つ', fu: 'ふ', ji: 'じ',
    sha: 'しゃ', shu: 'しゅ', sho: 'しょ', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ' })
  .forEach(([a, b]) => RK.set(a, b));
Object.entries({ k: 'き', g: 'ぎ', n: 'に', h: 'ひ', m: 'み', r: 'り', b: 'び', p: 'ぴ' })
  .forEach(([c, k]) => [['ya', 'ゃ'], ['yu', 'ゅ'], ['yo', 'ょ']].forEach(([y, x]) => RK.set(c + y, k + x)));
const FONTS = { kyo: '"Klee","UD Digi Kyokasho N-R","UD デジタル 教科書体 N-R","Hiragino Maru Gothic ProN","Yu Gothic",sans-serif',
  maru: '"Hiragino Maru Gothic ProN","Yu Gothic","Noto Sans JP",sans-serif', sans: '"Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif',
  mincho: '"Hiragino Mincho ProN","Noto Serif JP","Yu Mincho",serif' };
function setFont() {
  if (document.documentElement && document.documentElement.style) document.documentElement.style.setProperty('--jp',
    FONTS[S.fn || 'kyo'])
}

function toKana(s) {
  return s.toLowerCase().split(/\s+/).map(toK1).join('')
}

Object.entries({ sya: 'しゃ', syu: 'しゅ', syo: 'しょ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ', zya: 'じゃ', zyu: 'じゅ',
    zyo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', dya: 'ぢゃ', dyu: 'ぢゅ', dyo: 'ぢょ', she: 'しぇ', che: 'ちぇ',
    je: 'じぇ', fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', thi: 'てぃ', dhi: 'でぃ', wi: 'うぃ', we: 'うぇ' })
  .forEach(([a, b]) => RK.set(a, b));

// Romaji to kana: Hepburn, Kunrei and IME styles, macrons, n/nn/n', doubled consonants (tch too).
function toK1(s) {
  s = s.replace(/ā/g, 'aa').replace(/ī/g, 'ii').replace(/ū/g, 'uu').replace(/ē/g, 'ee')
    .replace(/ō/g, 'ou').replace(/n'/g, 'ん').replace(/'/g, '');
  let o = '';
  const v = x => !!x && /[aiueo]/.test(x);
  for (let i = 0; i < s.length;) {
    const c = s[i],
      d = s[i + 1];
    if (c == '-') {
      o += 'ー';
      i++;
      continue
    }
    if (c == 'n' && !v(d) && d != 'y') {
      if (d == 'n' && !(v(s[i + 2]) || s[i + 2] == 'y')) i += 2;
      else i++;
      o += 'ん';
      continue
    }
    if ((c == d && /[kstphmrgzdbjfc]/.test(c)) || (c == 't' && d == 'c' && s[i + 2] == 'h')) {
      o += 'っ';
      i++;
      continue
    }
    let k = 3,
      hit = 0;
    for (; k > 0; k--) {
      const t = RK.get(s.slice(i, i + k));
      if (t) {
        o += t;
        i += k;
        hit = 1;
        break
      }
    }
    if (!hit) {
      o += c;
      i++
    }
  }
  return o
}
