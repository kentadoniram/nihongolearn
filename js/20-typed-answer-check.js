/* js/20-typed-answer-check.js
 * Purpose: Semantic evaluator and romaji, hiragana and kanji answer checking.
 * Defines (9): VM, lvn, nkana, lc, rkOk, lr, near, oppOf, PW
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
// ---- Semantic evaluator: shortest path over the word-relation graph, long-vowel and katakana normalisation, particle explanations ----
Object.entries({che:'ちぇ',she:'しぇ',je:'じぇ',fa:'ふぁ',fi:'ふぃ',fe:'ふぇ',fo:'ふぉ'}).forEach(([a,b])=>RK.set(a,b));
const VM={};[['あかさたなはまやらわがざだばぱゃぁ','あ'],['いきしちにひみりぎじぢびぴぃ','い'],['うくすつぬふむゆるぐずづぶぷゅぅ','う'],['えけせてねへめれげぜでべぺぇ','え'],['おこそとのほもよろをごぞどぼぽょぉ','お']].forEach(([a,v])=>[...a].forEach(c=>VM[c]=v));
const lvn=x=>{let o='';for(const c of x)o+=c=='ー'?(VM[o.slice(-1)]||''):c;return o};
const nkana=x=>lvn(hira(x)).replace(/[。、！？.,!?\s]/g,'').replace(/を/g,'お').replace(/は/g,'わ').replace(/へ/g,'え');
const lc=x=>x.replace(/づ/g,'ず').replace(/ぢ/g,'じ').replace(/([おこそとのほもよろをごぞどぼぽょ])う/g,'$1お').replace(/([えけせてねへめれげぜでべぺ])い/g,'$1え');
// Accept romaji, hiragana, katakana (and the kanji itself for "type the word") for any single-word answer.
const rkOk=(v,t,w)=>{v=String(v).trim();if(!v)return false;if(t=='ty'&&v==w.w)return true;return lc(nkana(v.replace(/[A-Za-zāīūēō' -]+/g,toKana)))==lc(nkana(w.r))||(/^[A-Za-zāīūēō' -]+$/.test(v)&&lr(v)==lr(romaji(w.r)))};
const lr=x=>String(x).toLowerCase().replace(/ā/g,'aa').replace(/ī/g,'ii').replace(/ū/g,'uu').replace(/ē/g,'ee').replace(/ō/g,'ou').replace(/[^a-z]/g,'');
function near(t,mx){const D={[t]:0},N={},q=[t],cs={s:1,r:2};while(q.length){q.sort((a,b)=>D[a]-D[b]);const u=q.shift();(G[u]||[]).forEach(z=>{const c=cs[z.t];if(!c)return;const d=D[u]+c;if(d<=mx&&(D[z.w]==null||d<D[z.w])){D[z.w]=d;N[z.w]=z.n||N[u];q.push(z.w)}})}return Object.keys(D).filter(w=>w!=t&&WM[w]).map(w=>({w:WM[w],d:D[w],n:N[w]}))}
const oppOf=t=>(G[t]||[]).filter(z=>z.t=='a'||z.t=='g').map(z=>WM[z.w]).filter(Boolean);
const PW={'が>を':'が marks the subject, or what exists or is liked (図面があります, 図面が好きです). を marks what the action is done to, so a verb like 確認する, 食べる or 読む takes を.','を>が':'を marks the thing an action is done to. With ある, いる, 好き, わかる and the potential form, the thing takes が (本があります).','は>が':'は marks the topic, what you are talking about. が marks a new or emphasised subject, such as the answer to “who?”.','が>は':'が marks a new or emphasised subject. は marks the topic you are talking about.','に>で':'に marks a destination, a person receiving, a time or where something exists. で marks where an action happens or the means used.','で>に':'で marks where an action happens or the means used. に marks a destination, a person or a time.','を>に':'を marks what the action is done to. に marks the target person, place or time (友達に会います).','に>を':'に marks a target such as a person, place or time. を marks the thing the action is done to.','へ>に':'へ and に both mark a destination, but に also works for people and times.'};
