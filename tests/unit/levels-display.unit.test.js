'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('levels, furigana and Progress groups',async t=>{
 const app=await loadApp({seed:11});
 const S0=`S.jl=0;S.i={};GATE.t=0;`;
 const ej=(lv,s)=>app.run(`S.jl=${lv};GATE.t=0;ej(${JSON.stringify(s)})`);
 const s='私は概要を学校で説明しました。';
 await t.test('should hold the vocabulary of every JLPT level, N5 to N1',()=>{
  const c=app.run(`(()=>{const c={};W().filter(w=>!w.g&&!w.t).forEach(w=>c[w.l]=(c[w.l]||0)+1);return c})()`);
  assert.ok(c[5]>=600&&c[4]>=650&&c[3]>=120&&c[2]>=200&&c[1]>=150,JSON.stringify(c))});
 await t.test('should have a kanji entry for every kanji in the N2 and N1 words',()=>{
  const m=app.run(`(()=>{const u=new Set();W().filter(w=>!w.g&&w.l<=2).forEach(w=>[...w.w].forEach(c=>{if(K.test(c))u.add(c)}));return [...u].filter(c=>!KJ[c])})()`);
  assert.deepEqual([...m],[])});
 await t.test('should have no word twice',()=>{
  assert.equal(app.run(`(()=>{const s=new Set();let d=0;V.forEach(w=>{if(s.has(w.w))d++;s.add(w.w)});return d})()`),0)});
 await t.test('should show N5 kanji plainly and give furigana for kanji above an N5 learner',()=>{
  const h=ej(5,s);assert.match(h,/>学校</);assert.ok(!/<ruby>学校/.test(h));assert.match(h,/<ruby>概要<rt>がいよう<\/rt><\/ruby>/);assert.match(h,/<ruby>説明<rt>せつめい<\/rt><\/ruby>/)});
 await t.test('should show kanji within the level even when they were never studied',()=>{
  const h=ej(3,s);assert.match(h,/>説明</);assert.ok(!/<ruby>説明/.test(h));assert.match(h,/<ruby>概要/)});
 await t.test('should show every kanji plainly to an N1 learner',()=>{assert.ok(!/<ruby>/.test(ej(1,s)))});
 await t.test('should never print an N1 kanji bare to an N5 learner, in tiles or passages',()=>{
  assert.match(app.run(`S.jl=5;GATE.t=0;jw('概要')`),/<ruby>概要<rt>がいよう/);
  assert.match(app.run(`S.jl=5;GATE.t=0;pj('概要を読む')`),/<ruby>概要/)});
 await t.test('should use hiragana readings and keep kana text as it is',()=>{
  assert.equal(app.run(`S.jl=5;GATE.t=0;jw('です')`),'です');assert.equal(app.run(`S.jl=5;GATE.t=0;jw('学校')`),'学校')});
 await t.test('should find the level of a kanji from its entry, or from its easiest word',()=>{
  assert.equal(app.run(`kjLv('学')`),5);assert.equal(app.run(`kjLv('曖')`),1)});
 await t.test('should not print the whole sentence in romaji unless you turn that on',()=>{
  const r=on=>app.run(`(()=>{S.rm=${on};const q=TY.find(x=>x.t.length>=3);return trioT(q)})()`);
  assert.ok(!/class="rm"/.test(r(false)));assert.match(r(true),/class="rm"/);app.run(`S.rm=false`)});
 await t.test('should keep N2 and N1 words out of practice until the levels above are known',()=>{
  app.run(S0);assert.equal(app.run(`lvIntro(3)`),false);assert.equal(app.run(`lvIntro(2)`),false);assert.equal(app.run(`lvOpen(2)`),false);
  const L=app.run(`(()=>{const o=new Set();for(let i=0;i<25;i++){const x=pick();if(x&&x.w)o.add(x.w.l)}return [...o]})()`);L.forEach(l=>assert.ok(l>=4,'level '+l))});
 await t.test('should open the next level when 70 percent of the one before is met, or when you choose your level',()=>{
  app.run(S0);assert.equal(app.run(`S.jl=2;GATE.t=0;lvIntro(2)`),true);assert.equal(app.run(`lvIntro(1)`),false);
  app.run(`S.jl=0;GATE.t=0;W().filter(w=>!w.g&&!w.t&&w.l>=4).forEach(w=>S.i[w.w]={s:3,f:1,d:5,l:1,n:1});GATE.t=0`);
  assert.equal(app.run(`lvIntro(3)`),true);assert.equal(app.run(`ulv()`),3);app.run(S0)});
 await t.test('should rate an N5 word easier than an N1 word, and use the learned difficulty once you have met a word',()=>{
  const a=app.run(`pgDiff(W().find(w=>w.w=='水'))`),b=app.run(`pgDiff(W().find(w=>w.w=='概要'))`);assert.ok(a<b);
  assert.equal(app.run(`S.i['概要']={s:2,f:Date.now(),d:2,l:1,n:3};pgDiff(W().find(w=>w.w=='概要'))`),.2);app.run(S0)});
 await t.test('should group vocabulary by JLPT level, difficulty and newly acquired words',()=>{
  const g=k=>app.run(`pgGroups('${k}')`);
  assert.equal((g('lv').match(/<details/g)||[]).length,6);assert.equal((g('df').match(/<details/g)||[]).length,3);assert.equal((g('nw').match(/<details/g)||[]).length,3);
  assert.equal(app.run(`pgSet('lv','1').length`),app.run(`W().filter(w=>!w.g&&w.l==1).length`));
  assert.equal(app.run(`pgSet('df','e').length+pgSet('df','m').length+pgSet('df','h').length`),app.run(`W().filter(w=>!w.g).length`))});
 await t.test('should list words learned today under newly acquired, newest first',()=>{
  app.run(`S.i={};S.i['水']={s:1,f:Date.now(),d:5,l:1,n:1};S.i['火']={s:1,f:Date.now()-3*864e5,d:5,l:1,n:1};S.i['木']={s:1,f:Date.now()-60*864e5,d:5,l:1,n:1}`);
  assert.deepEqual([...app.run(`pgSet('nw','d').map(w=>w.w)`)],['水']);assert.deepEqual([...app.run(`pgSet('nw','w').map(w=>w.w)`)],['水','火']);assert.deepEqual([...app.run(`pgSet('nw','m').map(w=>w.w)`)],['水','火']);app.run(S0)});
 await t.test('should fill a group with word rows when it is opened and offer more',()=>{
  const h=app.run(`(()=>{const box={dataset:{},innerHTML:''},d={open:true,dataset:{k:'lv',g:'5'},querySelector:()=>box};pgList(d);return box.innerHTML})()`);
  assert.equal((h.match(/class="vr"/g)||[]).length,40);assert.match(h,/Show more/)});
 await t.test('should show the groups in the Progress tab as collapsed sections',()=>{
  app.run(`prog()`);const h=app.ctx.document.querySelector('#m').innerHTML;
  assert.match(h,/By JLPT level/);assert.match(h,/By difficulty/);assert.match(h,/Newly acquired/);assert.ok(!/<details class="card pg" open/.test(h))});
});
