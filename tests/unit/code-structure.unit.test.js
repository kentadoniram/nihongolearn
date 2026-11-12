'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{ROOT,read,loadApp}=require('../helpers/app-loader.helper.js');
const html=read('index.html'),scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
test('code structure',async t=>{
 await t.test('should keep index.html free of inline scripts and styles',()=>{assert.ok(!/<script>/.test(html));assert.ok(!/<style/.test(html));assert.ok(html.includes('href="css/app.css"'))});
 await t.test('should load an existing file for every script tag, in numeric order, with the boot file last',()=>{
  scripts.forEach(f=>assert.ok(fs.existsSync(path.join(ROOT,f)),f));const n=scripts.map(f=>path.basename(f).slice(0,2));assert.deepEqual(n,[...n].sort());assert.match(scripts[scripts.length-1],/99-boot/)});
 await t.test('should load every file in the js folder',()=>assert.deepEqual(fs.readdirSync(path.join(ROOT,'js')).sort(),scripts.map(f=>path.basename(f)).sort()));
 await t.test('should start every script with a header that says its purpose and what it defines',()=>scripts.forEach(f=>assert.match(read(f),/^\/\* js\/[\w-]+\.js\n \* Purpose: .+\n \* Defines \(\d+\):/,f)));
 await t.test('should parse every script on its own',()=>scripts.forEach(f=>assert.doesNotThrow(()=>new vm.Script(read(f),{filename:f}),f)));
 await t.test('should keep every script under 30 KB so it stays readable',()=>scripts.forEach(f=>assert.ok(Buffer.byteLength(read(f))<30000,f)));
 await t.test('should define each top-level name in only one file',()=>{
  const seen={},dup=[];scripts.forEach(f=>[...read(f).matchAll(/^(?:async function |function |const |let )([A-Za-z_$][\w$]*)/gm)].forEach(m=>{if(seen[m[1]]&&seen[m[1]]!=f)dup.push(m[1]);seen[m[1]]=f}));assert.deepEqual(dup,[])});
 await t.test('should let the service worker precache the stylesheet and scripts by reading index.html',()=>{const sw=read('sw.js');assert.ok(sw.includes("fetch('index.html'")&&sw.includes('(?:js|css)'))});
 await t.test('should describe every script in docs/ARCHITECTURE.md',()=>{const d=read('docs/ARCHITECTURE.md');scripts.forEach(f=>assert.ok(d.includes(path.basename(f)),f))});
 await t.test('should run every script in order without a start-up error',async()=>assert.ok(await loadApp()));
});
