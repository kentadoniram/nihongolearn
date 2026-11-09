'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('forgetting curve and difficulty model',async t=>{
 const app=await loadApp({seed:7});
 await t.test('should give a recall chance of 90 percent after exactly the stability time',()=>assert.ok(Math.abs(app.run('ret({s:2,t:Date.now()-2*864e5},Date.now())')-.9)<1e-6));
 await t.test('should give a recall chance of 1 straight after review',()=>assert.ok(app.run('ret({s:2,t:Date.now()},Date.now())')>.999));
 await t.test('should lower the recall chance as time passes',()=>assert.ok(app.run('ret({s:3,t:Date.now()-864e5},Date.now())')>app.run('ret({s:3,t:Date.now()-5*864e5},Date.now())')));
 await t.test('should map stability to four difficulty stages',()=>assert.deepEqual([...app.run('[.5,2,6,15,40].map(s=>stg({s}))')],[0,1,2,3,3]));
 await t.test('should raise the predicted success after repeated correct answers',()=>{
  const r=app.run(`(()=>{const x=feat(W().find(w=>!w.g),'jm',null),b=pc(x,'t-up');for(let i=0;i<25;i++)learn(x,1,'t-up');return pc(x,'t-up')-b})()`);assert.ok(r>0)});
 await t.test('should score a surprising failure as a larger loss than an expected success',()=>{
  const r=app.run(`(()=>{const x=feat(W().find(w=>!w.g),'jm',null);return[learn(x,0,'t-a'),learn(x,1,'t-b')]})()`);assert.ok(r[0]>r[1])});
});
