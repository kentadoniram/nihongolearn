'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('kanji reading mastery',async t=>{
 const fresh=async()=>loadApp({seed:9});
 await t.test('should start a new kanji low and untracked',async()=>{const {run}=await fresh();assert.ok(Math.abs(run(`kmScore('学')`)-1/3)<1e-9);assert.equal(run(`kmLevel('学')`),0)});
 await t.test('should lower the score for each request for help, and more for See more than for a tap',async()=>{
  const {run}=await fresh();const a=run(`kmScore('学')`);run(`kmHelp(['学'],0)`);const b=run(`kmScore('学')`);run(`kmHelp(['学'],1)`);const c=run(`kmScore('学')`);
  assert.ok(a>b&&b>c);assert.ok(a-b<b-c)});
 await t.test('should not count repeat taps in the same passage twice',async()=>{
  const {run}=await fresh();run(`kmHelp(['学'],0)`);const b=run(`kmScore('学')`);run(`kmHelp(['学'],0,1)`);assert.equal(run(`kmScore('学')`),b)});
 await t.test('should raise the score for independent reading and mark a kanji mastered only after enough of it',async()=>{
  const {run}=await fresh();for(let i=0;i<3;i++)run(`kmAdd('校','ok')`);assert.ok(!run(`kmMastered('校')`));
  for(let i=0;i<7;i++)run(`kmAdd('校','ok')`);assert.equal(run(`kmMastered('校')`),true)});
 await t.test('should take mastery away again when help is needed often',async()=>{
  const {run}=await fresh();for(let i=0;i<10;i++)run(`kmAdd('校','ok')`);assert.equal(run(`kmMastered('校')`),true);
  for(let i=0;i<4;i++)run(`kmAdd('校','tap')`);assert.equal(run(`kmMastered('校')`),false)});
 await t.test('should give less credit for a kanji read as romaji only than for one read as kanji',async()=>{
  const {run}=await fresh();run(`kmAdd('山','ok')`);run(`kmAdd('川','rom')`);assert.ok(run(`kmScore('山')`)>run(`kmScore('川')`))});
 await t.test('should let old evidence fade over time',async()=>{
  const {run}=await fresh();for(let i=0;i<6;i++)run(`kmAdd('山','tap')`);const now=run(`kmScore('山')`);const later=run(`kmScore('山',Date.now()+120*864e5)`);assert.ok(later>now)});
 await t.test('should show a kanji as romaji until it is mastered, then as the kanji itself',async()=>{
  const {run}=await fresh();const s='私は学校へ行きます。';
  assert.match(run(`pj(${JSON.stringify(s)})`),/class="jp lx kr"[^>]*>gakkou</);
  for(const c of ['学','校'])for(let i=0;i<10;i++)run(`kmAdd('${c}','ok')`);
  const h=run(`pj(${JSON.stringify(s)})`);assert.ok(!/>gakkou</.test(h));assert.match(h,/学校/)});
 await t.test('should record a tap on a romaji word and a See more as learning events',async()=>{
  const {run}=await fresh();
  run(`(()=>{const el={closest:s=>s=='.pass'?{}:null,dataset:{lx:'w:学校',kj:'学校'},textContent:'gakkou'};kLook(el,0);kLook(el,1)})()`);
  assert.equal(run(`S.km['学'].h`),1);assert.equal(run(`S.km['学'].d`),1);assert.deepEqual([...run(`S.kl.map(x=>x.k)`)].slice(0,4),['tap','tap','more','more']);
  assert.ok(run(`kmScore('学')`)<1/3)});
 await t.test('should credit kanji read without help after a correct answer and not credit the ones that needed help',async()=>{
  const {run}=await fresh();run(`PKH=new Set();kmHelp(['学'],0);kmDone({p:'学校へ行きます'},true)`);
  assert.equal(run(`S.km['校'].i`),1);assert.equal(run(`S.km['学'].i`),0)});
 await t.test('should list the kanji that need practice, weakest first',async()=>{
  const {run}=await fresh();run(`kmHelp(['学'],1);kmAdd('校','ok')`);assert.deepEqual([...run(`kmWeak(5)`)],['学','校'])});
 await t.test('should keep the newer record of a kanji when memory is imported',async()=>{
  const {run}=await fresh();run(`S.km={'学':{a:0,b:1,h:1,d:0,i:0,n:1,t:1}}`);run(`mrg({km:{'学':{a:0,b:5,h:3,d:0,i:0,n:3,t:99}}})`);assert.equal(run(`S.km['学'].t`),99)});
});
