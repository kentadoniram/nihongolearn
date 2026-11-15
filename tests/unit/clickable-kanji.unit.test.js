'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
// Kanji left over once every tap target (.kj) and every furigana (rt) is taken out.
const LEFT=`(h=>h.replace(/<rt>[^<]*<\\/rt>/g,'').replace(/<span class="kj"[^>]*>.<\\/span>/g,'').replace(/<[^>]+>/g,'').replace(/&[a-z#0-9]+;/g,'').match(/[\\u4e00-\\u9fff]/g)||[])`;
test('every kanji in a sentence can be tapped',async t=>{
 const app=await loadApp({seed:21});
 const left=src=>app.run(`(()=>{const bad=[];${src}.forEach(s=>{const l=${LEFT}(ej(s));if(l.length)bad.push(s+' -> '+l.join(''))});return bad})()`);
 await t.test('should make every kanji of every example sentence tappable, at every JLPT level',()=>{
  for(const lv of [0,5,3,1])assert.deepEqual([...left(`(S.jl=${lv},GATE.t=0,W().filter(w=>!w.g&&w.e).map(w=>w.e[0]))`)],[])});
 await t.test('should make every kanji of every question, reading passage and build sentence tappable',()=>{
  assert.deepEqual([...left(`DIAG.map(q=>q.q||'').concat(DIAG.map(q=>q.y||''))`)],[]);
  assert.deepEqual([...left(`LAB.map(u=>u.p||'').concat(LAB.map(u=>u.q||''))`)],[]);
  assert.deepEqual([...left(`SN.map(s=>s.t.join(''))`)],[]);
  assert.deepEqual([...left(`TY.map(s=>s.t.join(''))`)],[])});
 await t.test('should make kanji inside a word tappable, with the furigana of the word kept above your level',()=>{
  const h=app.run(`S.jl=5;GATE.t=0;ej('宿題をします。')`);
  assert.match(h,/<ruby><span class="kj"[^>]*data-k="宿"[^>]*>宿<\/span><span class="kj"[^>]*data-k="題"[^>]*>題<\/span><rt>しゅくだい<\/rt><\/ruby>/)});
 await t.test('should make a kanji outside any known word tappable too',()=>{
  const h=app.run(`ej('旧友に会いました。')`);assert.match(h,/data-k="旧"/);assert.match(h,/data-k="友"/)});
 await t.test('should show the hiragana reading, the meaning and the word when a kanji in a sentence is tapped',()=>{
  const tip=app.run(`(()=>{const lx={dataset:{lx:'w:宿題'}};const el={dataset:{k:'宿',s:'1'},closest:s=>s=='.lx'?lx:null};S.tf={r:0,m:0,w:0,p:0,s:0,l:0};return tipHTML('宿',null,true,wordCtx(el))})()`);
  assert.match(tip,/On [ぁ-ん]+/);assert.ok(!/On [ァ-ヶ]/.test(tip));assert.match(tip,/Kun /);assert.match(tip,/In 宿題 \(しゅくだい\): homework/);assert.match(tip,/<div>[a-z ,()]+<\/div>/)});
 await t.test('should keep the study toggles for kanji outside sentences',()=>{
  const tip=app.run(`(()=>{S.tf={r:0,m:0,w:0,p:0,s:0,l:0};return tipHTML('宿')})()`);assert.ok(!/On /.test(tip))});
 await t.test('should leave tile buttons free of nested tap targets so that a tile can still be chosen',()=>{
  assert.ok(!/class="kj"/.test(app.run(`jw('宿題','',1)`)))});
 await t.test('should show a word line for kanji inside a conjugated verb or stem',()=>{
  const h=app.run(`ej('毎日、日本語を勉強します。')`);assert.ok((h.match(/class="kj"/g)||[]).length>=7)});
});
test('the dictionary page of a word',async t=>{
 const app=await loadApp({seed:22});
 await t.test('should make every kanji of the example sentence tappable on the page of 宿題',()=>{
  const h=app.run(`(()=>{dict(W().indexOf(W().find(w=>w.w=='宿題')));return $('#dv').innerHTML})()`);
  const ex=h.match(/<b>Example<\/b><p>(.*?)<\/p>/)[1];
  assert.deepEqual([...app.run(`${LEFT}(${JSON.stringify(ex)})`)],[]);assert.match(ex,/data-k="宿"/);assert.match(ex,/data-k="題"/);assert.match(ex,/data-s="1"/)});
 await t.test('should do so on the page of every N5 and N4 word',()=>{
  const bad=app.run(`(()=>{const o=[];W().filter(w=>!w.g&&!w.t&&(w.l==5||w.l==4)).forEach(w=>{dict(W().indexOf(w));const h=$('#dv').innerHTML,m=h.match(/<b>Example<\\/b><p>(.*?)<\\/p>/);if(!m)o.push(w.w+' (no example)');else if(${LEFT}(m[1]).length)o.push(w.w)});return o})()`);
  assert.deepEqual([...bad],[])});
});
