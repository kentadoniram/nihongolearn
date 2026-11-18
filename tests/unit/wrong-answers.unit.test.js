'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
test('wrong answers are explained',async t=>{
 const app=await loadApp({seed:51});
 const w=n=>`W().find(x=>x.w=='${n}')`,txt=h=>h.replace(/<span class="kj"[^>]*>(.)<\/span>/g,'$1').replace(/<ruby>([^<]*)<rt>[^<]*<\/rt><\/ruby>/g,'$1').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').replace(/([^\x00-\x7f]) (?=[^\x00-\x7f])/g,'$1');
 const card=code=>txt(app.run(code));
 await t.test('should say what a wrongly chosen word means, why it is wrong and give an example with it',()=>{
  const h=app.run(`why(${w('学校')},${w('会社')})`),x=txt(h);assert.match(x,/You chose 会社/);assert.match(x,/company/);assert.match(x,/Why it is wrong/);assert.match(x,/Example with your answer/);assert.match(x,/会社/);assert.match(h,/class="wa"/);assert.match(x,/Correct usage/)});
 await t.test('should show how two related words differ when the deck has a note',()=>{
  assert.match(card(`why(${w('尋ねる')},${w('訪ねる')})`),/How they differ/)});
 await t.test('should explain a wrong counter by what each counter counts, with an example',()=>{
  const x=card(`waCard('枚','本','ペンを二＿＿買いました。')`);
  assert.match(x,/You chose 枚: counter for flat things/);assert.match(x,/Your sentence ペンを二枚買いました/);assert.match(x,/needs 本, a counter for long thin things/);assert.match(x,/Example with your answer .*枚/)});
 await t.test('should explain a wrong particle or grammar expression with its meaning and an example',()=>{
  const x=card(`waCard('のに','ので','雨＿＿、家にいます。')`);assert.match(x,/even though/);assert.match(x,/because/);assert.match(x,/Example with your answer/);
  assert.match(card(`waCard('に','は','私＿学生です。')`),/topic marker/)});
 await t.test('should explain a wrong look-alike kanji by the meaning and readings of both kanji',()=>{
  const x=card(`waCard('末','未','＿だ。')`);assert.match(x,/look alike/);assert.match(x,/末 means “end”/);assert.match(x,/未 means “not yet”/)});
 await t.test('should explain a wrongly chosen meaning by the word it belongs to',()=>{
  const x=card(`waCard('fire','water','What does 水 mean?')`);assert.match(x,/the meaning of 火/);assert.match(x,/Example with your answer/)});
 await t.test('should explain an inflected form by the verb and the form it is',()=>{
  const i=app.run(`optInfo('食べて')`);assert.match(i.what,/て-form of/);assert.match(i.what,/to eat/)});
 await t.test('should compare a typed reading with the right one and name what went wrong',()=>{
  assert.match(card(`tyWhy(${w('学校')},'gakou')`),/small っ/);assert.match(card(`tyWhy(${w('おじいさん')},'ojisan')`),/long vowel/);
  assert.match(card(`tyWhy(${w('学校')},'kakkou')`),/Some of the letters differ|dakuten/);assert.match(card(`tyWhy(${w('学校')},'学校')`),/word itself/);assert.match(card(`tyWhy(${w('学校')},'')`),/did not write an answer/)});
 await t.test('should tell what a wrongly typed reading means when it is another word',()=>{
  const x=card(`tyWhy(${w('おじいさん')},'ojisan')`);assert.match(x,/how to read おじさん ?“uncle”/);assert.match(x,/Example with your answer/);
  assert.match(card(`tyWhy(${w('学校')},'gakkoo')`),/does not match another word|how to read/)});
 await t.test('should mark the differing letters of a typed reading',()=>{
  const h=app.run(`tyWhy(${w('学校')},'gakou')`);assert.match(h,/<mark class="i">っ<\/mark>/)});
 await t.test('should explain the odd-one-out choice',()=>{
  const x=card(`(()=>{const c={ch:'学',odd:${w('水')}};return wrongOdd(${w('学校')},c)})()`);assert.match(x,/contains 学/);assert.match(x,/odd one out is 水/);assert.match(x,/Example with your answer/)});
 await t.test('should show the explanation under every wrong practice answer and under none of the right ones',()=>{
  const r=app.run(`(()=>{const o=[];for(let i=0;i<40;i++){S.aa=false;go('p');const c=cur;if(!c||!c.o)continue;const k=c.o.findIndex(z=>c.t=='gq'?!z.c:c.t=='oo'?z!==c.odd:z.w!=c.w.w);if(k<0)continue;ans(k);o.push($('#fb').innerHTML);go('p');const c2=cur;if(!c2||!c2.o)continue;const g=c2.o.findIndex(z=>c2.t=='gq'?z.c:c2.t=='oo'?z===c2.odd:z.w==c2.w.w);if(g<0)continue;ans(g);o.push('OK'+$('#fb').innerHTML)}return o})()`);
  assert.ok(r.length>10);for(const h of r){if(h.startsWith('OK'))assert.ok(!/class="wa"/.test(h));else assert.match(h,/class="wa"/)}});
 await t.test('should explain a wrong lab answer and a wrong check-up answer',()=>{
  const lab=app.run(`(()=>{go('l');const c=lcur;lq((c.a+1)%c.o.length);return $('#fb').innerHTML})()`);assert.match(lab,/class="wa"/);assert.match(lab,/You chose/);
  const dg=app.run(`(()=>{diag();const q=DX[0];const k=q.p.findIndex(o=>!o.c);da(k);return $('#fb').innerHTML})()`);assert.match(dg,/class="wa"/)});
 await t.test('should leave the explanation out when the right answer was chosen',()=>{
  const lab=app.run(`(()=>{go('l');const c=lcur;lq(c.a);return $('#fb').innerHTML})()`);assert.ok(!/class="wa"/.test(lab))});
 await t.test('should explain the wrong parts of a typed sentence and what they mean, with an example',()=>{
  const x=txt(app.run(`(()=>{const q=TY.find(x=>x.en=='I read a book yesterday.')||TY.find(x=>x.en.includes('book'));const v='watashi ga hon ni yomimashita';return revTyped(q,v,evalT(q,v))})()`));
  assert.match(x,/Your “が”: subject marker/);assert.match(x,/Your “に”/);assert.match(x,/Example:/)});
});
