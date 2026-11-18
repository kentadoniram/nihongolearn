'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('progress screen',async t=>{
 const app=await loadApp({seed:71}),now=Date.now();
 const box=()=>({innerHTML:''}),with$=(id,b)=>{const q=app.ctx.document.querySelector;app.ctx.document.querySelector=s=>s==id?b:q(s);return()=>{app.ctx.document.querySelector=q}};
 await t.test('should put JLPT level, difficulty and newly acquired in one vocabulary card with filters',()=>{
  const h=app.run(`(()=>{S.pv=null;return pvCard()})()`);assert.equal((h.match(/class="card"/g)||[]).length,1);assert.match(h,/id="pv"/);
  for(const x of ['JLPT level','Difficulty','Newly acquired','All levels','N5','N1','Work','Any difficulty','Easy','Medium','Hard','Any time','Today','Last 7 days','Last 30 days'])assert.match(h,new RegExp(x));
  assert.match(h,/onclick="pvf\('lv','5'\)"/);assert.ok(!/<details/.test(h))});
 await t.test('should filter the vocabulary by level, difficulty and when it was acquired, together',()=>{
  assert.equal(app.run(`pvSet({lv:'1',df:'',nw:''}).length`),app.run(`W().filter(w=>!w.g&&w.l==1&&!w.t).length`));
  assert.equal(app.run(`['e','m','h'].map(d=>pvSet({lv:'',df:d,nw:''}).length).reduce((a,b)=>a+b)`),app.run(`W().filter(w=>!w.g).length`));
  app.run(`S.i={};S.i['水']={s:1,f:Date.now(),d:5,l:1,n:1};S.i['火']={s:1,f:Date.now()-3*864e5,d:5,l:1,n:1};S.i['木']={s:1,f:Date.now()-60*864e5,d:5,l:1,n:1}`);
  assert.deepEqual([...app.run(`pvSet({lv:'',df:'',nw:'d'}).map(w=>w.w)`)],['水']);assert.deepEqual([...app.run(`pvSet({lv:'',df:'',nw:'w'}).map(w=>w.w)`)],['水','火']);
  assert.deepEqual([...app.run(`pvSet({lv:'5',df:'',nw:'m'}).map(w=>w.w)`)],['水','火']);app.run(`S.i={}`)});
 await t.test('should rate an N5 word easier than an N1 word, and use the learned difficulty once you have met a word',()=>{
  assert.ok(app.run(`pgDiff(W().find(w=>w.w=='水'))`)<app.run(`pgDiff(W().find(w=>w.w=='概要'))`));
  assert.equal(app.run(`S.i['概要']={s:2,f:Date.now(),d:2,l:1,n:3};pgDiff(W().find(w=>w.w=='概要'))`),.2);app.run(`S.i={}`)});
 await t.test('should redraw the card when a filter changes and show more words on request',()=>{
  const b=box(),off=with$('#pv',b);app.run(`S.pv={lv:'',df:'',nw:'',n:40};pvf('lv','1')`);assert.equal(app.run(`S.pv.lv`),'1');assert.match(b.innerHTML,/<a class="on" onclick="pvf\('lv','1'\)">N1<\/a>/);
  app.run(`pvf('lv','5');pvMore()`);assert.equal(app.run(`S.pv.n`),80);assert.equal((b.innerHTML.match(/class="vr"/g)||[]).length,80);off()});
 await t.test('should list the sentence patterns in a card with JLPT level and difficulty filters',()=>{
  const h=app.run(`(()=>{S.pp=null;return ppCard()})()`);for(const x of ['Sentence patterns','JLPT level','Difficulty','Beginner','Pre-intermediate','Intermediate','Upper-intermediate','Advanced'])assert.match(h,new RegExp(x));
  assert.match(h,/practice sentences/);assert.match(h,/onclick="ppf\('d','2'\)"/)});
 await t.test('should give every pattern a difficulty band and filter by it and by level',()=>{
  assert.equal(app.run(`FM.filter(f=>!(f.d>=1&&f.d<=5)).length`),0);
  const n5=app.run(`ppSet({lv:'5',d:''}).length`),n4=app.run(`ppSet({lv:'4',d:''}).length`);assert.ok(n5>=20&&n4>=30,n5+' '+n4);
  assert.ok(app.run(`ppSet({lv:'',d:'1'}).every(f=>f.d==1)&&ppSet({lv:'',d:'1'}).length>=5`));assert.ok(app.run(`ppSet({lv:'',d:''}).every((f,i,a)=>i==0||a[i-1].d<=f.d)`));
  assert.equal(app.run(`ppSet({lv:'5',d:'1'}).every(f=>f.l==5&&f.d==1)`),true)});
 await t.test('should give every N5 and N4 pattern two examples, a note, a trap and practice sentences',()=>{
  assert.deepEqual([...app.run(`FM.filter(f=>f.l>=4&&(f.ex.length<2||!f.note||!f.trap||ppCount(f)<2)).map(f=>f.id)`)],[])});
 await t.test('should redraw the pattern card when a filter changes',()=>{
  const b=box(),off=with$('#pp',b);app.run(`S.pp={lv:'',d:''};ppf('lv','4')`);assert.match(b.innerHTML,/<a class="on" onclick="ppf\('lv','4'\)">N4<\/a>/);assert.ok(!/N5<\/span>/.test(b.innerHTML.replace(/<a[^>]*>N5<\/a>/,'')));off()});
 await t.test('should colour the memory map from red to green and leave words you have not met grey',()=>{
  assert.equal(app.run(`mapColor(0)`),'hsl(0 62% 78%)');assert.equal(app.run(`mapColor(1)`),'hsl(120 62% 78%)');assert.equal(app.run(`mapColor(.5)`),'hsl(60 62% 78%)');
  const w=`W().find(x=>x.w=='水')`;assert.match(app.run(`S.i['水']={s:5,f:Date.now(),d:5,l:Date.now(),n:3};mapCell(${w},0,Date.now())`),/style="background:hsl\(/);
  assert.match(app.run(`S.i={};mapCell(${w},0,Date.now())`),/class="mc u"/);assert.match(app.run(`mapCell(${w},0,Date.now())`),/aria-label="水, not met yet"/)});
 await t.test('should group the memory map by level with a legend and a See more divider',()=>{
  const h=app.run(`(()=>{S.pm=null;return mapBody()})()`);assert.match(h,/class="gbar"/);assert.match(h,/forgotten/);for(const k of ['N5','N4','N3','N2','N1'])assert.match(h,new RegExp('<b>'+k+'</b>'));
  assert.match(h,/See more \(\d+ more\)/);assert.equal((h.match(/class="mc/g)||[]).length>=60*5,true);
  const small=app.run(`(()=>{S.pm=null;const n5=mapGroup('5',W(),Date.now());return n5})()`);assert.equal((small.match(/class="mc/g)||[]).length,60)});
 await t.test('should show more of a level on See more',()=>{
  const b=box(),off=with$('#pmap',b);app.run(`S.pm={};mapMore('5')`);assert.equal(app.run(`S.pm['5']`),180);assert.match(b.innerHTML,/<b>N5<\/b>/);off()});
 await t.test('should build the progress screen from the vocabulary card, the pattern card and the map, without the old groups',()=>{
  const h=app.run(`(()=>{go('g');return $('#m').innerHTML})()`);assert.match(h,/<h2 class="sh">Progress<\/h2>/);assert.match(h,/id="pv"/);assert.match(h,/id="pp"/);assert.match(h,/id="pmap"/);
  assert.ok(!/By JLPT level/.test(h)&&!/class="card pg"/.test(h))});
});
