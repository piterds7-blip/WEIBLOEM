/* Service worker Weibloem – podbij WERSJA przy każdym wdrożeniu, jeśli zmieniasz ikony lub manifest */
const WERSJA='weibloem-v6';
const PLIKI=['./','./index.html','./firebase-config.js','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(WERSJA).then(c=>c.addAll(PLIKI)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==WERSJA).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET') return;
  if(u.hostname.includes('firestore.googleapis.com')) return;          // dane idą zawsze do Firestore
  if(u.origin===location.origin){                                         // aplikacja: najpierw sieć (nowa wersja po pushu), offline z pamięci
    e.respondWith(fetch(r).then(o=>{ const k=o.clone(); caches.open(WERSJA).then(c=>c.put(r,k)); return o; }).catch(()=>caches.match(r).then(x=>x||caches.match('./index.html'))));
    return;
  }
  if(/gstatic\.com|googleapis\.com/.test(u.hostname)){                    // SDK Firebase i fonty: z pamięci, w tle odświeżane
    e.respondWith(caches.open(WERSJA).then(c=>c.match(r).then(x=>{ const s=fetch(r).then(o=>{ if(o.ok||o.type==='opaque') c.put(r,o.clone()); return o; }).catch(()=>x); return x||s; })));
  }
});
