'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process'),{ROOT,read}=require('../helpers/app-loader.helper.js');
const py=spawnSync('python3',['--version']).status===0,tool=path.join(ROOT,'tools','build-release.py');
const list=root=>JSON.parse(spawnSync('python3',[tool,'--list','--root',root]).stdout.toString());
test('release package',{skip:!py&&'python3 is not installed'},async t=>{
 const L=list(ROOT),c=JSON.parse(read('data/content.json'));
 await t.test('should include every pack listed in content.json',()=>c.packs.forEach(p=>assert.ok(L.files.includes('data/'+p),p)));
 await t.test('should include every JSON file in the data folder, not only the changed ones',()=>fs.readdirSync(path.join(ROOT,'data')).filter(f=>f.endsWith('.json')).forEach(f=>assert.ok(L.files.includes('data/'+f),f)));
 await t.test('should keep the original folder layout and list each path once',()=>{assert.equal(new Set(L.files).size,L.files.length);['index.html','sw.js','version.json','data/content.json'].forEach(f=>assert.ok(L.files.includes(f)));assert.ok(L.files.every(f=>!f.startsWith('/')&&!f.includes('\\')))});
 await t.test('should report nothing missing for the real project',()=>assert.deepEqual(L.missing,[]));
 const mk=(extra)=>{const d=fs.mkdtempSync(path.join(os.tmpdir(),'rel-'));fs.mkdirSync(path.join(d,'data'));fs.writeFileSync(path.join(d,'version.json'),'{"app":"0.0.20260101"}');fs.writeFileSync(path.join(d,'index.html'),'x');fs.writeFileSync(path.join(d,'data','content.json'),JSON.stringify({packs:['n4f.json',...(extra||[])]}));fs.writeFileSync(path.join(d,'data','n4f.json'),'{"a":1}');return d};
 await t.test('should keep one copy and report it when a stray JSON file differs from the one in data',()=>{const d=mk();fs.writeFileSync(path.join(d,'n4f.json'),'{"a":2}');const r=list(d);assert.ok(r.files.includes('data/n4f.json'));assert.ok(!r.files.includes('n4f.json'));assert.match(r.notes.join(' '),/differs from data\/n4f\.json/);assert.equal(fs.readFileSync(path.join(d,'data','n4f.json'),'utf8'),'{"a":1}')});
 await t.test('should drop a stray JSON file that is identical to the one in data',()=>{const d=mk();fs.writeFileSync(path.join(d,'n4f.json'),'{"a":1}');const r=list(d);assert.equal(r.files.filter(f=>f.endsWith('n4f.json')).length,1);assert.match(r.notes.join(' '),/identical/)});
 await t.test('should move a pack that sits outside data into data',()=>{const d=mk(['n9.json']);fs.writeFileSync(path.join(d,'n9.json'),'{}');const r=list(d);assert.ok(r.files.includes('data/n9.json'));assert.deepEqual(r.missing,[])});
 await t.test('should refuse to build when a listed pack is missing',()=>{const d=mk(['nope.json']);assert.deepEqual(list(d).missing,['data/nope.json']);assert.equal(spawnSync('python3',[tool,'--root',d,'--out',d]).status,1)});
});
