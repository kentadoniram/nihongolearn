'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('memory export and import',async t=>{
 await t.test('should keep the newer record of a word when merging memory',async()=>{
  const app=await loadApp();
  app.run(`S.i['t-x']={t:100,s:1};mrg({i:{'t-x':{t:200,s:5},'t-y':{t:50,s:2}}});mrg({i:{'t-x':{t:10,s:9}}})`);
  assert.equal(app.run(`S.i['t-x'].s`),5);assert.equal(app.run(`S.i['t-y'].s`),2)});
 await t.test('should store an imported content pack as content, not as progress',async()=>{
  const app=await loadApp();
  app.run(`mrg({pack:'t-pack',level:4,words:[{w:'猫猫猫',r:'ねこ',m:'cat cat cat'}]})`);
  assert.equal(app.run(`W().some(w=>w.w=='猫猫猫')`),true);assert.equal(app.run(`S.cp.length`),1);assert.equal(app.run(`S.i['猫猫猫']===undefined`),true)});
 await t.test('should round-trip its own memory without changing it',async()=>{
  const app=await loadApp({seed:2});
  app.run(`S.i['t-z']={t:5,s:3,n:1,l:0,d:5,x:{}};save()`);const before=app.run(`JSON.stringify(S.i)`);
  app.run(`mrg(JSON.parse(JSON.stringify(S)))`);assert.equal(app.run(`JSON.stringify(S.i)`),before)});
});
