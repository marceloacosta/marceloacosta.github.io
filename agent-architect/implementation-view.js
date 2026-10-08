import {DOCS} from './implementation.js';
import {icon,diagram} from './architecture.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,title)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`;

export function implementationView(plan,{prefix='guide',selector=''}={}){
  const c=plan.case,source=c?.scenario?.description||'',overview=source||plan.purpose;
  return `<div class="implementation-guide" data-case-context="${c?.id||''}">
  <section class="guide-case" id="${prefix}-case"><div class="guide-case-heading"><div><p class="eyebrow">${c?plan.basis==='selected'?'YOUR SELECTED USE CASE':'WORKED EXAMPLE FROM THE LIBRARY':'YOUR CURRENT SCOPE'}</p><h3>${c?`#${c.id} · ${esc(c.title)}`:'Define a case within these permissions'}</h3></div>${selector}</div>
  <p class="guide-overview">${esc(overview)}</p>${c?.scenario?.businessContext?`<div class="guide-useful"><h4>Where this is useful</h4><p>${esc(c.scenario.businessContext)}</p></div>`:''}
  ${c?`<p class="guide-attribution">Scenario from ${link(c.source,'Build With AWS')}. The pilot plan below adapts it to your choices.</p><details class="source-scenario"><summary>Services named in the original article</summary><p>${esc(c.architecture.services)}</p><p>These are the source scenario’s building blocks. Use the scoped connection plan below to decide which belong in your first pilot.</p></details>`:''}
  <div class="guide-contract"><div><b>Input</b><p>${esc(plan.input)}</p></div><div><b>Expected output</b><p>${esc(plan.output)}</p></div><div><b>Authority boundary</b><p>${esc(plan.scope)}</p></div></div>
  <h4>What the system should do</h4><p>${esc(plan.purpose)}</p>${plan.sourceNote?`<p class="guide-scope-note">${esc(plan.sourceNote)}</p>`:''}${c?.classificationNote?`<p class="guide-scope-note"><b>Classification rationale:</b> ${esc(c.classificationNote)}</p>`:''}${c?.architecture.sourceNote?`<p class="guide-scope-note"><b>Source clarification:</b> ${esc(c.architecture.sourceNote)}</p>`:''}${c?.note?`<p class="guide-scope-note">${esc(c.note)}</p>`:''}</section>
  <nav class="guide-nav" aria-label="Explore the implementation brief"><a href="#${prefix}-next">Start here</a><a href="#${prefix}-connections">Connect the services</a><a href="#${prefix}-considerations">Design considerations</a><a href="#${prefix}-roadmap">Build and validate</a><a href="#${prefix}-reading">Read next</a></nav>
  <section class="guide-next" id="${prefix}-next"><span class="guide-next-mark" aria-hidden="true">01</span><div><p class="eyebrow">YOUR IMMEDIATE NEXT STEP</p><h3>${esc(plan.immediate.title)}</h3><p>${esc(plan.immediate.detail)}</p><div class="guide-deliverable"><b>You should finish with</b><p>${esc(plan.artifact)}</p></div></div></section>
  <section class="guide-section" id="${prefix}-connections"><p class="eyebrow">${esc(plan.route)}</p><h3>How the pieces connect</h3><p class="guide-intro">Follow one request through the system. The service cards below explain each component’s job, its connections, and the first thing to configure.</p>
  ${diagram(plan.nodes,{label:'Proposed implementation connection plan',caption:['agent','multi','hybrid'].includes(plan.pattern)&&plan.route!=='Managed workspace first'?'Tool results return to the agent. The workflow or backend validates the final result and controls any action.':'A proposed pilot route. Each handoff needs an explicit input, output and failure path.'})}
  <ol class="connection-steps">${plan.flow.map((s,i)=>`<li><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><h4>${esc(s.title)}</h4><p>${esc(s.detail)}</p></div></li>`).join('')}</ol>
  <div class="implementation-services">${plan.services.map(s=>`<article class="implementation-service"><div class="implementation-service-heading">${icon(s.icon)}<div><span>${esc(s.tier)}</span><h4>${esc(s.name)}</h4></div></div><p>${esc(s.role)}</p><dl><dt>Connect it</dt><dd>${esc(s.connect)}</dd><dt>Configure first</dt><dd>${esc(s.first)}</dd></dl>${link(DOCS[s.doc][1],DOCS[s.doc][0])}</article>`).join('')}</div></section>
  <section class="guide-section" id="${prefix}-considerations"><p class="eyebrow">BEFORE YOU EXPAND THE SCOPE</p><h3>Decisions and failure modes to account for</h3><div class="consideration-grid">${plan.considerations.map(s=>`<article><h4>${esc(s.title)}</h4><p>${esc(s.detail)}</p></article>`).join('')}</div></section>
  <section class="guide-section" id="${prefix}-roadmap"><p class="eyebrow">FROM FIRST EXAMPLE TO A WORKING PILOT</p><h3>A practical build sequence</h3><ol class="build-roadmap">${plan.roadmap.map(s=>`<li><h4>${esc(s.title)}</h4><p>${esc(s.detail)}</p></li>`).join('')}</ol><div class="acceptance-checks"><h4>What must work before the pilot grows</h4><ul>${plan.gates.map(g=>`<li>${esc(g)}</li>`).join('')}</ul><p>Agree numerical quality, latency and cost targets with the task owner. Compare against the current process using the same test cases.</p></div></section>
  <section class="guide-section" id="${prefix}-reading"><p class="eyebrow">READ IN THIS ORDER</p><h3>Reading that moves the implementation forward</h3><ol class="guide-reading">${c?`<li><span>CASE CONTEXT</span>${link(c.source,`#${c.id} · ${c.title}`)}<p>Read the original scenario and its reference architecture before adapting the pilot.</p></li>`:''}${plan.readings.map(r=>`<li><span>BUILD STEP ${r.order}</span>${link(r.url,r.title)}<p>${esc(r.why)}</p></li>`).join('')}</ol><p class="guide-attribution">Guidance updated ${esc(plan.checkedOn)}. The proposed connections are an implementation starting point; confirm the selected region, models and connector capabilities during setup.</p></section>
  </div>`;
}

export function exportedImplementation(plan){
  // A readable offline version of the same content and diagram. Native image
  // assets are embedded by the caller, so the brief survives server shutdown.
  return implementationView(plan,{prefix:'build'});
}
