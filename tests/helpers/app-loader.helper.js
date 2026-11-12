'use strict';
// Loads the scripts listed in index.html (in order, except the boot file) in a sandbox with a fake page and the real data packs.
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..','..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const fakeEl=()=>({innerHTML:'',hidden:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){},contains:()=>false},focus(){},addEventListener(){},querySelectorAll:()=>[],insertAdjacentHTML(){},getBoundingClientRect:()=>({left:0,top:0,bottom:0,width:0,height:0})});
function seeded(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
async function loadApp({seed=1,store={}}={}){
 const scripts=[...read('index.html').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(f=>!/boot/.test(f));
 const els={'nav .on':{dataset:{v:'p'}}},ls={...store};
 const sb={console,document:{querySelector:q=>els[q]||(els[q]=fakeEl()),querySelectorAll:()=>[],createElement:fakeEl,documentElement:fakeEl(),body:fakeEl(),addEventListener(){}},
  localStorage:{getItem:k=>k in ls?ls[k]:null,setItem:(k,v)=>{ls[k]=String(v)}},navigator:{},alert(){},setTimeout:()=>0,clearTimeout(){},innerWidth:400,innerHeight:800,
  fetch:async f=>{try{const t=read(f);return{ok:true,json:async()=>JSON.parse(t)}}catch(e){return{ok:false,status:404}}}};
 sb.window=sb;const ctx=vm.createContext(sb);scripts.forEach(f=>vm.runInContext(read(f),ctx,{filename:f}));
 const run=src=>vm.runInContext(src,ctx);
 sb.__rand=seeded(seed);run('Math.random=()=>__rand()');
 await run('loadContent()');
 return{run,ctx}}
module.exports={loadApp,read,ROOT};
