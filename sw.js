const V='yt-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  if(r.mode==='navigate'){
    e.respondWith((async()=>{
      const cache=await caches.open(V);
      try{
        const res=await Promise.race([fetch(r.url,{cache:'no-cache'}),new Promise((_,no)=>setTimeout(no,5000))]);
        if(res&&res.ok) cache.put('./index.html',res.clone());
        return res;
      }catch(err){ return (await cache.match('./index.html'))||Response.error(); }
    })());
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res})));
});