/* js/17-today-screen.js
 * Purpose: Today screen and mixed session.
 * Defines (6): MX, mixStart, mixGo, mixNext, adv, today
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Today screen and mixed session ----
const MX = { on: 0, n: 0, len: 10, xp0: 0, c0: 0 };
function mixStart() {
  MX.on = 1;
  MX.n = 0;
  MX.xp0 = S.xp;
  MX.c0 = cov();
  mixGo()
}

function mixGo() {
  const m = 'ppltpbplpt'[MX.n % 10];
  $('#tip').hidden = true;
  if (m == 'p') {
    go('p', 1);
    practice()
  } else if (m == 'l') {
    go('l', 1);
    S.lf = '';
    lab()
  } else {
    go('b', 1);
    S.bm = m == 't' ? 'type' : 'tile';
    S.bm == 'type' ? typ() : bld()
  }
}

function mixNext() {
  MX.n++;
  if (MX.n < MX.len) {
    mixGo();
    return true
  }
  MX.on = 0;
  go('t', 1);
  const cv = cov();
  $('#m').innerHTML = `<div class="card hero"><div><h2>Session complete</h2><p style="margin:0">${MX.len} activities, +${S.xp-MX.xp0} XP</p><p class="mu" style="text-align:left;margin:4px 0 0">Coverage ${Math.round(MX.c0*100)}% to ${Math.round(cv*100)}%</p></div></div><button class="pri big" onclick="mixStart()">One more session</button><button class="sec" onclick="go('t')">Back to Today</button>`;
  return true
}

function adv(m) {
  if (MX.on && mixNext()) return;
  m == 'l' ? lab() : m == 't' ? typ() : bld()
}

function today() {
  const cv = cov(),
    fc = forecast(),
    g = goal(),
    dn = (S.days || {})[dk()] || 0,
    nw = topW(3).concat(rareOne()),
    ring = `<svg viewBox="0 0 42 42" width="92" height="92" role="img" aria-label="coverage ${Math.round(cv*100)} percent"><circle cx="21" cy="21" r="16" fill="none" stroke="var(--grid)" stroke-width="5"/><circle cx="21" cy="21" r="16" fill="none" stroke="var(--ok)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(cv*100.5).toFixed(1)} 100.5" transform="rotate(-90 21 21)"/><text x="21" y="24" text-anchor="middle" font-size="9" fill="currentColor">${Math.round(cv*100)}%</text></svg>`;
  $('#m').innerHTML = `<div class="card hero">${ring}<div style="flex:1"><h2>Today</h2><p class="mu" style="text-align:left;margin:0">Share of the most useful words you already know</p></div></div><button class="pri big" onclick="mixStart()">Start a session</button><p style="text-align:center;margin:0 0 12px"><a class="wl" onclick="vocab()">Word list</a> &nbsp; <a class="wl" onclick="roadmap()">Roadmap (${RMP.filter(x=>x.s!='done').length} to build)</a></p>${wbCard()}${kmCard()}<div class="card"><div class="stat"><span>Today</span><b>${dn} of ${g} answers</b></div><div class="bar" style="margin:6px 0"><i style="width:${Math.min(100,dn/g*100)}%"></i></div><div class="stat"><span>In 14 days</span><b>about ${fc.med} words secure</b></div><p class="mu" style="text-align:left;margin:4px 0 0">Likely range ${fc.lo} to ${fc.hi}, simulated from your pace and results.</p></div>${nw.length?`<div class="card"><b>Worth learning next</b><p class="mu" style="text-align:left;margin:2px 0 8px">Common words made of kanji you already know come first.</p>${nw.map(w=>`<div class="stat"><a class="wl" onclick="dict(${W().indexOf(w)})">${e(w.w)}</a>${TR[w.w]>=4?' <span class="lv">rare</span>':''}<span class="mu">${e(w.r)} ${e(w.m)}</span></div>`).join('')}</div>`:''}`
}
