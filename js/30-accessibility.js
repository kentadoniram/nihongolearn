/* js/30-accessibility.js
 * Purpose: Keyboard use, roles, announcements, dialog focus and page titles for screen readers.
 * Defines (12): A11Y_SEL, a11yFixList, a11yLangList, a11yFix, announce, a11yScreen, a11yMain, dvOpener, ...
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// Things that react to a click but are not buttons or links. They get a role and a place in the tab order.
const A11Y_SEL = '[onclick]:not(button):not(a[href]):not(input):not(select):not(textarea):not(summary):not(label)',
  A11Y_JA = /[\u3040-\u30ff\u4e00-\u9fff]/,
  A11Y_LATIN = /[A-Za-z]{3}/,
  A11Y_NAMES = { t: 'Today', p: 'Play', b: 'Build', l: 'Lab', g: 'Progress', m: 'Memory', s: 'Settings' };
function a11yFixList(els) {
  els.forEach(el => {
    if (!el.getAttribute('role')) el.setAttribute('role', 'button');
    if (el.getAttribute('tabindex') == null) el.setAttribute('tabindex', '0')
  })
}

// Text that is Japanese gets lang="ja", so a screen reader switches voice.
function a11yLangList(els) {
  els.forEach(el => {
    const t = el.textContent || '';
    if (!el.getAttribute('lang') && A11Y_JA.test(t) && !A11Y_LATIN.test(t)) el.setAttribute('lang', 'ja')
  })
}

function a11yFix(root) {
  a11yFixList([...root.querySelectorAll(A11Y_SEL)]);
  a11yLangList([...root.querySelectorAll('.jp,.kj,.big,.tile,.blk,.opt,.mean,.wl,.pass')])
}

// Say something to screen readers without moving the focus.
function announce(msg) {
  const r = $('#sr');
  r.textContent = '';
  setTimeout(() => {
    r.textContent = msg
  }, 60)
}

// A new screen: the title, the current tab, and the focus move to the content for keyboard and screen reader users.
function a11yScreen(v) {
  const n = A11Y_NAMES[v] || 'Nihongo Lab';
  document.title = n + ' – Nihongo Lab';
  document.querySelectorAll('nav button, .gear').forEach(b => b.setAttribute('aria-current', b.dataset
      .v == v ? 'page' : 'false'));
  announce(n)
}

// Move the focus to the content after a tab was chosen with the keyboard (not while typing or in a dialog).
function a11yMain() {
  const a = document.activeElement,
    m = $('#m');
  if (a && a.closest && a.closest('nav') && m.focus) m.focus()
}

// Dialog (#dv): remember what opened it, move the focus in, and keep the page behind it out of reach.
let dvOpener = null;
function dvOpen() {
  const d = $('#dv'),
    w = document.querySelector('.w');
  dvOpener = document.activeElement || null;
  if (w) w.inert = true;
  const b = d.querySelector && d.querySelector('button');
  (b || d).focus && (b || d).focus()
}

function dvClose() {
  const d = $('#dv'),
    w = document.querySelector('.w');
  d.hidden = true;
  if (w) w.inert = false;
  if (dvOpener && dvOpener.focus && dvOpener.isConnected !== false) dvOpener.focus();
  dvOpener = null
}

// Tab stays inside an open dialog.
function a11yTrap(ev, d) {
  const sel = 'button,a[href],input,select,textarea,summary,[tabindex="0"]',
    f = [...(d.querySelectorAll ? d.querySelectorAll(sel) : [])].filter(x => !x.disabled);
  if (!f.length) return;
  const first = f[0],
    last = f[f.length - 1],
    a = document.activeElement;
  if (ev.shiftKey && (a === first || a === d)) {
    ev.preventDefault();
    last.focus()
  } else if (!ev.shiftKey && a === last) {
    ev.preventDefault();
    first.focus()
  }
}

// Enter or Space does what a click does on anything that acts like a button.
function a11yKey(ev) {
  const t = ev.target;
  if (!t || !t.getAttribute) return;
  if (ev.key == 'Tab') {
    const d = $('#dv');
    if (!d.hidden) a11yTrap(ev, d);
    return
  }
  if (ev.key != 'Enter' && ev.key != ' ') return;
  const custom = t.getAttribute('onclick') != null && !/^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL)$/
    .test(t.tagName || ''),
    word = t.classList && (t.classList.contains('kj') || t.classList.contains('lx'));
  if (custom || word) {
    ev.preventDefault();
    t.click()
  }
}

if (document.addEventListener) {
  document.addEventListener('keydown', a11yKey);
  if (typeof MutationObserver != 'undefined') {
    const ob = new MutationObserver(ms => ms.forEach(m => m.target.nodeType == 1 && a11yFix(m.target)));
    ['#m', '#dv', '#bn'].forEach(q => {
      const el = $(q);
      if (el && el.nodeType) {
        ob.observe(el, { childList: true, subtree: true });
        a11yFix(el)
      }
    })
  }
}
