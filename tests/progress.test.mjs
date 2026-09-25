import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the actual application validators and import handler. This small DOM
// adapter supplies events only; browser rendering is checked separately.
async function app(saved={}) {
  const elements=new Map(),storage=new Map(Object.entries(saved));
  const element=selector=>{
    if(!elements.has(selector))elements.set(selector,{textContent:'',classList:{add(){},remove(){},toggle(){}},style:{},files:[],value:'',addEventListener(){}});
    return elements.get(selector);
  };
  const context=vm.createContext({
    URL,URLSearchParams,console,setTimeout:()=>0,clearTimeout(){},
    document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){}},
    window:{addEventListener(){}},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url.replace(/^\//,''),'utf8'))})
  });
  for(const f of ['app.js','features.js'])vm.runInContext(fs.readFileSync(`web/${f}`,'utf8'),context);
  await vm.runInContext('loadCanonical()',context);
  vm.runInContext('render=()=>{};load()',context);
  const run=code=>vm.runInContext(code,context);
  const state=()=>JSON.parse(run('JSON.stringify({progress,learning,storageError})'));
  const importBackup=async backup=>{
    const raw=typeof backup==='string'?backup:JSON.stringify(backup);
    await element('#backup-file').onchange({target:{files:[{size:raw.length,text:async()=>raw}],value:'backup.json'}});
    return element('#toast').textContent;
  };
  return {run,state,storage,importBackup};
}
test('legacy progress survives rebrand without granting current curriculum mastery',async()=>{
  const saved={schema:1,entries:{'gold:UNIT-0001':{status:'completed',notes:'Prior evidence'},'checkpoint:U001':{status:'in-progress',notes:'Earlier evidence'}}};
  const a=await app({'seven-cse-progress-v1':JSON.stringify(saved)});
  assert.deepEqual(a.state().progress['archive-b:UNIT-0001'],{status:'completed',notes:'Prior evidence',updated:''});
  assert.equal(a.run('currentStatus("U001")'),'not-started');
  a.run('save()');
  assert.ok(a.storage.has('cse-field-guide-progress'));
  assert.equal(a.storage.get('seven-cse-progress-v1'),JSON.stringify(saved));
});
test('valid backup imports units, activities, First14, diagnostics and one track',async()=>{
  const a=await app();
  const backup={schema:2,app:'cse-field-guide',entries:{'v2:U001':{status:'completed',notes:'<script>literal notes</script>'}},learning:{first14:{1:{status:'in-progress',notes:'Method'}},diagnostics:{'DIAG-01':{answer:'17/12',submitted:true,classification:'PARTIAL',evidence:'Delayed retest needed'}},activities:{'LAB-0001':{status:'in-progress',notes:'Measured results'}},track:'TRACK-01'}};
  assert.match(await a.importBackup(backup),/1 unit records imported/);
  assert.equal(a.state().learning.track,'TRACK-01');
  assert.equal(a.state().learning.diagnostics['DIAG-01'].classification,'PARTIAL');
  const reloaded=await app(Object.fromEntries(a.storage));
  assert.deepEqual(reloaded.state(),a.state());
  assert.match(a.run('esc(progress["current:U001"].notes)'),/&lt;script&gt;/);
});
test('invalid imports are rejected atomically without replacing existing progress',async()=>{
  const a=await app();
  await a.importBackup({schema:1,app:'seven-cse-explorer',entries:{'checkpoint:U001':{status:'completed',notes:'Keep'}}});
  const before=a.state(),stored=a.storage.get('cse-field-guide-progress');
  const invalid=[
    '{broken json',
    {schema:99,app:'cse-field-guide',entries:{}},
    {schema:2,app:'cse-field-guide',entries:{'v2:U076':{status:'completed',notes:''}}},
    {schema:2,app:'cse-field-guide',entries:{'v2:U001':{status:'completed',notes:''}},learning:{track:'TRACK-99'}},
    {schema:2,app:'cse-field-guide',entries:{},learning:{diagnostics:{'DIAG-29':{answer:'x'}}}},
    {schema:2,app:'cse-field-guide',entries:{},learning:{first14:{15:{status:'completed',notes:''}}}},
    {schema:2,app:'cse-field-guide',entries:{},learning:{activities:{'LAB-0001':{status:'certified',notes:''}}}},
    {schema:2,app:'cse-field-guide',entries:{'v2:U001':{status:'completed',notes:'x'.repeat(10001)}}}
  ];
  for(const backup of invalid){assert.match(await a.importBackup(backup),/Import stopped/);assert.deepEqual(a.state(),before);assert.equal(a.storage.get('cse-field-guide-progress'),stored);}
});
test('unreadable saved data is protected from automatic overwrites',async()=>{
  const a=await app({'cse-field-guide-progress':'{broken'});
  assert.match(a.state().storageError,/could not be read/);
  assert.equal(a.run('save()'),false);
  assert.equal(a.storage.get('cse-field-guide-progress'),'{broken');
});

test('earlier current-curriculum records retain evidence under the current identifier',async()=>{
  const saved={schema:2,entries:{'v2:U001':{status:'completed',notes:'Measured evidence'}},learning:{}};
  const a=await app({'cse-field-guide-progress-v2':JSON.stringify(saved)});
  assert.equal(a.run('currentStatus("U001")'),'completed');
  assert.equal(a.state().progress['current:U001'].notes,'Measured evidence');
  const before=a.state();
  assert.match(await a.importBackup({schema:2,app:'cse-field-guide',entries:{'current:U001':{status:'completed',notes:'One'},'v2:U001':{status:'in-progress',notes:'Two'}}}),/Import stopped/);
  assert.deepEqual(a.state(),before);
});
