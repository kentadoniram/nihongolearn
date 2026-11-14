/* js/16-statistics.js
 * Purpose: Statistics layer: Zipf, knapsack, classifiers, robust z-score, Poisson and Monte Carlo forecast.
 * Defines (22): ZR, zv, knownK, cost, nextW, cov, topW, ft, nbP, smP, trainLv, predLv, post, med, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Statistics layer ----

// Zipf: value of a word is 1/rank (f ~ 1/rank). Rank comes from the optional fr column, otherwise from a deck-based usefulness proxy.

// Knapsack: greedy value/cost, where cost grows with unknown kanji. Coverage = sum of values met / sum of all values.
let ZR = {},
  NB = null,
  SM = null,
  LV2 = { nb: 'n/a', sm: 'n/a', note: 'needs more words' };
const zv = w => 1 / (ZR[w.w] || 999),
  openW = w => w.l >= 4 || S.n3 || S.cnt > 120;
function knownK() {
  const k = new Set();
  W().forEach(w => {
    if (S.i[w.w])[...w.w].forEach(c => k.add(c))
  });
  return k
}

const cost = (w, kk) => 1 + .6 * [...w.w].filter(c => K.test(c) && !kk.has(c))
  .length + .1 * Math.max(0, w.r.length - 4);
const nextW = (w, kk) => Math.sqrt(zv(w) / cost(w, kk)) * ({ 5: 1, 4: .55, 3: .3 }[w.l] || .3) * (w.t ?
  .8 : 1);
function cov() {
  let a = 0,
    b = 0;
  W().forEach(w => {
    if (w.g || !openW(w)) return;
    const z = zv(w);
    b += z;
    if (S.i[w.w]) a += z
  });
  return b ? a / b : 0
}

function topW(n) {
  const kk = knownK();
  return W().filter(w => !w.g && !S.i[w.w] && openW(w)).sort((a, b) => nextW(b, kk) - nextW(a, kk))
    .slice(0, n)
}

// Level classifiers on character n-grams: Naive Bayes (Laplace smoothed) and softmax regression (SGD).
const ft = w => {
  const s = w.w,
    f = ['n' + Math.min(s.length, 5), 'e' + s.slice(-1), 'k' + Math.min([...s].filter(c => K.test(c))
      .length, 3)];
  for (let i = 0; i < s.length; i++) {
    f.push('c' + s[i]);
    if (i) f.push('b' + s.slice(i - 1, i + 1))
  }
  return f
};
function nbP(w, loo) {
  const C = [5, 4, 3],
    f = ft(w);
  if (loo) {
    NB.cnt[w.l];
    f.forEach(k => NB.cnt[w.l][k]--);
    NB.tot[w.l] -= f.length;
    NB.pri[w.l]--;
    NB.n--
  }
  const lp = C.map(c => Math.log((NB.pri[c] + 1) / (NB.n + 3)) + f.reduce((a, k) => a + Math.log(((NB
        .cnt[c][k] || 0) + 1) / (NB.tot[c] + NB.vs)), 0));
  if (loo) {
    f.forEach(k => NB.cnt[w.l][k]++);
    NB.tot[w.l] += f.length;
    NB.pri[w.l]++;
    NB.n++
  }
  const m = Math.max(...lp),
    e = lp.map(v => Math.exp(v - m)),
    t = e.reduce((a, b) => a + b);
  return e.map(v => v / t)
}

function smP(w) {
  const C = [5, 4, 3],
    f = ft(w),
    z = C.map(c => f.reduce((a, k) => a + (SM[c][k] || 0), 0)),
    m = Math.max(...z),
    e = z.map(v => Math.exp(v - m)),
    t = e.reduce((a, b) => a + b);
  return e.map(v => v / t)
}

function trainLv() {
  const D = V.filter(w => !w.t && !w.auto && [3, 4, 5].includes(w.l)),
    C = [5, 4, 3];
  if (D.length < 30) {
    NB = SM = null;
    return
  }
  const cnt = {},
    tot = {},
    pri = {},
    voc = new Set(),
    W3 = {};
  C.forEach(c => {
    cnt[c] = {};
    tot[c] = 0;
    pri[c] = 0;
    W3[c] = {}
  });
  D.forEach(w => {
    const f = ft(w);
    pri[w.l]++;
    f.forEach(k => {
      cnt[w.l][k] = (cnt[w.l][k] || 0) + 1;
      tot[w.l]++;
      voc.add(k)
    })
  });
  NB = { cnt, tot, pri, n: D.length, vs: voc.size };
  for (let ep = 0; ep < 25; ep++) D.forEach(w => {
    const f = ft(w),
      z = C.map(c => f.reduce((a, k) => a + (W3[c][k] || 0), 0)),
      m = Math.max(...z),
      e = z.map(v => Math.exp(v - m)),
      t = e.reduce((a, b) => a + b);
    C.forEach((c, i) => {
      const g = (w.l == c ? 1 : 0) - e[i] / t;
      f.forEach(k => {
        W3[c][k] = (W3[c][k] || 0) + .3 * g
      })
    })
  });
  SM = W3;
  const arg = p => C[p.indexOf(Math.max(...p))],
    nb = D.filter(w => arg(nbP(w, 1)) == w.l).length / D.length,
    sm = D.filter(w => arg(smP(w)) == w.l).length / D.length;
  LV2 = { nb: Math.round(nb * 100) + '%', sm: Math.round(sm * 100) + '%', note: 'Naive Bayes is leave-one-out, softmax is on its training words' }
}

function predLv(w) {
  const C = [5, 4, 3],
    a = nbP(w),
    b = smP(w),
    p = a.map((v, i) => v + b[i]);
  return C[p.indexOf(Math.max(...p))]
}

function post() {
  LEXRE = null;
  WM = {};
  V.forEach(w => WM[w.w] = w);
  G = {};
  REL.forEach(r => {
    if (WM[r[0]] && WM[r[1]]) {
      (G[r[0]] = G[r[0]] || []).push({ w: r[1], t: r[2], n: r[3] });
      (G[r[1]] = G[r[1]] || []).push({ w: r[0], t: r[2], n: r[3] })
    }
  });
  const KC = {};
  V.forEach(w => [...w.w].forEach(c => {
    if (K.test(c)) KC[c] = (KC[c] || 0) + 1
  }));
  const u = w => w.fr ? 1e6 / w.fr : 1 + [...w.w].reduce((a, c) => a + (K.test(c) ? KC[c] - 1 : 0), 0) + (w
    .l == 5 ? 2 : 0) + (w.l == 4 ? 1 : 0);
  const key = w => w.fr ? w.fr : (TR[w.w] || 3) * 1e4 + (FI[w.w] != null ? FI[w.w] : 5000 - Math.min(u(w),
      4000));
  ZR = {};
  V.slice().sort((a, b) => key(a) - key(b)).forEach((w, i) => ZR[w.w] = i + 1);
  trainLv();
  V.forEach(w => {
    if (w.auto && NB) w.l = predLv(w)
  });
  FRM().forEach(f => {
    if (!(PVR[f.p] && PVR[f.p].test(f.vp))) console.warn('grammar lint: frame', f.n, f.p, f.vp)
  })
}

// Robust z-score on log response time (median and MAD): fast wrong answers are slips, slow right answers are weak memories.
const med = a => {
  const b = a.slice().sort((x, y) => x - y),
    n = b.length;
  return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : 0
};
function rz() {
  const lg = Math.log(Math.max(300, Date.now() - (cur.t0 || Date.now()))),
    k = cur.t || 'x',
    r = (S.rt = S.rt || {})[k] || (S.rt[k] = []);
  let z = 0;
  if (r.length >= 15) {
    const m = med(r),
      d = med(r.map(x => Math.abs(x - m))) || .25;
    z = .6745 * (lg - m) / d
  }
  r.push(lg);
  if (r.length > 200) r.shift();
  return z
}

// Poisson regression with a Gamma prior: expected answers per weekday. Monte Carlo: simulate the next two weeks of reviews.
const dk = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4)
  .toISOString().slice(0, 10);
function tick() {
  const d = dk();
  S.days = S.days || {};
  S.days[d] = (S.days[d] || 0) + 1
}

function lam(dow) {
  const E = Object.entries(S.days || {}),
    mu = E.length ? E.reduce((a, x) => a + x[1], 0) / E.length : 10,
    g = E.filter(x => new Date(x[0] + 'T00:00:00').getDay() == dow);
  return (g.reduce((a, x) => a + x[1], 0) + 2 * mu) / (g.length + 2)
}

const goal = () => Math.min(40, Math.max(8, Math.round(lam(new Date().getDay()) * 1.1)));
const pois = l => {
  const L = Math.exp(-l);
  let k = 0,
    p = 1;
  do {
    k++;
    p *= Math.random()
  }
  while (p > L);
  return k - 1
};
function forecast(H = 14) {
  const now = Date.now(),
    I = W().filter(w => !w.g && S.i[w.w]).map(w => S.i[w.w]),
    n = Object.keys(S.days || {}).length || 1,
    nu = Math.min(12, Math.max(2, I.length / n)),
    T = S.cal.reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]),
    q = T[0] > 20 ? T[1] / T[0] : .8,
    R = [];
  for (let r = 0; r < 200; r++) {
    const s = I.map(i => i.s),
      nx = I.map(i => Math.max(0, (i.t + i.s * 864e5 - now) / 864e5));
    for (let d = 0; d < H; d++) {
      for (let i = 0; i < s.length; i++) if (nx[i] <= d) {
        if (Math.random() < q) s[i] *= 2.2;
        else s[i] = Math.max(.4, s[i] * .25);
        nx[i] = d + s[i]
      }
      for (let j = pois(nu); j > 0; j--) {
        s.push(.5);
        nx.push(d + .5)
      }
    }
    R.push(s.filter(v => v >= 7).length)
  }
  R.sort((a, b) => a - b);
  return { med: R[100], lo: R[20], hi: R[180] }
}

function statsCard() {
  const fc = forecast(),
    days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => d + ' ' + lam(i)
    .toFixed(0)).join(', ');
  return `<div class="card"><b>Statistics</b><p class="mu" style="text-align:left">Zipf-weighted coverage ${Math.round(cov()*100)}%. New words are ranked by frequency value divided by study cost, and each unknown kanji adds cost. Until real frequency ranks are added, rank is a deck-based proxy.</p><p class="mu" style="text-align:left">Level classifiers on character n-grams: Naive Bayes ${LV2.nb}, softmax ${LV2.sm} (${LV2.note}).</p><p class="mu" style="text-align:left">Response-time outliers (median and MAD z-score): ${S.slips||0} careless slips softened.</p><p class="mu" style="text-align:left">Poisson daily volume by weekday: ${days}.</p><p class="mu" style="text-align:left">14-day Monte Carlo: ${fc.med} secure words (${fc.lo} to ${fc.hi}).</p><p class="mu" style="text-align:left">${behSummary()}</p></div>`
}
