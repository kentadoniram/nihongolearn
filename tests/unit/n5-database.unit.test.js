'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
test('N5 database and verb conjugation table',async t=>{
 const app=await loadApp({seed:61}),n5=(js)=>app.run(`W().filter(w=>!w.g&&w.l==5).${js}`);
 await t.test('should hold at least 250 N5 words and 120 N5 kanji',()=>{assert.ok(n5('length')>=250);assert.ok(app.run('Object.values(KJ).filter(k=>k.l==5).length')>=120)});
 await t.test('should hold at least 50 N5 verbs',()=>assert.ok(n5('filter(w=>posOf(w)=="verb").length')>=50));
 await t.test('should give at least 60 N5 words a sample sentence',()=>assert.ok(n5('filter(w=>w.e).length')>=60));
 await t.test('should attach every sample sentence in N5 pack 2 to a word in the deck',()=>{const ex=JSON.parse(read('data/n5b.json')).examples.rows;const m=app.run(`${JSON.stringify(ex.map(r=>r[0]))}.filter(w=>!W().some(x=>x.w==w))`);assert.deepEqual([...m],[])});
 await t.test('should show a conjugation table with 11 forms for every N5 verb that can be conjugated',()=>{
  const bad=app.run(`W().filter(w=>!w.g&&w.l==5&&posOf(w)=='verb'&&vclass(w)&&vclass(w)!='suru'&&(vtab(w).match(/<tr>/g)||[]).length!=11).map(w=>w.w)`);assert.deepEqual([...bad],[])});
 await t.test('should use the irregular ない and て forms for ある and 行く',()=>{const r=app.run(`(()=>{const f=(n,x)=>conj(W().find(w=>w.w==n),x).s;return[f('ある','nai'),f('ある','nakatta'),f('行く','te'),f('来る','masu'),f('いる','nai'),f('飲む','tai'),f('食べる','mashou')]})()`);assert.deepEqual([...r],['ない','なかった','行って','来ます','いない','飲みたい','食べましょう'])});
 await t.test('should not show a table for nouns or for する',()=>{assert.equal(app.run(`vtab(W().find(w=>w.w=='学校'))`),'');assert.equal(app.run(`vtab(W().find(w=>w.w=='する'))`),'')});
 await t.test('should put the table in the dictionary entry of a verb',()=>{const h=app.run(`(()=>{dict(W().findIndex(w=>w.w=='食べる'));return document.querySelector('#dv').innerHTML})()`);assert.match(h,/Polite negative/);assert.match(h,/食べません/)});
});
