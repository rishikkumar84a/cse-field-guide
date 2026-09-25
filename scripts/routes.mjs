import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const origin='https://cse.rishik.tech';
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',`${name}.json`),'utf8'));
const curriculum=read('curriculum'),archives=read('curriculum-archives');
const views={first14:'Your first fourteen days',diagnostics:'Diagnostics',curriculum:'The seven-year curriculum',graph:'Prerequisite graph',active:'Active learning path',resources:'Resource catalogue',labs:'Laboratories',projects:'Engineering projects',specialization:'Specialization',about:'About'};
export const routes=new Map([['/',{title:'CSE Field Guide',index:true}]]);
for(const [id,title] of Object.entries(views))routes.set(`/${id}`,{title:`${title} · CSE Field Guide`,index:true});
routes.set('/sources',{title:'About · CSE Field Guide',canonical:'/about'});
for(const year of archives.years)routes.set(`/curriculum/${year.id}`,{title:`${year.label} · CSE Field Guide`,index:true});
for(const unit of curriculum.units){
  routes.set(`/unit/${unit.id}`,{title:`${unit.id} · ${unit.subject} · CSE Field Guide`,description:unit.outcome||unit.scope,index:true});
  routes.set(`/graph/${unit.id}`,{title:`${unit.id} prerequisites · CSE Field Guide`});
}
for(const semester of curriculum.active)routes.set(`/active/${semester.semester}`,{title:`${semester.semester} active path · CSE Field Guide`});
for(const resource of read('resources'))routes.set(`/resource/${resource.id}`,{title:`${resource.title} · CSE Field Guide`});
// Archive links remain usable without adding them to the search index.
for(const archive of archives.variants){
  for(const unit of archive.units)if(!routes.has(`/unit/${unit.id}`))routes.set(`/unit/${unit.id}`,{title:'Archived study record · CSE Field Guide'});
  for(const resource of archive.resources)if(!routes.has(`/resource/${resource.id}`))routes.set(`/resource/${resource.id}`,{title:'Archived resource · CSE Field Guide'});
}
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pageHtml(template,route){
  const page=routes.get(route);if(!page)throw Error(`Unknown route: ${route}`);
  const canonical=origin+(page.canonical||route);
  let html=template.replace(/<title>[^<]*<\/title>/,`<title>${escape(page.title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*/,`$1${canonical}`)
    .replace(/(<meta property="og:url" content=")[^"]*/,`$1${canonical}`)
    .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g,`$1${escape(page.title)}`);
  if(page.description)html=html.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*/g,`$1${escape(page.description)}`);
  return html;
}
export function sitemap(){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...routes].filter(([,p])=>p.index).map(([r])=>`  <url><loc>${origin}${r}</loc></url>`).join('\n')}\n</urlset>\n`;}
