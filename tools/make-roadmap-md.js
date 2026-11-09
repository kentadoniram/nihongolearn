// Regenerates ROADMAP.md from data/roadmap.json. Run: node tools/make-roadmap-md.js
const fs=require('fs'),v=JSON.parse(fs.readFileSync('version.json','utf8')),r=JSON.parse(fs.readFileSync('data/roadmap.json','utf8')).roadmap;
const sec=(t,k)=>{const a=r.filter(x=>x.s==k);return`## ${t} (${a.length})\n\n`+(a.map(x=>`- [${k=='done'?'x':' '}] ${x.t} (${x.a}${x.n?': '+x.n:''})`).join('\n')||'- none')+'\n'};
fs.writeFileSync('ROADMAP.md',`# Build plan\n\nApp version ${v.app}. Edit data/roadmap.json, then run \`node tools/make-roadmap-md.js\`. The app shows the same list under Roadmap.\n\n`+[sec('In progress','doing'),sec('Not started','planned'),sec('Done','done')].join('\n'));
