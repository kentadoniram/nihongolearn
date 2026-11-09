'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const J=JSON.stringify;
test('romaji conversion',async t=>{
 const app=await loadApp();const kana=r=>app.run(`toKana(${J(r)})`);
 const ok=(v,w,ty='tr')=>app.run(`rkOk(${J(v)},${J(ty)},${J(w)})`);
 for(const [r,k] of [['tomodachi','ともだち'],['ukeru','うける'],['gakkou','がっこう'],['gakkō','がっこう'],['konnichiwa','こんにちわ'],['matcha','まっちゃ'],['onnanoko','おんなのこ'],["kon'ya",'こんや'],['kyou','きょう'],['ryokou','りょこう'],['shinbun','しんぶん'],['jikan','じかん'],['tsukuru','つくる'],['hon wo yomu','ほんをよむ']])
  await t.test(`should convert "${r}" to ${k}`,()=>assert.equal(kana(r),k));
 for(const [r,k] of [['sika','しか'],['tuki','つき'],['huji','ふじ'],['zikan','じかん'],['tyotto','ちょっと']])
  await t.test(`should accept the Kunrei or IME spelling "${r}"`,()=>assert.equal(kana(r),k));
 await t.test('should read nn before a vowel as ん followed by the n syllable',()=>assert.equal(kana('konnichiwa').slice(0,3),'こんに'));
 await t.test('should accept romaji, hiragana and katakana for a reading',()=>{const w={w:'友達',r:'ともだち'};for(const v of ['tomodachi','ともだち','トモダチ','tomodati'])assert.equal(ok(v,w),true,v)});
 await t.test('should reject a wrong romaji reading',()=>assert.equal(ok('tomodachu',{w:'友達',r:'ともだち'}),false));
 await t.test('should not accept the kanji itself as the answer to a reading question',()=>assert.equal(ok('友達',{w:'友達',r:'ともだち'}),false));
 await t.test('should accept the kanji itself when typing the word from its meaning',()=>assert.equal(ok('友達',{w:'友達',r:'ともだち'},'ty'),true));
 await t.test('should distinguish long and short vowels',()=>{const w={w:'大きい',r:'おおきい'};assert.equal(ok('ookii',w),true);assert.equal(ok('okii',w),false)});
 await t.test('should accept n with or without an apostrophe',()=>{const w={w:'翻訳',r:'ほんやく'};assert.equal(ok("hon'yaku",w),true);assert.equal(ok('honyaku',w),true)});
 await t.test('should accept づ and ず spellings for the same word',()=>{const w={w:'続ける',r:'つづける'};assert.equal(ok('tsuzukeru',w),true);assert.equal(ok('tudukeru',w),true)});
 await t.test('should write ん before a vowel with an apostrophe in displayed romaji',()=>assert.equal(app.run('romaji("げんいん")'),"gen'in"));
 await t.test('should read back its own romaji for every word in the deck',()=>{const bad=app.run(`W().filter(w=>!w.g&&w.r&&!rkOk(romaji(w.r),'tr',w)).map(w=>w.w)`);assert.deepEqual([...bad],[])});
});
