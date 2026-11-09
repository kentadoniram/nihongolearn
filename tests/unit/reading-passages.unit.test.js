'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
test('hand-written reading passages',async t=>{
 const app=await loadApp({seed:5}),pk=JSON.parse(read('data/passages1.json')).passages;
 await t.test('should give each passage at least two questions with a valid answer and unique options',()=>pk.forEach(p=>{assert.ok(p.qs.length>=2,p.id);p.qs.forEach(q=>{assert.ok(q.a>=0&&q.a<q.o.length&&new Set(q.o).size==q.o.length&&q.y,p.id)})}));
 await t.test('should cover levels N5, N4 and N3',()=>assert.deepEqual([...new Set(pk.map(p=>p.l))].sort(),[3,4,5]));
 await t.test('should turn every passage question into a Lab activity',()=>assert.equal(app.run(`LAB.filter(u=>String(u.id).match(/^r\\d[a-z]-\\d$/)).length`),pk.reduce((n,p)=>n+p.qs.length,0)));
 await t.test('should shuffle the options of a reading question in the Lab',()=>{
  const firsts=new Set(app.run(`(()=>{const o=[];for(let i=0;i<30;i++){S.lrec=[];lab();o.push(lcur.a)}return o})()`));assert.ok(firsts.size>1)});
});
