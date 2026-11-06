// Network first, cache fallback: lesson files refresh when online and everything works offline.
const C='nihongo-lab';
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(C);await c.addAll(['./','index.html','manifest.json','version.json','data/manifest.json']);
 const m=await(await fetch('data/manifest.json',{cache:'no-store'})).json();await c.addAll(m.packs.map(f=>'data/'+f));self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
