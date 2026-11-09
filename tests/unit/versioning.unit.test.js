'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{read}=require('../helpers/app-loader.helper.js');
test('versioning',async t=>{
 const v=JSON.parse(read('version.json')),c=JSON.parse(read('data/content.json'));
 await t.test('should write the app version as MAJOR.MINOR.YYYYMMDD with an optional letter',()=>assert.match(v.app,/^\d+\.\d+\.\d{8}[a-z]?$/));
 await t.test('should use a real calendar date in the build number',()=>{const d=v.app.split('.')[2].slice(0,8),y=+d.slice(0,4),m=+d.slice(4,6),da=+d.slice(6,8);assert.ok(y>=2026&&m>=1&&m<=12&&da>=1&&da<=31)});
 await t.test('should describe the current version in the changelog',()=>assert.ok(read('CHANGELOG.md').includes('## v'+v.app)));
 await t.test('should keep the content version the same in version.json and content.json',()=>assert.equal(v.content,c.contentVersion));
 await t.test('should let the service worker precache the packs from content.json',()=>assert.ok(read('sw.js').includes('content.json')));
});
