'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
test('screens',async t=>{
 const app=await loadApp({seed:11}),shown=js=>app.run(`${js};document.querySelector('#m').innerHTML`);
 await t.test('should show how many planned builds are still pending on the Today screen',()=>{
  const n=JSON.parse(read('data/roadmap.json')).roadmap.filter(x=>x.s!='done').length;
  assert.ok(shown('today()').includes(`(${n} to build)`))});
 await t.test('should list every pending build in the roadmap screen',()=>{
  const html=shown('roadmap()');JSON.parse(read('data/roadmap.json')).roadmap.filter(x=>x.s!='done').forEach(x=>assert.ok(html.includes(x.t.replace(/&/g,'&amp;')),x.t))});
});
