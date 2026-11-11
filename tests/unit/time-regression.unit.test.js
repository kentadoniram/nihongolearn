'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const away=(app,days,w0=2.4)=>app.run(`(()=>{const n=Date.now();S.mdl.w[0]=${w0};W().filter(w=>!w.g).slice(0,20).forEach(w=>{S.i[w.w]={s:8,d:4,t:n-(${days}+1)*864e5,f:n-60*864e5,n:6,l:0,x:{}}});S.la=n-${days}*864e5;const r=absence();return r?{g:r.g,r0:r.r0,r1:r.r1,k:r.k,w0:S.mdl.w[0]}:null})()`);
test('time-based regression after time away',async t=>{
 await t.test('should do nothing when you were away for less than three days',async()=>{const app=await loadApp({seed:1});assert.equal(away(app,2),null);assert.equal(app.run('S.mdl.w[0]'),2.4)});
 await t.test('should lower the estimated recall after a long absence',async()=>{const a=away(await loadApp({seed:1}),20);assert.ok(a.g==20&&a.r1<a.r0,JSON.stringify(a))});
 await t.test('should ease the ability estimate back towards its start value',async()=>{const a=away(await loadApp({seed:1}),20);assert.ok(a.w0<2.4&&a.w0>1.2)});
 await t.test('should ease the ability back more the longer you were away',async()=>{const s=away(await loadApp({seed:1}),7),l=away(await loadApp({seed:1}),60);assert.ok(l.w0<s.w0&&l.r1<s.r1)});
 await t.test('should apply the regression only once for one absence',async()=>{const app=await loadApp({seed:1});away(app,20);assert.equal(app.run('absence()'),null)});
 await t.test('should lower the effective memory strength as time passes',async()=>{const app=await loadApp({seed:1});const r=app.run(`(()=>{const n=Date.now(),a={s:10,t:n-864e5},b={s:10,t:n-40*864e5};return[sEff(a,n),sEff(b,n)]})()`);assert.ok(r[1]<r[0])});
 await t.test('should ask easier question stages for words not seen for a long time',async()=>{const app=await loadApp({seed:1});const r=app.run(`(()=>{const n=Date.now(),it={s:12,t:n-150*864e5};return[stg(it),stg(it,n)]})()`);assert.ok(r[1]<r[0],r.join(' vs '))});
 await t.test('should show the welcome-back card on the Today screen and remove it after the first answer',async()=>{
  const app=await loadApp({seed:1});away(app,20);assert.match(app.run(`today();document.querySelector('#m').innerHTML`),/Welcome back after 20 days/);
  app.run(`const w=W().find(x=>x.w=='学校');S.i['学校']={s:3,d:5,t:Date.now(),f:Date.now(),n:3,l:0,x:{}};cur=build(w,'jm');ans(0)`);assert.equal(app.run('S.ab'),null)});
});
