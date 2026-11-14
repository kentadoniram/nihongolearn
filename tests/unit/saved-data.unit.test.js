'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const get=(ctx,k)=>ctx.localStorage.getItem(k);
test('saved data',async t=>{
 await t.test('should keep a copy of unreadable saved data instead of silently replacing it',async()=>{
  const {run,ctx}=await loadApp({store:{nihongoLab1:'{not valid json'}});
  run('save()');
  assert.equal(get(ctx,'nihongoLab1.corrupt'),'{not valid json');
  assert.ok(JSON.parse(get(ctx,'nihongoLab1')))});
 await t.test('should start empty and write no backup when nothing was saved before',async()=>{
  const {ctx}=await loadApp();assert.equal(get(ctx,'nihongoLab1.corrupt'),null)});
 await t.test('should load valid saved data unchanged',async()=>{
  const {run,ctx}=await loadApp({store:{nihongoLab1:JSON.stringify({xp:42})}});
  assert.equal(run('S.xp'),42);assert.equal(get(ctx,'nihongoLab1.corrupt'),null)});
 await t.test('should flag a failed save and clear the flag once saving works again',async()=>{
  const {run,ctx}=await loadApp();let fail=true;const set=ctx.localStorage.setItem;
  ctx.localStorage.setItem=(k,v)=>{if(fail)throw new Error('quota');set(k,v)};
  run('save()');assert.equal(run('saveFailed'),true);
  fail=false;run('save()');assert.equal(run('saveFailed'),false)});
 await t.test('should show a warning with a backup button in the banner when saving failed',async()=>{
  const {run,ctx}=await loadApp();run('saveFailed=true;banner()');
  const h=ctx.document.querySelector('#bn').innerHTML;assert.match(h,/could not be saved/);assert.match(h,/exp\(\)/)});
});
