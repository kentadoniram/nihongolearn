/* js/24-time-regression-and-reading-points.js
 * Purpose: Time-based regression after time away and reading help points.
 * Defines (5): absence, wbCard, LKE, kLook, kiStatus
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
// ---- Time-based regression after time away ----
// After 3 or more days: question stage follows the effective memory strength (stage uses sEff), and the ability estimate eases back towards its start value.
function absence(){const now=Date.now();if(!S.la){const ts=Object.values(S.i).map(i=>i.t||0);S.la=ts.length?Math.max(...ts):now}
 const g=(now-S.la)/864e5;if(g<3||S.abAt===S.la)return null;
 const m=S.mdl,k=Math.exp(-g/45);m.w[0]=1.2+(m.w[0]-1.2)*k;S.abAt=S.la;
 const L=W().filter(w=>S.i[w.w]);let r0=0,r1=0;L.forEach(w=>{const it=S.i[w.w];r0+=ret(it,Math.max(S.la,it.t));r1+=ret(it,now)});
 S.ab={g:Math.round(g),r0:L.length?r0/L.length:1,r1:L.length?r1/L.length:1,k,t:now};save();return S.ab}
function wbCard(){const a=S.ab;return a?`<div class="card"><b>Welcome back after ${a.g} days</b><p>Estimated recall across your words: ${Math.round(a.r0*100)}% when you left, ${Math.round(a.r1*100)}% now. Your ability estimate was eased back by ${Math.round((1-a.k)*100)}%, and questions start with easier forms. Both recover as you answer.</p></div>`:''}
// ---- Reading help points: 1 point for the first tap on a word or kanji in a passage, 3 in total for a double tap or opening its full entry ----
let LKE=null,PLK={};
function kLook(el,deep){if(!el||!el.closest||!el.closest('.pass'))return 0;LKE=el;const key=el.dataset.k?'k:'+el.dataset.k:el.dataset.lx,st=PLK[key]||(PLK[key]={c:0,d:0}),ki=S.ki=S.ki||{c:0,d:0,p:0,k:{}},ks=[...(el.textContent||'')].filter(c=>K.test(c));let p=0;
 if(!st.c){st.c=1;p+=1;ki.c++;ks.forEach(c=>{(ki.k[c]=ki.k[c]||{c:0,d:0}).c++})}
 if(deep&&!st.d){st.d=1;p+=2;ki.d++;ks.forEach(c=>{(ki.k[c]=ki.k[c]||{c:0,d:0}).d++})}
 if(p){ki.p+=p;S.xp+=p;PLK.n=(PLK.n||0)+p;save()}return p}
function kiStatus(){const ki=S.ki;if(!ki||!ki.p)return'No lookups yet. Tap a word or kanji in a reading passage: 1 point for the first tap, 3 in total for a double tap.';const top=Object.entries(ki.k).sort((a,b)=>b[1].c+b[1].d*2-(a[1].c+a[1].d*2)).slice(0,5).map(x=>x[0]).join(' ');return`${ki.p} points from ${ki.c} lookups (${ki.d} deep). Most looked-up kanji: ${top}.`}
