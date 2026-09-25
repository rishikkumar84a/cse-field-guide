'use strict';
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='cse-field-guide-progress';
// Compatibility identifiers preserve existing browser records and exported backups.
const PREVIOUS_KEYS=['cse-field-guide-progress-v2','seven-cse-progress-v1'];
const EDITION_ALIASES={v2:'current',checkpoint:'archive-a',gold:'archive-b'};
const statuses={'not-started':'Not started','in-progress':'In progress','completed':'Completed'};
let DATA, variant, U, R, progress={}, storageError='', currentUnit=null, currentTab='overview', lastFocus=null;
const state={edition:'current',view:'first14',year:'FY1',query:'',subject:'',status:'',semester:'',type:'',verification:'',limit:24};
const content=$('#workspace-content');
const safeUrl = value => {try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}};
const unitKey=id=>`${state.edition}:${id}`;
const entry=id=>progress[unitKey(id)]||{status:'not-started',notes:''};
const currentStatus=id=>entry(id).status;
const done=id=>currentStatus(id)==='completed';
const yearLabel=id=>DATA.years.find(y=>y.id===id)?.label || 'All seven years';
const mappedIds = u => [...new Set(u.resources.map(r=>r.id))];
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000)}
function showStorageError(text){storageError=text;$('#storage-warning').textContent=text;$('#storage-warning').classList.remove('hidden')}
function validateEntries(input){
  if(!input || typeof input!=='object' || Array.isArray(input)) throw Error('Invalid progress entries.');
  const valid={}; const variants=Object.fromEntries(DATA.variants.map(v=>[v.id,new Set(v.units.map(u=>u.id))]));
  for(const [k,v] of Object.entries(input)){
    const [savedEdition,id,...rest]=k.split(':');
    const edition=EDITION_ALIASES[savedEdition]||savedEdition;
    if(rest.length || !variants[edition]?.has(id)) throw Error('Backup contains unknown curriculum units.');
    if(!v || !Object.hasOwn(statuses,v.status) || typeof v.notes!=='string' || v.notes.length>10000) throw Error('Backup contains invalid progress or notes.');
    const normalizedKey=`${edition}:${id}`;
    if(Object.hasOwn(valid,normalizedKey))throw Error('Backup contains duplicate unit records.');
    valid[normalizedKey]={status:v.status,notes:v.notes,updated:typeof v.updated==='string'?v.updated:''};
  }return valid;
}
function save(){try{if(storageError)throw Error();localStorage.setItem(KEY,JSON.stringify({schema:2,entries:progress,learning}));return true}catch{showStorageError('Browser storage is unavailable, full, or contains unreadable data. Changes are in memory only. Export a backup before leaving.');return false}}
function load(){try{const raw=localStorage.getItem(KEY)||PREVIOUS_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);if(raw){const p=JSON.parse(raw);if(![1,2].includes(p.schema))throw Error();progress=validateEntries(p.entries);learning=validateLearning(p.learning||{});}else{progress={};learning=validateLearning({});}}catch{showStorageError('Saved progress could not be read. Existing browser data has not been changed. Export your work before repairing storage.')}}
function setEdition(id){
  state.edition=id;variant=DATA.variants.find(v=>v.id===id);U=new Map(variant.units.map(u=>[u.id,u]));R=new Map(variant.resources.map(r=>[r.id,r]));
  state.query='';state.subject='';state.status='';state.semester='';state.type='';state.verification='';state.limit=24;
  $('#edition').value=id;$('#edition-note').textContent=id==='current'?'11,200 planned active hours':'Archived curriculum · progress stays separate';
  if(id!=='current'&&!['curriculum','resources','sources'].includes(state.view))state.view='curriculum';
  render();
}
function render(){renderNav();renderHero();renderPage();renderProgress()}
function renderNav(){
  $$('.primary-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
  $('#year-nav').innerHTML=DATA.years.map((y,i)=>`${i===2?'<div class="year-separator"></div>':''}<button data-year="${y.id}" class="${state.view==='curriculum'&&state.year===y.id?'active':''}"><span class="year-num">${i+1}</span>${esc(y.label)}</button>`).join('');
}
function renderHero(){
  const titles={first14:'Your first fourteen days',diagnostics:'Find your starting point',curriculum:'The seven-year curriculum',graph:'Prerequisite relationships',active:'Your active learning path',resources:'The master resource catalogue',labs:'Laboratory sequences',projects:'Engineering projects',specialization:'Choose one specialization',sources:'About CSE Field Guide'};
  const descriptions={first14:'Set up, diagnose, and begin with evidence.',diagnostics:'Attempt independently. Explain your reasoning before reviewing the key.',curriculum:'Two foundation years, five engineering years, fourteen semesters.',graph:'Inspect hard prerequisites, staged co-requisites, and module gates.',active:'Assigned scopes and a small rotating study queue.',resources:'A reference universe to draw from. Catalogue membership is not an assignment.',labs:'Predict, experiment, record raw evidence, analyze, report, and defend.',projects:'Design, build, test, measure, operate, and maintain.',specialization:'Explore broadly through Engineering Year 3. Choose one primary track for Years 4–5.',sources:'A rigorous seven-year self-directed Computer Science & Engineering education and mastery system.'};
  $('#page-title').textContent=titles[state.view]||'CSE Field Guide';$('#page-description').textContent=descriptions[state.view]||'';
  $('#page-crumb').textContent=titles[state.view]||'Curriculum';
}
function renderProgress(){
  const count=variant.units.filter(u=>done(u.id)).length;
  $('#side-completed').textContent=count;$('#side-total').textContent=` / ${variant.units.length} units complete`;
  $('#side-meter').style.width=`${count/variant.units.length*100}%`;
  const ongoing=variant.units.find(u=>currentStatus(u.id)==='in-progress');
  $('#continue-study').innerHTML=`${ongoing?'Continue studying':count===variant.units.length?'Review curriculum':'Open first unit'} <span>↗</span>`;
  $$('.year-card').forEach(b=>{const us=variant.units.filter(u=>u.year===b.dataset.year);$('.tiny-meter i',b).style.width=`${us.filter(u=>done(u.id)).length/us.length*100}%`});
}
function options(values,current,label){return `<option value="">${esc(label)}</option>`+values.map(v=>`<option value="${esc(v)}" ${current===v?'selected':''}>${esc(v)}</option>`).join('')}
function renderPage(){
  if(renderFeature())return;
  if(state.view==='sources'){renderSources();return}
  if(state.view==='resources'){renderResources();return}
  const year=DATA.years.find(y=>y.id===state.year);
  content.innerHTML=`<div class="section-heading"><h2>The seven-year map</h2><small>2 foundation + 5 engineering · 14 semesters</small></div>
  <div class="phase-labels"><span>01 — FOUNDATION</span><span>02 — ENGINEERING</span></div>
  <div class="year-rail" aria-label="Select a curriculum year">${DATA.years.map((y,i)=>`<button class="year-card ${y.phase==='Foundation'?'foundation':''} ${state.year===y.id?'active':''}" data-year="${y.id}" aria-pressed="${state.year===y.id}" aria-label="${esc(y.label)}"><span class="year-code">${y.id}</span><strong>Year ${i+1}</strong><small>${variant.units.filter(u=>u.year===y.id).length} units</small><div class="tiny-meter"><i></i></div></button>`).join('')}</div>
  <p class="path-hint">Choose a year to explore its subjects. Competence and evidence guide progress.</p>
  <div class="unit-section-head"><div><h2>${year?esc(year.label):'All seven years'} <span style="color:#a9b69b;font-weight:300">/</span> <span style="color:#7e8e72">${year?year.phase==='Foundation'?'Foundation':'Engineering':'Full curriculum'}</span></h2><p>${year?'Two semesters · Preserved source sequence':'All 14 semesters · Search across the full architecture'}</p></div><button class="text-button" id="all-years">${state.year?'Explore all years ↗':'Return to FY1 ↗'}</button></div>
  <div class="filters"><label class="searchbox"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search topics, competencies, resources…" value="${esc(state.query)}" aria-label="Search curriculum"></label><select id="subject-filter" aria-label="Filter by subject">${options([...new Set(variant.units.map(u=>u.subject))].sort(),state.subject,'All subjects')}</select><select id="status-filter" aria-label="Filter by progress">${options(Object.values(statuses),state.status,'All progress')}<option value="Source gaps" ${state.status==='Source gaps'?'selected':''}>Source gaps</option></select><select id="semester-filter" aria-label="Filter by semester">${options(['S1','S2'],state.semester,'Both semesters')}</select></div>
  <div class="result-line"><span id="result-count" aria-live="polite"></span><button class="clear-filters" id="clear-filters">Clear filters</button></div><div id="unit-results"></div>`;
  $('#search').addEventListener('input',e=>{state.query=e.target.value;renderUnitResults()});
  $('#subject-filter').addEventListener('change',e=>{state.subject=e.target.value;renderUnitResults()});
  $('#status-filter').addEventListener('change',e=>{state.status=e.target.value;renderUnitResults()});
  $('#semester-filter').addEventListener('change',e=>{state.semester=e.target.value;renderUnitResults()});
  $('#all-years').onclick=()=>{state.year=state.year?'':'FY1';state.semester='';render()};
  $('#clear-filters').onclick=clearFilters;
  renderUnitResults();
}
function clearFilters(){state.query='';state.subject='';state.status='';state.semester='';state.type='';state.verification='';state.limit=24;renderPage();renderProgress()}
function searchableUnit(u){return [u.id,u.year,u.title,u.subject,u.scope,u.outcome,u.gate,u.prerequisiteText,...mappedIds(u).map(id=>[R.get(id)?.title,R.get(id)?.creator,id].join(' '))].join(' ').toLowerCase()}
function matchesQuery(text){return state.query.toLowerCase().trim().split(/\s+/).every(t=>text.includes(t))}
function filterUnits(){return variant.units.filter(u=>(!state.year||u.year===state.year)&&(!state.subject||u.subject===state.subject)&&(!state.semester||u.semester.endsWith(state.semester))&&(!state.status||(state.status==='Source gaps'?u.prerequisiteKind==='unresolved':statuses[currentStatus(u.id)]===state.status))&&matchesQuery(searchableUnit(u)))}
function renderUnitResults(){
  const units=filterUnits();const base=variant.units.filter(u=>!state.year||u.year===state.year);
  $('#result-count').textContent=`${units.length} of ${base.length} units${state.year?' in '+yearLabel(state.year):''} · ${variant.name}`;
  if(!units.length){$('#unit-results').innerHTML=`<div class="empty"><h3>No units match these filters.</h3><p>${state.year?'Search is limited to '+esc(yearLabel(state.year))+'. Try all years or clear the filters.':'Try a subject, resource title, or unit ID.'}</p><button class="primary-button" id="empty-reset">${state.year?'Search all years':'Clear filters'}</button></div>`;$('#empty-reset').onclick=()=>{if(state.year){state.year='';render()}else clearFilters()};return}
  const groups=[...new Set(units.map(u=>u.semester))];
  $('#unit-results').innerHTML=groups.map(s=>`<div class="semester-label">${esc(s)} <span>·</span> ${s.endsWith('S1')?'FIRST':'SECOND'} SEMESTER</div><div class="unit-grid">${units.filter(u=>u.semester===s).map(unitCard).join('')}</div>`).join('');
}
function unitCard(u){const s=currentStatus(u.id);return `<button class="unit-card" data-unit="${u.id}" aria-label="Open ${esc(u.title)}"><div class="card-top"><span class="subject-badge">${esc(u.subject)}</span><span class="card-id">${u.id}</span></div><h3>${esc(u.title)}</h3><p class="scope">${esc(u.scope)}</p><div class="card-footer"><span><i class="status-dot ${s==='completed'?'complete':s==='in-progress'?'progress':''}"></i>${statuses[s]}</span><span>${mappedIds(u).length} resources ${u.prerequisiteKind==='unresolved'?'· <span title="Prerequisite description is unresolved">Source gap</span>':''}</span><span class="unit-arrow">↗</span></div></button>`}
function renderResources(){
  content.innerHTML=`<div class="section-heading"><h2>The resource library</h2><small>${variant.resources.length} resource records · ${variant.name}</small></div><div class="notice">Verification labels are preserved from the source. A reachable URL does not verify content, price, license, or availability today. Use the Active learning path for assignments.</div>
  <div class="filters"><label class="searchbox"><span aria-hidden="true">⌕</span><input id="resource-search" type="search" aria-label="Search resources" placeholder="Search books, courses, creators, IDs…" value="${esc(state.query)}"></label><select id="resource-type" aria-label="Resource type">${options([...new Set(variant.resources.map(r=>r.type))].sort(),state.type,'All types')}</select><select id="resource-year" aria-label="Resources mapped to year"><option value="">All years & unmapped</option>${DATA.years.map(y=>`<option value="${y.id}" ${y.id===state.year?'selected':''}>${esc(y.label)}</option>`).join('')}</select><select id="resource-verification" aria-label="Verification filter"><option value="">All verification states</option>${verificationOptions()}</select></div><div class="result-line"><span id="resource-count" aria-live="polite"></span><button class="clear-filters" id="clear-resource-filters">Clear filters</button></div><div id="resource-results"></div>`;
  $('#resource-search').oninput=e=>{state.query=e.target.value;state.limit=24;resourceResults()};
  $('#resource-type').onchange=e=>{state.type=e.target.value;state.limit=24;resourceResults()};
  $('#resource-year').onchange=e=>{state.year=e.target.value;state.limit=24;resourceResults()};
  $('#resource-verification').onchange=e=>{state.verification=e.target.value;state.limit=24;resourceResults()};
  $('#clear-resource-filters').onclick=()=>{state.year='';clearFilters()};resourceResults();
}
function uncertain(r){return /NOT VERIFIED|UNCERTAIN|FAIL|BLOCK|ERROR|UNAVAILABLE|UNVERIFIED|404|403/i.test(r.status||'')||!r.status}
function resourceResults(){
  const mapped=state.year?new Set(variant.units.filter(u=>u.year===state.year).flatMap(mappedIds)):null;
  const resources=variant.resources.filter(r=>(!mapped||mapped.has(r.id))&&(!state.type||r.type===state.type)&&(!state.verification||verificationValues(r).includes(state.verification))&&matchesQuery([r.id,r.title,r.creator,r.subject,r.topic,r.institution].join(' ').toLowerCase()));
  $('#resource-count').textContent=`${resources.length} ${resources.length===1?'record':'records'}${state.year?' mapped to '+yearLabel(state.year):' in this catalogue'} · showing ${Math.min(resources.length,state.limit)}`;
  $('#resource-results').innerHTML=resources.length?`<div class="resource-grid">${resources.slice(0,state.limit).map(r=>`<article class="resource-card"><div class="card-top"><span class="subject-badge">${esc(r.type)}</span><span class="card-id">${esc(r.id)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.creator||r.institution||'Creator not recorded')}</p><div class="resource-meta">${esc(r.subject||'Subject not recorded')}<br>${esc(r.status||'Verification not recorded')}</div><div class="resource-actions"><button data-resource="${r.id}">Inspect source record</button>${safeUrl(r.url)?`<a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener noreferrer">Open ↗</a>`:'<span>No source URL</span>'}</div></article>`).join('')}</div>${resources.length>state.limit?'<button class="load-more" id="load-more">Show 24 more resources</button>':''}`:`<div class="empty"><h3>No resources found.</h3><p>Try all years, a broader search, or another resource type.</p></div>`;
  if($('#load-more'))$('#load-more').onclick=()=>{state.limit+=24;resourceResults()};
}
function openUnit(id,tab='overview'){
  if(!U.has(id))return;
  currentUnit=id;currentTab=tab;
  if(!routing)history.replaceState(null,'',routeUrl('unit',id));
  if(!$('#unit-dialog').open)lastFocus=document.activeElement;
  renderUnitDialog();
  if(!$('#unit-dialog').open)$('#unit-dialog').showModal();
  $('#unit-dialog').scrollTop=0;
}
function renderUnitDialog(){const u=U.get(currentUnit);
  $('#unit-content').innerHTML=`<div class="dialog-head"><button class="close-dialog" data-close="unit" aria-label="Close unit details">×</button><div class="dialog-eyebrow">${esc(variant.name)} / ${esc(yearLabel(u.year))} / ${esc(u.semester)}</div><h2 id="unit-title">${esc(u.title)}</h2><div class="tags"><span class="pill">${esc(u.subject)}</span><span class="pill">${u.id}</span><span class="pill">Target ${esc(u.level)}</span>${u.hours?`<span class="pill">${u.hours} planned hours</span>`:''}</div></div><div class="dialog-tabs" role="tablist" aria-label="Unit details"><button role="tab" id="tab-overview" aria-controls="unit-panel" aria-selected="${currentTab==='overview'}" data-tab="overview" class="${currentTab==='overview'?'active':''}">Competencies</button><button role="tab" id="tab-prerequisites" aria-controls="unit-panel" aria-selected="${currentTab==='prerequisites'}" data-tab="prerequisites" class="${currentTab==='prerequisites'?'active':''}">Prerequisites</button><button role="tab" id="tab-resources" aria-controls="unit-panel" aria-selected="${currentTab==='resources'}" data-tab="resources" class="${currentTab==='resources'?'active':''}">Resources <span style="opacity:.6">${mappedIds(u).length}</span></button></div><div class="dialog-body" id="unit-panel" role="tabpanel" aria-labelledby="tab-${currentTab}">${unitPanel(u)}</div>`;
  $$('#unit-content [data-tab]').forEach(b=>b.onclick=()=>{currentTab=b.dataset.tab;renderUnitDialog();$(`#tab-${currentTab}`).focus()});
  const note=$('#evidence-notes');if(note)note.oninput=()=>{const prev=entry(u.id);progress[unitKey(u.id)]={...prev,notes:note.value,updated:new Date().toISOString()};const saved=save();$('#notes-status').textContent=saved?'Saved in this browser':'In memory only — export a backup'};
  const status=$('#unit-status');if(status)status.onchange=()=>{progress[unitKey(u.id)]={...entry(u.id),status:status.value,updated:new Date().toISOString()};save();renderProgress();if(state.view==='curriculum')renderUnitResults();toast('Progress updated for this edition')};
}
function sourceNote(u){return `<details class="provenance"><summary>View source provenance</summary><p>${esc(u.source)}<br>${esc(u.mapSource)}${u.mapId?'<br>Map: '+esc(u.mapId):''}</p><p>${esc(u.notes||'No additional source note.')}</p></details>`}
function unitPanel(u){
  if(currentTab==='prerequisites')return relationPanel(u)+(state.edition==='current'?moduleGatePanel(u.id):'')+sourceNote(u);
  if(currentTab==='resources'){
    const grouped=new Map();for(const r of u.resources){if(!grouped.has(r.id))grouped.set(r.id,[]);grouped.get(r.id).push(r.role)}
    return `<h3>Mapped learning resources</h3><p>Assignments and roles below come from this edition’s unit map. Choose a primary route and use the rest as assigned practice or references.</p>${[...grouped].map(([id,roles])=>{const r=R.get(id);return `<div class="resource-row"><div><div class="roles">${esc(roles.join(' · '))}</div><button data-resource="${id}"><h4>${esc(r?.title||id)}</h4></button><small>${esc(r?.type)} · ${esc(id)} · ${esc(r?.status||'Verification not recorded')}</small></div>${safeUrl(r?.url)?`<a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener noreferrer">Open ↗</a>`:'<small>No source URL</small>'}</div>`}).join('')}<p class="micro">Mapped catalogue references may include alternatives and later study. Use the Active learning path for the assigned scope. Verification flags are preserved source metadata.</p>${sourceNote(u)}`;
  }
  return `<h3>What you’ll work on</h3><div class="topic-list">${(u.scope||u.title).split(/[;,]/).filter(t=>t.trim()).map(t=>`<span>${esc(t.trim())}</span>`).join('')}</div><h3>${u.outcome?'Competency outcome':'Evidence gate'}</h3><div class="competency">${esc(u.outcome||u.gate)}</div>${!u.outcome?'<div class="missing">Separate competency outcomes and planned hours are not recorded in this archived curriculum. The evidence gate above is preserved verbatim.</div>':''}${u.gate?`<h3>Assessment gate</h3><p>${esc(u.gate)}</p>`:''}${state.edition==='current'?activeScope(u):''}<div class="progress-editor"><h3>Your learning record</h3><div class="progress-row"><label for="unit-status" class="sr-only">Unit progress</label><select id="unit-status">${Object.entries(statuses).map(([k,v])=>`<option value="${k}" ${currentStatus(u.id)===k?'selected':''}>${v}</option>`).join('')}</select><small>Self-reported · ${variant.name} · This browser only</small></div><label for="evidence-notes">Evidence & notes</label><textarea id="evidence-notes" maxlength="10000" placeholder="Record a problem set, lab result, project, or explanation that demonstrates your understanding…">${esc(entry(u.id).notes)}</textarea><p class="micro" id="notes-status">${storageError?'Export to keep a backup.':'Notes save automatically in this browser.'} Completing a unit does not automatically complete its prerequisites.</p></div>${sourceNote(u)}`;
}
function ancestors(id,seen=new Set()){for(const p of U.get(id).prerequisites){if(!seen.has(p)){seen.add(p);ancestors(p,seen)}}return seen}
function relationNode(id,current=false){const v=U.get(id);return `<${current?'div':'button'} class="relation-node ${current?'current':''}" ${current?'':`data-unit="${id}" data-relation="true"`}><small>${esc(v.semester)} · ${id}${done(id)?' · Completed':''}</small>${esc(v.title)}</${current?'div':'button'}>`}
function relationPanel(u){
  const deps=variant.units.filter(v=>v.prerequisites.includes(u.id));const all=[...ancestors(u.id)];
  return `<h3>Prerequisites, as recorded</h3><div class="competency">${esc(u.prerequisiteText||'Not recorded')}</div>${u.prerequisiteKind==='unresolved'?'<div class="missing">Unresolved source description. No exact unit relationship is drawn. This does not mean the unit has no prerequisites.</div>':u.prerequisiteKind==='text match'?'<div class="notice">These links match the source’s subject and year/semester text exactly. This archive does not record prerequisite unit IDs. Treat these as navigation matches, not a separately verified dependency specification.</div>':u.prerequisiteKind==='none'?'<p>The source explicitly records no prerequisites for this unit.</p>':'<p>These prerequisite unit IDs are explicitly recorded in this source.</p>'}
  <div class="relation-grid"><div class="relation-column"><h4>Before this unit</h4>${u.prerequisites.length?u.prerequisites.map(id=>relationNode(id)).join(''):`<p>${u.prerequisiteKind==='none'?'None recorded.':'No resolvable links.'}</p>`}</div><div class="relation-column"><h4>Selected unit</h4><div class="relation-arrow" aria-hidden="true">→</div>${relationNode(u.id,true)}</div><div class="relation-column"><h4>Used by</h4>${deps.length?deps.map(v=>relationNode(v.id)).join(''):'<p>No direct dependent units recorded or resolved.</p>'}</div></div>${state.edition==='archive-b'?'<p class="micro">“Used by” only includes resolvable literal matches. Other source descriptions may refer to this material. The graph is incomplete by design.</p>':''}${all.length?`<details class="source-details"><summary>All earlier dependencies · ${all.length}</summary><div class="ancestor-list">${variant.units.filter(v=>all.includes(v.id)).map(v=>`<button data-unit="${v.id}" data-relation="true">${v.id} · ${esc(v.title)}</button>`).join('')}</div></details>`:''}`;
}
function openResource(id){const r=R.get(id);if(!r)return;
  if(!routing)history.replaceState(null,'',routeUrl('resource',id));
  const url=safeUrl(r.url);const mapped=variant.units.filter(u=>u.resources.some(x=>x.id===id));
  const fields=[['Creator',r.creator],['Institution',r.institution],['Subject',r.subject],['Prerequisites',r.prerequisites],['URL / source status',r.status],['Content verification',r.contentStatus],['Access, as recorded',r.access],['License',r.license],['Price verification',r.priceStatus],['Source review date',r.checked]];
  $('#resource-content').innerHTML=`<div class="dialog-head"><button class="close-dialog" data-close="resource" aria-label="Close resource details">×</button><div class="dialog-eyebrow">${esc(variant.name)} / ${esc(r.type)} / ${esc(r.id)}</div><h2 id="resource-title">${esc(r.title)}</h2><p style="font-size:12px;color:#7a896b">${esc(r.creator||r.institution||'Creator not recorded')}</p></div><div class="dialog-body"><h3>Scope and selection</h3><p>${esc(r.topic||'Scope not recorded.')}</p>${r.why?`<div class="competency">${esc(r.why)}</div>`:''}<dl class="metadata">${fields.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v||'Not recorded in this source')}</dd>`).join('')}</dl><p>${esc(r.notes||'')}</p>${resourceExtras(r)}<h3>Mapped curriculum units</h3>${mapped.length?`<div class="ancestor-list">${mapped.map(u=>`<button data-resource-unit="${u.id}">${u.id} · ${esc(u.title)}</button>`).join('')}</div>`:'<div class="missing">No unit assignment exists in the imported unit map. This catalog record is not automatically assigned to a year.</div>'}<p class="micro">Verification is historical source metadata. No fresh link, price, access or content check is implied.</p>${url?`<a class="primary-button resource-open" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open original resource ↗</a><p class="micro" style="overflow-wrap:anywhere">${esc(url)}</p>`:'<div class="missing">No usable HTTP(S) source URL was recorded.</div>'}<div class="provenance">${esc(r.source)}</div></div>`;
  if(!$('#resource-dialog').open)$('#resource-dialog').showModal();$('#resource-dialog').scrollTop=0;
}
function exportProgress(){const blob=new Blob([JSON.stringify({schema:2,app:'cse-field-guide',exportedAt:new Date().toISOString(),entries:progress,learning},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`cse-field-guide-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Progress backup downloaded')}
function changeView(view){navigate(view)}
function chooseYear(year){state.year=year;navigate('curriculum',year)}
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.view)changeView(button.dataset.view);
  if(button.dataset.year)chooseYear(button.dataset.year);
  if(button.dataset.unit)openUnit(button.dataset.unit,button.dataset.relation?'prerequisites':'overview');
  if(button.dataset.resource)openResource(button.dataset.resource);
  if(button.dataset.resourceUnit){$('#resource-dialog').close();openUnit(button.dataset.resourceUnit)}
  if(button.dataset.edition){setEdition(button.dataset.edition);chooseYear('FY1')}
  if(button.dataset.close){$('#'+button.dataset.close+'-dialog').close();if(button.dataset.close==='unit'&&lastFocus?.isConnected)lastFocus.focus()}
  if(button.hasAttribute('data-export'))exportProgress();
  if(button.hasAttribute('data-import'))$('#backup-file').click();
});
// Keep a dismissed detail URL from reopening the dialog on refresh.
for(const kind of ['unit','resource'])$('#'+kind+'-dialog').addEventListener('close',()=>{
  if(!routing&&!$('dialog[open]')&&(location.pathname.startsWith('/'+kind+'/')||location.hash.startsWith('#/'+kind+'/'))){
    const arg=state.view==='curriculum'?state.year:'';
    history.replaceState(null,'',routeUrl(state.view,arg));
  }
});
$('#edition').onchange=e=>{setEdition(e.target.value);navigate(state.view)};
$('#source-info').onclick=()=>changeView('sources');
$('.skip').onclick=e=>{e.preventDefault();$('#main').focus();$('#main').scrollIntoView()};
$('.brand').onclick=e=>{e.preventDefault();setEdition('current');navigate('first14')};
$('#continue-study').onclick=()=>{const u=variant.units.find(u=>currentStatus(u.id)==='in-progress')||variant.units.find(u=>!done(u.id))||variant.units[0];openUnit(u.id)};
$('#export-progress').onclick=exportProgress;
$('#import-progress').onclick=()=>$('#backup-file').click();
$('#backup-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Backup is too large.');const p=JSON.parse(await file.text());if(!([1,2].includes(p.schema)&&['seven-cse-explorer','cse-field-guide'].includes(p.app)))throw Error('This is not a CSE Field Guide backup.');const imported=validateEntries(p.entries);const importedLearning=validateLearning(p.learning||{});progress={...progress,...imported};learning=mergeLearning(learning,importedLearning);const saved=save();render();toast(`${Object.keys(imported).length} unit records imported${saved?'':' into memory; export before leaving'}.`)}catch(err){toast(`Import stopped: ${err.message}`)}finally{e.target.value=''}};
document.addEventListener('keydown',e=>{if(e.target.matches('[role="tab"]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const tabs=['overview','prerequisites','resources'];currentTab=tabs[(tabs.indexOf(currentTab)+(e.key==='ArrowRight'?1:2))%3];renderUnitDialog();$(`#tab-${currentTab}`).focus()}});
window.addEventListener('storage',e=>{if(e.key===KEY){load();render();if($('#unit-dialog').open)renderUnitDialog()}});
async function init(){try{await loadCanonical();load();setEdition('current');applyRoute()}catch(err){content.innerHTML=`<div class="empty"><h3>The curriculum could not be loaded.</h3><p>${esc(err.message)} Refresh to try again.</p></div>`}}
window.addEventListener('DOMContentLoaded',init,{once:true});
