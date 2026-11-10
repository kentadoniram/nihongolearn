'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
test('casual speech rules and phrases',async t=>{
 const app=await loadApp({seed:41}),c=(r,w)=>app.run(`CAS_FN.${r}(W().find(x=>x.w==${JSON.stringify(w)}))`);
 for(const [r,w,f,k] of [['shimau','忘れる','忘れてしまった','忘れちゃった'],['shimau','飲む','飲んでしまった','飲んじゃった'],['shimau','行く','行ってしまった','行っちゃった'],['teiru','見る','見ている','見てる'],['teoku','言う','言っておく','言っとく'],['teoku','読む','読んでおく','読んどく'],['nakya','行く','行かなければならない','行かなきゃ'],['tewa','食べる','食べてはだめ','食べちゃだめ'],['tewa','飲む','飲んではだめ','飲んじゃだめ']])
  await t.test(`should turn ${f} into ${k} (${r})`,()=>{const x=c(r,w);assert.equal(x.f,f);assert.equal(x.c,k)});
 await t.test('should give every verb in the deck a correct answer and three different wrong options for every rule',()=>{
  const bad=app.run(`(()=>{const o=[];V.filter(d=>!d.t&&posOf(d)=='verb'&&vclass(d)&&vclass(d)!='suru').forEach(d=>Object.keys(CAS_FN).forEach(r=>{const m=CAS_FN[r](d),u=new Set([m.c,...m.w]);if(u.size!=4||m.c==m.f)o.push(d.w+':'+r)}));return o})()`);assert.deepEqual([...bad],[])});
 await t.test('should load five rules and at least 25 phrases with a meaning and a polite form',()=>{assert.equal(app.run('CAS.rules.length'),5);assert.ok(app.run('CAS.phrases.length')>=25);assert.deepEqual([...app.run('CAS.phrases.filter(p=>!(p.c&&p.p&&p.m)).map(p=>p.c)')],[])});
 await t.test('should list the casual pack in the content list',()=>assert.ok(JSON.parse(read('data/content.json')).packs.includes('casual.json')));
 await t.test('should offer casual rules and phrases as Lab activities',()=>assert.equal(app.run(`labItems().filter(x=>x.k).length`),app.run('CAS.rules.length+CAS.phrases.length')));
 await t.test('should build a Lab question whose correct option is the casual form',()=>{
  const r=app.run(`(()=>{const x=labItems().find(z=>z.k=='r'&&z.r.id=='shimau'),q=ruleQ(x);return[q.o[q.a],q.o.length,new Set(q.o).size]})()`);assert.match(r[0],/(ちゃった|じゃった)$/);assert.equal(r[1],4);assert.equal(r[2],4)});
 await t.test('should show the polite form and the register in the answer to a phrase question',()=>{
  const y=app.run(`(()=>{const q=phraseQ(labItems().find(z=>z.k=='p'));return q.y})()`);assert.match(y,/More polite/)});
});
