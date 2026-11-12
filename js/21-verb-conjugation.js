/* js/21-verb-conjugation.js
 * Purpose: Verb conjugation and the synonym check for conjugated verbs.
 * Defines (9): GOD1, ROW, IE, vclass, conj, _vf, vfMap, verbAlt, evalT
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
// ---- Verb conjugation and the synonym check for conjugated verbs ----
// An answer may use a close-meaning verb in the same form as the expected verb (習います > 学びます); an opposite verb is explained instead.
const GOD1=['帰る','入る','走る','知る','切る','要る','減る','参る','喋る','握る','照る','練る','滑る','限る','蹴る','焦る','散る','湿る','茂る','しゃべる'];
const ROW={う:'わいうえお',く:'かきくけこ',ぐ:'がぎぐげご',す:'さしすせそ',つ:'たちつてと',ぬ:'なにぬねの',ぶ:'ばびぶべぼ',む:'まみむめも',る:'らりるれろ'};
const IE='いきしちにひみりぎじびぴえけせてねへめれげぜべぺ';
function vclass(d){if(d.w=='する')return'suru';if(d.r=='くる')return'kuru';const L=d.r.slice(-1);if(!ROW[L])return null;
 if(L=='る'&&d.w.endsWith('る')&&IE.includes(d.r.slice(-2,-1))&&!GOD1.includes(d.w))return'ichidan';return'godan'}
function conj(d,f){const c=vclass(d);if(!c||c=='suru')return null;if(d.w=='ある'&&(f=='nai'||f=='nakatta'))return{s:f=='nai'?'ない':'なかった',r:f=='nai'?'ない':'なかった'};let a,i,te,ta;const U=x=>x.slice(0,-1),L=d.r.slice(-1);
 if(c=='ichidan'){a=i=[U(d.w),U(d.r)];te=a.map(x=>x+'て');ta=a.map(x=>x+'た')}
 else if(c=='kuru'){a=['来','こ'];i=['来','き'];te=['来て','きて'];ta=['来た','きた']}
 else{const r=ROW[L],mk=t=>[U(d.w)+t,U(d.r)+t],tt=d.w=='行く'?'って':{う:'って',つ:'って',る:'って',む:'んで',ぶ:'んで',ぬ:'んで',く:'いて',ぐ:'いで',す:'して'}[L];a=mk(r[0]);i=mk(r[1]);te=mk(tt);ta=mk(tt.replace(/て$/,'た').replace(/で$/,'だ'))}
 const M={masu:[i,'ます'],mase:[i,'ません'],mashita:[i,'ました'],te:[te,''],ta:[ta,''],nai:[a,'ない'],nakatta:[a,'なかった'],dict:[[d.w,d.r],''],tai:[i,'たい'],mashou:[i,'ましょう'],teimasu:[te,'います']}[f];return M?{s:M[0][0]+M[1],r:M[0][1]+M[1]}:null}
let _vf=null,_vn=-1;
function vfMap(){if(_vf&&_vn==V.length)return _vf;_vn=V.length;_vf=new Map();V.forEach(d=>{if(d.t||!/[うくぐすつぬぶむる]$/.test(d.r)||posOf(d)!='verb')return;['masu','mase','mashita','te','ta','nai','nakatta'].forEach(f=>{const x=conj(d,f);if(x)_vf.set(x.s+'|'+x.r,{d,f})})});return _vf}
function verbAlt(t,rc,u2){const h=vfMap().get(t+'|'+rc);if(!h)return{};const{d,f}=h,o={};
 for(const c of near(d.w,2).sort((a,b)=>a.d-b.d)){if(posOf(c.w)!='verb')continue;const x=conj(c.w,f);if(x&&u2.includes(nkana(x.r))){o.alt={from:t,to:x.s,d:c.d,n:c.n,m:c.w.m,hit:nkana(x.r)};break}}
 for(const c of oppOf(d.w)){if(posOf(c)!='verb')continue;const x=conj(c,f);if(x&&u2.includes(nkana(x.r))){o.op=`${x.s} (${c.m}) means the opposite of ${t} (${d.m}), so the meaning is reversed.`;break}}
 return o}
function evalT(q,v){const mp={};q.t.forEach((t,i)=>{const r=q.r[i];mp[t]=r;const k=cs(t,r);if(k&&k<t.length)mp[t.slice(0,t.length-k)]=r.slice(0,r.length-k)});W().forEach(w=>{if(K.test(w.w)&&!mp[w.w])mp[w.w]=w.r});
 const ur=Object.keys(mp).sort((a,b)=>b.length-a.length).reduce((x,k)=>x.split(k).join(mp[k]),v.replace(/[A-Za-zāīūēō' -]+/g,toKana)),un=nkana(ur),cn=nkana(q.r.join('')),last=q.t.length-1,alt=[],msg=[];let u2=un;
 q.t.forEach((t,i)=>{if(PR[t])return;if(i==last){const r0=nkana(q.r[i]);if(!u2.includes(r0)&&!WM[t]){const vs=verbAlt(t,q.r[i],u2);if(vs.alt){u2=u2.replace(vs.alt.hit,r0);alt.push(vs.alt)}if(vs.op)msg.push(vs.op)}return}const rc=nkana(q.r[i]);if(u2.includes(rc))return;const wi=WM[t];if(!wi){const vs=verbAlt(t,q.r[i],u2);if(vs.alt){u2=u2.replace(vs.alt.hit,rc);alt.push(vs.alt)}if(vs.op)msg.push(vs.op);return}
  for(const c of near(t,2).sort((a,b)=>a.d-b.d)){const rr=nkana(c.w.r);if(rr&&u2.includes(rr)){u2=u2.replace(rr,rc);alt.push({from:t,to:c.w.w,d:c.d,n:c.n,m:c.w.m});break}}
  const op=oppOf(t).find(c=>un.includes(nkana(c.r)));if(op)msg.push(`${op.w} (${op.m}) means the opposite of ${t} (${wi.m}), so the meaning is reversed.`)});
 const ok=(u2==cn||(q.alts||[]).some(a=>nkana(a.join(''))==u2))&&!alt.some(a=>a.d>1),srt=[...u2].sort().join('')==[...cn].sort().join('');alt.filter(a=>a.d>1).forEach(a=>msg.push(`${a.to} (${a.m}) is related to ${a.from} but not the same.${a.n?' '+a.n:''}`));if(K.test(ur))msg.push('I could not read some kanji in your answer. Try writing those words in hiragana or romaji.');
 const a=ending(u2),b=ending(cn);if(a!=b&&!(srt&&u2!=cn))msg.push(`Tense or form: your sentence ends as “${a||'no clear verb ending'}”, but it needs “${b}”.`);
 const cont=q.t.map((t,i)=>[t,i]).filter(([t,i])=>!PR[t]&&i!=last);let ws=0;cont.forEach(([t,i])=>{const rc=nkana(q.r[i]);if(un.includes(rc))ws+=1;else{const x=alt.find(z=>z.from==t);if(x)ws+=x.d==1?.95:.7}});
 const prs=q.t.map((t,i)=>[t,i]).filter(([t,i])=>PR[t]&&i);let ps=0;
 prs.forEach(([t,i])=>{const pre=nkana(q.r[i-1]),pr=nkana(q.r[i]);if(u2.includes(pre+pr)){ps++;return}const X=[...'おわえにでがともの'].find(c=>c!=pr&&u2.includes(pre+c));
  if(X){const used=({お:'を',わ:'は',え:'へ'})[X]||X;msg.push((PW[used+'>'+t]||`You used ${used} after ${q.t[i-1]}, but ${t} (${PR[t]}) is needed.`)+` Correct: ${q.t[i-1]}${t}${q.t.slice(i+1).join('')}.`)}else if(u2.includes(pre))msg.push(`After ${q.t[i-1]} the particle ${t} (${PR[t]}) is missing.`)});
 const tl=nkana(q.r[last]),tailOk=u2.endsWith(tl);
 if(u2!=cn&&srt)msg.push('You have the right pieces in the wrong order. Japanese keeps each particle right after its word and puts the verb last. English order (subject, verb, object) does not carry over.');else if(!ok&&!tailOk&&u2.includes(tl))msg.push('The verb (predicate) must come last in a Japanese sentence.');
 cont.forEach(([t,i])=>{if(!un.includes(nkana(q.r[i]))&&!alt.some(z=>z.from==t)&&!msg.some(m=>m.includes(t)))msg.push(`I cannot find ${t} (${q.r[i]}) in your answer.`)});
 const p={w:cont.length?ws/cont.length:1,p:prs.length?ps/prs.length:1,f:a==b?1:0,o:u2==cn?1:tailOk?.7:.2};
 return{ok,pct:ok?100:Math.round(100*(.4*p.w+.25*p.p+.2*p.f+.15*p.o)),p,msg,alt,u2,un}}
