/* js/11-build-tab.js
 * Purpose: Sentence patterns and the Build tab.
 * Defines (10): nlq, PT, fm, blk, bld, bsh, sp, pat, pats, sc
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const nlq=()=>{const r=S.nl.slice(-20);return[r.length?(r.reduce((a,b)=>a+b,0)/r.length).toFixed(2):'n/a',S.nn?(S.nt/S.nn).toFixed(2):'n/a']};
const PT='はがをにでへとも';let bq=null;
const fm=id=>FM.find(f=>f.id==id),open3=x=>x.l>=4||S.n3||S.cnt>120;
const blk=f=>f.blocks.map((b,i)=>`<span class="blk${i==f.blocks.length-1?' v':''}">${e(b)}</span>`).join('');
function bld(){if(S.bm=='type')return typ();S.bm='tile';if(GEN.frames&&Math.random()<.6){const q=gs();bq={q,pool:shuffle(q.t.map((_,i)=>i)),sel:[],ev:[],t0:Date.now(),fs:'',tfs:0};etStart();return bsh()}const pf=S.pf=S.pf||{},w=x=>(1+((S.cxw||{})[x.f]||0)*.5)/(1+(pf[x.f]||0)*.7)+.05,P=SN.filter(open3),c=P.length>1?P.filter(x=>!bq||x!==bq.q):P;if(!c.length)return;
 let r=Math.random()*c.reduce((a,x)=>a+w(x),0),q=c[c.length-1];for(const x of c){r-=w(x);if(r<=0){q=x;break}}
 bq={q,pool:shuffle(q.t.map((_,i)=>i)),sel:[],ev:[],t0:Date.now(),fs:'',tfs:0};etStart();bsh()}
function bsh(){const{q,pool,sel}=bq,f=fm(q.f),lb=x=>S.hl?'':` <span class="lv">N${x.l}</span>`;
 $('#m').innerHTML=`${f?`<div class="card pat" onclick="pat('${f.id}')"><div class="mu" style="text-align:left;margin:0">Pattern: <b>${e(f.name)}</b>${lb(f)} <a class="wl">how it works</a></div><div class="blks">${blk(f)}</div></div>`:''}<div class="card q-bt"><div class="mu" style="display:flex;justify-content:space-between;margin:0"><span>Natural Japanese order${lb(q)}</span><a class="wl" onclick="S.bm='type';save();typ()">Type it</a> <a class="wl" onclick="pats()">Patterns</a></div><div class="mean">${e(q.en)}</div><div id="bs">${sel.map((k,j)=>`<button class="tile on" onclick="su(${j})">${e(q.t[k])}</button>`).join('')||'<span class="mu">Tap the words in order</span>'}</div><div>${pool.map(k=>`<button class="tile" ${sel.includes(k)?'disabled':''} onclick="sp(${k})">${e(q.t[k])}</button>`).join('')}</div><button class="pri" onclick="sc()">Check</button><button class="skip" onclick="sskip()">Skip</button></div><div id="fb"></div>`}
function sp(k){bq.ev.push(['+',k,Date.now()-bq.t0]);bq.sel.push(k);if(!bq.fs&&bq.sel.length==bq.q.t.length){bq.fs=bq.sel.map(z=>bq.q.t[z]).join(' ');bq.tfs=Date.now()-bq.t0}bsh()}function su(j){bq.ev.push(['-',bq.sel[j],Date.now()-bq.t0]);bq.sel.splice(j,1);bsh()}
function pat(id){const f=fm(id);dv(`<h2 style="margin:8px 0">${e(f.name)}${S.hl?'':' <span class="lv">N'+f.l+'</span>'}</h2><div class="blks">${blk(f)}</div><p>${e(f.note)}</p><p class="mu" style="text-align:left">${e(f.trap)}</p>${f.ex.map(x=>`<div class="card"><p style="margin:0">${[...x[0]].map(kc).join('')}</p><p class="mu" style="text-align:left;margin:4px 0 0">${e(x[1])}</p></div>`).join('')}<button class="pri" onclick="$('#dv').hidden=true">Try it</button>`)}
function pats(){dv(`<h2 style="margin:8px 0">Sentence patterns</h2>${FM.filter(open3).map(f=>`<div class="card pat" onclick="pat('${f.id}')"><b>${e(f.name)}</b>${S.hl?'':' <span class="lv">N'+f.l+'</span>'}<div class="blks">${blk(f)}</div></div>`).join('')}`)}
function sc(){const{q,sel}=bq,t=sel.map(k=>q.t[k]),f=fm(q.f);if(t.length<q.t.length)return;
 const un=a=>{const u=[];a.forEach(x=>{if(PT.includes(x)&&x.length==1&&u.length)u[u.length-1]+=x;else u.push(x)});return u.sort().join('|')},n=q.t.length-q.tail,tl=q.t.slice(n).join(''),tailOk=t.slice(n).join('')==tl,
 ok=tailOk&&un(t.slice(0,n))==un(q.t.slice(0,n)),same=t.join(' ')==q.t.join(' ');let m='';
 if(!tailOk)m='In Japanese the verb (the predicate) always comes last. English says “I eat sushi” (subject, verb, object). Japanese says “I sushi eat”. Move '+tl+' to the end.';
 else if(t.some((x,i)=>PT.includes(x)&&x.length==1&&(i==0||PT.includes(t[i-1]))))m='A particle sticks right after the word it marks (寿司 を, never を 寿司). Check which word each particle belongs to.';
 else m='All the pieces are there, but a particle sits next to the wrong word. Check which word each は, が, を, に or で belongs to.';
 cxTile(q,t,ok);tick();if(ok){S.xp+=15;S.pf=S.pf||{};S.pf[q.f]=(S.pf[q.f]||0)+1;save()}
 $('#fb').innerHTML=`<div class="card fb ${ok?'':'r'}"><b>${ok?'✓ Natural Japanese, +15 XP':'✗ Not quite'}</b><p>${ok?(same?'':'Japanese lets you move these blocks around. The usual order is: '+ej(q.t.join(' '))):ej(m)}</p>${ok&&q.ex?`<p class="mu" style="text-align:left">Other natural orders: ${ej(q.ex.join('   '))}</p>`:''}${trioT(q)}${!ok&&f?`<div class="blks">${blk(f)}</div>`:''}<p class="mu" style="text-align:left">${ej(q.y||(f&&f.note)||'')}</p><button class="pri" onclick="adv('b')">Next sentence</button></div>`;
 if(ok&&S.aa!==false){const b0=bq;setTimeout(()=>{if(bq===b0&&$('nav .on')&&$('nav .on').dataset.v=='b')adv('b')},2400)}}
