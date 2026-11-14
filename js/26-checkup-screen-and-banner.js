/* js/26-checkup-screen-and-banner.js
 * Purpose: Backup banner and the check-up screen.
 * Defines (6): banner, dg, diag, dq, da, dn
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
function banner() {
  setFont();
  absence();
  const b = $('#bn');
  if (!b) return;
  const old = !S.bk || Date.now() - S.bk > 6048e5,
    sn = S.bs && Date.now() - S.bs < 864e5;
  if (saveFailed) {
    b.innerHTML = '<div class="bn" role="alert"><span>Progress could not be saved on this device (storage is full or blocked). Save a backup now.</span><button class="mini" onclick="exp()">Save</button></div>';
    return
  }
  b.innerHTML = Object.keys(S.i).length > 3 && old && !sn ? `<div class="bn"><span>${S.bk?'Backup is over a week old':'No backup yet'}</span><button class="mini" onclick="exp()">Save</button><button class="mini" aria-label="Dismiss" onclick="S.bs=Date.now();save();banner()">×</button></div>` :
    ''
}

let dg = null;
function diag() {
  DX = diagBuild();
  dg = { i: 0, r: [] };
  go('p', 1);
  dq()
}

function dq() {
  const q = DX[dg.i];
  q.p = shuffle(q.o.map((t, i) => ({ t, c: i == q.a })));
  $('#m').innerHTML = `<div class="card"><p class="mu">Question ${dg.i+1} of ${DX.length}</p><p style="font-size:1.3rem;text-align:center;margin:8px 0">${e(q.q)}</p><div id="dc">${q.p.map((o,j)=>`<button class="opt" onclick="da(${j})">${e(o.t)}</button>`).join('')}<button class="opt" style="color:var(--mu)" onclick="da(-1)">I don’t know yet</button></div></div><div id="fb"></div>`
}

function da(j) {
  const q = DX[dg.i],
    ok = j >= 0 && q.p[j].c,
    id = q.id || q.w,
    w = W().find(x => x.w == id);
  if (w) learn(feat(w, q.c == 'g' ? 'gq' : 'jm', null), ok ? 1 : 0, w.w);
  dg.r.push({ q, ok });
  document.querySelectorAll('#dc .opt').forEach((b, k) => {
    b.disabled = true;
    if (q.p[k] && q.p[k].c) b.classList.add('ok');
    else if (k == j) b.classList.add('bad')
  });
  $('#fb').innerHTML = `<div class="card fb ${ok?'':'r'}"><b>${ok?'Correct':j<0?'No problem, here is how it works':'Not quite'}</b><p>Answer: ${e(q.o[q.a])}</p>${q.w&&WM[q.w]?trioW(WM[q.w]):''}<p>${e(q.y)}</p><button class="pri" onclick="dn()">${dg.i+1<DX.length?'Next':'See my result'}</button></div>`
}

function dn() {
  dg.i++;
  if (dg.i < DX.length) return dq();
  const n = Date.now(),
    c = l => {
    const r = dg.r.filter(x => x.q.l == l);
    return [r.filter(x => x.ok).length, r.length]
  }, a = c(5), b = c(4);
  dg.r.forEach(x => {
    if (!x.ok) return;
    const id = x.q.id || x.q.w;
    if (W().some(y => y.w == id) && !S.i[id]) S.i[id] = { s: 3, d: 4, t: n, f: n, n: 1, l: 0, x: {} }
  });
  const lv = a[0] / a[1] < .5 ? 'N5 basics' : b[0] / b[1] < .5 ? 'N5 solid, ready to start N4' : 'N4 working level';
  S.diag = { t: n, n5: a, n4: b, lv };
  save();
  $('#m').innerHTML = `<div class="card"><b>Your starting point: ${lv}</b><p>N5 questions: ${a[0]} of ${a[1]}. N4 questions: ${b[0]} of ${b[1]}.</p><p class="mu" style="text-align:left">Words you got right are scheduled for review instead of being taught again. Everything else is introduced step by step.</p><button class="pri" onclick="practice()">Start practising</button></div>`
}
