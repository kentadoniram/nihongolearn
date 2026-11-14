/* js/02-forgetting-model.js
 * Purpose: Forgetting curve and its personal fit to your reviews.
 * Defines (9): FK, ret, fmNLL, fitFm, applyFm, refitFm, rvPush, fmStatus, cur
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Forgetting curve (FSRS-style power law): R=0.9 when t=S days.
let FK = 1,
  FC = -.5;
const ret = (it, n) => Math.pow(1 + 19 / 81 * FK * ((n - it.t) / 864e5) / it.s, FC);

// Personal forgetting model: fit a time scale k and curve shape c to your own reviews by maximum likelihood, with a prior pulling towards the standard curve.
function fmNLL(rv, k, c) {
  return rv.reduce((a, [dt, s, y]) => {
    const p = Math.min(.999, Math.max(.001, Math.pow(1 + 19 / 81 * k * dt / s, c)));
    return a - Math.log(y ? p : 1 - p)
  }, 0)
}

function fitFm(rv) {
  if (rv.length < 60) return { ok: 0, n: rv.length };
  let best = null;
  const b0 = fmNLL(rv, 1, -.5);
  for (let j = -6; j <= 6; j++) {
    const k = Math.exp(j * .15);
    for (const c of [-.35, -.5, -.7]) {
      const v = fmNLL(rv, k, c) + 3 * Math.pow(Math.log(k), 2) + 30 * Math.pow(c + .5, 2);
      if (!best || v < best.v) best = { k, c, v }
    }
  }
  const n1 = fmNLL(rv, best.k, best.c);
  return { ok: b0 - n1 >= 2 ? 1 : 0, k: best.k, c: best.c, n: rv.length, nll0: b0 / rv.length, nll1: n1 / rv
    .length }
}

function applyFm() {
  const f = S.fm;
  FK = f && f.ok ? Math.min(2.5, Math.max(.4, f.k)) : 1;
  FC = f && f.ok ? f.c : -.5
}

function refitFm() {
  S.fm = fitFm(S.rv || []);
  applyFm();
  save()
}

function rvPush(dt, s, y) {
  if (dt < .25) return;
  const r = S.rv = S.rv || [];
  r.push([+dt.toFixed(3), +s.toFixed(3), y]);
  if (r.length > 800) r.shift();
  if (r.length >= 60 && r.length % 25 == 0) refitFm()
}

function fmStatus() {
  const f = S.fm,
    n = (S.rv || []).length;
  if (!f || !f.ok) return n < 60 ? `Fitting needs 60 reviews that are at least 6 hours apart (${n} so far). Until then the standard curve is used.` :
    'Your reviews match the standard curve closely, so it is unchanged.';
  return `Fitted to ${f.n} of your reviews: memories fade ${f.k>1?Math.round((f.k-1)*100)+'% faster':Math.round((1-f.k)*100)+'% slower'} than the standard curve (shape ${f.c}). Log loss ${f.nll0.toFixed(3)} to ${f.nll1.toFixed(3)}.`
}

applyFm();
let cur = null,
  cmb = 0,
  rd = { n: 0, ok: 0, xp: 0, bc: 0 };
