'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const el=(inPass=true,lx='w:学校',txt='学校')=>`({dataset:{lx:${JSON.stringify(lx)}},textContent:${JSON.stringify(txt)},closest:s=>s=='.pass'&&${inPass}?{}:null})`;
test('reading help points in passages',async t=>{
 const app=await loadApp({seed:51}),look=(e,d)=>app.run(`kLook(${e},${d})`);
 await t.test('should give 1 point for the first tap on a word in a passage',()=>{const e=el();assert.equal(look(e,0),1);assert.equal(look(e,0),0)});
 await t.test('should give 3 points in total when the same word is double tapped',()=>{const e=el(true,'w:先生','先生');assert.equal(look(e,0),1);assert.equal(look(e,1),2);assert.equal(look(e,1),0)});
 await t.test('should give 3 points for a double tap on a word that was not tapped before',()=>assert.equal(look(el(true,'w:電車','電車'),1),3));
 await t.test('should add points to the total, to XP and to each kanji tally',()=>{
  const r=app.run('[S.ki.p,S.ki.c,S.ki.d,S.ki.k["学"].c,S.ki.k["先"].d]');assert.equal(r[0],1+3+3);assert.equal(r[1],3);assert.equal(r[2],2);assert.equal(r[3],1);assert.equal(r[4],1)});
 await t.test('should give no points for text outside a reading passage',()=>{const p=app.run('S.ki.p');assert.equal(look(el(false,'w:駅','駅'),1),0);assert.equal(app.run('S.ki.p'),p)});
 await t.test('should allow the same word to earn points again in a new passage',()=>{app.run('PLK={}');assert.equal(look(el(),0),1)});
 await t.test('should reset the per-passage counters when a new Lab activity is shown',()=>{app.run('lab()');assert.equal(app.run('PLK.n||0'),0)});
 await t.test('should summarise the points and the most looked-up kanji',()=>assert.match(app.run('kiStatus()'),/points from \d+ lookups.*Most looked-up kanji/));
});
