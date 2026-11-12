// Network first, cache fallback: lesson files refresh when online and everything works offline.
const C='nihongo-lab';
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(C);
 for(const u of ['./','index.html','manifest.json','version.json'])await c.add(u).catch(()=>{});
 // the stylesheet and scripts are read from index.html, so adding a file there is enough
 try{const h=await(await fetch('index.html',{cache:'no-store'})).text();for(const m of h.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g))await c.add(m[1]).catch(()=>{})}catch(x){}
 for(const b of ['data/','']){try{const m=await(await fetch(b+'content.json',{cache:'no-store'})).json();for(const f of ['content.json',...m.packs])await c.add(b+f).catch(()=>{});break}catch(x){}}
 self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
