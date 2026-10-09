// O histórico vive no localStorage, nunca no cache. HTML usa rede primeiro.
const CACHE='roleta-static-__CACHE_VERSION__';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE),response=await fetch('/index.html',{cache:'no-cache'});
 if(!response.ok)throw new Error('Grimório indisponível para cache.');
 const html=await response.clone().text();await cache.put('/index.html',response);
 const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map(match=>match[1]);
 const tarot=['the-sun','the-moon','strength','justice','card-back'].map(name=>'/tarot/'+name+'.png');
 await cache.addAll([...assets,...tarot,'/icon.svg','/icon-192.png','/icon-512.png','/manifest.webmanifest']);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('roleta-static-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate')event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok)await cache.put('/index.html',response.clone());return response;}catch{return await cache.match('/index.html')||Response.error();}})());
 // Assets públicos da mesma origem não variam por usuário. Vite pode enviar Vary: Origin.
 else if(url.pathname.startsWith('/assets/')||url.pathname.startsWith('/tarot/')||url.pathname.startsWith('/icon')||url.pathname==='/manifest.webmanifest')event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(request,{ignoreVary:true});if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;})());
});
