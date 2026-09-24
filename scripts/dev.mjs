import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback};
const port=Number(arg('--port',process.env.PORT||'5173'));
const host=arg('--host','0.0.0.0');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local.invalid').pathname);}catch{res.writeHead(400);res.end();return;}
  const base=path.join(root,pathname.startsWith('/data/')?'data':'web');
  const relative=pathname.startsWith('/data/')?pathname.slice(6):pathname==='/'?'index.html':pathname.slice(1);
  const target=path.resolve(base,relative);
  if(!target.startsWith(base+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);
});
server.listen(port,host,()=>console.log(`CSE Field Guide development server on port ${port}`));
process.on('SIGTERM',()=>server.close());
