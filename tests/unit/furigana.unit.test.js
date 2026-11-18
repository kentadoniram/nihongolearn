'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('furigana',async t=>{
 const app=await loadApp({seed:41});
 const N=h=>h.replace(/<span class="kj"[^>]*>(.)<\/span>/g,'$1').replace(/<span class="jp[^"]*"[^>]*>/g,'').replace(/<\/span>/g,''),
  ej=(s,hint)=>N(app.run(`S.jl=5;GATE.t=0;ej(${JSON.stringify(s)},${JSON.stringify(hint||null)})`));
 await t.test('should read 変 as か in every form of 変わる and 変える, and as へん on its own',()=>{
  assert.match(ej('町が変わりました。'),/<ruby>変<rt>か<\/rt><\/ruby>わりました/);assert.match(ej('変わらない。'),/<ruby>変<rt>か<\/rt><\/ruby>わらない/);
  assert.match(ej('予定を変えました。'),/<ruby>変<rt>か<\/rt><\/ruby>えました/);assert.match(ej('新しい服に変える。'),/<ruby>変<rt>か<\/rt><\/ruby>える/);
  assert.match(ej('変な味です。'),/<ruby>変<rt>へん<\/rt><\/ruby>な/)});
 await t.test('should put furigana over the kanji only and leave the okurigana outside',()=>{
  assert.equal(app.run(`S.jl=5;GATE.t=0;N=null;rubyOf('食べる','たべる',1)`),'<ruby>食<rt>た</rt></ruby>べる');
  assert.equal(app.run(`rubyOf('お金','おかね',1)`),'お<ruby>金<rt>かね</rt></ruby>');
  assert.equal(app.run(`rubyOf('話し合う','はなしあう',1)`),'<ruby>話し合<rt>はなしあ</rt></ruby>う');
  assert.equal(app.run(`rubyOf('宿題','しゅくだい',1)`),'<ruby>宿題<rt>しゅくだい</rt></ruby>')});
 await t.test('should read every form of a verb or い-adjective with its own reading',()=>{
  assert.match(ej('昨日は疲れませんでした。'),/<ruby>疲<rt>つか<\/rt><\/ruby>れませんでした/);assert.match(ej('少しも厳しくなかった。'),/<ruby>厳<rt>きび<\/rt><\/ruby>しくなかった/);
  assert.match(ej('毎日続けさせられる。'),/<ruby>続<rt>つづ<\/rt><\/ruby>けさせられる/)});
 await t.test('should let the word of the sentence decide between two words with the same form',()=>{
  assert.match(ej('次の駅で降ります。','降りる'),/<ruby>降<rt>お<\/rt><\/ruby>ります/);assert.match(ej('雨が降ります。','降る'),/<ruby>降<rt>ふ<\/rt><\/ruby>ります/);
  assert.match(app.run(`(()=>{dict(W().indexOf(W().find(w=>w.w=='降りる')));return $('#dv').innerHTML})()`),/<rt>お<\/rt>/)});
 await t.test('should keep the longest match fast and correct with every form in the lexicon',()=>{
  const n=app.run(`Object.keys(FRD).length`);assert.ok(n>5000,n);
  const t0=Date.now();app.run(`for(let i=0;i<300;i++)ej('毎日、日本語を勉強しています。昨日は友達と映画を見ました。')`);assert.ok(Date.now()-t0<3000,'slow: '+(Date.now()-t0))});
 await t.test('should read the word being taught as that word in every example sentence',()=>{
  const bad=app.run(`(()=>{if(!LEXRE)mkLex();const bad=[];W().filter(w=>!w.g&&w.e&&K.test(w.w)&&!w.w.startsWith('〜')).forEach(w=>{let ok=false;
   w.e[0].split(LEXRE).forEach((p,i)=>{if(i%2){const m=LEXM[p];if((m[0]=='w'||m[0]=='f')&&m[1]==w.w)ok=true;
    if(m[0]=='r'){const st=cs(w.w,w.r),stem=w.w.slice(0,w.w.length-st),rs=w.r.slice(0,w.r.length-st);if(p.startsWith(stem)&&RDX[p].startsWith(rs))ok=true}
    if(m[0]=='w'&&p.includes(w.w))ok=true}});if(!ok)bad.push(w.w)});return bad})()`);
  // する compounds (their form belongs to the …する word), 考える (考え as a noun in 考えさせて) and こと written in kana
  assert.deepEqual([...bad].sort(),['事','散歩','旅行','結婚','考える','降りる'].sort())});
});
