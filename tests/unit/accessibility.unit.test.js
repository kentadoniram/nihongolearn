'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp,read}=require('../helpers/app-loader.helper.js');
// WCAG 2 contrast ratio of two #rrggbb colours.
const lum=h=>{const[r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b};
const ratio=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return(x+.05)/(y+.05)};
const css=read('css/app.css'),html=read('index.html');
const tokens=block=>Object.fromEntries([...block.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6})/g)].map(m=>[m[1],m[2]]));
const light=tokens(css.slice(css.indexOf(':root'),css.indexOf('@media(prefers-color-scheme:dark)'))),
 dark=tokens(css.slice(css.indexOf('@media(prefers-color-scheme:dark)'),css.indexOf('* {')));
const el=(attrs={},extra={})=>{const a={...attrs};return{tagName:'DIV',textContent:'',classList:{contains:c=>(a.class||'').split(' ').includes(c)},getAttribute:k=>k in a?a[k]:null,setAttribute:(k,v)=>{a[k]=String(v)},attrs:a,clicked:0,click(){this.clicked++},...extra}};
test('colour and contrast',async t=>{
 for(const [name,th] of [['light',light],['dark',dark]]){
  await t.test(`should keep text at 4.5 to 1 or better on the background and cards in the ${name} theme`,()=>{
   for(const fg of ['fg','mu','ink','ok','bad'])for(const bg of ['bg','card'])assert.ok(ratio(th[fg],th[bg])>=4.5,`${fg} on ${bg} ${ratio(th[fg],th[bg]).toFixed(2)}`)});
  await t.test(`should keep the border of buttons and inputs at 3 to 1 or better in the ${name} theme`,()=>{
   for(const bg of ['bg','card'])assert.ok(ratio(th.bdc,th[bg])>=3,`bdc on ${bg} ${ratio(th.bdc,th[bg]).toFixed(2)}`)})}
 await t.test('should use the control border colour for buttons, tiles, inputs and chips',()=>{
  for(const sel of ['nav button','.opt, .pri, .btn, .sec','.tile','textarea','#ti2','.chips a','.mini'])assert.match(css.match(new RegExp('\\n'+sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+' \\{([^}]*)\\}'))[1],/var\(--bdc\)/,sel)});
 await t.test('should show a focus ring, respect reduced motion and forced colours, and not rely on colour alone for answers',()=>{
  assert.match(css,/:focus-visible\s*\{[^}]*outline:\s*2px/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/forced-colors:active/);
  assert.match(css,/\.opt\.ok::after\s*\{\s*content:\s*" ✓"/);assert.match(css,/\.opt\.bad::after\s*\{\s*content:\s*" ✗"/);assert.match(css,/\.sr-only/);assert.match(css,/\.skip-link:focus/)});
});
test('page structure',async t=>{
 await t.test('should declare the language, a skip link to the content, and a focusable main area',()=>{
  assert.match(html,/<html lang="en">/);assert.match(html,/<body><a class="skip-link" href="#m">/);assert.match(html,/<main id="m" tabindex="-1">/)});
 await t.test('should label the sections, the dialog, the live regions and the arrows',()=>{
  assert.match(html,/<nav aria-label="Sections">/);assert.match(html,/<div id="dv" role="dialog" aria-modal="true" aria-label="Details" tabindex="-1" hidden>/);
  assert.match(html,/<div id="sr" class="sr-only" role="status" aria-live="polite">/);assert.match(html,/<div id="tip" role="status" aria-live="polite" hidden>/);
  assert.match(html,/id="zl" role="button" tabindex="0"/);assert.match(html,/id="zr" role="button" tabindex="0"/);assert.ok(!/id="st" aria-live/.test(html))});
 await t.test('should not zoom-lock the page',()=>assert.ok(!/user-scalable\s*=\s*no|maximum-scale/.test(html)));
});
test('keyboard, roles and announcements',async t=>{
 const app=await loadApp({seed:31});
 await t.test('should give clickable divs and spans a button role and a tab stop, and leave real buttons alone',()=>{
  const d=el({onclick:'x()'}),f=el({onclick:'x()',role:'link',tabindex:'-1'});app.ctx.a11yFixList([d,f]);
  assert.equal(d.attrs.role,'button');assert.equal(d.attrs.tabindex,'0');assert.equal(f.attrs.role,'link');assert.equal(f.attrs.tabindex,'-1');
  assert.match(app.run('A11Y_SEL'),/:not\(button\)/)});
 await t.test('should mark Japanese text lang ja and leave English and mixed text alone',()=>{
  const j=el({},{textContent:'宿題'}),en=el({},{textContent:'Close'}),mix=el({},{textContent:'宿題 means homework'});app.ctx.a11yLangList([j,en,mix]);
  assert.equal(j.attrs.lang,'ja');assert.equal(en.attrs.lang,undefined);assert.equal(mix.attrs.lang,undefined)});
 await t.test('should give every kanji tap target lang ja',()=>assert.match(app.run(`kb('宿題')`),/<span class="kj" tabindex="0" lang="ja" data-k="宿"/));
 const key=(k,t,extra={})=>{const ev={key:k,target:t,prevented:0,preventDefault(){this.prevented++},...extra};app.ctx.a11yKey(ev);return ev};
 await t.test('should let Enter and Space work on anything that acts like a button',()=>{
  for(const k of ['Enter',' ']){const d=el({onclick:'x()'}),ev=key(k,d);assert.equal(d.clicked,1);assert.equal(ev.prevented,1)}
  const w=el({class:'kj'}),ev=key('Enter',w);assert.equal(w.clicked,1)});
 await t.test('should not interfere with real buttons, links, inputs and other keys',()=>{
  const b=el({onclick:'x()'},{tagName:'BUTTON'}),i=el({},{tagName:'INPUT'}),d=el({onclick:'x()'});
  key('Enter',b);key(' ',i);key('a',d);assert.equal(b.clicked+i.clicked+d.clicked,0)});
 await t.test('should keep Tab inside an open dialog',()=>{
  const first=el(),last=el(),dlg=el({},{hidden:false,querySelectorAll:()=>[first,last],focus(){}});
  let f=null;first.focus=()=>f='first';last.focus=()=>f='last';
  app.ctx.document.activeElement=last;app.ctx.a11yTrap({key:'Tab',shiftKey:false,preventDefault(){f='stopped'}},dlg);assert.equal(f,'first');
  app.ctx.document.activeElement=first;app.ctx.a11yTrap({key:'Tab',shiftKey:true,preventDefault(){}},dlg);assert.equal(f,'last')});
 await t.test('should move the focus into a dialog, hide the page behind it, and give the focus back when it closes',()=>{
  const opener=el({},{focus(){this.focused=1}}),w={inert:false},btn={focus(){this.focused=1}},d=app.ctx.document.querySelector('#dv'),
   oldQ=app.ctx.document.querySelector;
  d.querySelector=()=>btn;app.ctx.document.activeElement=opener;
  app.ctx.document.querySelector=q=>q=='.w'?w:oldQ(q);
  app.run('dvOpen()');assert.equal(btn.focused,1);assert.equal(w.inert,true);
  app.run('dvClose()');assert.equal(d.hidden,true);assert.equal(w.inert,false);assert.equal(opener.focused,1);
  app.ctx.document.querySelector=oldQ});
 await t.test('should open every dialog through dv() and close it with dvClose(), not by hiding it directly',()=>{
  assert.match(read('js/10-dictionary.js'),/dvOpen\(\)/);
  for(const f of ['js/10-dictionary.js','js/11-build-tab.js'])assert.ok(!/\$\('#dv'\)\.hidden=true/.test(read(f)),f);
  assert.match(read('js/12-tooltips.js'),/Escape[\s\S]{0,200}dvClose\(\)/)});
 await t.test('should set the title and the current tab, and announce the new screen',()=>{
  const b1={dataset:{v:'t'},setAttribute(k,v){this.cur=v}},b2={dataset:{v:'p'},setAttribute(k,v){this.cur=v}};
  app.ctx.document.querySelectorAll=()=>[b1,b2];app.ctx.setTimeout=fn=>fn();
  app.run(`a11yScreen('p')`);assert.equal(app.ctx.document.title,'Play – Nihongo Lab');assert.equal(b1.cur,'false');assert.equal(b2.cur,'page');
  assert.equal(app.ctx.document.querySelector('#sr').textContent,'Play')});
 await t.test('should not let the arrow keys change question while a dialog is open or a menu has the focus',()=>{
  assert.match(read('js/12-tooltips.js'),/INPUT\|TEXTAREA\|SELECT[\s\S]{0,60}\$\('#dv'\)\s*\.hidden\)\s*\{\s*if \(ev\.key == 'ArrowRight'\)/)});
});
test('labels and announcements in the screens',async t=>{
 const app=await loadApp({seed:32});
 await t.test('should announce the feedback of every exercise through a live region',()=>{
  const h=[app.run(`typCard({en:'x',l:5})`),app.run(`labCard({t:'t',q:'q',o:['a'],ex:[]})`),app.run(`(()=>{dg={i:0,r:[]};return dqCard({p:[{t:'a'}],q:'q'})})()`)];
  h.forEach(x=>assert.match(x,/id="fb" role="status"/));
  for(const f of ['js/05-question-builder.js','js/11-build-tab.js'])assert.match(read(f),/id=\\?"fb\\?" role=\\?"status\\?"/)});
 await t.test('should label every field and menu on the settings screen',()=>{
  const h=app.run(`(()=>{mem();return $('#m').innerHTML})()`);
  for(const tag of h.match(/<(select|textarea)[^>]*>/g)||[])assert.match(tag,/aria-label=/,tag);
  assert.match(h,/<input type="range" aria-label=/);assert.ok(!/<input type="file"[^>]*hidden/.test(h));assert.match(h,/<input type="file" class="sr-only"/)});
 await t.test('should label the vocabulary search',()=>{
  const h=app.run(`vocabSearch({q:''})`);assert.match(h,/aria-label="Search the vocabulary"/)});
 await t.test('should label the answer box and the icon buttons',()=>{
  assert.match(app.run(`typCard({en:'x',l:5})`),/id="ti2"[^>]*aria-label="your answer"/);assert.match(read('js/07-memory-export-import.js')+read('js/26-checkup-screen-and-banner.js'),/aria-label="Dismiss"/)});
});
