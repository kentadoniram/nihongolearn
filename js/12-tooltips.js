/* js/12-tooltips.js
 * Purpose: Part of speech, kanji tooltips and tap handling.
 * Defines (3): posOf, tipHTML, showTip
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const posOf=w=>w.p||(/^to /.test(w.m)?'verb':/い$/.test(w.w)&&/い$/.test(w.r)&&K.test(w.w)?'i-adjective':/^[ァ-ヶー]+$/.test(w.w)?'noun (loanword)':'noun');
function tipHTML(c,wi){const k=KJ[c],w=wi==null||isNaN(wi)?null:W()[wi],f=S.tf,o=[];if(!k)return`<b class="tg">${c}</b><div class="mu">No entry yet</div>`;
 const ws=W().filter(x=>!x.g&&x.w.includes(c)).slice(0,4),la=[...new Set(SIM.filter(g=>g.includes(c)).join('').split(''))].filter(x=>x!=c);
 o.push(`<b class="tg">${c}</b>${f.l&&!S.hl?` <span class="lv">N${k.l}</span>`:''}`);
 if(f.r)o.push(`<div>On ${e(k.on)}<br>Kun ${e(k.kun)}</div>`);if(f.m)o.push(`<div>${e(k.m)}</div>`);
 if(f.p&&w)o.push(`<div class="mu">${e(w.w)}: ${posOf(w)}</div>`);
 if(f.w&&ws.length)o.push(`<div class="mu">${ws.map(x=>e(x.w)).join(' ')}</div>`);
 if(f.s&&la.length)o.push(`<div class="mu">Looks like ${la.map(e).join(' ')}</div>`);
 return o.join('')}
function showTip(el){const t=$('#tip');t.innerHTML=tipHTML(el.dataset.k,el.dataset.w==null?null:+el.dataset.w);t.hidden=false;t.dataset.open='k:'+el.dataset.k;
 const r=el.getBoundingClientRect(),h=t.offsetHeight,w=t.offsetWidth;t.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';t.style.top=(r.bottom+h+12>innerHeight?Math.max(8,r.top-h-8):r.bottom+8)+'px'}
if(document.addEventListener){document.addEventListener('click',ev=>{const t=ev.target,tp=$('#tip'),k=t.closest&&t.closest('.kj,.lx');if(t.closest&&t.closest('#tip')){const o=tp.dataset.open;if(o){tp.hidden=true;tp.dataset.open='';if(LKE)kLook(LKE,1);openX(o)}return}if(k){ev.stopPropagation();ev.preventDefault();k.classList.contains('lx')?showLx(k):showTip(k);kLook(k,0)}else tp.hidden=true},true);
 document.addEventListener('dblclick',ev=>{const k=ev.target.closest&&ev.target.closest('.kj,.lx');if(k&&k.closest('.pass')){ev.preventDefault();kLook(k,1);$('#tip').hidden=true;openX(k.classList.contains('lx')?k.dataset.lx:'k:'+k.dataset.k)}},true);
 document.addEventListener('keydown',ev=>{if(ev.key=='Escape')$('#tip').hidden=true;else if(ev.key=='Enter'&&ev.target.classList&&ev.target.classList.contains('kj'))showTip(ev.target);else if(!/INPUT|TEXTAREA/.test(ev.target.tagName||'')){if(ev.key=='ArrowRight')nav(1);else if(ev.key=='ArrowLeft')nav(-1)}});
 document.addEventListener('scroll',()=>{$('#tip').hidden=true},true)}
