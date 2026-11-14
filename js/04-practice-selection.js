/* js/04-practice-selection.js
 * Purpose: Learning update, screen router and choosing the next item (Thompson sampling).
 * Defines (8): learn, go, ruby, pick, practice, meet, goq, opts
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// One SGD step on the negative log-likelihood. Returns this answer's -log L (surprise). Learning rate rises when recent fit is poor.
function learn(x, y, id) {
  const p = Math.min(.999, Math.max(.001, pr(x, id))),
    m = S.mdl,
    ls = -Math.log(y ? p : 1 - p),
    bi = Math.min(4, Math.floor(p * 5)),
    rc = S.nl.slice(-20),
    lr = rc.length >= 10 && rc.reduce((a, b) => a + b, 0) / rc.length > .75 ? .18 : .1;
  m.w = m.w.map((v, i) => v + lr * ((y - p) * x[i] - .004 * v));
  if (id) S.beta[id] = (S.beta[id] || 0) * .99 - .15 * (y - p);
  m.n++;
  S.cal[bi][0]++;
  S.cal[bi][1] += y;
  S.nl.push(ls);
  if (S.nl.length > 60) S.nl.shift();
  S.nt += ls;
  S.nn++;
  return ls
}

function go(v, skip) {
  if (!skip) MX.on = 0;
  banner();
  $('#st').innerHTML = '';
  if (document.body) document.body.classList.toggle('pl', v == 'p');
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v == v));
  if (skip) return;
  v == 't' ? today() : v == 'p' ? practice() : v == 'l' ? lab() : v == 'b' ? bld() : v == 'm' ? mem() :
    prog()
}

function ruby(w, on) {
  return on && K.test(w.w) ? `<ruby>${e(w.w)}<rt>${e(w.r)}</rt></ruby>` : e(w.w)
}

function pick(fn) {
  const now = Date.now(),
    all = W(),
    L = all.filter(w => S.i[w.w]),
    b4 = all.filter(w => w.l >= 4 && !w.t),
    n3 = S.n3 || L.filter(w => w.l >= 4 && !w.t).length / b4.length > .7,
    un = all.filter(w => !S.i[w.w] && (w.l >= 4 || n3)),
    rc = S.rec;
  const day = new Date().setHours(0, 0, 0, 0),
    nt = L.filter(w => S.i[w.w].f >= day).length,
    R = w => ret(S.i[w.w], now),
    fresh = a => a.filter(w => !rc.includes(w.w)),
    wp = (a, f) => {
    const t = a.map(f);
    let r = Math.random() * t.reduce((x, y) => x + y, 0),
      i = 0;
    for (; i < a.length - 1; i++) {
      r -= t[i];
      if (r <= 0) break
    }
    return a[i]
  }, ts = a => a.reduce((b, w) => {
    const it = S.i[w.w],
      m = rb(1 + Math.max(0, it.n - it.l) * R(w), 1 + it.l);
    return !b || m < b.m ? { w, m } : b
  }, 0).w;
  const g20 = S.nl.slice(-20),
    cap = g20.length >= 15 && g20.reduce((a, b) => a + b, 0) / g20.length < .45 ? 20 : 10;
  const kk = knownK(),
    uv = un.filter(w => !w.g),
    nx = (un.length > uv.length && Math.random() < .25) ? un.find(w => w.g) : (uv.length ? wp(Math.random() < (S
        .rare ?? .2) && uv.some(w => TR[w.w] >= 4) ? uv.filter(w => TR[w.w] >= 4) : uv.some(w => (TR[w
        .w] || 3) < 4) ? uv.filter(w => (TR[w.w] || 3) < 4) : uv, a => nextW(a, kk) * Math.exp(-3 * Math
        .abs(pc(feat(a, 'jm'), a.w) - .75))) : un[0]);
  if (fn && un.length) return { w: nx, intro: 1 };
  const bi = S.bq.findIndex(b => b.at <= S.cnt && L.some(w => w.w == b.id));
  if (bi >= 0) {
    const id = S.bq.splice(bi, 1)[0].id;
    return { w: L.find(w => w.w == id) }
  }
  const kw = Math.random() < .15 ? kmWeakWord(L) : null;
  if (kw) return { w: kw };
  const F = fresh(L);
  if (F.length > 5 && Math.random() < .12) return { w: rnd(F) };
  const due = fresh(L.filter(w => R(w) < .9));
  if (due.length) return { w: ts(due) };
  if (un.length && nt < cap) return { w: nx, intro: 1 };
  if (un.length && Math.random() < .7) return { w: nx, intro: 1 };
  if (F.length) return { w: ts(F) };
  return L.length ? { w: rnd(L) } : un.length ? { w: nx, intro: 1 } : null
}

function practice(fn) {
  banner();
  strip();
  const m = $('#m');
  const p = pick(fn);
  if (!p) {
    m.innerHTML = '<div class="card"><p>You have met every word. Add more in Progress with Import.</p></div>';
    return
  }
  if (p.intro) return meet(W().indexOf(p.w));
  cur = build(p.w);
  show()
}

function meet(i) {
  const w = W()[i],
    p = pc(feat(w, w.g ? 'gq' : 'jm', null), w.w);
  S.i[w.w] = { s: .5, d: Math.min(9, Math.max(2, 10 * (1 - p))), t: Date.now(), f: Date.now(), n: 0, l: 0,
    x: {} };
  save();
  if (w.g) {
    cur = build(w);
    show();
    return
  }
  const c = cur = { w, study: 1 },
    x = exOf(w);
  $('#m').innerHTML = `<div class="card nw st" onclick="goq()"><p class="mu">New word. Look closely, it will be hidden.</p><div class="big">${ruby(w,1)}</div><p class="mean">${e(w.m)} ${lvb(w)}</p>${x?`<p class="mu">${e(x[0])}</p>`:''}<div class="rb tm"><i></i></div></div>`;
  c.tm = setTimeout(() => goq(c), 3500)
}

function goq(c) {
  c = c || cur;
  if (!c || !c.study || cur !== c) return;
  clearTimeout(c.tm);
  if (!$('nav .on') || $('nav .on').dataset.v != 'p') return;
  cur = build(c.w, 'mj');
  show()
}

function opts(w, key, g) {
  const pw = [.6, 1.6, 2, 3][g == null ? 1 : g],
    it = S.i[w.w] || {},
    c = W().filter(x => !x.g && (x.l >= 4 || S.i[x.w] || S.n3 || w.l == 3) && x.w !== w.w && x[key] !== w[key] &&
    (key != 'r' || K.test(x.w)));
  const Z = c.reduce((a, y) => a + 1 + Math.pow(sim(w, y), 2), 0),
    tot = Object.values(it.x || {}).reduce((a, b) => a + b, 0),
    wt = x => (((it.x || {})[x.w] || 0) + 4 * (1 + Math.pow(sim(w, x), pw)) / Z) / (tot + 4) * ((it.lo ||
      []).includes(x.w) ? .2 : 1),
    out = []; // Dirichlet-smoothed confusion: P(j|i)=(C[i][j]+a*prior_j)/(sum_j C[i][j]+a), prior from similarity
  while (out.length < 3 && c.length) {
    let r = Math.random() * c.reduce((a, x) => a + wt(x), 0),
      i = 0;
    for (; i < c.length - 1; i++) {
      r -= wt(c[i]);
      if (r <= 0) break
    }
    out.push(c.splice(i, 1)[0])
  }
  it.lo = out.map(x => x.w);
  return shuffle(out.concat(w))
}
