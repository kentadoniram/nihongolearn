'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadApp}=require('../helpers/app-loader.helper.js');
const J=JSON.stringify;
test('verb conjugation and the synonym check for conjugated verbs',async t=>{
 const app=await loadApp({seed:2}),verb=w=>`W().find(x=>x.w==${J(w)})`;
 const cls=w=>app.run(`vclass(${verb(w)})`),form=(w,f)=>app.run(`conj(${verb(w)},${J(f)})`);
 for(const [w,c] of [['食べる','ichidan'],['見る','ichidan'],['起きる','ichidan'],['寝る','ichidan'],['帰る','godan'],['入る','godan'],['知る','godan'],['飲む','godan'],['書く','godan'],['話す','godan'],['来る','kuru']])
  await t.test(`should classify ${w} as ${c}`,()=>assert.equal(cls(w),c));
 for(const [w,f,s,r] of [['食べる','te','食べて','たべて'],['行く','te','行って','いって'],['飲む','ta','飲んだ','のんだ'],['書く','te','書いて','かいて'],['泳ぐ','te','泳いで','およいで'],['話す','te','話して','はなして'],['帰る','nai','帰らない','かえらない'],['見る','nakatta','見なかった','みなかった'],['買う','masu','買います','かいます'],['来る','masu','来ます','きます']])
  await t.test(`should conjugate ${w} in the ${f} form as ${s}`,()=>{const x=form(w,f);assert.equal(x.s,s);assert.equal(x.r,r)});
 const q=(t,r)=>`{en:'x',t:${J(t)},r:${J(r)}}`,ev=(qq,v)=>app.run(`evalT(${qq},${J(v)})`);
 const learn=q(['私','は','日本語','を','習います'],['わたし','は','にほんご','を','ならいます']);
 await t.test('should accept the expected verb typed in romaji',()=>assert.equal(ev(learn,'watashi wa nihongo wo naraimasu').ok,true));
 await t.test('should accept a close-meaning verb in the same polite form',()=>{const r=ev(learn,'watashi wa nihongo wo manabimasu');assert.equal(r.ok,true);assert.equal(r.alt[0].to,'学びます')});
 await t.test('should accept a close-meaning verb in the te form',()=>{const r=ev(q(['これ','を','使って','ください'],['これ','を','つかって','ください']),'kore wo mochiite kudasai');assert.equal(r.alt[0].to,'用いて')});
 await t.test('should explain an opposite verb instead of accepting it',()=>{const r=ev(q(['私','は','本','を','買います'],['わたし','は','ほん','を','かいます']),'watashi wa hon wo urimasu');assert.equal(r.ok,false);assert.match(r.msg.join(' '),/opposite/)});
 await t.test('should not accept the right verb in the wrong tense',()=>{const r=ev(learn,'watashi wa nihongo wo naraimashita');assert.equal(r.ok,false);assert.match(r.msg.join(' '),/Tense or form/)});
 await t.test('should load the verb relation pairs into the relation graph',()=>assert.ok(app.run(`near('話す',2).some(c=>c.w.w=='しゃべる')`)));
});
