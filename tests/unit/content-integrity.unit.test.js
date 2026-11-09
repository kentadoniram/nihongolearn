'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
test('learning content',async t=>{
 const app=await loadApp(),content=JSON.parse(read('data/content.json'));
 await t.test('should list only pack files that exist and parse',()=>{for(const f of content.packs)assert.doesNotThrow(()=>JSON.parse(read('data/'+f)),f)});
 await t.test('should include N4 pack 5 in the content list',()=>assert.ok(content.packs.includes('n4e.json')));
 await t.test('should load the words of N4 pack 5 into the deck',()=>assert.equal(app.run(`['旅館','美味しい','今朝','見つける'].every(x=>W().some(w=>w.w==x))`),true));
 await t.test('should give every word a unique id',()=>{const d=app.run(`(()=>{const s=new Set(),d=[];W().forEach(w=>{if(s.has(w.w))d.push(w.w);s.add(w.w)});return d})()`);assert.deepEqual([...d],[])});
 await t.test('should give every word a kana reading, a meaning and a JLPT level from 3 to 5',()=>{
  const bad=app.run(`W().filter(w=>!w.g&&!(w.r&&w.m&&/^[ぁ-ゟァ-ヿー・]+$/.test(w.r)&&[3,4,5].includes(w.l))).map(w=>w.w)`);assert.deepEqual([...bad],[])});
 await t.test('should have a kanji entry for at least 85 percent of the kanji used in words',()=>{
  const r=app.run(`(()=>{const u=new Set();W().filter(w=>!w.g).forEach(w=>[...w.w].forEach(c=>{if(K.test(c))u.add(c)}));const m=[...u].filter(c=>!KJ[c]);return{n:u.size,m:m.length}})()`);assert.ok(1-r.m/r.n>=.85,`missing ${r.m} of ${r.n}`)});
 await t.test('should give every question a valid answer index, unique options and an explanation',()=>{
  const bad=app.run(`DIAG.filter(q=>!(q.a>=0&&q.a<q.o.length&&new Set(q.o).size==q.o.length&&q.y)).map(q=>q.q)`);assert.deepEqual([...bad],[])});
 await t.test('should align sentence readings with sentence tokens',()=>{
  const bad=app.run(`SN.filter(s=>s.r&&s.r.split(' ').length!=s.t.length).map(s=>s.en)`);assert.deepEqual([...bad],[])});
});
