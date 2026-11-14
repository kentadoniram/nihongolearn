/* js/14-typed-translation.js
 * Purpose: Fonts, romaji to kana and typed translation.
 * Defines (15): RK, FONTS, setFont, toKana, toK1, EN, ending, PR, diagT, tq, typ, TB, tbIn, tbRec, ...
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
    je: 'じぇ' }).forEach(([a, b]) => RK.set(a, b));

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

const EN = [[/ませんでした$/, 'past negative (polite)'], [/でした$/, 'was / were (polite)'], [/ました$/, 'past (polite)'],
  [/ません$/, 'negative (polite)'], [/[てで]います$/, 'ongoing or resulting state (-ている)'], [/ですか$/, 'question (polite)'],
  [/たいです$/, 'want to (-たい)'], [/[てで]ください$/, 'please do (-てください)'], [/ます$/, 'present or future (polite)'],
  [/です$/, 'is / am / are (polite)']];
const ending = x => (EN.find(y => y[0].test(x)) || [])[1];
const PR = { は: 'topic', が: 'subject', を: 'object', に: 'target, destination or time', で: 'place of action or means',
  へ: 'direction', と: 'together with', も: 'also' };
function diagT(q, un, cn, hk) {
  const m = [],
    nz = x => x.replace(/を/g, 'お').replace(/は/g, 'わ').replace(/へ/g, 'え'),
    a = ending(un),
    b = ending(cn);
  if (hk) m.push('I could not read some kanji in your answer. Try writing those words in hiragana or romaji.');
  if (a != b) m.push(`Tense or form: your sentence ends as “${a||'no clear verb ending'}”, but it needs “${b}”.`);
  if ([...un].sort().join('') == [...cn].sort().join('')) m.push('You have the right pieces in the wrong order. Japanese keeps each particle right after its word and puts the verb last. English order (subject, verb, object) does not carry over.');
  else {
    const tl = nz(q.r[q.r.length - 1]);
    if (!un.endsWith(tl) && un.includes(tl)) m.push('The verb (predicate) must come last in a Japanese sentence.');
    q.t.forEach((t, i) => {
      if (PR[t] && i) {
        if (!un.includes(nz(q.r[i - 1] + q.r[i]))) m.push(`Check the particle after ${q.t[i-1]}: it needs ${t} (${PR[t]}).`)
      } else if (!PR[t] && i < q.t.length - 1 && !un.includes(nz(q.r[i]))) m.push(`I cannot find ${t} (${q.r[i]}) in your answer.`)
    })
  }
  return m
}

let tq = null;
function typ() {
  S.bm = 'type';
  const P = TY.filter(open3),
    rc = S.trec,
    pf = S.pf = S.pf || {};
  if (!P.length) {
    $('#m').innerHTML = '<div class="card">No typing exercises yet.</div>';
    return
  }
  const last = rc.length ? TY.find(x => x.en == rc[rc.length - 1]) : null,
    c = P.filter(x => !rc.includes(x.en)),
    A = c.length ? c : P,
    w = x => (1 + ((S.cxw || {})[x.f] || 0) * .4) * (last && x.k == last.k ? .3 : 1) / (1 + (pf['t' + x
        .en] || 0) * .7) + .05;
  let r = Math.random() * A.reduce((a, x) => a + w(x), 0),
    q = A[A.length - 1];
  for (const x of A) {
    r -= w(x);
    if (r <= 0) {
      q = x;
      break
    }
  }
  if (GEN.frames && Math.random() < .6) q = gs();
  q = tq = { ...q };
  const f = fm(q.f);
  $('#m').innerHTML = `${f?`<div class="card pat" onclick="pat('${f.id}')"><div class="mu" style="text-align:left;margin:0">Pattern: <b>${e(f.name)}</b> <a class="wl">how it works</a></div><div class="blks">${blk(f)}</div></div>`:''}<div class="card q-tr"><div class="mu" style="display:flex;justify-content:space-between;margin:0"><span>Translate into Japanese${S.hl?'':' <span class="lv">N'+q.l+'</span>'}</span><a class="wl" onclick="S.bm='tile';save();bld()">Tiles</a></div><div class="mean">${e(q.en)}</div><input id="ti2" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="romaji, hiragana or kanji" aria-label="your answer"><button class="pri" onclick="tc()">Check</button><button class="skip" onclick="tskip()">Skip</button></div><div id="fb"></div>`;
  const i = $('#ti2');
  i.focus();
  etStart();
  TB = { tf: 0, dr: '', snaps: [], del: 0, rev: 0, pk: 0, lt: 0, ll: 0, pv: '' };
  i.oninput = tbIn;
  i.onkeydown = ev => {
    if (ev.key == 'Enter') tc()
  }
}

let TB = { tf: 0, dr: '', snaps: [], del: 0, rev: 0, pk: 0, lt: 0, ll: 0, pv: '' };
function tbIn() {
  const i = $('#ti2'),
    n = Date.now(),
    v = i.value;
  if (!TB.tf) TB.tf = n - ET.t0;
  if (TB.lt && n - TB.lt > 1500 && TB.ll > 2 && TB.snaps[TB.snaps.length - 1] !== TB.pv) {
    TB.snaps.push(TB.pv);
    if (!TB.dr) TB.dr = TB.pv
  }
  if (v.length < TB.ll) {
    TB.del += TB.ll - v.length;
    if (TB.ll - v.length > 3) TB.rev++
  }
  TB.pk = Math.max(TB.pk, v.length);
  TB.lt = n;
  TB.ll = v.length;
  TB.pv = v
}

function tbRec(q, v, E, r) {
  const T = TB,
    rec = { t: Date.now(), k: 'type', id: q.en, dr: (T.dr || v).slice(0, 80), fin: v.slice(0, 80), sn: T
    .snaps.slice(0, 4).map(x => x.slice(0, 60)), del: T.del, rev: T.rev, pk: T.pk, tf: Math.round(T.tf),
    ta: Math.round(E.act), ok: r.ok ? 1 : 0, pct: r.pct, alt: r.alt.length };
  (S.cx = S.cx || []).push(rec);
  if (S.cx.length > 200) S.cx.shift();
  logEv({ k: 't', id: q.en, ty: 'type', ok: r.ok, E, keys: ['f:' + q.f, 'ty:type'].concat(r.msg.length ?
        ['err:' + r.msg[0].slice(0, 24)] : []), ctx: `${q.en}|${v}|${q.t.join('')}`.slice(0, 200) })
}

function tc() {
  const q = tq,
    v = $('#ti2').value;
  if (!q || q.done || !v.trim()) return;
  q.done = 1;
  const E = etEnd(),
    r = evalT(q, v),
    ok = r.ok,
    pf = S.pf = S.pf || {};
  tbRec(q, v, E, r);
  if (ok) {
    S.xp += 20;
    pf['t' + q.en] = (pf['t' + q.en] || 0) + 1
  } else if (q.f) S.cxw = Object.assign(S.cxw || {}, { [q.f]: ((S.cxw || {})[q.f] || 0) + (r.pct < 70 ?
        1 : .5) });
  tick();
  S.trec.push(q.en);
  if (S.trec.length > 8) S.trec.shift();
  save();
  const sib = q.sib || TY.filter(x => x.k == q.k && x.en != q.en && open3(x))
    .slice(0, 3),
    pc = x => Math.round(x * 100),
    al = r.alt.map(a => `${a.from} → ${a.to} (${a.m})${a.n?': '+a.n:''}`)
    .join('; ');
  $('#fb').innerHTML = `<div class="card fb ${ok?'':'r'}"><b>${ok?'✓ Correct'+(r.alt.length?' (accepted variation)':'')+', +20 XP':'✗ '+r.pct+'% close'}</b>${ok?'':`<p class="mu" style="text-align:left;margin:4px 0">Words ${pc(r.p.w)}%, particles ${pc(r.p.p)}%, form ${pc(r.p.f)}%, order ${pc(r.p.o)}%</p><ul style="margin:6px 0;padding-left:18px">${(r.msg.length?r.msg:['Some words or endings differ from the target sentence.']).slice(0,4).map(x=>`<li>${ej(x)}</li>`).join('')}</ul><p class="mu" style="text-align:left;margin:4px 0">Japanese verbs do not change for I, you, he or they, so there is no subject-verb agreement to get wrong. The form depends on tense and politeness.</p>`}${al?`<p class="mu" style="text-align:left;margin:4px 0">Word choice: ${ej(al)}</p>`:''}${ok&&q.ex?`<p class="mu" style="text-align:left;margin:4px 0">Other natural orders: ${ej(q.ex.join('   '))}</p>`:''}${trioT(q)}${sib.length?`<p class="mu" style="text-align:left;margin:4px 0">Same idea, other structures: ${sib.map(x=>e(x.en+' '+x.t.join(''))).join(' / ')}</p>`:''}<button class="pri" onclick="adv('t')">Next</button></div>`;
  if (ok && S.aa !== false) {
    const q0 = q;
    setTimeout(() => {
      if (tq === q0 && $('nav .on') && $('nav .on').dataset.v == 'b') adv('t')
    }, 3200)
  }
}
