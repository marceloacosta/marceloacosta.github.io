import {asset} from './paths.js';
import {PATTERNS, DOMAINS} from './model.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const services = [
  ['agentcore', /AgentCore/i, 'Amazon Bedrock AgentCore'],
  ['bedrock', /Bedrock(?! AgentCore)/i, 'Amazon Bedrock'],
  ['step-functions', /Step Functions/i, 'AWS Step Functions'],
  ['textract', /Textract/i, 'Amazon Textract'],
  ['lambda', /Lambda/i, 'AWS Lambda'],
  ['s3', /\bS3\b/i, 'Amazon S3'],
  ['dynamodb', /DynamoDB/i, 'Amazon DynamoDB'],
  ['eventbridge', /EventBridge/i, 'Amazon EventBridge'],
  ['quick', /\bQuick(?:Sight| Sight| Suite)?\b/i, 'Amazon Quick'],
  ['athena', /Athena/i, 'Amazon Athena'],
  ['redshift', /Redshift/i, 'Amazon Redshift'],
  ['glue', /\bGlue\b/i, 'AWS Glue'],
  ['config', /AWS Config/i, 'AWS Config'],
  ['security-hub', /Security Hub/i, 'AWS Security Hub'],
  ['guardduty', /GuardDuty/i, 'Amazon GuardDuty'],
  ['cloudtrail', /CloudTrail/i, 'AWS CloudTrail'],
  ['cloudwatch', /CloudWatch/i, 'Amazon CloudWatch'],
  ['opensearch', /OpenSearch/i, 'Amazon OpenSearch Service'],
  ['iam', /\bIAM\b/i, 'AWS IAM'],
];
const glyphs = {
  input:'<path d="M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 16h5"/>',
  tools:'<path d="M8 5 3 12l5 7m8-14 5 7-5 7M14 3l-4 18"/>',
  check:'<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="10"/>',
  people:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  data:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
};
export function icon(key, className='') {
  if (services.some(s => s[0] === key)) return `<img class="aws-icon ${className}" src="${asset(`aws-icons/${key}.svg`)}" alt="" width="40" height="40">`;
  return `<svg class="diagram-symbol ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[key] || glyphs.tools}</svg>`;
}
export function serviceIcon(name) {
  const found = services.find(s => s[1].test(name));
  return icon(found?.[0] || 'tools');
}
export const PATTERN_NODES = {
  automation:[['input','Request / event'],['lambda','Business rules'],['check','Validated action']],
  grounded:[['input','Question'],['bedrock','Retrieve evidence'],['bedrock','Grounded answer']],
  workflow:[['input','Request + data'],['step-functions','Controlled workflow'],['bedrock','Model step'],['check','Validate result']],
  agent:[['input','Task + context'],['agentcore','Bounded agent'],['tools','Authorized tools'],['check','Verify outcome']],
  hybrid:[['input','Request / event'],['step-functions','Durable workflow'],['agentcore','Investigate exception'],['check','Validate + deliver']],
  multi:[['input','Complex task'],['agentcore','Coordinator'],['agentcore','Specialist agents'],['check','Reconcile outputs']],
};
export function diagram(nodes, {compact=false, label='High-level architecture', caption='', support=''}={}) {
  return `<figure class="architecture ${compact?'compact':''}" aria-label="${esc(label)}"><div class="architecture-track">${nodes.map(([key,title],i)=>`<div class="architecture-node">${icon(key)}<span>${esc(title)}</span></div>${i<nodes.length-1?'<span class="architecture-arrow" aria-hidden="true">→</span>':''}`).join('')}</div>${support}${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
}
export function patternDiagram(pattern, options={}) {
  return diagram(PATTERN_NODES[pattern], {label:PATTERNS[pattern].name, ...options});
}
export function caseDiagram(c, compact=false) {
  const source = c.architecture.services;
  const trigger = c.architecture.input || ({answer:'User question',analyze:'Business question',create:'Source material',investigate:'Alert / question',execute:'Request / event'})[c.goal];
  const output = c.architecture.output || ({answer:'Cited answer',analyze:'Verified analysis',create:'Reviewed draft',investigate:'Evidence + proposal',execute:c.action==='critical'?'Approval → action':'Validated outcome'})[c.goal];
  let nodes = PATTERN_NODES[c.pattern].map(n=>[...n]);
  nodes[0]=['input',trigger]; nodes[nodes.length-1]=[c.action==='critical'?'people':'check',output];
  // Use generic application code when the source does not name Step Functions
  // or Lambda. The expanded diagram is a proposed simplified starting route.
  nodes = nodes.map(([key,label])=> key==='step-functions'&&!/Step Functions/i.test(source)?['tools','Workflow code']:key==='lambda'&&!/Lambda/i.test(source)?['tools','Business rules']:[key,label]);
  if(c.pattern==='grounded' && /Amazon Q Business/i.test(source)) nodes=[['input',trigger],['quick','Amazon Quick'],['check',output]];
  if(c.id==='051') nodes=[['s3','Invoice upload'],['textract','Extract fields'],['step-functions','Validate + route'],['agentcore','Match exception'],['people','Review → payment']];
  if(compact) nodes=[nodes[0],nodes[['agent','multi'].includes(c.pattern)?1:Math.floor(nodes.length/2)],nodes.at(-1)];
  const matched = services.filter(s=>s[1].test(source));
  const support = compact?'':`<div class="architecture-support"><span>BUILDING BLOCKS IN THE SOURCE ARTICLE</span><div class="service-chips">${matched.map(([key,,name])=>`<span>${icon(key)}${esc(name)}</span>`).join('')}</div></div>`;
  return diagram(nodes,{compact,label:`Basic architecture for #${c.id}: ${c.title}`,support,caption:compact?'Suggested starting design':`Simplified starting design · ${PATTERNS[c.pattern].short}. Validate permissions, state and integrations for your workload.`});
}
export function referenceFigure(ref, {sizes='(max-width: 760px) calc(100vw - 90px), (max-width: 1072px) calc(100vw - 132px), 940px'}={}) {
  const responsive=ref.previewImage?` srcset="${esc(asset(ref.previewImage))} ${ref.previewWidth}w, ${esc(asset(ref.image))} ${ref.width}w" sizes="${esc(sizes)}"`:'';
  return `<figure class="source-diagram"><a href="${esc(asset(ref.image))}" target="_blank" rel="noopener" aria-label="Open full-size diagram: ${esc(ref.title)}"><img src="${esc(asset(ref.image))}"${responsive} alt="Original reference architecture ${esc(ref.label)}: ${esc(ref.title)}" width="${ref.width||1408}" height="${ref.height||768}" loading="lazy" decoding="async"></a><figcaption><span>EDITION ${ref.edition} · REFERENCE ${esc(ref.label)}</span><strong>${esc(ref.title)}</strong><a href="${esc(ref.source)}" target="_blank" rel="noopener noreferrer">Read the source article ↗</a><small>Select the diagram to open it at full size.</small></figcaption></figure>`;
}
export function caseReferences(c, refs) {
  return `<section class="case-references"><h3>The original architecture${c.architecture.references.length>1?'s':''}</h3><p class="field-note">${c.architecture.referenceBasis==='source'?'Linked from this use case in the original series.':'Suggested reference from the same edition; the original entry does not assign an architecture label.'}</p>${c.architecture.references.map(id=>referenceFigure(refs.find(r=>r.id===id))).join('')}</section>`;
}
export function referenceGallery(refs, {article=false}={}) {
  const sizes=article?'(max-width: 760px) calc(100vw - 100px), (max-width: 1100px) calc(100vw - 140px), 800px':'(max-width: 760px) calc(100vw - 100px), (max-width: 1440px) calc((100vw - 220px) / 2), 600px';
  return `<div class="reference-gallery">${Object.entries(DOMAINS).filter(([key])=>key!=='any').map(([key,title])=>`<details class="reference-edition"><summary><span>${esc(title)}</span><small>${refs.filter(r=>r.domain===key).length} diagrams</small></summary><div class="reference-grid">${refs.filter(r=>r.domain===key).map(ref=>referenceFigure(ref,{sizes})).join('')}</div></details>`).join('')}</div>`;
}
