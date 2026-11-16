/* js/07-memory-export-import.js
 * Purpose: Memory export, import and merge, and reset.
 * Defines (7): exp, addCp, isPack, mrg, imp, impt, rst
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
async function exp() {
  const f = new File([JSON.stringify({ ...S, app: VER.app })], 'nihongo-lab-' + new Date()
    .toISOString().slice(0, 10) + '.json', { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      await navigator.share({ files: [f], title: 'Nihongo Lab backup' });
      S.bk = Date.now();
      save();
      banner();
      if ($('nav .on') && $('nav .on').dataset.v == 'm') mem();
      return
    }
  } catch (x) {
    if (x.name == 'AbortError') return
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(f);
  a.download = f.name;
  a.click();
  S.bk = Date.now();
  save();
  banner();
  if ($('nav .on') && $('nav .on').dataset.v == 'm') mem()
}

function addCp(p) {
  if (!p.pack) p.pack = 'import-' + Date.now();
  const i = S.cp.findIndex(x => x.pack == p.pack);
  i < 0 ? S.cp.push(p) : S.cp[i] = p
}

const isPack = j => j && (j.pack || j.questions || j.kanji || j.sentences || j.patterns || j.reading ||
  (j.words && !j.i));
function mrg(j) {
  if (isPack(j)) {
    addCp(j);
    applyPacks(PK.concat(S.cp));
    save();
    return
  }
  Object.entries(j.i || {}).forEach(([k, v]) => {
    if (!S.i[k] || (v.t || 0) > S.i[k].t) S.i[k] = v
  });
  Object.assign(S.lab, j.lab || {});
  S.beta = Object.assign({}, j.beta, S.beta);
  if (j.mdl && j.mdl.w && j.mdl.w.length == 13 && j.mdl.n > S.mdl.n) S.mdl = j.mdl;
  if (j.diag && !S.diag) S.diag = j.diag;
  S.xp = Math.max(S.xp, j.xp || 0);
  ['lg', 'hd', 'cx'].forEach(k => {
    const m = new Map();
    (S[k] || []).concat(j[k] || []).forEach(r => m.set(r.t + '|' + (r.id || ''), r));
    S[k] = [...m.values()].sort((a, b) => a.t - b.t).slice(-({ lg: 800, hd: 150, cx: 200 }[k]))
  });
  S.hk = S.hk || {};
  Object.entries(j.hk || {}).forEach(([k, h]) => {
    const a = S.hk[k] || (S.hk[k] = [0, 0, 0, 0]);
    h.forEach((v, i) => a[i] = Math.max(a[i], v))
  });
  S.km = S.km || {};
  Object.entries(j.km || {}).forEach(([k, v]) => {
    if (!S.km[k] || (v.t || 0) > S.km[k].t) S.km[k] = v
  });
  S.skips = Math.max(S.skips || 0, j.skips || 0);
  S.cxw = Object.assign({}, j.cxw, S.cxw);
  (j.custom || []).forEach(x => {
    if (x.w && x.r && x.m && !W().some(y => y.w == x.w)) S.custom.push(x)
  });
  (j.cp || []).forEach(addCp);
  applyPacks(PK.concat(S.cp));
  save()
}

function imp(f) {
  const r = new FileReader();
  r.onload = () => {
    try {
      mrg(JSON.parse(r.result));
      alert('Memory loaded.');
      mem()
    } catch (x) {
      alert('That file is not a valid Nihongo Lab memory.')
    }
  };
  r.readAsText(f.files[0])
}

function impt() {
  try {
    mrg(JSON.parse($('#mt').value));
    alert('Memory loaded.');
    mem()
  } catch (x) {
    alert('That text is not valid memory.')
  }
}

function rst() {
  if (confirm('Erase all progress on this device?')) {
    S.i = {};
    S.lab = {};
    save();
    prog()
  }
}
