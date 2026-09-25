import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {routes,pageHtml,sitemap} from './routes.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.cp(path.join(root, 'web'), output, { recursive: true });
await fs.cp(path.join(root, 'data'), path.join(output, 'data'), { recursive: true });
const template=await fs.readFile(path.join(root,'web/index.html'),'utf8');
for(const route of routes.keys()){
  const file=path.join(output,route==='/'?'index.html':`${route.slice(1)}.html`);
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,pageHtml(template,route));
}
await fs.writeFile(path.join(output,'sitemap.xml'),sitemap());
console.log(`Built static site in dist/ with ${routes.size} valid page routes and a sitemap.`);
