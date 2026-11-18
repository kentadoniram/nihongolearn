/* js/31-wrong-answers.js
 * Purpose: Wrong answers: what the chosen answer means, why it does not fit, and an example with it.
 * Defines (14): FORM_LBL, FORMMAP, formMap, optInfo, fillBlank, hasBlank, wordReason, relNote, why, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const FORM_LBL = { dict: 'dictionary form', masu: 'polite form', mase: 'polite negative', mashita: 'polite past',
  masendeshita: 'polite past negative', nai: 'plain negative', nakatta: 'plain past negative', naide: 'ないで form',
  nakereba: 'form for “must”', te: 'て-form', ta: 'plain past', tai: 'form for “want to”', mashou: 'form for “let us”',
  teimasu: 'form for “is doing”', tari: 'たり form', tara: 'たら form', ba: 'ば form', pot: 'potential form',
  pas: 'passive form', cau: 'causative form', caupas: 'causative-passive form', vol: 'volitional form',
  imp: 'imperative' };
let FORMMAP = null,
  FORMN = -1;

// Every form of every verb in the deck (kanji or kana) with the verb it comes from.
function formMap() {
  if (FORMMAP && FORMN === V.length) return FORMMAP;
  FORMN = V.length;
  FORMMAP = {};
  V.forEach(w => {
    if (w.g || posOf(w) != 'verb' || !vclass(w)) return;
    ['dict'].concat(FORMS_V).forEach(f => {
      const x = conj(w, f);
      if (!x) return;
      if (!FORMMAP[x.s]) FORMMAP[x.s] = [w, f];
      if (!FORMMAP[x.r]) FORMMAP[x.r] = [w, f]
    })
  });
  return FORMMAP
}

// What a choice is: {what: html, ex: [japanese, english], w: word}, or null when the deck knows nothing about it.

// counter = the choices are counters (枚, 本, 冊), so a bare 本 means the counter and not the book.
function optInfo(t, counter) {
  if (!LEXRE) mkLex();
  const ct = WM['〜' + t],
    x = EXPR[EXI[t]],
    w = WM[t],
    ctr = c => ({ what: `the counter ${e(t)}: ${e(c.m)}`, brief: e(c.m), ex: c.e, w: c });
  if (counter && ct) return ctr(ct);
  if (x) return { what: `${e(x.b)}. ${e(x.f)}`, brief: e(x.b), ex: x.ex && x.ex[0] };
  if (w) return { what: `${lk(w)} ${e(w.r)}: “${e(w.m)}”`, brief: `${e(w.r)}: “${e(w.m)}”`, ex: w.e, w };
  const f = formMap()[t];
  if (f) return { what: `the ${FORM_LBL[f[1]]} of ${lk(f[0])} “${e(f[0].m)}”`, brief: `the ${FORM_LBL[f[1]]} of “${e(f[0].m)}”`,
    ex: f[0].e, w: f[0] };
  if (ct) return ctr(ct);
  if (t.length == 1 && KJ[t]) {
    const k = KJ[t],
      u = W().find(z => !z.g && z.e && z.w.includes(t));
    return { what: `the kanji ${e(t)}: “${e(k.m)}” (on ${e(hira(k.on))}, kun ${e(k.kun)})`, brief: `“${e(k.m)}”`,
      ex: u && u.e, w: u }
  }
  const same = W().filter(z => !z.g && hira(z.r) == hira(t));
  if (same.length) {
    const how = same.slice(0, 2).map(z => lk(z) + ' “' + e(z.m) + '”').join(' or ');
    return { what: `how to read ${how}`, brief: `how to read ${how}`, ex: same[0].e, w: same[0] }
  }
  const mw = W().find(z => !z.g && z.m == t);
  if (mw) return { what: `the meaning of ${lk(mw)} ${e(mw.r)}`, brief: `the meaning of ${lk(mw)}`, ex: mw
    .e, w: mw };
  return null
}

// The sentence with your choice written into its blank.
const fillBlank = (s, t) => s.replace(/[＿_]+/, t);
const hasBlank = s => /[＿_]{2,}|＿/.test(s || '');

// Why a wrong word is not the right word: look-alike kanji, a shared kanji, a similar sound, or a different kind of word.
function wordReason(w, x) {
  const A = [...x.w].filter(c => K.test(c)),
    B = [...w.w].filter(c => K.test(c)),
    lkp = [];
  A.forEach(a => B.forEach(b => {
    if (a != b && look(a, b)) lkp.push([a, b])
  }));
  let r;
  if (lkp.length) r = `${ej(lkp[0][0])} and ${ej(lkp[0][1])} look alike, so they are easy to swap. ${ej(x.w)} means “${e(x.m)}”, while ${ej(w.w)} means “${e(w.m)}”.`;
  else if (A.some(a => B.includes(a))) r = `Both words share a kanji, which is why they feel alike. ${ej(x.w)} means “${e(x.m)}”, while ${ej(w.w)} means “${e(w.m)}”.`;
  else if ([...bg(x.r)].some(b => bg(w.r).has(b))) r = `They sound alike (${e(x.r)} and ${e(w.r)}), so listen for the difference. ${ej(x.w)} means “${e(x.m)}”, while ${ej(w.w)} means “${e(w.m)}”.`;
  else r = `${ej(x.w)} (${romaji(x.r)}) means “${e(x.m)}”, which is a different word from ${ej(w.w)} “${e(w.m)}”.`;
  if (posOf(x) != posOf(w)) r += ` ${e(x.w)} is a ${posOf(x)}, but the answer is a ${posOf(w)}.`;
  return r
}

// How the two words are related, when the deck has a note about it.
function relNote(w, x) {
  const z = (G[w.w] || []).find(r => r.w == x.w && r.n);
  return z ? `<br>How they differ: ${e(z.n)}` : ''
}

// Word choices: what you chose, why it is wrong, an example with it and the correct usage.
function why(w, x) {
  const ex = x.e ? `<div><b>Example with your answer</b> ${ej(x.e[0],x.w)} <span class="mu">(${e(x.e[1])})</span></div>` :
    '',
    use = exLine(w) || `${e(w.w)} (${e(w.r)}) means “${e(w.m)}”.`;
  return `<div class="wa"><div><b>You chose</b> ${lk(x)} ${e(x.r)} (${romaji(x.r)}): “${e(x.m)}” ${lvb(x)}</div>` + `<div><b>Why it is wrong</b> ${wordReason(w,x)}${relNote(w,x)}</div>${ex}<div>${use}</div></div>`
}

// Odd one out: the choice does contain the shared kanji, so it belongs with the others.
function wrongOdd(x, c) {
  const ex = x.e ? `<div><b>Example with your answer</b> ${ej(x.e[0],x.w)} <span class="mu">(${e(x.e[1])})</span></div>` :
    '';
  return `<div class="wa"><div><b>You chose</b> ${lk(x)} ${e(x.r)}: “${e(x.m)}”</div><div><b>Why it is wrong</b> ${ej(x.w)} contains ${ej(c.ch)}, ` + `like the other three, so it belongs with them. The odd one out is ${lk(c.odd)} “${e(c.odd.m)}”.</div>${ex}</div>`
}

// Why one choice is not the other: two counters, two expressions, two kanji, two words or two readings.
function optReason(ch, co) {
  const ctr = !!WM['〜' + ch] && !!WM['〜' + co],
    a = optInfo(ch, ctr),
    b = optInfo(co, ctr);
  if (!a || !b) return '';
  if (ctr) return `${e(ch)} is a ${a.brief}. This sentence needs ${e(co)}, a ${b.brief}.`;
  if (a.w && b.w && !WM['〜' + ch] && a.w !== b.w && !a.w.g && !b.w.g) return wordReason(b.w, a.w);
  if (ch.length == 1 && co.length == 1 && KJ[ch] && KJ[co]) {
    const one = c => `${e(c)} means “${e(KJ[c].m)}” (on ${e(hira(KJ[c].on))}, kun ${e(KJ[c].kun)})`;
    return `${look(ch, co) ? e(ch) + ' and ' + e(co) + ' look alike, so they are easy to swap. ' : ''}${one(ch)}, while ${one(co)}.`
  }
  return `${e(ch)}: ${a.what}<br>${e(co)}: ${b.what}`
}

// The card under a wrong answer to a choice question: sentence, meaning, reason, example.
function waCard(ch, co, sentence) {
  const ctr = !!WM['〜' + ch] && !!WM['〜' + co],
    a = optInfo(ch, ctr),
    why = optReason(ch, co) || `That choice does not fit here. The right choice was ${e(co)}; the explanation shows why.`,
    parts = [`<div><b>You chose</b> ${e(ch)}${a?': '+a.brief:''}</div>`];
  if (hasBlank(sentence)) parts.push(`<div><b>Your sentence</b> ${ej(fillBlank(sentence,ch))} <span class="mu">does not fit here</span></div>`);
  parts.push(`<div><b>Why it is wrong</b> ${why}</div>`);
  if (a && a.ex) parts.push(`<div><b>Example with your answer</b> ${ej(a.ex[0],a.w&&a.w.w)} <span class="mu">(${e(a.ex[1])})</span></div>`);
  return `<div class="wa">${parts.join('')}</div>`
}

// What went wrong in a typed reading: a small っ, a long vowel, a dakuten, or other letters.
function tyCause(a, b) {
  const nt = x => x.replace(/っ/g, ''),
    nl = x => x.replace(/ー/g, '').replace(/([おこそとのほもよろをごぞどぼぽ])[うお]/g, '$1')
    .replace(/([えけせてねへめれげぜでべぺ])[いえ]/g, '$1').replace(/([あかさたなはまやらわがざだばぱ])あ/g, '$1')
    .replace(/([いきしちにひみりぎじぢびぴ])い/g, '$1').replace(/([うくすつぬふむゆるぐずづぶぷ])う/g, '$1'),
    base = x => x.normalize('NFD').replace(/[\u3099\u309a]/g, '').normalize('NFC');
  if (a == b) return '';
  if (nt(a) == nt(b)) return 'The small っ (a short pause before a hard consonant) is missing or extra.';
  if (nl(a) == nl(b)) return 'The long vowel is the problem: おう, えい, ああ and the like are held twice as long.';
  if (base(a) == base(b)) return 'A dakuten (゛) or handakuten (゜) is missing or extra, which changes the sound.';
  return 'Some of the letters differ from the reading.'
}

// Typed reading: your answer next to the right one, what went wrong, what you wrote actually means, and the correct usage.
function tyWhy(w, v) {
  const raw = String(v || '').trim();
  if (!raw) return `You did not write an answer. The reading is ${ej(w.r)} (${romaji(w.r)}).<br>${exLine(w)}`;
  const kv = hira(toKana(raw.toLowerCase())),
    kr = hira(w.r),
    d = diffTok([...kv], [...kr]),
    same = W().filter(z => !z.g && z !== w && hira(z.r) == kv).slice(0, 2),
    cause = raw == w.w ? 'You wrote the word itself; the question asks for its reading.' : tyCause(kv,
    kr),
    mean = same.length ? `<div><b>What you wrote</b> is how to read ${same.map(z=>lk(z)+' “'+e(z.m)+'”').join(' or ')}.</div>` + (same[0]
    .e ? `<div><b>Example with your answer</b> ${ej(same[0].e[0],same[0].w)} <span class="mu">(${e(same[0].e[1])})</span></div>` :
    '') : `<div><b>What you wrote</b> does not match another word in the deck.</div>`;
  return `<div class="wa"><div><b>You wrote</b> ${e(raw)} <span class="mu">${revMark([...kv],d.a,'d')}</span></div>` + `<div><b>Correct reading</b> ${revMark([...kr],d.b,'i')} <span class="mu">(${romaji(w.r)})</span></div>` + `<div><b>Why it is wrong</b> ${cause}</div>${mean}<div>${exLine(w)}</div></div>`
}
