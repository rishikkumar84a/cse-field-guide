import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {routes,pageHtml,sitemap} from './routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback};
const port=Number(arg('--port',process.env.PORT||'5173'));
const host=arg('--host','0.0.0.0');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local.invalid').pathname);}catch{res.writeHead(400);res.end();return;}
  const route=pathname==='/'?'/':pathname.replace(/\/$/,'');
  if(routes.has(route)){
    res.writeHead(200,{'Content-Type':mime['.html'],'Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?'':pageHtml(fs.readFileSync(path.join(root,'web/index.html'),'utf8'),route));return;
  }
  if(pathname==='/sitemap.xml'){res.writeHead(200,{'Content-Type':mime['.xml']});res.end(req.method==='HEAD'?'':sitemap());return;}
  const base=path.join(root,pathname.startsWith('/data/')?'data':'web');
  const relative=pathname.startsWith('/data/')?pathname.slice(6):pathname==='/'?'index.html':pathname.slice(1);
  const target=path.resolve(base,relative);
  if(!target.startsWith(base+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404,{'Content-Type':mime['.html']});res.end(req.method==='HEAD'?'':fs.readFileSync(path.join(root,'web/404.html')));return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);
});
server.listen(port,host,()=>console.log(`CSE Field Guide development server on port ${port}`));
process.on('SIGTERM',()=>server.close());
