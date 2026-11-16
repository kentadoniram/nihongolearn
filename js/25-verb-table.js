/* js/25-verb-table.js
 * Purpose: Verb conjugation table for the dictionary.
 * Defines (6): CLASS_LBL, VFORMS, VBUILD, vtabRow, vtabClass, vtab
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// ---- Verb conjugation table for the dictionary ----
const CLASS_LBL = { ichidan: 'ichidan (る-verb)', godan: 'godan (う-verb)', kuru: 'irregular (来る)', suru: 'irregular (する)' };

// ['#', group] starts a group. A third value with {s} is an example sentence; any other text says what the form is used for.
const VFORMS = [['#', 'Basic (plain) forms'], ['Dictionary (plain)', 'dict', '私は毎日{s}。'], ['Plain negative',
    'nai', '私は{s}。'], ['Plain past', 'ta', 'もう{s}。'], ['Plain past negative', 'nakatta', '昨日は{s}。'], ['#',
    'Polite forms'], ['Polite present', 'masu', '毎日{s}。'], ['Polite negative', 'mase', '今日は{s}。'], ['Polite past',
    'mashita', '昨日{s}。'], ['Polite past negative', 'masendeshita', '昨日は{s}。'], ['Let us', 'mashou', '一緒に{s}。'],
  ['Want to', 'tai', '私は{s}です。'], ['#', 'て-form and its uses'], ['て-form', 'te', '{s}ください。'], ['Is doing',
    'teimasu', '今、{s}。'], ['Without doing', 'naide', 'without doing; with ください: please do not do it'],
  ['Doing things like', 'tari', '{s}します。 (lists actions, with たり ... たり)'], ['#', 'Ability and voice'],
  ['Potential', 'pot', 'can do, is able to'], ['Passive', 'pas', 'is done to someone (also a respectful style)'],
  ['Causative', 'cau', 'makes or lets someone do'], ['Causative-passive', 'caupas', 'is made to do (often against one\'s wish)'],
  ['#', 'Conditional, will and necessity'], ['Conditional ば', 'ba', 'if (a general condition: ～ば、...)'],
  ['Conditional たら', 'tara', 'if or when (after it happens: ～たら、...)'], ['Volitional (plain)', 'vol',
    'let us, I will (plain style of ましょう)'], ['Imperative', 'imp', 'a command (rough, plain)'], ['Must',
    'nakereba', 'must do (～なければならない)']];
const VBUILD = { ichidan: 'Ichidan: drop る, then add the ending (食べる: 食べ + ます, 食べ + られる, 食べ + させる, 食べ + れば).',
  godan: 'Godan: change the last kana along its row. Negative, passive and causative use the あ-row (書か), polite and て-stem use the い-row (書き), potential, ば and imperative use the え-row (書け), volitional uses the お-row (書こう).',
  kuru: '来る is irregular: こ before ない, られる, させる and よう, き before ます, たい and て, く before れば.', suru: 'する is irregular: し before ます, ない, て and よう; さ before れる and せる; す before れば; potential is できる.' };

// One row of the table: form name, the form with its reading, and an example or what the form is for.
function vtabRow(w, [n, f, fr]) {
  if (n == '#') return `<tr><th colspan="3">${f}</th></tr>`;
  const x = conj(w, f);
  if (!x) return '';
  const use = fr.includes('{s}') ? e(fr.replace('{s}', x.s)) : '<span class="mu">' + e(fr) + '</span>';
  return `<tr><td>${n}</td><td>${e(x.s)}<br><span class="mu">${e(x.r)} (${romaji(x.r)})</span></td><td>${use}</td></tr>`
}

// The line above the table: the verb class and anything irregular about this verb.
const vtabClass = (w, c) => `<p>Conjugation: ${CLASS_LBL[c]||c}${w.w=='行く'?', with an irregular て-form':''}${w.w=='ある'?', with the irregular negative ない':''}` + `${HONV.includes(w.w)?', with the polite stem ～い (いらっしゃいます)':''}</p>`;
function vtab(w) {
  const c = vclass(w);
  if (w.g || posOf(w) != 'verb' || !c) return '';
  const R = VFORMS.map(f => vtabRow(w, f)).join('').replace(/<tr><th[^>]*>[^<]*<\/th><\/tr>(?=<tr><th|$)/g,
    '');
  return vtabClass(w, c) + `<p class="mu" style="text-align:left">${VBUILD[c]}</p><div style="overflow-x:auto"><table class="ct">${R}</table></div>` + `<p class="mu" style="text-align:left">The example frames are simple patterns, so check that the meaning fits the verb.</p>`
}
