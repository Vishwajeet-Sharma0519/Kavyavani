import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const filename = new URL("../dist/index.html", import.meta.url);
let html = await readFile(filename, "utf8");
const version = createHash("sha256")
  .update("pwa-v2" + html)
  .digest("hex")
  .slice(0, 12);
html = html
  .replace(
    "<title>mobile</title>",
    "<title>Kavyavani · A little room for poetry</title>",
  )
  .replace(
    /<title>.*?<\/title>/,
    "<title>Kavyavani · A little room for poetry</title>",
  );
html = html.replace(
  "</head>",
  `<meta name="theme-color" content="#743a40"><meta name="description" content="Find your next favourite verse. Read and collect 4,730 poems in Devanagari, Roman, and Urdu."><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icon-192.png"><style>html,body,#root{background:#f7f2e8}*{box-sizing:border-box}*:focus-visible{outline:2px solid currentColor;outline-offset:3px}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}</style></head>`,
);
html = html.replace(
  "</body>",
  `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}</script></body>`,
);
await writeFile(filename, html);
const shell = [
  ...html.matchAll(/(?:src|href)="(\/(?:_expo|assets)\/[^"?]+)"/g),
].map((m) => m[1]);
const fontFiles = await readdir(new URL("../dist/assets/", import.meta.url), {
  recursive: true,
});
shell.push(
  ...fontFiles
    .filter((name) => name.endsWith(".ttf"))
    .map((name) => "/assets/" + name.replaceAll("\\", "/")),
);
// Cache the app shell and visited poetry. Never cache failures. Updates wait
// for old tabs to close so old JS and a new data revision cannot be mixed.
const worker = `const CACHE='kavyavani-${version}';
const SHELL=${JSON.stringify(["/", "/index.html", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png", ...shell])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kavyavani-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.open(CACHE).then(c=>c.match('/index.html'))));return;}
 event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(req);if(cached)return cached;const response=await fetch(req);if(response.ok && (url.pathname.startsWith('/data/')||url.pathname.startsWith('/assets/')||url.pathname.startsWith('/_expo/'))){try{await cache.put(req,response.clone())}catch{}}return response;}));
});`;
await writeFile(new URL("../dist/sw.js", import.meta.url), worker);
console.log(`PWA shell generated: ${version}`);
