'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),cp=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{loadApp}=require('../helpers/app-loader.helper.js');
const ROOT=path.join(__dirname,'..','..'),py=cp.spawnSync('python3',['--version']).status===0;
const imp=(args)=>{const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'cf-')),'o.json');const r=cp.spawnSync('python3',[path.join(ROOT,'tools','import-corpus-freq.py'),...args,'--out',out],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(fs.readFileSync(out,'utf8'))};
test('corpus frequency ranks',async t=>{
 await t.test('should read the BCCWJ word list, skip particles and keep the best rank of a word',{skip:!py},()=>{
  const d=imp([path.join(ROOT,'tests/fixtures/bccwj-sample.tsv'),'--name','BCCWJ sample']);
  assert.equal(d.corpus.name,'BCCWJ sample');assert.equal(d.cfreq['行く'],2);assert.equal(d.cfreq['水'],6);assert.ok(!('の' in d.cfreq))});
 await t.test('should turn counts into ranks, most frequent first',{skip:!py},()=>{
  const d=imp([path.join(ROOT,'tests/fixtures/count-sample.csv')]);assert.equal(d.cfreq['行く'],1);assert.equal(d.cfreq['学校'],2);assert.equal(d.cfreq['水'],3)});
 await t.test('should write only words of the deck',{skip:!py},()=>{
  const d=imp([path.join(ROOT,'tests/fixtures/count-sample.csv')]);assert.ok(Object.keys(d.cfreq).length<=d.corpus.total);assert.equal(d.corpus.matched,Object.keys(d.cfreq).length)});
 await t.test('should say the ranking is estimated while no corpus file is loaded',async()=>{
  const app=await loadApp({seed:3});assert.equal(app.run(`Object.keys(CR).length`),0);assert.match(app.run(`cfStatus()`),/estimated tiers/);assert.ok(!/corpus rank/.test(app.run(`gr(W().find(w=>w.w=='水'))`)))});
 await t.test('should rank words by corpus rank first, label them, and keep estimates for the rest',async()=>{
  const app=await loadApp({seed:3});
  app.run(`applyPacks(PK.concat([{cfreq:{'学校':1,'水':40,'概要':9000},corpus:{name:'Test corpus'}}]))`);
  assert.ok(app.run(`ZR['学校']<ZR['水']`));assert.ok(app.run(`ZR['水']<ZR['概要']`));
  assert.equal(app.run(`TR['学校']`),1);assert.equal(app.run(`TR['概要']`),3);
  assert.match(app.run(`gr(W().find(w=>w.w=='学校'))`),/corpus rank 1, Test corpus/);
  assert.match(app.run(`gr(W().find(w=>w.w=='先生'))`),/estimate: not in the corpus list/);
  assert.match(app.run(`cfStatus()`),/corpus ranks \(Test corpus\) for 3 of/)});
 await t.test('should place a word the corpus does not list at the position of its estimated tier',async()=>{
  const app=await loadApp({seed:3});
  app.run(`applyPacks(PK.concat([{cfreq:{'学校':1,'水':40},corpus:{name:'T'}}]))`);
  assert.ok(app.run(`ZR['水']<ZR['先生']`));assert.ok(app.run(`ZR['先生']<ZR['概要']`))});
});
