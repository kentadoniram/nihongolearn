'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process'),{ROOT,read}=require('../helpers/app-loader.helper.js');
const {format,formatCss,scan}=require('../../tools/format-js.js');
const scripts=fs.readdirSync(path.join(ROOT,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f),all=[...scripts,'css/app.css'];
const tokens=s=>scan(s,0,false).tokens.filter(t=>t.t!=='lc'&&t.t!=='bc').map(t=>t.x);
const snippets={
 forLoop:'for(let i=0;i<3;i++){a(i)}',
 regex:'x=/[;/]+/g.test(s);y=1;',
 template:'a=`x${b?`y${c}`:"z"}w`;',
 asi:'const a=1\nconst b=2',
 ternary:'x=a?b:c;o={k:1};',
 unary:'x=-1;y=a-1;z=!b;i++;',
 arrow:'f=x=>x+1;g=()=>{h()};',
 declarations:'const a=1,b=2,c=3;',
 comment:'a();// note\nb();',
 switchCase:'switch(x){case 1:a();break;default:b()}',
 elseIf:'if(a){b()}else if(c){d()}else{e()}'
};
test('code style',async t=>{
 await t.test('should find every script and the stylesheet already formatted',()=>{const r=spawnSync('node',[path.join(ROOT,'tools','format-js.js'),'--check']);assert.equal(r.status,0,r.stdout.toString())});
 await t.test('should have no tabs, no trailing spaces, no carriage returns and one final newline',()=>all.forEach(f=>{const s=read(f);assert.ok(!/\t/.test(s)&&!/ +\n/.test(s)&&!/\r/.test(s)&&/[^\n]\n$/.test(s),f)}));
 await t.test('should keep code lines short except long strings, templates and comments',()=>{
  const bad=[];all.filter(f=>f.endsWith('.js')).forEach(f=>read(f).split('\n').forEach((l,i)=>{if(l.length>120&&!/[`'"]/.test(l)&&!l.trim().startsWith('//'))bad.push(f+':'+(i+1))}));assert.deepEqual(bad,[])});
 await t.test('should change only white space and line breaks in every script',()=>scripts.forEach(f=>{const s=read(f);assert.deepEqual(tokens(format(s)),tokens(s),f)}));
 await t.test('should produce the same text when formatting twice',()=>{for(const [k,s] of Object.entries(snippets))assert.equal(format(format(s)),format(s),k)});
 await t.test('should produce code that still parses for each tricky snippet',()=>{for(const [k,s] of Object.entries(snippets))assert.doesNotThrow(()=>new vm.Script(format(s)),k)});
 await t.test('should keep the tokens of each tricky snippet',()=>{for(const [k,s] of Object.entries(snippets))assert.deepEqual(tokens(format(s)),tokens(s),k)});
 await t.test('should keep semicolons of a for header on one line',()=>assert.ok(format(snippets.forLoop).includes('for (let i = 0; i < 3; i++) {\n  a(i)\n}')));
 await t.test('should not treat a semicolon or slash inside a regular expression as code',()=>assert.ok(format(snippets.regex).includes('/[;/]+/g.test(s);')));
 await t.test('should leave a template literal with a nested template untouched',()=>assert.ok(format(snippets.template).includes('`x${b?`y${c}`:"z"}w`')));
 await t.test('should keep a line break that automatic semicolon insertion depends on',()=>assert.equal(format(snippets.asi),'const a = 1\nconst b = 2\n'));
 await t.test('should space ternaries, object keys and unary operators correctly',()=>{assert.ok(format(snippets.ternary).includes('x = a ? b : c;'));assert.ok(format(snippets.ternary).includes('o = { k: 1 };'));const u=format(snippets.unary);['x = -1;','y = a - 1;','z = !b;','i++;'].forEach(x=>assert.ok(u.includes(x),x))});
 await t.test('should format arrow functions',()=>{assert.ok(format(snippets.arrow).includes('f = x => x + 1;'));assert.ok(format(snippets.arrow).includes('g = () => {\n  h()\n};'))});
 await t.test('should put each declarator of a const list on its own line',()=>assert.equal(format(snippets.declarations),'const a = 1,\n  b = 2,\n  c = 3;\n'));
 await t.test('should keep a trailing comment on its own line of code',()=>assert.ok(format(snippets.comment).includes('a(); // note\nb();')));
 await t.test('should put each case of a switch on its own line',()=>assert.match(format(snippets.switchCase),/\n\s*case 1: a\(\);\n\s*break;\n\s*default: b\(\)/));
 await t.test('should keep else and else if on the closing brace line',()=>assert.ok(format(snippets.elseIf).includes('} else if (c) {')&&format(snippets.elseIf).includes('} else {')));
 await t.test('should format CSS with one declaration per line and keep url() values whole',()=>{
  const c=formatCss('a{b:c;d:e}@media (max-width:600px){p{q:r}}.x{b:url(data:image/png;base64,AAA);c:d}');
  assert.ok(c.includes('a {\n  b: c;\n  d: e\n}'));assert.ok(c.includes('@media (max-width:600px) {\n  p {\n    q: r\n  }\n}'));assert.ok(c.includes('b: url(data:image/png;base64,AAA);'));assert.equal(formatCss(c),c)});
 await t.test('should declare an editor config that matches the formatter',()=>{const e=read('.editorconfig');assert.match(e,/indent_style = space/);assert.match(e,/indent_size = 2/);assert.match(e,/end_of_line = lf/)});
 await t.test('should offer format, format:check and test as npm scripts',()=>{const s=JSON.parse(read('package.json')).scripts;['test','format','format:check','check'].forEach(k=>assert.ok(s[k],k))});
});
