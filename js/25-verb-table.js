/* js/25-verb-table.js
 * Purpose: Verb conjugation table for the dictionary.
 * Defines (3): CLASS_LBL, VFORMS, vtab
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
// ---- Verb conjugation table for the dictionary ----
const CLASS_LBL={ichidan:'ichidan (る-verb)',godan:'godan (う-verb)',kuru:'irregular (来る)'};
const VFORMS=[['Dictionary (plain)','dict','私は毎日{s}。'],['Polite present','masu','毎日{s}。'],['Polite negative','mase','今日は{s}。'],['Polite past','mashita','昨日{s}。'],['Plain negative','nai','私は{s}。'],['Plain past','ta','もう{s}。'],['Plain past negative','nakatta','昨日は{s}。'],['て-form','te','{s}ください。'],['Want to','tai','私は{s}です。'],['Let us','mashou','一緒に{s}。'],['Is doing','teimasu','今、{s}。']];
function vtab(w){const c=vclass(w);if(w.g||posOf(w)!='verb'||!c||c=='suru')return'';
 const R=VFORMS.map(([n,f,fr])=>{const x=conj(w,f);return x?`<tr><td>${n}</td><td>${e(x.s)}<br><span class="mu">${e(x.r)} (${romaji(x.r)})</span></td><td>${e(fr.replace('{s}',x.s))}</td></tr>`:''}).join('');
 return`<p>Conjugation: ${CLASS_LBL[c]||c}${w.w=='行く'?', with an irregular て-form':''}${w.w=='ある'?', with the irregular negative ない':''}</p><div style="overflow-x:auto"><table class="ct">${R}</table></div><p class="mu" style="text-align:left">The example frames are simple patterns, so check that the meaning fits the verb.</p>`}
