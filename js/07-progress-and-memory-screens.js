/* js/07-progress-and-memory-screens.js
 * Purpose: Progress screen, memory export and import, settings screen, tile builder helpers.
 * Defines (14): prog, exp, addCp, isPack, mrg, imp, impt, rst, LV, strip, oddg, bshow, bp, mem
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
function prog() {
  const A = W(),
    n = Date.now(),
    L = A.filter(w => S.i[w.w]),
    sol = L.filter(w => S.i[w.w].s >= 7).length;
  $('#m').innerHTML = `<div class="card"><b>${L.length}</b> items met, <b>${sol}</b> solid, ${A.length} in the deck</div><div class="card"><div class="grid">${A.map(w=>{const it=S.i[w.w],o=it?Math.max(.25,ret(it,n)):.08;return`<span onclick="dict(${A.indexOf(w)})" style="cursor:pointer;opacity:${o}" title="${e(w.m||w.q||'')}">${e(w.g?'文法':w.w)}</span>`}).join('')}</div><p class="mu">Bright words are strong in memory. Faded ones are due for a visit.</p></div><div class="card"><b>Difficulty model</b><p class="mu" style="text-align:left">Logistic regression predicting your chance of a correct answer, trained on ${S.mdl.n} answers. Positive weights make a question easier, negative weights make it harder. It picks new words and question types near an 80% success rate. Words you keep missing also get their own extra difficulty term, like a Rasch model.</p><p class="mu" style="text-align:left">Fit check, −log L (lower is better, a coin flip scores 0.69): last 20 answers ${nlq()[0]}, all answers ${nlq()[1]}.</p><p class="mu" style="text-align:left">Calibration, predicted band vs actual success: ${calq()}.</p>${attr()}${FN.map((n,i)=>`<div>${n}: ${S.mdl.w[i].toFixed(2)}</div>`).join('')}</div><div class="card"><button class="sec" onclick="vocab()">Vocabulary list</button><button class="sec" onclick="roadmap()">Roadmap</button></div>${statsCard()}<div class="card"><button class="sec" onclick="go('m')">Backup and transfer</button></div>`
}

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

const LV = ['Seedling', 'Student', 'Reader', 'Decoder', 'Tracker', 'Sage'];
function strip() {
  const x = S.xp,
    l = Math.floor(Math.sqrt(x / 40)),
    lo = 40 * l * l,
    hi = 40 * (l + 1) * (l + 1),
    q = S.q && S.q.d == new Date().toDateString() ? S.q.n : 0;
  $('#st').innerHTML = `<div class="strip">${hist.length&&hi>0?'<a class="wl" onclick="nav(-1)">‹ Back</a>':''}<span><b>Lv ${l+1}</b> ${LV[Math.min(l,5)]}</span><div class="xp" title="XP to next level"><i style="width:${(x-lo)/(hi-lo)*100}%"></i></div><span class="cmb">${cmb>1?'x'+cmb:''}</span><span class="mu" style="margin:0">${q}/12</span><a class="wl" onclick="practice(1)">+ word</a></div><div class="rb" title="round progress"><i style="width:${rd.n/8*100}%"></i></div>`
}

function oddg(w) {
  const A = W().filter(x => !x.g && (x.l >= 4 || S.i[x.w] || S.n3)),
    ks = [...w.w].filter(c => K.test(c) && A.filter(x => x.w.includes(c))
    .length >= 3);
  if (!ks.length) return null;
  const ch = rnd(ks),
    g = shuffle(A.filter(x => x.w.includes(ch) && x.w != w.w)).slice(0, 2)
    .concat(w),
    od = rnd(A.filter(x => !x.w.includes(ch)).sort((a, b) => sim(g[0], b) - sim(g[0], a))
    .slice(0, 5));
  return { ch, odd: od, o: shuffle(g.concat(od)) }
}

function bshow() {
  const c = cur;
  $('#bs').innerHTML = c.sel.map((k, i) => `<button class="tile on" onclick="bu(${i})">${e(c.pool[k])}</button>`)
    .join('') || '<span class="mu">Tap the kana in order</span>';
  $('#bp').innerHTML = c.pool.map((ch, k) => `<button class="tile" ${c.sel.includes(k)?'disabled':''} onclick="bp(${k})">${e(ch)}</button>`)
    .join('')
}

function bp(k) {
  cur.sel.push(k);
  bshow()
}

function bu(i) {
  cur.sel.splice(i, 1);
  bshow()
}

function mem() {
  const d = S.bk ? new Date(S.bk).toLocaleDateString() : 'never',
    pk = PK.concat(S.cp),
    ck = (k, t) => `<p><label><input type="checkbox" ${S[k]?'checked':''} onchange="S.${k}=this.checked;save()"> ${t}</label></p>`;
  $('#m').innerHTML = `<details class="card" open><summary>Backup and transfer</summary><p class="mu" style="text-align:left">Last backup: ${d}. Memory means your progress, mistakes, XP and difficulty model.</p><button class="pri" onclick="exp()">Download my memory</button><label class="pri" style="display:block;text-align:center;cursor:pointer">Load memory from file<input type="file" accept=".json,application/json" hidden onchange="imp(this)"></label><details><summary class="mu">Use text instead</summary><textarea id="mt" placeholder="Paste memory text here"></textarea><button class="sec" onclick="$('#mt').value=JSON.stringify(S)">Show as text</button><button class="sec" onclick="navigator.clipboard&&navigator.clipboard.writeText(JSON.stringify(S))">Copy</button><button class="sec" onclick="impt()">Load from text</button></details></details>
<details class="card"><summary>Display</summary>${ck('hl','Hide JLPT level labels')}<p class="mu" style="text-align:left;margin:8px 0 2px">Japanese font</p><select onchange="S.fn=this.value;save();setFont()">${[['kyo','Textbook (school style)'],['maru','Rounded'],['sans','Plain sans'],['mincho','Mincho (serif)']].map(([k,t])=>`<option value="${k}" ${(S.fn||'kyo')==k?'selected':''}>${t}</option>`).join('')}</select><p class="mu" style="text-align:left;margin:8px 0 2px">Kanji tooltip shows</p>${[['r','Readings'],['m','Meaning'],['p','Part of speech of the word'],['l','JLPT level'],['w','Example words'],['s','Look-alike kanji']].map(([k,t])=>`<p style="margin:4px 0"><label><input type="checkbox" ${S.tf[k]?'checked':''} onchange="S.tf.${k}=this.checked;save()"> ${t}</label></p>`).join('')}<button class="sec" onclick="S.tf={r:1,m:0,p:0,l:0,w:0,s:0};save();mem()">Reading only</button><button class="sec" onclick="S.tf={r:1,m:1,p:0,l:1,w:0,s:0};save();mem()">Reading + meaning</button><button class="sec" onclick="S.tf={r:1,m:1,p:1,l:1,w:0,s:0};save();mem()">+ part of speech</button><button class="sec" onclick="S.tf={r:1,m:1,p:1,l:1,w:1,s:1};save();mem()">Everything</button></details>
<details class="card"><summary>Learning</summary>${ck('aa','Move on automatically after a correct answer')}<p class="mu" style="text-align:left">Forgetting model: ${fmStatus()}</p><p class="mu" style="text-align:left">Reading help: ${kiStatus()}</p><p class="mu" style="text-align:left">Kanji mastery: ${kmStatus()}</p><button class="sec" onclick="refitFm();mem()">Refit now</button>${ck('wk','Include work vocabulary (plant engineering)')}<p style="margin:8px 0 2px">Rare words mixed in: <b id="rv">${Math.round((S.rare??.2)*100)}%</b></p><input type="range" min="0" max="40" step="10" value="${Math.round((S.rare??.2)*100)}" oninput="S.rare=this.value/100;$('#rv').textContent=this.value+'%';save()" style="width:100%">${ck('n3','Open N3 content now')}<p class="mu" style="text-align:left">Otherwise N3 opens once most N5 and N4 words are met.</p></details>
<details class="card"><summary>Content</summary><p class="mu" style="text-align:left">${V.length} words, ${Object.keys(KJ).length} kanji, ${SN.length} sentences, ${GI.length} grammar items and ${rc()} generated reading passages. Lessons load from the data folder, and you can add a content pack here.</p>${pk.map(p=>`<div class="mu">${e(p.pack||p.title||'pack')}${p.level?' (N'+p.level+')':''}</div>`).join('')}<label class="sec" style="cursor:pointer">Import content pack<input type="file" accept=".json" hidden onchange="imp(this)"></label></details>
<details class="card"><summary>Learning data</summary>${dataCard()}</details>
<details class="card"><summary>Advanced</summary><button class="sec" onclick="rst()">Erase everything on this device</button></details>
<details class="card"><summary>About</summary><p>Nihongo Lab v${e(VER.app)}</p><p class="mu" style="text-align:left">Lesson data ${e(VER.content)}. Version format is MAJOR.MINOR.BUILD.</p></details>`
}
