'use strict';
// Learning views share the cards, dialogs, navigation and styles.
let C, PRACTICE, DIAGNOSTICS, MANIFEST, provenanceData=null, diagnosticKeys=null;
let learning={first14:{},diagnostics:{},activities:{},track:''}, routing=false;
let selectedDiagnostic='DIAG-01', selectedGraph='U029', selectedSemester='0A-S1';
const classifications=['MASTERED','PARTIAL','WEAK','MISSING'];
const viewIds=['first14','diagnostics','curriculum','graph','active','resources','labs','projects','specialization','sources'];
const resourceIdPattern=/\b[A-Z]+-\d{4}\b/g;
const yearId=y=>({'0A':'FY1','0B':'FY2','1':'EY1','2':'EY2','3':'EY3','4':'EY4','5':'EY5'}[y]);
async function readData(name){const res=await fetch(`/data/${name}.json`);if(!res.ok)throw Error(`Missing data: ${name}`);return res.json()}
async function loadCanonical(){
  const [curriculum,resources,practice,diagnostics,manifest,legacy]=await Promise.all(['curriculum','resources','practice','diagnostics','integrity','curriculum-archives'].map(readData));
  C=curriculum;PRACTICE=practice;DIAGNOSTICS=diagnostics;MANIFEST=manifest;
  const active=new Map(C.active_unit_view.map(a=>[a.unit_id,a]));
  const units=C.units.map(u=>({...u,raw:u,title:u.subject,subject:u.domain,originalYear:u.year,originalSemester:u.semester,year:yearId(u.year),semester:yearId(u.year)+'-'+u.semester.split('-').at(-1),level:`L${u.target}`,gate:active.get(u.id)?.assessment,resources:C.maps.filter(m=>m.unit_id===u.id).map(m=>({id:m.resource_id,role:m.role,scope:m.scope})),prerequisiteText:u.prerequisites.join(', ')||'None',prerequisiteKind:u.prerequisites.length?'explicit IDs':'none',source:`${MANIFEST.sourceVersion} · units · ${u.id}`,mapSource:`Curriculum mappings and active scopes · ${u.id}`}));
  const canonical={id:'current',name:'Current curriculum',label:'75-unit curriculum',units,resources:resources.map(r=>({...r,url:r.direct_url||r.canonical_url||r.official_url,checked:r.last_checked,contentStatus:r.bibliography_status||r.full_text_status,priceStatus:r.cost_status,source:`${r.source_release||MANIFEST.sourceVersion} · ${r.source_sheet||'resources'} · ${r.source_row||r.id}`})),active:C.active,notes:'Complete 75-unit system. All source hours, units, prerequisites and resource records are preserved.'};
  DATA={schema:2,years:legacy.years,variants:[canonical,...legacy.variants],manifest:[MANIFEST],limitations:C.gaps.map(g=>g.join(' — '))};
}
function validateLearning(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid learning record.');
  const result={first14:{},diagnostics:{},activities:{},track:''};
  const text=(v,max=10000)=>{if(v!==undefined&&(typeof v!=='string'||v.length>max))throw Error('Invalid learning notes.');return v||''};
  for(const kind of ['first14','diagnostics','activities']){
    const rows=value[kind]||{};if(typeof rows!=='object'||Array.isArray(rows))throw Error('Invalid learning entries.');
    for(const [id,row] of Object.entries(rows)){
      const known=kind==='first14'?C.first14.some(d=>String(d.day)===id):kind==='diagnostics'?DIAGNOSTICS.some(d=>d.id===id):[...PRACTICE.labs,...PRACTICE.projects].some(a=>a.id===id);
      if(!known||!row||typeof row!=='object'||Array.isArray(row))throw Error('Unknown learning item.');
      if(kind==='diagnostics'){
        if(row.classification&&!classifications.includes(row.classification))throw Error('Invalid diagnostic classification.');
        if(row.submitted!==undefined&&typeof row.submitted!=='boolean')throw Error('Invalid diagnostic attempt.');
        result[kind][id]={answer:text(row.answer),submitted:row.submitted===true,classification:row.classification||'',evidence:text(row.evidence)};
      }else{
        if(!Object.hasOwn(statuses,row.status))throw Error('Invalid activity status.');
        result[kind][id]={status:row.status,notes:text(row.notes)};
      }
    }
  }
  if(value.track){if(!C.tracks.some(t=>t.id===value.track))throw Error('Unknown specialization.');result.track=value.track;}
  return result;
}
function mergeLearning(a,b){return {first14:{...a.first14,...b.first14},diagnostics:{...a.diagnostics,...b.diagnostics},activities:{...a.activities,...b.activities},track:b.track||a.track}}
function routeUrl(view,arg=''){
  const page=view==='sources'?'about':view;
  return `/${page}${arg?'/'+encodeURIComponent(arg):''}${state.edition==='current'?'':'?edition='+state.edition}`;
}
function navigate(view,arg=''){
  history.pushState(null,'',routeUrl(view,arg));applyRoute();
}
function applyRoute(){
  if(!DATA)return;routing=true;
  try{
    const route=location.hash.startsWith('#/')?location.hash.slice(2):location.pathname.replace(/^\//,'')+location.search;
    const [path,search='']=route.split('?');const [page,arg,...extra]=path.replace(/\/$/,'').split('/').map(s=>decodeURIComponent(s));
    if(extra.length){showRouteMissing();return;}
    const requested=page==='about'?'sources':page;
    const savedEdition=new URLSearchParams(search).get('edition')||'current';
    const edition=EDITION_ALIASES[savedEdition]||savedEdition;
    if(!DATA.variants.some(v=>v.id===edition)){showRouteMissing();return;}
    if(arg&&!['unit','resource','curriculum','graph','active'].includes(requested)){showRouteMissing();return;}
    if(DATA.variants.some(v=>v.id===edition)&&edition!==state.edition)setEdition(edition);
    for(const d of $$('dialog[open]'))d.close();
    if(requested==='unit'){
      if(!U.has(arg)){showRouteMissing();return;}
      state.year=U.get(arg).year;state.view='curriculum';render();openUnit(arg);return;
    }
    if(requested==='resource'){
      if(!R.has(arg)){showRouteMissing();return;}
      state.view='resources';state.year='';render();openResource(arg);return;
    }
    if(requested&&!viewIds.includes(requested)){showRouteMissing();return;}
    state.view=requested||'first14';
    if(state.edition!=='current'&&!['curriculum','resources','sources'].includes(state.view))state.view='curriculum';
    state.query='';state.subject='';state.status='';state.semester='';state.type='';state.verification='';state.limit=24;
    if(state.view==='curriculum'&&arg){if(!DATA.years.some(y=>y.id===arg)){showRouteMissing();return;}state.year=arg;}
    if(state.view==='resources')state.year='';
    if(state.view==='graph'&&arg){if(!U.has(arg)){showRouteMissing();return;}selectedGraph=arg;}
    if(state.view==='active'&&arg){if(!C.active.some(a=>a.semester===arg)){showRouteMissing();return;}selectedSemester=arg;}
    render();
  }catch{showRouteMissing()}finally{routing=false}
}
function showRouteMissing(){content.innerHTML='<div class="empty"><h2>This curriculum route does not exist.</h2><button class="primary-button" data-view="first14">Return to First14</button></div>'}
window.addEventListener('hashchange',applyRoute);
window.addEventListener('popstate',applyRoute);
function verificationValues(r){return typeof r.status==='string'&&r.status?[r.status]:[]}
function verificationOptions(){return [...new Set(variant.resources.flatMap(verificationValues))].sort().map(v=>`<option value="${esc(v)}" ${state.verification===v?'selected':''}>${esc(v)}</option>`).join('')}
function linkRefs(value){
  const text=Array.isArray(value)?value.join('; '):typeof value==='object'&&value?JSON.stringify(value):String(value??'');
  return text.split(/(https?:\/\/[^\s<>"']+|\b(?:[A-Z]+-\d{4}|U\d{3})\b)/g).map(part=>{
    if(/^https?:\/\//.test(part)&&safeUrl(part))return `<a href="${esc(safeUrl(part))}" target="_blank" rel="noopener noreferrer">${esc(part)}</a>`;
    return R?.has(part)?`<button class="inline-link" data-resource="${part}">${part}</button>`:U?.has(part)?`<button class="inline-link" data-unit="${part}">${part}</button>`:esc(part);
  }).join('');
}
function detailFields(fields){return `<dl class="metadata">${fields.filter(([,v])=>v!==undefined&&v!==null&&v!==''&&(!Array.isArray(v)||v.length)).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${linkRefs(v)}</dd>`).join('')}</dl>`}
function renderFeature(){
  const features={first14:renderFirst14,diagnostics:renderDiagnostics,active:renderActive,labs:()=>renderActivities('labs'),projects:()=>renderActivities('projects'),specialization:renderSpecialization,graph:renderGraph};
  if(features[state.view]){features[state.view]();return true;}return false;
}
function renderFirst14(){
  content.innerHTML=`<nav class="entry-route" aria-label="Recommended starting route"><strong>First14</strong><span>→</span><button data-view="diagnostics">Diagnostics</button><span>→</span><button data-year="FY1">Foundation</button><span>→</span><button data-unit="U001">U001–U004</button></nav>
  <p>Use these fourteen sessions to establish your starting point. Skip only demonstrated mastery; repair gaps before dependent work.</p>
  <div class="first14-grid">${C.first14.map(d=>{const saved=learning.first14[d.day]||{status:'not-started',notes:''};return `<article class="source-panel"><div class="card-top"><span class="subject-badge">Day ${d.day}</span><small>${d.minutes} minutes</small></div><h3>${esc(d.title)}</h3><p>${linkRefs(d.tasks)}</p><p><strong>Evidence:</strong> ${esc(d.evidence)}</p><label for="day-${d.day}">Learning record</label><select id="day-${d.day}" data-day="${d.day}">${optionsForStatus(saved.status)}</select><label for="day-note-${d.day}">Evidence notes</label><textarea id="day-note-${d.day}" data-day-notes="${d.day}" maxlength="10000">${esc(saved.notes)}</textarea></article>`}).join('')}</div><div class="action-row"><button class="primary-button" data-view="diagnostics">Open Diagnostics →</button><button data-year="FY1">Explore Foundation Year 1</button></div>`;
  $$('[data-day]').forEach(el=>el.onchange=()=>{learning.first14[el.dataset.day]={...(learning.first14[el.dataset.day]||{notes:''}),status:el.value};save();toast('Day record saved')});
  $$('[data-day-notes]').forEach(el=>el.oninput=()=>{learning.first14[el.dataset.dayNotes]={...(learning.first14[el.dataset.dayNotes]||{status:'not-started'}),notes:el.value};save()});
}
function optionsForStatus(current){return Object.entries(statuses).map(([k,v])=>`<option value="${k}" ${k===current?'selected':''}>${v}</option>`).join('')}
function renderDiagnostics(){
  const item=DIAGNOSTICS.find(d=>d.id===selectedDiagnostic)||DIAGNOSTICS[0];selectedDiagnostic=item.id;
  const attempt=learning.diagnostics[item.id]||{answer:'',submitted:false,classification:'',evidence:''};
  content.innerHTML=`<div class="notice">Work without hints or AI assistance. Record your method. Review the key after submitting, then classify the skill as MASTERED, PARTIAL, WEAK, or MISSING. Classification does not complete a unit.</div><div class="diagnostic-layout"><nav class="diagnostic-nav" aria-label="Diagnostic questions">${DIAGNOSTICS.map(d=>`<button data-diag="${d.id}" aria-current="${d.id===item.id?'step':'false'}">${d.id}<small>${esc(d.topic)}${learning.diagnostics[d.id]?.submitted?' · Attempt saved':''}</small></button>`).join('')}</nav><section class="source-panel diagnostic-question"><div class="eyebrow">${item.id}</div><h2>${esc(item.topic)}</h2><p class="diagnostic-prompt">${esc(item.question)}</p><form id="diagnostic-form"><label for="diagnostic-answer">Your answer and reasoning</label><textarea id="diagnostic-answer" maxlength="10000" required ${attempt.submitted?'readonly':''}>${esc(attempt.answer)}</textarea>${attempt.submitted?'':'<button class="primary-button" type="submit">Submit attempt & review key</button>'}</form>${attempt.submitted?`<section class="review-key"><h3>Review your submitted attempt</h3>${diagnosticKeys?`<p>${esc(diagnosticKeys[item.id])}</p>`:'<button id="load-review" class="text-button">Open answer key for this submitted attempt</button>'}<label for="diagnostic-class">Evidence-based classification</label><select id="diagnostic-class"><option value="">Not assessed</option>${classifications.map(c=>`<option ${attempt.classification===c?'selected':''}>${c}</option>`).join('')}</select><label for="diagnostic-evidence">Correction, explanation, and delayed-test evidence</label><textarea id="diagnostic-evidence" maxlength="10000">${esc(attempt.evidence)}</textarea></section>`:'<p class="micro">Answer review becomes available after you submit this attempt.</p>'}<p>Repair route: <button class="inline-link" data-unit="${item.repair_unit}">${item.repair_unit} · ${esc(U.get(item.repair_unit)?.title)}</button></p><div class="action-row"><button id="next-diagnostic">Next diagnostic →</button><button data-year="FY1">Continue to Foundation</button></div></section></div>`;
  $$('[data-diag]').forEach(b=>b.onclick=()=>{selectedDiagnostic=b.dataset.diag;renderDiagnostics()});
  $('#diagnostic-answer').oninput=e=>{learning.diagnostics[item.id]={...attempt,answer:e.target.value};save()};
  $('#diagnostic-form').onsubmit=async e=>{e.preventDefault();const answer=$('#diagnostic-answer').value.trim();if(!answer)return;learning.diagnostics[item.id]={...attempt,answer,submitted:true};save();try{diagnosticKeys=await readData('diagnostic-keys')}catch{toast('Attempt saved. The review key could not be loaded.')}renderDiagnostics()};
  if($('#load-review'))$('#load-review').onclick=async()=>{try{diagnosticKeys=await readData('diagnostic-keys');renderDiagnostics()}catch{toast('The answer key could not be loaded. Try again.')}};
  if($('#diagnostic-class'))$('#diagnostic-class').onchange=e=>{learning.diagnostics[item.id].classification=e.target.value;save()};
  if($('#diagnostic-evidence'))$('#diagnostic-evidence').oninput=e=>{learning.diagnostics[item.id].evidence=e.target.value;save()};
  $('#next-diagnostic').onclick=()=>{selectedDiagnostic=DIAGNOSTICS[(DIAGNOSTICS.indexOf(item)+1)%DIAGNOSTICS.length].id;renderDiagnostics()};
}
function activeScope(u){const a=C.active_unit_view.find(a=>a.unit_id===u.id);if(!a)return '';
  return `<h3>Assigned active scope</h3>${detailFields([['Primary resource',a.primary_resource],['Exact chapters',a.exact_chapters],['Primary course',a.primary_course],['Exact lectures',a.exact_lectures],['Practice',a.practice],['Labs',a.lab],['Projects',a.project],['Not yet',a.not_yet]])}<button class="text-button" data-active-unit="${u.id}">Open this semester’s active path →</button>`;
}
function renderActive(){
  const a=C.active.find(a=>a.semester===selectedSemester)||C.active[0];selectedSemester=a.semester;
  content.innerHTML=`<div class="section-heading"><h2>${esc(a.semester)} · ${esc(a.goal)}</h2></div><label for="active-semester">Semester</label><select id="active-semester">${C.active.map(s=>`<option value="${s.semester}" ${s.semester===a.semester?'selected':''}>${yearLabel(yearId(s.year))} · ${s.semester}</option>`).join('')}</select><div class="notice">${esc(a.queue_rule)}</div><p>${a.hours} planned hours. Labs and projects use their parent-unit allocation; do not add the same hours again.</p><div class="queue-grid">${[['NOW',a.now],['NEXT',a.next],['REFERENCE',a.reference],['OPTIONAL',a.optional],['LATER',a.later],['ARCHIVE',a.archive]].map(([k,v])=>`<section class="source-panel"><h3>${k}</h3>${Array.isArray(v)?v.length?`<ul>${v.map(id=>`<li><button class="inline-link" data-resource="${id}">${id} · ${esc(R.get(id)?.title||id)}</button></li>`).join('')}</ul>`:'<p>No separate assignment recorded.</p>':`<p>${linkRefs(v)}</p>`}</section>`).join('')}</div><h2>Unit scopes</h2>${a.unit_ids.map(id=>{const u=U.get(id),r=C.active_unit_view.find(x=>x.unit_id===id);return `<details class="source-details"><summary>${id} · ${esc(u.title)} · ${u.hours} hours</summary>${detailFields(Object.entries(r).filter(([k])=>!['unit_id','year','semester'].includes(k)).map(([k,v])=>[k.replaceAll('_',' '),v]))}<button class="primary-button" data-unit="${id}">Open unit</button></details>`}).join('')}${detailFields([['Assessment',a.assessment],['Mastery gate',a.gate]])}`;
  $('#active-semester').onchange=e=>navigate('active',e.target.value);
}
function moduleGatePanel(id){
  const co=C.dependencies.filter(d=>d.after===id&&d.kind==='STAGED CO-REQUISITE');const gates=C.module_gates.filter(g=>g.unit===id);
  return `${co.length?`<h3>Staged co-requisites</h3>${co.map(d=>`<div class="gate-note"><strong>${linkRefs(d.before)}</strong><p>${esc(d.reason)}</p></div>`).join('')}`:''}${gates.length?`<h3>Same-semester module gates</h3>${gates.map(g=>`<div class="gate-note"><strong>${linkRefs(g.requires)}</strong><p>${esc(g.when)}</p><p><strong>Required evidence:</strong> ${esc(g.evidence)}</p></div>`).join('')}`:''}`;
}
function normalizedEdges(){return C.dependencies.flatMap(d=>(d.before.match(/\bU\d{3}\b/g)||[]).map(from=>({from,to:d.after,kind:d.kind,reason:d.reason})));}
function renderGraph(){
  const u=U.get(selectedGraph)||variant.units[0];selectedGraph=u.id;
  const edges=normalizedEdges();const related=edges.filter(e=>e.from===u.id||e.to===u.id);
  const nodes=new Set([u.id,...related.flatMap(e=>[e.from,e.to])]);
  const semesters=[...new Set(C.units.map(u=>u.semester))];const positions=new Map();
  const width=1230,rowHeight=144;
  C.units.forEach(u=>{const row=semesters.indexOf(u.semester);const siblings=C.units.filter(v=>v.semester===u.semester);const col=siblings.indexOf(u);positions.set(u.id,{x:95+col*158,y:48+row*rowHeight});});
  content.innerHTML=`<label for="graph-unit">Inspect a unit’s relationships</label><select id="graph-unit">${variant.units.map(v=>`<option value="${v.id}" ${v.id===u.id?'selected':''}>${v.id} · ${esc(v.title)}</option>`).join('')}</select><p>Solid: hard prerequisite. Dashed: staged co-requisite. Dotted: module gate. The map highlights direct relationships for the selected unit; all 75 units remain navigable.</p>${moduleGatePanel(u.id)}<div class="graph-scroll" tabindex="0" role="region" aria-label="Scrollable prerequisite map"><svg class="prerequisite-map" viewBox="0 0 ${width} ${semesters.length*rowHeight+25}" role="img" aria-label="75-unit prerequisite map; selected ${esc(u.id)}"><defs><marker id="edge-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#13878a"/></marker></defs>${semesters.map((s,i)=>`<text x="8" y="${64+i*rowHeight}" class="graph-semester">${s}</text><line x1="90" y1="${132+i*rowHeight}" x2="1218" y2="${132+i*rowHeight}" stroke="#dce5eb"/>`).join('')}${related.map(e=>{const a=positions.get(e.from),b=positions.get(e.to);return `<path d="M${a.x+65},${a.y+66} C${a.x+65},${a.y+101} ${b.x+65},${b.y-35} ${b.x+65},${b.y}" fill="none" stroke="#13878a" stroke-width="2.5" ${e.kind.startsWith('STAGED')?'stroke-dasharray="8 5"':e.kind.startsWith('MODULE')?'stroke-dasharray="2 5"':''} marker-end="url(#edge-arrow)"><title>${esc(e.from+' → '+e.to+' · '+e.kind+' · '+e.reason)}</title></path>`}).join('')}${C.units.map(v=>{const p=positions.get(v.id);const words=v.subject.split(' '),lines=[];for(const word of words){if(!lines.length||lines.at(-1).length+word.length>18)lines.push(word);else lines[lines.length-1]+=' '+word;}return `<a href="/graph/${v.id}" aria-label="Inspect ${v.id} ${esc(v.subject)}"><rect x="${p.x}" y="${p.y}" width="137" height="68" rx="6" fill="${v.id===u.id?'#082c42':nodes.has(v.id)?'#d6f3f1':'#ffffff'}" stroke="${nodes.has(v.id)?'#13878a':'#c5d3df'}"/><text x="${p.x+8}" y="${p.y+17}" fill="${v.id===u.id?'#fff':'#082c42'}" font-size="13" font-weight="700">${v.id}</text>${lines.slice(0,3).map((line,i)=>`<text x="${p.x+8}" y="${p.y+32+i*13}" fill="${v.id===u.id?'#fff':'#082c42'}" font-size="12">${esc(line)}</text>`).join('')}<title>${esc(v.subject)}</title></a>`}).join('')}</svg></div><section class="source-details"><h2>${u.id} · ${esc(u.title)}</h2><button class="primary-button" data-unit="${u.id}">Open unit details</button><ul>${related.map(e=>`<li>${linkRefs(e.from)} → ${linkRefs(e.to)} · <strong>${esc(e.kind)}</strong><br>${esc(e.reason)}</li>`).join('')}</ul></section>`;
  $('#graph-unit').onchange=e=>navigate('graph',e.target.value);
}
function renderActivities(kind){
  const rows=PRACTICE[kind];
  content.innerHTML=`<div class="section-heading"><h2>${rows.length} ${kind==='labs'?'required laboratory sequences':'project contracts'}</h2></div><div class="notice">${kind==='labs'?'Physical, simulated, virtual, remote, and software evidence stay distinct. Simulation alone does not demonstrate physical competence.':'Each project includes requirements, architecture, testing, security, operation, maintenance, and evidence.'} Hours are included in the assigned units.</div><div class="filters"><label class="searchbox"><input id="activity-search" type="search" placeholder="Search title, ID, unit, or mode" aria-label="Search activities"></label><select id="activity-year" aria-label="Activity year"><option value="">All years</option>${DATA.years.map(y=>`<option value="${y.id}">${y.label}</option>`).join('')}</select>${kind==='labs'?`<select id="activity-mode" aria-label="Lab mode">${options([...new Set(rows.map(l=>l.mode))],'','All modes')}</select>`:''}</div><div id="activity-results"></div>`;
  const results=()=>{
    const q=$('#activity-search').value.toLowerCase(),y=$('#activity-year').value,m=$('#activity-mode')?.value;
    const selected=rows.filter(a=>(!y||yearId(a.year)===y)&&(!m||a.mode===m)&&JSON.stringify([a.id,a.title,a.unit,a.unit_ids,a.mode,a.topic]).toLowerCase().includes(q));
    $('#activity-results').innerHTML=`<p>${selected.length} of ${rows.length} ${kind}</p><div class="unit-grid">${selected.map(a=>`<button class="unit-card" data-activity="${a.id}"><div class="card-top"><span class="subject-badge">${esc(a.mode||'PROJECT')}</span><span>${a.id}</span></div><h3>${esc(a.title)}</h3><p>${esc(a.experiment||a.engineering_problem)}</p><div class="card-footer">${a.hours} included hours · ${statuses[learning.activities[a.id]?.status||'not-started']}</div></button>`).join('')}</div>`;
  };
  $('#activity-search').oninput=results;$('#activity-year').onchange=results;if($('#activity-mode'))$('#activity-mode').onchange=results;results();
}
function openActivity(id){
  const a=[...PRACTICE.labs,...PRACTICE.projects].find(a=>a.id===id);if(!a)return;const rec=learning.activities[id]||{status:'not-started',notes:''};
  const fields=a.type==='LAB'?['unit','mode','hours','objective','theory','equipment','software','setup','safety','experiment','measurements','expected_result','analysis','report','assessment','extension','resource_ids','time_accounting','execution_status','verification_note']:['unit_ids','allocations','hours','objective','engineering_problem','requirements','constraints','architecture','technologies','theory','alternatives','implementation','tests','benchmark','security','documentation','operations','maintenance','extension','portfolio_value','research_potential','resource_ids','time_accounting','execution_status','verification_note'];
  $('#activity-content').innerHTML=`<div class="dialog-head"><button data-close="activity" class="close-dialog" aria-label="Close activity details">×</button><div class="eyebrow">${id} · ${esc(a.mode||a.type)}</div><h2 id="activity-title">${esc(a.title)}</h2></div><div class="dialog-body">${detailFields(fields.map(k=>[k.replaceAll('_',' '),a[k]]))}<div class="progress-editor"><label for="activity-status">Your learning record</label><select id="activity-status">${optionsForStatus(rec.status)}</select><label for="activity-notes">Raw evidence, analysis, debugging, report, and defense</label><textarea id="activity-notes" maxlength="10000">${esc(rec.notes)}</textarea><p>Self-reported progress. The source does not certify execution or mastery.</p></div><details class="provenance"><summary>Preserved source contract</summary><pre>${esc(JSON.stringify(a,null,2))}</pre></details></div>`;
  $('#activity-status').onchange=e=>{learning.activities[id]={...rec,...learning.activities[id],status:e.target.value};save();if(['labs','projects'].includes(state.view))renderActivities(state.view)};
  $('#activity-notes').oninput=e=>{learning.activities[id]={...rec,...learning.activities[id],notes:e.target.value};save()};
  $('#activity-dialog').showModal();
}
function renderSpecialization(){
  content.innerHTML=`<div class="notice">Select one primary specialization from the sixteen supplied track options. U060 → U063 → U068 share a 720-hour specialist instruction budget; project and research hours remain in their existing units.</div><label for="selected-track">Your primary specialization</label><select id="selected-track"><option value="">Not selected yet</option>${C.tracks.map(t=>`<option value="${t.id}" ${learning.track===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select><div class="source-grid">${C.track_routes.map(t=>`<article class="source-panel ${learning.track===t.track_id?'active':''}"><div class="eyebrow">${esc(t.track_id)}</div><h3>${esc(t.track)}</h3>${detailFields([['Stage',t.stage],['Prerequisites',t.prerequisites],['Primary book',t.primary_book],['Secondary book',t.secondary_book],['Book scope',t.book_scope],['Course',t.course],['Course scope',t.course_scope],['GitHub',t.github],['Papers',t.papers],['Investigation question',t.question],['Hours',t.hours],['Not yet',t.not_yet]])}<details class="provenance"><summary>Track contract & literature map</summary>${detailFields(Object.entries(C.tracks.find(x=>x.id===t.track_id)||{}).map(([k,v])=>[k.replaceAll('_',' '),v]))}<pre>${esc(JSON.stringify(C.literature_map.find(x=>x.subject===t.track)||{},null,2))}</pre></details></article>`).join('')}</div>`;
  $('#selected-track').onchange=e=>{learning.track=e.target.value;save();renderSpecialization();toast('One primary specialization saved')};
}
function resourceExtras(r){if(state.edition!=='current')return '';
  const fields=['catalogue_state','recommendation_status','edition','isbn','doi','direct_url','verification_note','inherited_verification','bibliography_status','playback_status','execution_status','last_verified','what_read','what_run','what_modify','what_build','what_not_yet','what_to_read','what_to_run','what_to_modify','what_to_build','chapter_scope','exercise_scope','lectures_url','notes_url','assignments_url','exams_url','projects_url','free_legal_url','alternative','source_release','legacy_id','source_sheet','source_row'];
  return `<h3>Scope, access, and provenance</h3>${detailFields(fields.map(k=>[k.replaceAll('_',' '),r[k]]))}<details class="source-details"><summary>Complete preserved resource record</summary><pre>${esc(JSON.stringify(r,null,2))}</pre></details><details class="source-details"><summary data-provenance="${esc(r.id)}">Source rows and ID aliases</summary><div id="provenance-${esc(r.id)}"><button data-load-provenance="${esc(r.id)}">Load original provenance records</button></div></details>`;
}
async function loadProvenance(id){const target=document.getElementById('provenance-'+id);if(!target)return;target.textContent='Loading provenance…';try{provenanceData=provenanceData||await readData('provenance');target.innerHTML=`<p>Resource identities, source-qualified aliases and review evidence are recorded below. Current catalogue fields are shown above.</p><pre>${esc(JSON.stringify({aliases:provenanceData.aliases.filter(a=>a.resource_id===id),sourceRecords:provenanceData.provenance.filter(a=>a.resource_id===id)},null,2))}</pre>`;}catch{target.textContent='Provenance could not be loaded. Reopen the record to try again.'}}
function renderSources(){
  const audit=MANIFEST.sourceCounts;
  content.innerHTML=`<section class="source-panel about-brand"><img src="/assets/logo.png" alt="CSE Field Guide" width="200" height="200"><div><h2>CSE Field Guide</h2><p><strong>Learn • Build • Explore • Become</strong></p><p>CSE Field Guide is an interactive seven-year self-directed Computer Science and Engineering education and mastery system combining curriculum planning, prerequisite navigation, learning resources, laboratories, projects, assessment and local progress tracking.</p></div></section>
  <div class="stats-strip"><span><strong>75</strong> units</span><span><strong>14</strong> semesters</span><span><strong>11,200</strong> active hours</span><span><strong>38</strong> labs</span><span><strong>24</strong> projects</span><span><strong>1</strong> specialization</span></div>
  <section class="source-details"><h2>Who it is for</h2><p>Independent learners who want a structured, sustained route through computing and engineering, including those building the mathematics, science and programming foundations needed for advanced study. Begin with <button class="inline-link" data-view="first14">First14</button>, take the <button class="inline-link" data-view="diagnostics">Diagnostics</button>, then enter <button class="inline-link" data-year="FY1">Foundation Year 1</button> and U001–U004.</p><h2>Seven years of study</h2><p>Two Foundation Years and five Engineering Years span fourteen semesters. The 75-unit curriculum covers mathematics, physics, chemistry, technical communication, engineering drawing, circuits, electronics, digital logic, architecture, programming, algorithms, operating systems, networks, databases, distributed systems, security, AI, embedded systems, software engineering, research and independent engineering practice.</p><p>The 11,200 hours are planned active learning time. Calendar time alone does not establish competence.</p></section>
  <section class="source-details"><h2>How prerequisites work</h2><p>Hard prerequisites identify knowledge needed before a unit. Staged co-requisites allow carefully sequenced work within a semester. Module gates require specific evidence before a later module. Follow all three and use the <button class="inline-link" data-view="graph">prerequisite graph</button> to inspect relationships. Marking a unit complete does not complete its prerequisites.</p><h2>How resources are organized</h2><p>The master catalogue contains ${audit.resources.toLocaleString()} resource records. It is a reference universe, not a completion checklist. The active learning path selects exact scopes using NOW, NEXT, OPTIONAL, LATER, REFERENCE and ARCHIVE. All ${MANIFEST.originalResourceIds.length} original resource IDs and source-qualified aliases remain traceable.</p><h2>Laboratories, projects and specialization</h2><p>38 laboratory sequences and 24 projects require experiments, measurements, implementation, testing, reports and explanation. Their hours are already included in parent-unit allocations. Physical, simulated, virtual, remote and software evidence stay distinct. Choose one primary specialization from sixteen track options; advanced work requires independent review.</p></section>
  <section class="source-details"><h2>Resource verification</h2>${detailFields(Object.entries(audit.verification))}<p>PAGE VERIFIED records page-level review. DIRECT ACCESS VERIFIED records access to the resource. Separate metadata, bibliography, playback and execution labels describe only the checks recorded. None establishes current stock, price, future availability or learner mastery. Unverified, restricted, broken and archived entries remain labelled; a reachable URL does not upgrade them.</p></section>
  <section class="source-details"><h2>Your progress belongs to you</h2><p>Unit, First14, diagnostic, lab and project records stay in this browser. Choose one specialization and record the evidence behind your progress. Export a backup before clearing storage, changing browsers or changing domains. Import validates records before merging; matching imported records replace saved records.</p><p>Archived study records have separate progress. Earlier completion is never automatically counted toward the current curriculum.</p><div class="action-row"><button class="primary-button" data-export>Export progress</button><button data-import>Import backup</button></div></section>
  <details class="source-details"><summary>Resource and learning limitations</summary><ul>${C.gaps.map(g=>`<li><strong>${esc(g[0])}:</strong> ${esc(g[1])}<br>${esc(g[2])}</li>`).join('')}</ul><p><a href="/data/resource-reference.json" download>Download supplementary resource reference tables (JSON)</a>. These include comparison notes, coverage audits and planning allowances; they are not current price quotations or additional assignments.</p></details>
  <section class="source-details"><h2>Contribute</h2><p>Propose focused code, accessibility, documentation or data improvements through the <a href="https://github.com/rishikkumar84a/cse-field-guide">GitHub repository</a>. Include affected IDs, reproducible steps and evidence for resource verification. Preserve curriculum relationships and third-party attribution.</p><h2>Education and content boundaries</h2><p>CSE Field Guide is a self-directed educational and software project. It does not award a university degree, accredited credits or professional registration.</p><p>Third-party books, papers, courses, lectures, videos, datasets, standards and documentation are linked and referenced. They remain subject to their respective rights and licences. The project does not imply university affiliation.</p><h2>Creator and maintainer</h2><p>Rishik Kumar Chaurasiya</p><p><a href="https://rishik.tech">rishik.tech</a> · <a href="https://www.rishik.tech">www.rishik.tech</a> · <a href="https://github.com/rishikkumar84a">GitHub profile</a></p><p><a href="https://cse.rishik.tech">cse.rishik.tech</a> · Software release 1.0.0</p></section>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.activity)openActivity(b.dataset.activity);
  if(b.dataset.loadProvenance)loadProvenance(b.dataset.loadProvenance);
  if(b.dataset.activeUnit){$('#unit-dialog').close();navigate('active',C.units.find(u=>u.id===b.dataset.activeUnit).semester);}
});
