/* js/22-lexicon.js
 * Purpose: Tappable words and expressions inside Japanese text.
 * Defines (21): JPR, FORMS_V, ADJ_ENDS, FLM, formsOf, lexRe, mkLex, ej, ENDS, rj, tokH, trioT, trioS, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Display helpers: spacing and furigana in explanations ----
const JPR = /[\u3040-\u30ff\u4e00-\u9fff々ー]+/g;

// Inflected forms of a verb or い-adjective with their readings, so 変わりました is read かわりました and not 変 (へん) + わり.
const FORMS_V = ['masu', 'mase', 'mashita', 'masendeshita', 'nai', 'nakatta', 'naide', 'nakereba', 'te',
  'ta', 'tai', 'mashou', 'teimasu', 'tari', 'tara', 'ba', 'pot', 'pas', 'cau', 'caupas', 'vol', 'imp'];
const ADJ_ENDS = ['く', 'くて', 'かった', 'くない', 'くなかった', 'ければ', 'さ', 'そう', 'すぎる', 'くなる'];
let FLM = {},
  FRD = {},
  FALT = {};
function formsOf(w) {
  if (w.g || !K.test(w.w)) return [];
  const p = posOf(w),
    out = [];
  if (p == 'verb' && vclass(w)) {
    FORMS_V.forEach(f => {
      const x = conj(w, f);
      if (x) out.push([x.s, x.r])
    });
    ['masu', 'nai'].forEach(f => {
      const x = conj(w, f);
      if (x && x.s.length > 2) out.push([x.s.slice(0, f == 'masu' ? -2 : -2), x.r.slice(0, -2)])
    })
  } else if (p == 'i-adjective' && w.w.length > 1) {
    const s = w.w.slice(0, -1),
      r = w.r == 'いい' ? 'よ' : w.r.slice(0, -1);
    ADJ_ENDS.forEach(t => out.push([s + t, r + t]))
  }
  return out
}

// One pattern for all keys as a prefix tree, so that finding the longest match stays fast with thousands of entries.
function lexRe(keys) {
  const T = {};
  keys.forEach(k => {
    let n = T;
    for (const c of k) n = n[c] = n[c] || {};
    n[''] = 1
  });
  const esc = c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    walk = n => {
    const cs = Object.keys(n).filter(c => c),
      inner = cs.map(c => esc(c) + walk(n[c])),
      x = inner.length > 1 ? '(?:' + inner.join('|') + ')' : inner.join('');
    return n[''] && cs.length ? '(?:' + x + ')?' : x
  };
  return new RegExp('(' + walk(T) + ')', 'g')
}

// Lexicon: deck words and grammar expressions inside any Japanese text become tappable (tooltip first, full window on a second tap).
function mkLex() {
  LEXM = {};
  EXI = {};
  RDX = {};
  FLM = {};
  FRD = {};
  FALT = {};
  STM = new Set();
  EXPR.forEach((x, i) => {
    EXI[x.j] = i;
    if (x.j.length > 1) LEXM[x.j] = ['x', i]
  });
  V.forEach(w => {
    if (K.test(w.w) || w.w.length >= 3) LEXM[w.w] = ['w', w.w];
    // counters after a number (五枚, 二台): index the counter itself when its sound never changes
    if (w.w.startsWith('〜') && '枚台番度'.includes(w.w.slice(1))) LEXM[w.w.slice(1)] = ['w', w.w]
  });
  const add = (a, b, st) => {
    if (a && b && K.test(a) && !WM[a] && !RDX[a]) {
      RDX[a] = b;
      if (st) STM.add(a)
    }
  };
  (GEN.subj || []).forEach(z => add(z.j, z.r));
  (GEN.tm || []).forEach(z => add(z.j, z.r));
  FRM().forEach(f => {
    add(f.n, f.nr);
    add(f.vp, f.vpr);
    add(f.va, f.var)
  });
  ((GEN.ident || {}).nouns || []).forEach(n => add(n[0], n[1]));
  TY.forEach(q => q.t.forEach((t, i) => add(t, q.r[i])));
  V.forEach(w => {
    const k = cs(w.w, w.r);
    if (k && k < w.w.length) add(w.w.slice(0, w.w.length - k), w.r.slice(0, w.r.length - k), 1)
  });
  Object.keys(RDX).forEach(k => {
    if (!LEXM[k]) LEXM[k] = ['r', k]
  });
  V.forEach(w => formsOf(w).forEach(([f, r]) => {
    if (!LEXM[f] || LEXM[f][0] == 'f')(FALT[f] = FALT[f] || []).push([w.w, r]);
    if (!LEXM[f]) {
      FLM[f] = w.w;
      FRD[f] = r;
      LEXM[f] = ['f', w.w]
    }
  }));
  const ks = Object.keys(LEXM);
  LEXRE = ks.length ? lexRe(ks) : /$^/g
}

// hint: the word the sentence is about. Two words can share a form (降ります is おります or ふります), and the hint decides.
function ej(s, hint) {
  if (!LEXRE) mkLex();
  return String(s).split(LEXRE).map((p, i) => {
    if (i % 2) {
      const m = LEXM[p];
      if (m[0] == 'r') return `<span class="jp">${jw(p,RDX[p])}</span>`;
      if (m[0] == 'f') {
        const alt = (FALT[p] || []).find(a => a[0] == hint) || [m[1], FRD[p]];
        return `<span class="jp lx" data-lx="w:${e(alt[0])}">${jw(p,alt[1])}</span>`
      }
      const w = m[0] == 'w' ? WM[m[1]] : null;
      return `<span class="jp lx" data-lx="${m[0]}:${m[0]=='w'?e(m[1]):m[1]}">${jw(p,w&&w.r)}</span>`
    }
    return e(p).replace(JPR, x => `<span class="jp">${kb(x)}</span>`)
  }).join('')
}

const ENDS = new Set(['ます', 'ました', 'ません', 'ませんでした', 'です', 'でした', 'ではありません', 'ですか']);
function rj(s) {
  if (!LEXRE) mkLex();
  const P = [];
  String(s).split(LEXRE).forEach((p, i) => {
    if (i % 2) {
      const m = LEXM[p];
      if (m[0] == 'r') P.push({ s: romaji(RDX[p]), a: STM.has(p) ? 'n' : '' });
      else if (m[0] == 'f') P.push({ s: romaji(FRD[p]), a: '' });
      else if (m[0] == 'x') P.push({ s: romaji(p), a: ENDS.has(p) ? 'p' : '' });
      else P.push({ s: romaji(WM[m[1]].r), a: '' })
    } else {
      let run = '';
      const fl = () => {
        if (run) {
          P.push({ s: romaji(run), a: '' });
          run = ''
        }
      };
      for (const c of p) {
        if ('はをへ'.includes(c)) {
          fl();
          P.push({ s: { は: 'wa', を: 'o', へ: 'e' }[c], a: '' })
        } else if (/[、。？！\s]/.test(c)) fl();
        else if (c == '＿') {
          fl();
          P.push({ s: '__', a: '' })
        } else run += c
      }
      fl()
    }
  });
  return P.filter(x => x.s).map((x, i, a) => (i && a[i - 1].a != 'n' && x.a != 'p' ? ' ' : '') + x.s)
    .join('')
}

function tokH(t, rd) {
  if (!LEXRE) mkLex();
  const i = EXI[t],
    w = WM[t];
  if (i != null) return `<span class="jp lx" data-lx="x:${i}">${e(t)}</span>`;
  if (w) return `<span class="jp lx" data-lx="w:${e(t)}">${jw(t,w.r)}</span>`;
  const rr = rd || RDX[t];
  return `<span class="jp">${jw(t,rr)}</span>`
}

const trioT = q => `<div class="trio"><div class="t1">${q.t.map((t,i)=>tokH(t,q.r?q.r[i]:'')).join('')}</div>${S.rm?`<div class="rm">${q.r?romajiS(q.r):rj(q.t.join(' '))}</div>`:''}${q.en?`<div class="en">${e(q.en)}</div>`:''}</div>`;
const trioS = (jp, en) => `<div class="trio"><div class="t1">${ej(jp)}</div>${S.rm?`<div class="rm">${rj(jp)}</div>`:''}${en?`<div class="en">${e(en)}</div>`:''}</div>`;
const trioW = w => `<div class="trio"><div class="t1">${K.test(w.w)?`<ruby>${lk(w)}<rt>${e(w.r)}</rt></ruby>`:lk(w)}</div><div class="rm">${romaji(w.r)}</div><div class="en">${e(w.m)} ${lvb(w)}</div></div>`;
const tn = n => WM[n] ? WM[n].m : n,
  KN = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 },
  trV = x => WM[x] ? WM[x].m : (/^.時半?$/.test(x) && KN[x[0]] ? KN[x[0]] + (x.length > 2 ? ':30' : ':00') :
  '');
function placeTip(el, h) {
  const t = $('#tip');
  t.innerHTML = h;
  t.hidden = false;
  const r = el.getBoundingClientRect(),
    hh = t.offsetHeight,
    ww = t.offsetWidth;
  t.style.left = Math.max(8, Math.min(innerWidth - ww - 8, r.left + r.width / 2 - ww / 2)) + 'px';
  t.style.top = (r.bottom + hh + 12 > innerHeight ? Math.max(8, r.top - hh - 8) : r.bottom + 8) + 'px'
}

function showLx(el) {
  const [ty, v] = el.dataset.lx.split(/:(.+)/),
    t = $('#tip');
  let h = '';
  if (ty == 'w') {
    const w = WM[v];
    if (!w) return;
    h = `<b class="tg" style="font-size:1.2rem">${e(w.w)}</b> ${lvb(w)}<div>${e(w.r)} <span class="mu">(${romaji(w.r)})</span></div><div>${e(w.m)}</div><div class="mu">Tap again for the full entry</div>`
  } else {
    const x = EXPR[+v];
    if (!x) return;
    h = `<b class="tg" style="font-size:1.2rem">${e(x.j)}</b><div>${e(x.b)}</div><div class="mu">Tap again for the full explanation</div>`
  }
  placeTip(el, h);
  t.dataset.open = ty + ':' + v
}

function openX(o) {
  const [ty, v] = o.split(/:(.+)/);
  if (ty == 'w') {
    const i = W().findIndex(x => x.w == v);
    if (i >= 0) dict(i)
  } else if (ty == 'x') expd(+v);
  else kd(v)
}

function expd(i) {
  const x = EXPR[i];
  dv(`<div class="big" style="font-size:2.2rem">${e(x.j)}</div><p class="mean">${e(x.b)}</p><p>${ej(x.f)}</p>${(x.ex||[]).map(z=>`<div class="card"><p style="margin:0">${ej(z[0])}</p><p class="mu" style="margin:4px 0 0">${rj(z[0])}</p><p style="margin:4px 0 0">${e(z[1])}</p></div>`).join('')}`)
}

const romajiS = a => a.map(x => ({ は: 'wa', を: 'o', へ: 'e' })[x] || romaji(x))
  .join(' ');
function toast(m) {
  const t = $('#tip');
  t.innerHTML = e(m);
  t.hidden = false;
  t.dataset.open = '';
  t.style.left = '50%';
  t.style.top = '70px';
  t.style.transform = 'translateX(-50%)';
  clearTimeout(toast.h);
  toast.h = setTimeout(() => {
    t.hidden = true;
    t.style.transform = ''
  }, 1600)
}
