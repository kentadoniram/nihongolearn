'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('N4 and N3 content',async t=>{
 const app=await loadApp({seed:71}),count=l=>app.run(`W().filter(w=>!w.g&&w.l==${l}).length`);
 await t.test('should hold at least 480 N4 words and 120 N3 words',()=>{assert.ok(count(4)>=480,'N4 '+count(4));assert.ok(count(3)>=120,'N3 '+count(3))});
 await t.test('should have a kanji entry for every kanji used in the deck',()=>{const m=app.run(`(()=>{const u=new Set();W().filter(w=>!w.g).forEach(w=>[...w.w].forEach(x=>{if(K.test(x)&&!KJ[x])u.add(x)}));return[...u].join('')})()`);assert.equal(m,'')});
 await t.test('should hold at least 18 N3 grammar questions as practice items',()=>{assert.ok(app.run(`DIAG.filter(q=>q.c=='g'&&q.l==3).length`)>=18);assert.equal(app.run(`['g301','g306','g312'].every(id=>GI.some(x=>x.w==id))`),true)});
 await t.test('should hold at least five N3 sentence patterns',()=>assert.ok(app.run('FM.filter(f=>f.l==3).length')>=5));
 await t.test('should link every N3 sentence to an existing pattern',()=>{const b=app.run(`SN.filter(s=>s.l==3&&s.f&&!FM.some(f=>f.id==s.f)).map(s=>s.en)`);assert.deepEqual([...b],[])});
 await t.test('should accept the typed romaji answer for every N3 sentence that has readings',()=>{
  const bad=app.run(`SN.filter(s=>s.l==3&&s.r).filter(s=>{const r=s.r.split(' '),v=r.map(x=>romaji(x)).join(' ');return !evalT({en:s.en,t:s.t,r},v).ok}).map(s=>s.en)`);assert.deepEqual([...bad],[])});
 await t.test('should explain every N3 grammar question',()=>{const b=app.run(`DIAG.filter(q=>q.c=='g'&&q.l==3&&!(q.y&&q.y.length>25)).map(q=>q.id)`);assert.deepEqual([...b],[])});
});
