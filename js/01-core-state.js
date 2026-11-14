/* js/01-core-state.js
 * Purpose: Global state, saved data and small helpers.
 * Defines (8): V, $, KEY, S, svn, saveFailed, W, hira
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
let V = [],
  DIAG = [],
  KJ = {},
  SN = [],
  LAB = [],
  SIM = [],
  GI = [],
  DX = [],
  PK = [],
  FM = [],
  TY = [],
  GEN = {},
  REL = [],
  GRAD = [],
  BEC = [],
  TR = {},
  FI = {},
  WM = {},
  G = {},
  RMP = [],
  FR = null,
  EXPR = [],
  LEXRE = null,
  LEXM = {},
  EXI = {},
  RDX = {},
  STM = new Set();
const VER = { app: '?', content: '?' };
const $ = s => document.querySelector(s),
  e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'nihongoLab1',
  K = /[\u4e00-\u9fff]/;
let S;
try {
  const raw = localStorage.getItem(KEY);
  try {
    S = JSON.parse(raw)
  } catch (x) {
    // unreadable saved data: keep a copy before the first save replaces it
    if (raw) localStorage.setItem(KEY + '.corrupt', raw)
  }
} catch (x) {}
S = S || {};
S.i = S.i || {};
S.lab = S.lab || {};
S.custom = S.custom || [];
S.rec = S.rec || [];
S.bq = S.bq || [];
S.cnt = S.cnt || 0;
S.xp = S.xp || 0;
S.beta = S.beta || {};
S.cp = S.cp || [];
if (S.aa === undefined) S.aa = true;
if (S.wk === undefined) S.wk = true;
S.fp = S.fp || [];
S.trec = S.trec || [];
S.cal = S.cal || [0, 0, 0, 0, 0].map(() => [0, 0]);
if (!S.tf) S.tf = { r: 1, m: 1, p: 0, l: 1, w: 0, s: 0 };
S.nl = S.nl || [];
S.nt = S.nt || 0;
S.nn = S.nn || 0;
let svn = 0,
  saveFailed = false;
const save = () => {
  try {
    if (++svn % 30 == 0 && JSON.stringify(S).length > 3e6) {
      S.lg = (S.lg || []).slice(-300);
      S.hd = (S.hd || []).slice(-60);
      S.cx = (S.cx || []).slice(-80)
    }
    localStorage.setItem(KEY, JSON.stringify(S));
    saveFailed = false
  } catch (x) {
    saveFailed = true
  }
};
const W = () => (S.wk === false ? V.filter(w => !w.t) : V).concat(S.custom, GI),
  rnd = a => a[Math.random() * a.length | 0],
  shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0])
  .map(x => x[1]);
const hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 96));
