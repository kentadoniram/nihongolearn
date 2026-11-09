'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const prep=(app,s)=>app.run(`(()=>{const w=W().find(x=>x.w=='学校');S.i['学校']={s:${s},d:5,t:Date.now(),f:Date.now(),n:5,l:0,x:{}};return w})()`);
test('question generation',async t=>{
 await t.test('should cycle through different question forms before repeating one',async()=>{
  const app=await loadApp({seed:3});prep(app,8);
  const ts=[...app.run(`(()=>{const w=W().find(x=>x.w=='学校'),o=[];for(let i=0;i<6;i++){const b=build(w);o.push(b.t=='gq'&&b.qv?'cloze':b.t)}return o})()`)];
  assert.ok(new Set(ts).size>=5,ts.join(','));ts.slice(1).forEach((x,i)=>assert.notEqual(x,ts[i]))});
 await t.test('should offer typing and sentence questions only once a word is learned',async()=>{
  const app=await loadApp({seed:4});prep(app,.5);
  const early=[...app.run(`(()=>{const w=W().find(x=>x.w=='学校'),o=new Set;for(let i=0;i<12;i++){S.i['学校'].s=.5;S.i['学校'].tc={};o.add(build(w).t)}return[...o]})()`)];
  assert.ok(!early.includes('ty')&&!early.includes('tr'),early.join(','))});
 await t.test('should change the order of the options when the same word is asked again',async()=>{
  const app=await loadApp({seed:5});prep(app,3);
  const same=app.run(`(()=>{const w=W().find(x=>x.w=='学校');let p='',n=0;for(let i=0;i<20;i++){const o=build(w,'jm').o.map(x=>x.w).join('|');if(o==p)n++;p=o}return n})()`);assert.ok(same<=1,'same order '+same+' times')});
 await t.test('should use more look-alike wrong options at higher stages',async()=>{
  const avg=async s=>{const app=await loadApp({seed:9});prep(app,s);return app.run(`(()=>{const w=W().find(x=>x.w=='学校');let t=0,n=0;for(let i=0;i<40;i++){S.i['学校'].lo=[];S.fp=[];opts(w,'w',stg(S.i['学校'])).filter(x=>x!==w).forEach(x=>{t+=sim(w,x);n++})}return t/n})()`)};
  assert.ok(await avg(30)>await avg(.5))});
 await t.test('should mark a typed romaji reading as correct',async()=>{
  const app=await loadApp({seed:6});prep(app,3);
  const d=app.run(`(()=>{const w=W().find(x=>x.w=='友達');S.i['友達']={s:3,d:5,t:Date.now(),f:Date.now(),n:3,l:0,x:{}};cur=build(w,'tr');const b=rd.ok;ans(0,'tomodachi');return rd.ok-b})()`);assert.equal(d,1)});
 await t.test('should mark a typed romaji word as correct when typing the word from its meaning',async()=>{
  const app=await loadApp({seed:6});
  const d=app.run(`(()=>{const w=W().find(x=>x.w=='旅館');S.i['旅館']={s:9,d:5,t:Date.now(),f:Date.now(),n:3,l:0,x:{}};cur=build(w,'ty');const b=rd.ok;ans(0,'ryokan');return rd.ok-b})()`);assert.equal(d,1)});
});
