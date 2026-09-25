import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {routes,pageHtml,sitemap} from '../scripts/routes.mjs';

const template=fs.readFileSync('web/index.html','utf8');
test('every current unit and required learning view has a static route',()=>{
  for(let n=1;n<=75;n++)assert.ok(routes.has(`/unit/U${String(n).padStart(3,'0')}`));
  for(const path of ['/','/first14','/diagnostics','/curriculum/FY1','/graph','/active','/resources','/labs','/projects','/specialization','/about'])assert.ok(routes.has(path),path);
  for(const path of ['/unit/U076','/unknown','/curriculum/FY3'])assert.equal(routes.has(path),false,path);
  const resources=JSON.parse(fs.readFileSync('data/resources.json','utf8'));
  for(const resource of resources)assert.ok(routes.has(`/resource/${resource.id}`),resource.id);
});
test('deep pages have matching canonical metadata and root-relative assets',()=>{
  for(const route of ['/unit/U001','/unit/U075','/about','/curriculum/FY1']){
    const html=pageHtml(template,route);
    assert.ok(html.includes(`rel="canonical" href="https://cse.rishik.tech${route}"`));
    assert.ok(html.includes(`property="og:url" content="https://cse.rishik.tech${route}"`));
    for(const [,value] of html.matchAll(/(?:src|href)="([^"]+)"/g))assert.ok(/^(\/|https?:|#)/.test(value),`${route}: ${value}`);
  }
  assert.match(pageHtml(template,'/unit/U001'),/<title>U001 ·/);
  assert.match(sitemap(),/<loc>https:\/\/cse\.rishik\.tech\/unit\/U075<\/loc>/);
  assert.ok(!sitemap().includes('/data/diagnostic-keys'));
  assert.match(fs.readFileSync('web/404.html','utf8'),/Page not found/);
});
