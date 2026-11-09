'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{read}=require('../helpers/app-loader.helper.js');
test('build plan list',async t=>{
 const r=JSON.parse(read('data/roadmap.json')).roadmap,md=read('ROADMAP.md');
 await t.test('should give every item a title, an area and a valid status',()=>r.forEach(x=>{assert.ok(x.t&&x.a);assert.ok(['planned','doing','done'].includes(x.s),x.t)}));
 await t.test('should not repeat an item',()=>assert.equal(new Set(r.map(x=>x.t)).size,r.length));
 await t.test('should list every item that is not yet built in ROADMAP.md',()=>r.filter(x=>x.s!='done').forEach(x=>assert.ok(md.includes(x.t),'missing from ROADMAP.md: '+x.t)));
 await t.test('should show items that are done as ticked in ROADMAP.md',()=>r.filter(x=>x.s=='done').forEach(x=>assert.ok(md.includes('[x] '+x.t))));
});
