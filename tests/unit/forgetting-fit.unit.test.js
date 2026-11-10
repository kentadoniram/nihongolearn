'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const reviews=(k,n,seed)=>{const R=rng(seed);return Array.from({length:n},()=>{const dt=Math.max(.3,-3*Math.log(1-R())),s=1+R()*9,p=Math.pow(1+19/81*k*dt/s,-.5);return[+dt.toFixed(3),+s.toFixed(3),R()<p?1:0]})};
test('personal forgetting model',async t=>{
 const app=await loadApp({seed:31}),fit=rv=>app.run(`fitFm(${JSON.stringify(rv)})`);
 await t.test('should not fit with fewer than 60 reviews',()=>assert.equal(fit(reviews(1.8,40,1)).ok,0));
 await t.test('should recover a faster-fading memory (k = 1.8) from 700 reviews',()=>{const f=fit(reviews(1.8,700,2));assert.equal(f.ok,1);assert.ok(f.k>1.4&&f.k<2.3,'k '+f.k);assert.ok(f.nll1<f.nll0)});
 await t.test('should recover a slower-fading memory (k = 0.6) from 700 reviews',()=>{const f=fit(reviews(.6,700,3));assert.equal(f.ok,1);assert.ok(f.k>.45&&f.k<.85,'k '+f.k)});
 await t.test('should stay close to the standard curve when memory behaves as the standard curve predicts',()=>{const f=fit(reviews(1,700,4));assert.ok(!f.ok||Math.abs(f.k-1)<.25,JSON.stringify(f))});
 await t.test('should make the recall chance lower when fitted memories fade faster',()=>{
  const r=app.run(`(()=>{const it={s:2,t:Date.now()-2*864e5},a=ret(it,Date.now());S.fm={ok:1,k:2,c:-.5};applyFm();const b=ret(it,Date.now());S.fm=null;applyFm();return[a,b,ret(it,Date.now())]})()`);assert.ok(r[1]<r[0]);assert.ok(Math.abs(r[2]-r[0])<1e-9)});
 await t.test('should ignore reviews less than six hours apart when logging history',()=>{app.run('S.rv=[];rvPush(.1,2,1);rvPush(.2,2,0)');assert.equal(app.run('S.rv.length'),0)});
 await t.test('should refit automatically as the review log grows',()=>{app.run('S.rv=[];S.fm=null');for(const r of reviews(1.8,75,6))app.run(`rvPush(${r[0]},${r[1]},${r[2]})`);assert.ok(app.run('!!S.fm'))});
 await t.test('should explain how many reviews are still needed',()=>{app.run('S.rv=[];S.fm=null');assert.match(app.run('fmStatus()'),/60 reviews/)});
});
