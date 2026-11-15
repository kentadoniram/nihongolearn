/* js/21-verb-conjugation.js
 * Purpose: Verb conjugation and the synonym check for conjugated verbs.
 * Defines (9): GOD1, ROW, IE, vclass, conj, _vf, vfMap, verbAlt, evalT
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Verb conjugation and the synonym check for conjugated verbs ----

// An answer may use a close-meaning verb in the same form as the expected verb (習います > 学びます); an opposite verb is explained instead.
const GOD1 = ['帰る', '入る', '走る', '知る', '切る', '要る', '減る', '参る', '喋る', '握る', '照る', '練る', '滑る', '限る', '蹴る',
  '焦る', '散る', '湿る', '茂る', 'しゃべる'];
const ROW = { う: 'わいうえお', く: 'かきくけこ', ぐ: 'がぎぐげご', す: 'さしすせそ', つ: 'たちつてと', ぬ: 'なにぬねの', ぶ: 'ばびぶべぼ', む: 'まみむめも',
  る: 'らりるれろ' };
const IE = 'いきしちにひみりぎじびぴえけせてねへめれげぜべぺ';
function vclass(d) {
  if (d.w.endsWith('する') && d.r.endsWith('する')) return 'suru';
  if (d.r == 'くる') return 'kuru';
  const L = d.r.slice(-1);
  if (!ROW[L]) return null;
  if (L == 'る' && d.w.endsWith('る') && IE.includes(d.r.slice(-2, -1)) && !GOD1.includes(d.w)) return 'ichidan';
  return 'godan'
}

// Verbs whose polite stem is irregular: いらっしゃいます, おっしゃいます, くださいます, なさいます.
const HONV = ['いらっしゃる', 'おっしゃる', 'くださる', 'なさる'];

// Forms that ある cannot take, and its irregular negatives.
const ARU = { nai: 'ない', nakatta: 'なかった', naide: 'ないで', nakereba: 'なければならない' };

// Conjugate a verb: ichidan, godan, 来る and する (also compounds such as 勉強する).

// Forms: dict masu mase mashita masendeshita nai nakatta naide nakereba te ta tai mashou teimasu tari tara ba pot pas cau caupas vol imp.
function conj(d, f) {
  const c = vclass(d);
  if (!c) return null;
  if (d.w == 'ある' && ARU[f]) return { s: ARU[f], r: ARU[f] };
  if (d.w == 'ある' && ['pot', 'pas', 'cau', 'caupas', 'imp', 'vol'].includes(f)) return null;
  if (HONV.includes(d.w) && ['pot', 'pas', 'cau', 'caupas', 'imp', 'vol'].includes(f)) return null;
  const U = x => x.slice(0, -1),
    L = d.r.slice(-1),
    suf = {};
  let st;
  if (c == 'suru') {
    st = [d.w.slice(0, -2), d.r.slice(0, -2)];
    Object.assign(suf, { dict: 'する', masu: 'します', mase: 'しません', mashita: 'しました', masendeshita: 'しませんでした',
        te: 'して', ta: 'した', nai: 'しない', nakatta: 'しなかった', naide: 'しないで', nakereba: 'しなければならない', tai: 'したい',
        mashou: 'しましょう', teimasu: 'しています', tari: 'したり', tara: 'したら', ba: 'すれば', pot: 'できる', pas: 'される',
        cau: 'させる', caupas: 'させられる', vol: 'しよう', imp: 'しろ' })
  } else if (c == 'ichidan') {
    st = [U(d.w), U(d.r)];
    Object.assign(suf, { dict: 'る', masu: 'ます', mase: 'ません', mashita: 'ました', masendeshita: 'ませんでした', te: 'て',
        ta: 'た', nai: 'ない', nakatta: 'なかった', naide: 'ないで', nakereba: 'なければならない', tai: 'たい', mashou: 'ましょう',
        teimasu: 'ています', tari: 'たり', tara: 'たら', ba: 'れば', pot: 'られる', pas: 'られる', cau: 'させる', caupas: 'させられる',
        vol: 'よう', imp: 'ろ' })
  } else if (c == 'kuru') {
    const t = { dict: ['来る', 'くる'], masu: ['来ます', 'きます'], mase: ['来ません', 'きません'], mashita: ['来ました', 'きました'],
      masendeshita: ['来ませんでした', 'きませんでした'], te: ['来て', 'きて'], ta: ['来た', 'きた'], nai: ['来ない', 'こない'], nakatta: ['来なかった',
        'こなかった'], naide: ['来ないで', 'こないで'], nakereba: ['来なければならない', 'こなければならない'], tai: ['来たい', 'きたい'],
      mashou: ['来ましょう', 'きましょう'], teimasu: ['来ています', 'きています'], tari: ['来たり', 'きたり'], tara: ['来たら', 'きたら'],
      ba: ['来れば', 'くれば'], pot: ['来られる', 'こられる'], pas: ['来られる', 'こられる'], cau: ['来させる', 'こさせる'], caupas: ['来させられる',
        'こさせられる'], vol: ['来よう', 'こよう'], imp: ['来い', 'こい'] }[f];
    return t ? { s: t[0], r: t[1] } : null
  } else {
    const r = ROW[L],
      mk = t => [U(d.w) + t, U(d.r) + t],
      tt = d.w == '行く' ? 'って' : { う: 'って', つ: 'って', る: 'って', む: 'んで', ぶ: 'んで', ぬ: 'んで', く: 'いて', ぐ: 'いで',
      す: 'して' }[L],
      ta = tt.replace(/て$/, 'た').replace(/で$/, 'だ'),
      ti = HONV.includes(d.w) ? mk('い') : mk(r[1]);
    const X = { dict: [[d.w, d.r], ''], masu: [ti, 'ます'], mase: [ti, 'ません'], mashita: [ti, 'ました'], masendeshita: [ti,
        'ませんでした'], te: [mk(tt), ''], ta: [mk(ta), ''], nai: [mk(r[0]), 'ない'], nakatta: [mk(r[0]), 'なかった'],
      naide: [mk(r[0]), 'ないで'], nakereba: [mk(r[0]), 'なければならない'], tai: [ti, 'たい'], mashou: [ti, 'ましょう'],
      teimasu: [mk(tt), 'います'], tari: [mk(ta), 'り'], tara: [mk(ta), 'ら'], ba: [mk(r[3]), 'ば'], pot: [mk(r[3]),
        'る'], pas: [mk(r[0]), 'れる'], cau: [mk(r[0]), 'せる'], caupas: [mk(r[0]), 'せられる'], vol: [mk(r[4]),
        'う'], imp: [mk(r[3]), ''] }[f];
    return X ? { s: X[0][0] + X[1], r: X[0][1] + X[1] } : null
  }
  return suf[f] === undefined ? null : { s: st[0] + suf[f], r: st[1] + suf[f] }
}

let _vf = null,
  _vn = -1;
function vfMap() {
  if (_vf && _vn == V.length) return _vf;
  _vn = V.length;
  _vf = new Map();
  V.forEach(d => {
    if (d.t || !/[うくぐすつぬぶむる]$/.test(d.r) || posOf(d) != 'verb') return;
    ['masu', 'mase', 'mashita', 'te', 'ta', 'nai', 'nakatta'].forEach(f => {
      const x = conj(d, f);
      if (x) _vf.set(x.s + '|' + x.r, { d, f })
    })
  });
  return _vf
}

function verbAlt(t, rc, u2) {
  const h = vfMap().get(t + '|' + rc);
  if (!h) return {};
  const { d, f } = h,
    o = {};
  for (const c of near(d.w, 2).sort((a, b) => a.d - b.d)) {
    if (posOf(c.w) != 'verb') continue;
    const x = conj(c.w, f);
    if (x && u2.includes(nkana(x.r))) {
      o.alt = { from: t, to: x.s, d: c.d, n: c.n, m: c.w.m, hit: nkana(x.r) };
      break
    }
  }
  for (const c of oppOf(d.w)) {
    if (posOf(c) != 'verb') continue;
    const x = conj(c, f);
    if (x && u2.includes(nkana(x.r))) {
      o.op = `${x.s} (${c.m}) means the opposite of ${t} (${d.m}), so the meaning is reversed.`;
      break
    }
  }
  return o
}

function evalT(q, v) {
  const mp = {};
  q.t.forEach((t, i) => {
    const r = q.r[i];
    mp[t] = r;
    const k = cs(t, r);
    if (k && k < t.length) mp[t.slice(0, t.length - k)] = r.slice(0, r.length - k)
  });
  W().forEach(w => {
    if (K.test(w.w) && !mp[w.w]) mp[w.w] = w.r
  });
  const ur = Object.keys(mp).sort((a, b) => b.length - a.length).reduce((x, k) => x.split(k)
    .join(mp[k]), v.replace(/[A-Za-zāīūēō' -]+/g, toKana)),
    un = nkana(ur),
    cn = nkana(q.r.join('')),
    last = q.t.length - 1,
    alt = [],
    msg = [];
  let u2 = un;
  q.t.forEach((t, i) => {
    if (PR[t]) return;
    if (i == last) {
      const r0 = nkana(q.r[i]);
      if (!u2.includes(r0) && !WM[t]) {
        const vs = verbAlt(t, q.r[i], u2);
        if (vs.alt) {
          u2 = u2.replace(vs.alt.hit, r0);
          alt.push(vs.alt)
        }
        if (vs.op) msg.push(vs.op)
      }
      return
    }
    const rc = nkana(q.r[i]);
    if (u2.includes(rc)) return;
    const wi = WM[t];
    if (!wi) {
      const vs = verbAlt(t, q.r[i], u2);
      if (vs.alt) {
        u2 = u2.replace(vs.alt.hit, rc);
        alt.push(vs.alt)
      }
      if (vs.op) msg.push(vs.op);
      return
    }
    for (const c of near(t, 2).sort((a, b) => a.d - b.d)) {
      const rr = nkana(c.w.r);
      if (rr && u2.includes(rr)) {
        u2 = u2.replace(rr, rc);
        alt.push({ from: t, to: c.w.w, d: c.d, n: c.n, m: c.w.m });
        break
      }
    }
    const op = oppOf(t).find(c => un.includes(nkana(c.r)));
    if (op) msg.push(`${op.w} (${op.m}) means the opposite of ${t} (${wi.m}), so the meaning is reversed.`)
  });
  const ok = (u2 == cn || (q.alts || []).some(a => nkana(a.join('')) == u2)) && !alt.some(a => a.d > 1),
    srt = [...u2].sort().join('') == [...cn].sort().join('');
  alt.filter(a => a.d > 1).forEach(a => msg.push(`${a.to} (${a.m}) is related to ${a.from} but not the same.${a.n?' '+a.n:''}`));
  if (K.test(ur)) msg.push('I could not read some kanji in your answer. Try writing those words in hiragana or romaji.');
  const a = ending(u2),
    b = ending(cn);
  if (a != b && !(srt && u2 != cn)) msg.push(`Tense or form: your sentence ends as “${a||'no clear verb ending'}”, but it needs “${b}”.`);
  const cont = q.t.map((t, i) => [t, i]).filter(([t, i]) => !PR[t] && i != last);
  let ws = 0;
  cont.forEach(([t, i]) => {
    const rc = nkana(q.r[i]);
    if (un.includes(rc)) ws += 1;
    else {
      const x = alt.find(z => z.from == t);
      if (x) ws += x.d == 1 ? .95 : .7
    }
  });
  const prs = q.t.map((t, i) => [t, i]).filter(([t, i]) => PR[t] && i);
  let ps = 0;
  prs.forEach(([t, i]) => {
    const pre = nkana(q.r[i - 1]),
      pr = nkana(q.r[i]);
    if (u2.includes(pre + pr)) {
      ps++;
      return
    }
    const X = [...'おわえにでがともの'].find(c => c != pr && u2.includes(pre + c));
    if (X) {
      const used = ({ お: 'を', わ: 'は', え: 'へ' })[X] || X;
      msg.push((PW[used + '>' + t] || `You used ${used} after ${q.t[i-1]}, but ${t} (${PR[t]}) is needed.`) + ` Correct: ${q.t[i-1]}${t}${q.t.slice(i+1).join('')}.`)
    } else if (u2.includes(pre)) msg.push(`After ${q.t[i-1]} the particle ${t} (${PR[t]}) is missing.`)
  });
  const tl = nkana(q.r[last]),
    tailOk = u2.endsWith(tl);
  if (u2 != cn && srt) msg.push('You have the right pieces in the wrong order. Japanese keeps each particle right after its word and puts the verb last. English order (subject, verb, object) does not carry over.');
  else if (!ok && !tailOk && u2.includes(tl)) msg.push('The verb (predicate) must come last in a Japanese sentence.');
  cont.forEach(([t, i]) => {
    if (!un.includes(nkana(q.r[i])) && !alt.some(z => z.from == t) && !msg.some(m => m.includes(t))) msg
      .push(`I cannot find ${t} (${q.r[i]}) in your answer.`)
  });
  const p = { w: cont.length ? ws / cont.length : 1, p: prs.length ? ps / prs.length : 1, f: a == b ?
    1 : 0, o: u2 == cn ? 1 : tailOk ? .7 : .2 };
  return { ok, pct: ok ? 100 : Math.round(100 * (.4 * p.w + .25 * p.p + .2 * p.f + .15 * p.o)), p, msg,
    alt, u2, un, ur }
}
