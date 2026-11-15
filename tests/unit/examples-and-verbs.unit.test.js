'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('example sentences, verb relations and conjugation tables',async t=>{
 const app=await loadApp({seed:13}),v=w=>`W().find(x=>x.w==${JSON.stringify(w)})`,f=(w,k)=>app.run(`conj(${v(w)},${JSON.stringify(k)})`);
 await t.test('should give every N5 and N4 word at least one example sentence with an English translation',()=>{
  const no=app.run(`W().filter(w=>!w.g&&!w.t&&(w.l==5||w.l==4)&&!(w.e&&w.e[0]&&w.e[1])).map(w=>w.w)`);assert.deepEqual([...no],[])});
 await t.test('should end every example sentence with a full stop or a question mark and keep the English readable',()=>{
  const bad=app.run(`W().filter(w=>!w.g&&w.e&&(!/[。？！.]$/.test(w.e[0])||w.e[1].length<8||!/[a-z]/.test(w.e[1]))).map(w=>w.w)`);assert.deepEqual([...bad],[])});
 await t.test('should use the word itself in its example sentence',()=>{
  const bad=app.run(`W().filter(w=>!w.g&&!w.t&&(w.l==5||w.l==4)&&w.e).filter(w=>{const t=w.w.replace('〜','');const st=/^to /.test(w.m)?t.replace(/(する|[るうくぐすつぬぶむい])$/,''):/[ぁ-ん]い$/.test(t)&&!/[きれ]い$/.test(t)?t.slice(0,-1):t;return !w.e[0].includes(st)&&!w.e[0].includes(w.r)&&!w.e[0].includes(t)}).map(w=>w.w)`);
  assert.ok(bad.length<=3,JSON.stringify(bad))});
 await t.test('should be able to give a reading to every kanji in the example sentences',()=>{
  const n=app.run(`(()=>{if(!LEXRE)mkLex();let n=0;W().filter(w=>!w.g&&w.e).forEach(w=>w.e[0].split(LEXRE).forEach((p,i)=>{if(i%2==0)[...p].forEach(c=>{if(K.test(c))n++})}));return n})()`);assert.equal(n,0)});
 await t.test('should show furigana in an example only for kanji above your level',()=>{
  const h=app.run(`S.jl=5;GATE.t=0;ej(${v('火事')}.e[0])`);assert.match(h,/<ruby>昨日<rt>きのう<\/rt><\/ruby>/);assert.ok(!/<ruby>夜/.test(h))});
 await t.test('should have at least 20 close-meaning verb pairs, with notes that explain the difference',()=>{
  const n=app.run(`REL.filter(r=>r[2]=='s'&&posOf(WM[r[0]]||{m:''})=='verb').length`);assert.ok(n>=20,n);
  assert.ok(app.run(`REL.filter(r=>r[2]=='s'&&posOf(WM[r[0]]||{m:''})=='verb'&&!r[3]).length`)<=4)});
 await t.test('should have transitive and intransitive verb pairs and verb opposites',()=>{
  assert.ok(app.run(`REL.filter(r=>r[2]=='p').length`)>=40);assert.ok(app.run(`REL.filter(r=>r[2]=='a'&&posOf(WM[r[0]]||{m:''})=='verb').length`)>=30)});
 await t.test('should explain how two related verbs differ in the dictionary',()=>{
  const h=app.run(`gr(${v('尋ねる')})`);assert.match(h,/How they differ/);assert.match(h,/訪ねる/)});
 await t.test('should only relate words that are in the deck',()=>{
  assert.deepEqual([...app.run(`REL.filter(r=>!WM[r[0]]||!WM[r[1]]).map(r=>r[0]+'/'+r[1])`)],[])});
 for(const [w,k,s] of [['食べる','pot','食べられる'],['食べる','pas','食べられる'],['食べる','cau','食べさせる'],['食べる','caupas','食べさせられる'],['食べる','ba','食べれば'],['食べる','tara','食べたら'],['食べる','vol','食べよう'],['食べる','imp','食べろ'],
  ['書く','pot','書ける'],['書く','pas','書かれる'],['書く','cau','書かせる'],['書く','ba','書けば'],['書く','vol','書こう'],['書く','tara','書いたら'],['買う','pas','買われる'],['買う','ba','買えば'],['話す','pot','話せる'],['飲む','cau','飲ませる'],['泳ぐ','vol','泳ごう'],['死ぬ','pot','死ねる'],
  ['来る','pot','来られる'],['来る','cau','来させる'],['来る','ba','来れば'],['来る','vol','来よう'],['来る','imp','来い'],['する','pot','できる'],['する','pas','される'],['する','vol','しよう'],['勉強する','masu','勉強します'],['勉強する','ba','勉強すれば'],['勉強する','caupas','勉強させられる'],
  ['食べる','masendeshita','食べませんでした'],['書く','naide','書かないで'],['行く','tari','行ったり'],['いらっしゃる','masu','いらっしゃいます']])
  await t.test(`should conjugate ${w} in the ${k} form as ${s}`,()=>assert.equal(f(w,k).s,s));
 await t.test('should leave out the forms ある and the honorific verbs cannot take',()=>{assert.equal(f('ある','pot'),null);assert.equal(f('いらっしゃる','cau'),null);assert.equal(f('ある','naide').s,'ないで')});
 await t.test('should show a grouped table with polite, negative, past, te, potential, passive, causative and conditional forms',()=>{
  const h=app.run(`vtab(${v('食べる')})`);for(const k of ['Polite present','Plain negative','Plain past','て-form','Potential','Passive','Causative','Causative-passive','Conditional ば','Conditional たら','Volitional','Imperative'])assert.match(h,new RegExp(k));
  assert.match(h,/食べさせられる/);assert.match(h,/<th colspan="3">Ability and voice<\/th>/)});
 await t.test('should explain how each verb class is built',()=>{assert.match(app.run(`vtab(${v('書く')})`),/え-row/);assert.match(app.run(`vtab(${v('食べる')})`),/drop る/);assert.match(app.run(`vtab(${v('来る')})`),/こ before ない/)});
 await t.test('should classify する compounds as する verbs, not godan',()=>assert.equal(app.run(`vclass(${v('勉強する')})`),'suru'));
});
