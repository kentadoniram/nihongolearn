/* js/22-lexicon.js
 * Purpose: Tappable words and expressions inside Japanese text.
 * Defines (16): JPR, mkLex, ej, ENDS, rj, tokH, trioT, trioS, trioW, tn, placeTip, showLx, openX, expd, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Display helpers: spacing and furigana in explanations ----
const JPR = /[\u3040-\u30ff\u4e00-\u9fff々ー]+/g;

// Lexicon: deck words and grammar expressions inside any Japanese text become tappable (tooltip first, full window on a second tap).
function mkLex() {
  LEXM = {};
  EXI = {};
  RDX = {};
  STM = new Set();
  EXPR.forEach((x, i) => {
    EXI[x.j] = i;
    if (x.j.length > 1) LEXM[x.j] = ['x', i]
  });
  V.forEach(w => {
    if (K.test(w.w) || w.w.length >= 3) LEXM[w.w] = ['w', w.w]
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
  const ks = Object.keys(LEXM).sort((a, b) => b.length - a.length).map(x => x.replace(/[.*+?^${}()|[\]\\]/g,
      '\\$&'));
  LEXRE = ks.length ? new RegExp('(' + ks.join('|') + ')', 'g') : /$^/g
}

function ej(s, nr) {
  if (!LEXRE) mkLex();
  return String(s).split(LEXRE).map((p, i) => {
    if (i % 2) {
      const m = LEXM[p];
      if (m[0] == 'r') return `<span class="jp">${nr?e(p):`<ruby>${e(p)}<rt>${e(RDX[p])}</rt></ruby>`}</span>`;
      const w = m[0] == 'w' ? WM[m[1]] : null;
      return `<span class="jp lx" data-lx="${m[0]}:${m[0]=='w'?e(m[1]):m[1]}">${w&&K.test(p)&&!nr?`<ruby>${e(p)}<rt>${e(w.r)}</rt></ruby>`:e(p)}</span>`
    }
    return e(p).replace(JPR, x => `<span class="jp">${x}</span>`)
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
  if (w) return `<span class="jp lx" data-lx="w:${e(t)}">${K.test(t)?`<ruby>${e(t)}<rt>${e(w.r)}</rt></ruby>`:e(t)}</span>`;
  const rr = rd || RDX[t];
  return `<span class="jp">${K.test(t)&&rr?`<ruby>${e(t)}<rt>${e(rr)}</rt></ruby>`:e(t)}</span>`
}

const trioT = q => `<div class="trio"><div class="t1">${q.t.map((t,i)=>tokH(t,q.r?q.r[i]:'')).join('')}</div><div class="rm">${q.r?romajiS(q.r):rj(q.t.join(' '))}</div>${q.en?`<div class="en">${e(q.en)}</div>`:''}</div>`;
const trioS = (jp, en) => `<div class="trio"><div class="t1">${ej(jp)}</div><div class="rm">${rj(jp)}</div>${en?`<div class="en">${e(en)}</div>`:''}</div>`;
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
