/* js/03-difficulty-model.js
 * Purpose: Look-alike similarity, difficulty regression (Rasch style), calibration and random samplers.
 * Defines (11): look, bg, sim, FN, sg, feat, pr, pc, nrm, rg, rb
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Look-alike kanji groups, used to build confusable choices.
const look = (a, b) => a != b && SIM.some(g => g.includes(a) && g.includes(b));
const bg = s => {
  const h = hira(s),
    o = new Set();
  for (let i = 0; i < h.length - 1; i++) o.add(h.slice(i, i + 2));
  return o
};
function sim(a, b) {
  let s = 0;
  const A = [...a.w].filter(c => K.test(c)),
    B = [...b.w].filter(c => K.test(c));
  A.forEach(x => B.forEach(y => {
    if (x == y) s += 2;
    else if (look(x, y)) s += 3
  }));
  const p = bg(a.r),
    q = bg(b.r);
  p.forEach(x => {
    if (q.has(x)) s += 1.5
  });
  if (a.r.length == b.r.length) s += .5;
  return s
}

// Regression difficulty model: online logistic regression, p = sigmoid(w . x), trained by SGD with L2 shrinkage.
const FN = ['bias', 'N4 item', 'kanji count', 'word length', 'confusability', 'meaning question', 'word question',
  'reading question', 'typing question', 'grammar question', 'odd-one-out question', 'tile builder question',
  'past lapses'];
if (!S.mdl || S.mdl.w.length != 13) S.mdl = { w: [1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], n: 0 };
const sg = z => 1 / (1 + Math.exp(-z));
function feat(w, t, it) {
  const k = [...w.w].filter(c => K.test(c)).length,
    cf = w.g ? 0 : Math.min(5, Math.max(0, ...W().filter(x => x !== w && !x.g)
      .map(x => sim(w, x)))) / 5;
  return [1, w.l == 4 ? 1 : 0, k / 3, (w.g ? 4 : w.w.length) / 4, cf, ...['jm', 'mj', 'jr', 'tr', 'gq',
      'oo', 'bt'].map(x => x == ({ ty: 'tr', rw: 'mj' }[t] || t) ? 1 : 0), it ? Math.min(it.l, 6) / 3 :
    0]
}

// Rasch-style prediction: p = sigmoid(w.x - beta_item). w.x holds ability and feature difficulty; beta_item is learned per item.
const pr = (x, id) => sg(S.mdl.w.reduce((a, v, i) => a + v * x[i], 0) - (S.beta[id] || 0));

// Calibrated probability: shrinks the raw prediction toward the observed success rate in its probability bin.
const pc = (x, id) => {
  const p = pr(x, id),
    b = S.cal[Math.min(4, Math.floor(p * 5))];
  return (b[1] + p * 10) / (b[0] + 10)
};
const nrm = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
function rg(k) {
  const d = k - 1 / 3,
    c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x,
      v;
    do {
      x = nrm();
      v = 1 + c * x
    }
    while (v <= 0);
    v = v * v * v;
    if (Math.log(Math.random()) < .5 * x * x + d - d * v + d * Math.log(v)) return d * v
  }
}

const rb = (a, b) => {
  const x = rg(a),
    y = rg(b);
  return x / (x + y)
};
