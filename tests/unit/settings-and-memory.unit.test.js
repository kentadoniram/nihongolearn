'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
test('settings tab and memory tab',async t=>{
 const app=await loadApp({seed:61}),screen=c=>app.run(`(()=>{${c};return $('#m').innerHTML})()`);
 await t.test('should have a small gear button at the upper right that opens the settings',()=>{
  const h=read('index.html');assert.match(h,/<button id="gear" class="gear" data-v="s" aria-label="Settings" onclick="go\('s'\)"><svg/);assert.match(read('css/app.css'),/\.gear \{[^}]*position: absolute;[^}]*top: 0;[^}]*right: 0/)});
 await t.test('should not add a seventh tab for settings',()=>assert.equal((read('index.html').match(/<nav[^>]*>(.*?)<\/nav>/)[1].match(/<button/g)||[]).length,6));
 await t.test('should show the settings screen for the gear, with display, learning, content, advanced and about',()=>{
  const h=screen(`go('s')`);assert.match(h,/<h2 class="sh">Settings<\/h2>/);for(const k of ['Display','Learning','Content','Advanced','About'])assert.match(h,new RegExp('<summary>'+k+'</summary>'));
  assert.match(h,/My JLPT level/);assert.match(h,/Erase everything/);assert.ok(!/Backup and transfer/.test(h))});
 await t.test('should keep backup, what the app remembers and the learning data on the memory screen',()=>{
  const h=screen(`go('m')`);assert.match(h,/<h2 class="sh">Memory<\/h2>/);assert.match(h,/Backup and transfer/);assert.match(h,/What the app remembers/);assert.match(h,/Forgetting model/);assert.match(h,/Kanji mastery/);assert.match(h,/Word ranking/);assert.match(h,/Learning data/);
  assert.ok(!/My JLPT level/.test(h));assert.ok(!/Erase everything/.test(h))});
 await t.test('should stay on the settings screen after choosing a tooltip preset',()=>{
  assert.match(read('js/07-settings-screen.js'),/save\(\);settings\(\)/);assert.ok(!/save\(\);mem\(\)/.test(read('js/07-settings-screen.js')))});
 await t.test('should mark the gear as the current page on the settings screen and name the page',()=>{
  const g={dataset:{v:'s'},setAttribute(k,v){this.cur=v}},m={dataset:{v:'m'},setAttribute(k,v){this.cur=v}};
  app.ctx.document.querySelectorAll=()=>[g,m];app.ctx.setTimeout=fn=>fn();app.run(`a11yScreen('s')`);assert.equal(g.cur,'page');assert.equal(m.cur,'false');assert.equal(app.ctx.document.title,'Settings – Nihongo Lab')});
});
