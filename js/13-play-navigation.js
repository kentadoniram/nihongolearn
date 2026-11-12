/* js/13-play-navigation.js
 * Purpose: Previous and next navigation in Play.
 * Defines (5): hist, snap, nav, calq, attr
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
// Previous/next navigation in Play: hist holds snapshots of finished questions.
let hist=[],hi=0,liveH='';
function snap(){hist.push($('#m').innerHTML);if(hist.length>30)hist.shift();hi=hist.length}
function nav(d){const v=$('nav .on');if(!v||v.dataset.v!='p')return;
 if(d<0){if(hi<=0){toast('This is your first question in this session');return}if(hi==hist.length)liveH=$('#m').innerHTML;hi--;$('#m').innerHTML=hist[hi]}
 else if(hi<hist.length){hi++;$('#m').innerHTML=hi==hist.length?liveH:hist[hi]}
 else if(cur&&cur.done)nq()}
const calq=()=>S.cal.map((b,i)=>b[0]?`${i*20}-${i*20+20}%: ${Math.round(b[1]/b[0]*100)}% (${b[0]})`:null).filter(Boolean).join('; ')||'not enough answers yet';
function attr(){const r=[];Object.entries(S.i).forEach(([k,it])=>Object.entries(it.x||{}).forEach(([j,n])=>r.push([k,j,n])));r.sort((a,b)=>b[2]-a[2]);return r.length?`<p class="mu" style="text-align:left">Most confused: ${r.slice(0,3).map(x=>x[0]+' as '+x[1]+' ('+x[2]+'x)').join(', ')}.</p>`:''}
