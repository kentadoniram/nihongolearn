'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const draw=(app,expr,n)=>app.run(`(()=>{const a=[];for(let i=0;i<${n};i++)a.push(${expr});return a})()`);
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,vari=a=>{const m=mean(a);return a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
test('random samplers',async t=>{
 const app=await loadApp({seed:21});
 await t.test('should draw standard normal numbers with mean 0 and variance 1',()=>{const a=draw(app,'nrm()',8000);assert.ok(Math.abs(mean(a))<.05);assert.ok(Math.abs(vari(a)-1)<.08)});
 await t.test('should draw gamma(3) numbers with mean 3 and variance 3',()=>{const a=draw(app,'rg(3)',8000);assert.ok(Math.abs(mean(a)-3)<.15);assert.ok(Math.abs(vari(a)-3)<.5)});
 await t.test('should draw beta(2,5) numbers with mean 2/7',()=>{const a=draw(app,'rb(2,5)',8000);assert.ok(Math.abs(mean(a)-2/7)<.01)});
 await t.test('should draw Poisson(4) counts with mean 4 and variance 4',()=>{const a=draw(app,'pois(4)',8000);assert.ok(Math.abs(mean(a)-4)<.15);assert.ok(Math.abs(vari(a)-4)<.4)});
 await t.test('should favour the weaker item when Thompson sampling from two beta beliefs',()=>{
  const a=draw(app,'rb(3,9)<rb(9,3)?1:0',2000);assert.ok(mean(a)>.95);assert.ok(mean(a)<1)});
});
test('difficulty regression with item difficulty (Rasch style) and log-likelihood',async t=>{
 const app=await loadApp({seed:22}),R=rng(5),sg=z=>1/(1+Math.exp(-z)),wt=[.5,1.2,-1,.8,-.6,0,0,0,0,0,0,0,0];
 const mk=()=>{const x=[1,...[1,2,3,4].map(()=>R()<.5?1:0),0,0,0,0,0,0,0,0];const p=sg(wt.reduce((a,v,i)=>a+v*x[i],0));return{x,p,y:R()<p?1:0}};
 const train=Array.from({length:4000},mk),test_=Array.from({length:1500},mk);
 const loss=app.run(`(()=>{const D=${JSON.stringify(train)};let s=0;D.forEach(d=>{s+=learn(d.x,d.y,null)});return s/D.length})()`);
 const pred=app.run(`${JSON.stringify(test_.map(d=>d.x))}.map(x=>pc(x,null))`);
 const ll=test_.reduce((a,d,i)=>a-Math.log(d.y?pred[i]:1-pred[i]),0)/test_.length,pb=mean(test_.map(d=>d.y)),base=test_.reduce((a,d)=>a-Math.log(d.y?pb:1-pb),0)/test_.length;
 await t.test('should beat the constant base-rate model on fresh data after training',()=>assert.ok(ll<base-.02,`${ll.toFixed(3)} vs ${base.toFixed(3)}`));
 await t.test('should predict probabilities that track the true ones',()=>{const a=pred,b=test_.map(d=>d.p),ma=mean(a),mb=mean(b);const c=a.reduce((s,v,i)=>s+(v-ma)*(b[i]-mb),0)/Math.sqrt(a.reduce((s,v)=>s+(v-ma)**2,0)*b.reduce((s,v)=>s+(v-mb)**2,0));assert.ok(c>.8,'corr '+c)});
 await t.test('should keep the running negative log-likelihood equal to the sum of the surprises',()=>{const r=app.run(`(()=>{const x=[1,1,0,0,0,0,0,0,0,0,0,0,0],n0=S.nn,t0=S.nt;let s=0;for(let i=0;i<30;i++)s+=learn(x,i%3?1:0,null);return[S.nn-n0,S.nt-t0-s]})()`);assert.equal(r[0],30);assert.ok(Math.abs(r[1])<1e-9)});
 await t.test('should show higher observed success in the high-prediction bin than in the low one',()=>{const c=app.run('S.cal.map(b=>b[0]?b[1]/b[0]:null)').filter(v=>v!==null);assert.ok(c[c.length-1]>c[0])});
 await t.test('should learn a larger difficulty for an item that is missed often',()=>{
  const b=app.run(`(()=>{const x=[1,1,0,0,0,0,0,0,0,0,0,0,0];for(let i=0;i<60;i++){learn(x,i%10==0?1:0,'t-hard');learn(x,i%10==0?0:1,'t-easy')}return[S.beta['t-hard'],S.beta['t-easy']]})()`);assert.ok(b[0]>b[1],b.join(' vs '))});
});
test('robust response-time scoring and confusion memory',async t=>{
 const app=await loadApp({seed:23});
 await t.test('should score a very slow answer far above normal with a robust z-score',()=>{app.run('S.rt={}');for(let i=0;i<20;i++)app.run(`robZ('t',${1400+i*10})`);assert.ok(app.run(`robZ('t',9000)`)>3);assert.ok(Math.abs(app.run(`robZ('t',1500)`))<1.5)});
 await t.test('should compute the median of an unsorted list',()=>assert.equal(app.run('med([9,1,5])'),5));
 await t.test('should offer a previously chosen wrong answer much more often (Dirichlet smoothing)',()=>{
  const rate=x=>app.run(`(()=>{const w=W().find(z=>z.w=='学校');S.i['学校']={s:3,d:5,t:Date.now(),f:Date.now(),n:3,l:0,x:${JSON.stringify(x)}};let c=0;for(let i=0;i<300;i++){S.i['学校'].lo=[];if(opts(w,'w',1).some(z=>z.w=='猫'))c++}return c/300})()`);
  const a=rate({}),b=rate({'猫':30});assert.ok(b>a+.2,`${a} -> ${b}`)});
});
test('Monte Carlo mastery forecast',async t=>{
 const setup=async q=>{const app=await loadApp({seed:24});app.run(`S.days={a:1,b:1};S.cal=[[0,0],[0,0],[0,0],[0,0],[100,${q}]];W().filter(w=>!w.g).slice(0,30).forEach(w=>{S.i[w.w]={s:3,d:5,t:Date.now(),f:Date.now(),n:3,l:0,x:{}}})`);return app};
 await t.test('should return an ordered interval (low, median, high)',async()=>{const f=(await setup(90)).run('forecast(14)');assert.ok(f.lo<=f.med&&f.med<=f.hi)});
 await t.test('should forecast more solid items when your accuracy is higher',async()=>{const hi=(await setup(95)).run('forecast(14)').med,lo=(await setup(20)).run('forecast(14)').med;assert.ok(hi>lo,hi+' vs '+lo)});
 await t.test('should forecast at least as many solid items over a longer horizon',async()=>{const a=await setup(95);assert.ok(a.run('forecast(28)').med>=a.run('forecast(7)').med)});
});
