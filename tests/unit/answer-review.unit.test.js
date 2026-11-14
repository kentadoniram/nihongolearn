'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('answer review for sentence writing',async t=>{
 const app=await loadApp({seed:7});
 const typed=v=>app.run(`(()=>{const q=TY.find(x=>x.en=='I read a book.');const r=evalT(q,${JSON.stringify(v)});return {ok:r.ok,h:revTyped(q,${JSON.stringify(v)},r)}})()`);
 const tiles=(order,ok)=>app.run(`(()=>{const q=SN.find(s=>s.t.join(' ')=='私 は 寿司 を 食べます');return revTiles(q,${JSON.stringify(order)}.map(i=>q.t[i]),${ok})})()`);
 await t.test('should show your answer and the correct answer even when a typed sentence is right',()=>{const r=typed('わたしはほんをよみます');assert.equal(r.ok,true);assert.match(r.h,/Your answer/);assert.match(r.h,/Correct answer/);assert.match(r.h,/Your sentence matches/)});
 await t.test('should mark the parts of a typed answer that differ and say what is missing',()=>{const r=typed('わたしはほんをたべました');assert.equal(r.ok,false);assert.match(r.h,/<mark class="d">/);assert.match(r.h,/<mark class="i">/);assert.match(r.h,/読/);assert.match(r.h,/Tense or form/)});
 await t.test('should show the answer as typed, including romaji',()=>{const r=typed('watashi wa hon wo yomimasu');assert.match(r.h,/watashi wa hon wo yomimasu/)});
 await t.test('should explain each misplaced tile and show the usual order',()=>{const h=tiles([4,3,2,1,0],false);assert.match(h,/must come last/);assert.match(h,/must come right after 寿司/);assert.match(h,/<mark class="d">/)});
 await t.test('should show the correct order next to a correct tile answer',()=>{const h=tiles([0,1,2,3,4],true);assert.match(h,/Correct answer/);assert.match(h,/matches the correct sentence/);assert.ok(!/<mark/.test(h))});
 await t.test('should find the shared items of two lists with diffTok',()=>{const d=app.run(`diffTok(['a','b','c'],['a','c','d'])`);assert.deepEqual([...d.a],[1,0,1]);assert.deepEqual([...d.b],[1,1,0])});
});
