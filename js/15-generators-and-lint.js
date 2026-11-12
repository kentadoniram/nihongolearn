/* js/15-generators-and-lint.js
 * Purpose: Sentence generators and the grammar lint.
 * Defines (10): FRM, kindOf, labChips, gsB, PVR, lintS, gsI, gs, identLab, genLab
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
// Generators: one table of sentence frames feeds Build, typing and Lab; reading templates fill slots so every passage and question differs.
const FRM=()=>GEN.frames||[],rc=()=>(GEN.reads||[]).reduce((a,r)=>a+Object.values(r.slots).reduce((p,v)=>p*v.length,1),0);
const kindOf=x=>x.gen=='read'||(x.u&&x.u.p)?'r':['syn','ant','para'].includes(x.gen)?'m':x.w?'w':'g';
const labChips=()=>[['','All'],['r','Reading'],['g','Grammar'],['m','Meaning'],['w','Words']].map(([k,t])=>`<a class="wl" style="${(S.lf||'')==k?'font-weight:700;text-decoration:none':''}" onclick="S.lf='${k}';save();lab()">${t}</a>`).join(' ');
function gsB(f,s,t){const th=s.j!='私',vb=t.t==1?f.e2:t.t==2?'will '+f.e1:th?f.e3:f.e1,v=t.t==1?f.va:f.vp,vr=t.t==1?f.var:f.vpr;
 return{en:`${s.e} ${vb} ${t.e}.`,t:[s.j,'は',t.j,f.n,f.p,v],r:[s.r,'は',t.r,f.nr,f.p,vr],tail:1,y:f.y,l:5,f:f.f,k:`g|${s.j}|${f.n}`,fr:f,tm:t.t,alts:[[t.r,s.r,'は',f.nr,f.p,vr],[s.r,'は',f.nr,f.p,t.r,vr]],ex:[`${t.j}、${s.j}は${f.n}${f.p}${v}。`,`${s.j}は${f.n}${f.p}${t.j}${v}。`]}}
// Grammar lint: particle and verb must be compatible, tense must match the time word, subject must differ from the noun.
const PVR={に:/^(行|会|入)/,で:/^(勉強|待|行)/,を:/^(食|飲|開|読|書|見|聞)/};
function lintS(o){if(o.t.length!=o.r.length)return false;if(o.fr){if(!(PVR[o.fr.p]&&PVR[o.fr.p].test(o.fr.vp)))return false;if(o.t[0]==o.t[3])return false;if(/ました$/.test(o.t[5])!=(o.tm==1))return false}return/(ます|ました|です|でした|ありません|か)$/.test(o.t[o.t.length-1])}
function gsI(){const I=GEN.ident,s=rnd(GEN.subj),n=rnd(I.nouns),fo=rnd(I.forms),key=`i|${s.j}|${n[0]}|${fo.k}`;if(s.j==n[0]||S.fp.includes(key))return null;S.fp.push(key);
 const mk=fo=>{const am=s.j=='私',be=fo.k=='past'?'was':am?'am':'is';return{en:fo.k=='q'?`${am?'Am I':'Is '+s.e.toLowerCase()} ${n[2]}?`:`${s.e} ${be}${fo.k=='neg'?' not':''} ${n[2]}.`,t:[s.j,'は',n[0],...fo.j],r:[s.r,'は',n[1],...fo.r],tail:fo.j.length,y:'は marks the topic and です closes the sentence politely. Japanese has no separate word for “is” in the middle.',l:5,f:'wa',k:`i|${s.j}|${n[0]}`,tm:0}};
 const o=mk(fo);o.sib=I.forms.filter(x=>x!==fo).map(mk);return o}
function gs(){const F=FRM();for(let k=0;k<20;k++){if(GEN.ident&&Math.random()<.3){const o=gsI();if(o)return o;continue}
  const f=rnd(F),s=rnd(GEN.subj),t=rnd(GEN.tm),key=`g|${s.j}|${t.j}|${f.n}|${f.vp}`;if(S.fp.includes(key)&&k<19)continue;const o=gsB(f,s,t);if(!lintS(o))continue;
  S.fp.push(key);if(S.fp.length>400)S.fp.shift();o.sib=GEN.tm.filter(x=>x!==t).map(x=>gsB(f,s,x));return o}return gsB(F[0],GEN.subj[0],GEN.tm[0])}
function identLab(k){const I=GEN.ident,s=rnd(GEN.subj),n=rnd(I.nouns.filter(x=>x[0]!=s.j));
 if(k=='p'){const ix=shuffle(['は','が','を','に']),sent=`${s.j}＿＿${n[0]}です。`;return{t:'Fill in the particle',p:sent,q:'Which particle fits?',o:ix,a:ix.indexOf('は'),y:`は marks the topic, what the sentence is about, and です states what it is. Complete: ${s.j}は${n[0]}です。`,key:'ip|'+sent,full:`${s.j}は${n[0]}です。`,fen:`${s.e} ${s.j=='私'?'am':'is'} ${n[2]}.`}}
 const ix=shuffle(['でした','です','ではありません','ですか']),sent=`昨日、${s.j}は${n[0]}＿＿。`;return{t:'Choose the right form',p:sent,q:'Which ending fits?',o:ix,a:ix.indexOf('でした'),y:`昨日 points to the past, so です becomes でした: ${s.j}は${n[0]}でした。`,key:'it|'+sent,full:`昨日、${s.j}は${n[0]}でした。`,fen:`${s.e} was ${n[2]} yesterday.`}}
function genLab(x){const F=FRM(),s=rnd(GEN.subj);let c;
 if(x.gen=='particle'&&GEN.ident&&Math.random()<.35)c=identLab('p');else if(x.gen=='tense'&&GEN.ident&&Math.random()<.3)c=identLab('t');
 else if(x.gen=='particle'){const f=rnd(F),t=rnd(GEN.tm),vb=t.t==1?f.va:f.vp,sent=`${s.j}は${t.j}${f.n}＿＿${vb}。`,ix=shuffle(['に','で','を','が']);
  c={t:'Fill in the particle',p:sent,q:'Which particle fits?',o:ix,a:ix.indexOf(f.p),y:`${f.y} Complete: ${f.n}${f.p}${vb}.`,key:'p|'+sent,full:`${s.j}は${t.j}${f.n}${f.p}${vb}。`,fen:gsB(f,s,t).en}}
 else if(x.gen=='tense'){const f=rnd(F),cu=rnd(GEN.cues),st=f.vp.slice(0,-2),fm={'ます':st+'ます','ました':st+'ました','ません':st+'ません','ませんでした':st+'ませんでした','ています':f.te+'います','ていました':f.te+'いました'},ix=shuffle([cu.a,...cu.d]),sent=`${cu.j}、${s.j}は${f.n}${f.p}＿＿。`;
  c={t:'Choose the right form',p:sent,q:'Which ending fits?',o:ix.map(k=>fm[k]),a:ix.indexOf(cu.a),y:`${cu.j} points to ${cu.n}, so the verb needs the ${cu.a} form: ${f.n}${f.p}${fm[cu.a]}.`,key:'t|'+sent,full:`${cu.j}、${s.j}は${f.n}${f.p}${fm[cu.a]}。`,fen:cu.a=='ました'?`${s.e} ${f.e2} yesterday.`:cu.a=='ます'?`${s.e} will ${f.e1} next week.`:''}}
 else if(x.gen=='syn'||x.gen=='ant')c=relLab(x.gen);else if(x.gen=='para')c=paraLab();
 else{const r=x.r,v={};Object.keys(r.slots).forEach(k=>v[k]=rnd(r.slots[k]));const qd=rnd(r.qs),fl=z=>z.replace(/\{(\w+)\}/g,(_,k)=>v[k]),pass=fl(r.t),o=shuffle([v[qd.s],...shuffle(r.slots[qd.s].filter(z=>z!=v[qd.s])).slice(0,3)]);
  c={t:'Reading',p:pass,q:fl(qd.q),en:qd.en,o,a:o.indexOf(v[qd.s]),y:fl(qd.y),key:'r|'+pass+'|'+qd.s,full:v[qd.s],fen:trV(v[qd.s])}}
 c.x=x;c.l=x.l;c.ex=[];return c}
