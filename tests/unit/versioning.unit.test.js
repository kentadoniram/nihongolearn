'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{read,ROOT}=require('../helpers/app-loader.helper.js');
test('versioning',async t=>{
 const v=JSON.parse(read('version.json')),c=JSON.parse(read('data/content.json'));
 await t.test('should write the app version as MAJOR.MINOR.YYYYMMDD with an optional letter',()=>assert.match(v.app,/^\d+\.\d+\.\d{8}[a-z]?$/));
 await t.test('should use a real calendar date in the build number',()=>{const d=v.app.split('.')[2].slice(0,8),y=+d.slice(0,4),m=+d.slice(4,6),da=+d.slice(6,8);assert.ok(y>=2026&&m>=1&&m<=12&&da>=1&&da<=31)});
 await t.test('should describe the current version in the changelog',()=>assert.ok(read('CHANGELOG.md').includes('## v'+v.app)));
 await t.test('should keep the content version the same in version.json and content.json',()=>assert.equal(v.content,c.contentVersion));
 await t.test('should let the service worker precache the packs from content.json',()=>assert.ok(read('sw.js').includes('content.json')));
 await t.test('should keep package.json on the same MAJOR.MINOR as version.json',()=>assert.equal(JSON.parse(read('package.json')).version,v.app.split('.').slice(0,2).join('.')+'.0'));
 await t.test('should not keep a second, stale copy of content.json or SCHEMA.md in the project root',()=>['content.json','SCHEMA.md'].forEach(f=>assert.ok(!fs.existsSync(path.join(ROOT,f)),f)));
 await t.test('should list manifest icons that exist and are precached by the service worker',()=>{const m=JSON.parse(read('manifest.json'));assert.ok(m.icons.some(i=>i.sizes==='192x192')&&m.icons.some(i=>i.sizes==='512x512'));m.icons.forEach(i=>assert.ok(fs.existsSync(path.join(ROOT,i.src)),i.src));assert.ok(read('sw.js').includes('icons/icon-192.png'))});
});
