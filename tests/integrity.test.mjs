import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=n=>JSON.parse(fs.readFileSync(`data/${n}.json`,'utf8'));
const c=read('curriculum'),r=read('resources'),p=read('practice'),d=read('diagnostics'),m=read('source-manifest'),v=read('provenance');
const units=new Set(c.units.map(u=>u.id)),resources=new Set(r.map(x=>x.id));
const refs=value=>(JSON.stringify(value)||'').match(/\b[A-Z]+-\d{4}\b/g)||[];
const canonical=value=>JSON.stringify(value&&typeof value==='object'?Array.isArray(value)?value.map(normalize):normalize(value):value);
function normalize(v){if(!v||typeof v!=='object')return v;if(Array.isArray(v))return v.map(normalize);return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));}
const digest=value=>crypto.createHash('sha256').update(canonical(value)).digest('hex');
test('all 75 IDs, semester assignments and hours are preserved',()=>{
  assert.deepEqual([...units],Array.from({length:75},(_,i)=>`U${String(i+1).padStart(3,'0')}`));
  assert.equal(c.units.length,75);assert.equal(new Set(c.units.map(u=>u.semester)).size,14);
  assert.equal(c.units.reduce((a,u)=>a+u.hours,0),11200);
  assert.deepEqual(c.units.map(({id,year,semester,hours})=>({id,year,semester,hours})),m.unitPreservation);
});
test('1550 unique resources include every original resource ID',()=>{
  assert.equal(r.length,1550);assert.equal(resources.size,1550);assert.equal(m.originalResourceIds.length,473);
  assert.deepEqual(m.originalResourceIds.filter(id=>!resources.has(id)),[]);
});
test('canonical units, resources, mappings and provenance retain exact source fields',()=>{
  const keys=read('diagnostic-keys');
  const collections={...c,...p,...v,...read('source-views'),resources:r,diagnostics:d.map(row=>({...row,answer:keys[row.id]}))};
  for(const [key,hash] of Object.entries(m.fieldHashes))assert.equal(digest(collections[key]),hash,key);
});
test('38 lab contracts and 24 project contracts retain valid parents and allocations',()=>{
  assert.equal(p.labs.length,38);assert.equal(p.projects.length,24);
  assert.equal(new Set([...p.labs,...p.projects].map(a=>a.id)).size,62);
  for(const a of p.labs){assert.ok(units.has(a.unit),a.id);for(const id of a.resource_ids)assert.ok(resources.has(id),id);}
  for(const a of p.projects){for(const id of a.unit_ids)assert.ok(units.has(id));assert.equal(Object.values(a.allocations).reduce((x,y)=>x+y,0),a.hours,a.id);}
});
test('First14 and DIAG-01 through DIAG-28 are present; learner data has no answer keys',()=>{
  assert.deepEqual(c.first14.map(x=>x.day),Array.from({length:14},(_,i)=>i+1));
  assert.deepEqual(d.map(x=>x.id),Array.from({length:28},(_,i)=>`DIAG-${String(i+1).padStart(2,'0')}`));
  assert.equal(Object.keys(read('diagnostic-keys')).length,28);
  for(const row of d){assert.ok(units.has(row.repair_unit));assert.equal('answer' in row,false);}
  for(const file of ['curriculum','resources','practice','legacy-editions'])assert.ok(!/"answer"\s*:/.test(fs.readFileSync(`data/${file}.json`,'utf8')),file);
});
test('all prerequisite, staged co-requisite and module-gate references resolve',()=>{
  for(const u of c.units)for(const id of u.prerequisites)assert.ok(units.has(id),`${u.id} → ${id}`);
  for(const edge of c.dependencies){assert.ok(units.has(edge.after));const before=edge.before.match(/\bU\d{3}\b/g)||[];assert.ok(before.length);for(const id of before)assert.ok(units.has(id));}
  assert.equal(c.module_gates.length,4);assert.equal(c.dependencies.filter(d=>d.kind==='STAGED CO-REQUISITE').length,4);
  const active=new Set(),visited=new Set();
  function visit(id){assert.ok(!active.has(id),`Prerequisite cycle at ${id}`);if(visited.has(id))return;active.add(id);for(const p of c.units.find(u=>u.id===id).prerequisites)visit(p);active.delete(id);visited.add(id);}
  for(const id of units)visit(id);
});
test('all active-path, track and map references resolve without invented aliases',()=>{
  assert.equal(c.active_unit_view.length,75);assert.equal(c.active.length,14);assert.equal(c.track_routes.length,16);
  for(const row of c.maps){assert.ok(units.has(row.unit_id));assert.ok(resources.has(row.resource_id));}
  const fields=['resource_id','resource_ids','primary','course','practice','docs','papers','video','lab_ids','project_ids','now','next','reference','optional','primary_resource','primary_book','secondary_book','primary_course','youtube','website','github','lab','project','documentation','standards_rfc','paper'];
  for(const rows of [c.unit_routes,c.active_unit_view,c.active,c.track_routes,p.labs,p.projects])for(const row of rows)for(const k of fields)for(const id of refs(row[k]))assert.ok(resources.has(id),`${k}: ${id}`);
  for(const row of [...v.aliases,...v.provenance])assert.ok(resources.has(row.resource_id),row.resource_id);
  for(const source of [c,p,d]){
    for(const id of refs(source))assert.ok(resources.has(id),id);
    for(const id of JSON.stringify(source).match(/\bU\d{3}\b/g)||[])assert.ok(units.has(id),id);
  }
  // Imported historical notes retain old IDs, resolved only within their source.
  for(const row of r)for(const id of refs(row.notes))if(!resources.has(id))assert.ok(v.aliases.some(a=>a.source===row.source_release&&a.legacy_id===id&&resources.has(a.resource_id)),`${row.id}: ${id}`);
  // Repeated source mapping rows are legal historical data, not duplicate entity IDs.
  assert.equal(c.maps.length,1014);
});
test('verification values and inherited states are unchanged',()=>{
  const counts={};for(const row of r)counts[row.status]=(counts[row.status]||0)+1;
  assert.deepEqual(counts,m.sourceCounts.verification);
  for(const row of v.verification)assert.equal(r.find(r=>r.id===row.resource_id).status,row.status,row.resource_id);
  assert.ok(r.some(x=>x.inherited_verification&&x.inherited_verification!==x.status));
});
test('web assets and JavaScript entry points exist; release excludes secrets and source archives',()=>{
  const html=fs.readFileSync('web/index.html','utf8');
  for(const file of ['app.js','features.js','style.css','rebrand.css','assets/logo.png','assets/favicon.svg','assets/social-preview.png'])assert.ok(fs.existsSync(`web/${file}`),file);
  assert.match(html,/<title>CSE Field Guide<\/title>/);assert.match(html,/og:title" content="CSE Field Guide"/);
  assert.ok(!html.includes('CSE Curriculum Explorer'));
  for(const file of fs.readdirSync('data')){
    const text=fs.readFileSync(`data/${file}`,'utf8');
    assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-proj-[A-Za-z0-9_-]{30,}|OAI-Sites-Authorization|\/workspace\/|\/mnt\/data\//.test(text),file);
  }
});
