import fs from 'node:fs';
import crypto from 'node:crypto';

const read=name=>JSON.parse(fs.readFileSync(`data/${name}.json`,'utf8'));
function normalize(value){
  if(!value||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(normalize);
  return Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])]));
}
const keys=read('diagnostic-keys');
const collections={...read('curriculum'),...read('practice'),...read('provenance'),...read('resource-reference'),resources:read('resources'),diagnostics:read('diagnostics').map(row=>({...row,answer:keys[row.id]}))};
const manifest=read('integrity');
for(const key of Object.keys(manifest.fieldHashes)){
  if(collections[key]===undefined)throw Error(`Missing collection: ${key}`);
  manifest.fieldHashes[key]=crypto.createHash('sha256').update(JSON.stringify(normalize(collections[key]))).digest('hex');
}
fs.writeFileSync('data/integrity.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Updated collection digests. Review the data and manifest diff, then run npm test. Digests do not establish semantic correctness.');
