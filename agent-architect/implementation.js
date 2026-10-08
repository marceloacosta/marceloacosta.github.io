import {PATTERNS, DATA, GOALS, permitted} from './model.js';

// Editorial implementation guidance. These are proposed pilot designs, not
// generated infrastructure or assertions about a reader's existing systems.
export const DOCS = {
  kb:['Build a Bedrock Managed Knowledge Base','https://docs.aws.amazon.com/bedrock/latest/userguide/kb-build-managed.html'],
  retrieve:['Retrieve API for evidence passages','https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_Retrieve.html'],
  sync:['Sync a managed knowledge-base data source','https://docs.aws.amazon.com/bedrock/latest/userguide/kb-managed-sync.html'],
  customerKb:['Create a customer-managed knowledge base','https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-create.html'],
  customerSync:['Sync a customer-managed data source','https://docs.aws.amazon.com/bedrock/latest/userguide/kb-data-source-sync-ingest.html'],
  connectors:['Check data-source connector availability','https://docs.aws.amazon.com/bedrock/latest/userguide/data-source-connectors.html'],
  agenticRetrieve:['Query a managed knowledge base with agentic retrieval','https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-agentic-retrieve.html'],
  policy:['Enforce tool authorization with AgentCore Policy','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html'],
  vector:['Choose a supported vector store','https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-setup.html'],
  workflow:['Orchestrate Lambda with Step Functions','https://docs.aws.amazon.com/lambda/latest/dg/with-step-functions.html'],
  model:['Call Bedrock from Step Functions','https://docs.aws.amazon.com/step-functions/latest/dg/connect-bedrock.html'],
  harness:['Start an AgentCore harness','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-get-started.html'],
  runtime:['Choose harness or Runtime','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-vs-runtime.html'],
  hybrid:['Invoke AgentCore from Step Functions','https://docs.aws.amazon.com/step-functions/latest/dg/connect-bedrockagentcore.html'],
  gateway:['Connect tools with AgentCore Gateway','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-quick-start.html'],
  lambdaTools:['Define Lambda tool contracts','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-add-target-lambda.html'],
  approval:['Understand callback and service integrations','https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html'],
  retry:['Handle workflow errors','https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html'],
  ledger:['Use DynamoDB conditional writes','https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html'],
  trace:['Set up AgentCore observability','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-get-started.html'],
  iam:['Scope AWS workload permissions','https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html'],
  textract:['Extract invoices and receipts','https://docs.aws.amazon.com/textract/latest/dg/analyzing-document-expense.html'],
  query:['Use parameterized Athena queries','https://docs.aws.amazon.com/athena/latest/ug/querying-with-prepared-statements.html'],
  events:['Route events with EventBridge','https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html'],
  s3:['Connect S3 event notifications','https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html'],
  browser:['Explore AgentCore Browser','https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/browser-tool.html'],
  quick:['Explore Amazon Quick capabilities','https://docs.aws.amazon.com/quick/latest/userguide/what-is.html'],
  qbusiness:['Q Business availability and migration','https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/qbusiness-availability-change.html'],
  findings:['Understand GuardDuty findings','https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings.html'],
  audit:['Inspect CloudTrail event history','https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html'],
};
const service=(name,icon,role,connect,first,doc,tier='Pilot core')=>({name,icon,role,connect,first,doc,tier});
const task=(title,detail)=>({title,detail});
const PROFILES={
  grounded:{
    purpose:'Build a grounded answer or draft over authorized knowledge. A useful result contains a supported answer, links to its evidence, and a clear handoff when the sources cannot settle the question.',
    nodes:[['input','Authenticated question'],['bedrock','Managed Knowledge Base'],['bedrock','Bedrock model'],['check','Answer + citations']],
    services:[
      service('Approved source + managed ingestion','s3','Keep source ownership, versions, document permissions and freshness identifiable.','Connect a supported source to Bedrock Managed Knowledge Base and configure ingestion and ACL awareness for that connector. Check sync failures before querying.','Start with one collection and two users with different access. Validate updates, deletion and revoked access.','sync'),
      service('Amazon Bedrock Managed Knowledge Base','bedrock','Manage ingestion, storage, indexing and retrieval without selecting a separate vector store.','Your backend authenticates the caller and uses Retrieve for passages. Apply the supported user context and access configuration for the selected connector; do not trust a user-supplied filter as authorization.','Verify connector, region, file types, ACL support and retrieval quality against the evaluation set.','kb'),
      service('Amazon Bedrock model + application backend','bedrock','Compose a supported answer or draft from permitted retrieved evidence.','Pass retrieved passages to your model with source IDs and an insufficient-evidence response contract. Validate the returned citations. Managed knowledge bases use Retrieve or AgenticRetrieveStream, not RetrieveAndGenerate.','Start with a single retrieval pass. Evaluate bounded AgenticRetrieveStream only if multi-step retrieval improves quality enough to justify its latency and cost.','retrieve'),
    ],
    flow:[task('Prepare the evidence','Ingest approved documents and metadata. Keep a path back to the source version; retrieval cannot repair a missing or stale source.'),task('Authorize the request','Authenticate the user, derive their permitted source scope on the server, and reject requests outside it.'),task('Retrieve, then answer','Retrieve relevant passages, pass those passages to the model, and return the response with source links. Keep retrieved content separate from system instructions.'),task('Check the response','Test that claims follow from the cited evidence. If the sources are absent or conflicting, ask a clarification or hand off to the document owner.')],
    immediate:task('Create the first question-and-evidence set','Choose one document collection and write 10 representative questions. For each, record the expected answer and supporting source; include one unanswerable question, one outdated source and one unauthorized-user case.'),
    artifact:'A question / expected answer / source / allowed audience table, reviewed by the knowledge owner.',
    gates:['The answer cites the expected source, and its claims are supported by that source.','A user without source permission receives neither restricted passages nor a revealing summary.','Missing and conflicting evidence produces a clarification or handoff, not an invented resolution.'],
    reads:['kb','retrieve','sync','agenticRetrieve','connectors','iam'],
  },
  automation:{
    purpose:'Automate a process with known rules. Code decides the route and checks the outcome. The design should produce the same business result when a request is delivered twice or a dependency times out.',
    nodes:[['input','Validated request'],['step-functions','Step Functions'],['lambda','Rules + adapters'],['check','Verified outcome']],
    services:[
      service('AWS Step Functions','step-functions','Coordinate the known sequence, explicit branches, timeouts and recovery.','Start the workflow from your backend or an event. Pass a request ID between Task states and route failures with Catch to a named recovery path.','Sketch the normal route, duplicate route and uncertain-result route before implementing the state machine.','workflow'),
      service('AWS Lambda','lambda','Validate input and execute narrowly defined business operations.','Use a Task state to invoke the function. Give each operation a schema and return status, operation ID and evidence of the outcome.','Implement one operation against a test endpoint. Make a repeated request reuse the same business key.','workflow'),
    ],
    flow:[task('Validate and identify','Check required fields and derive a stable business operation ID before contacting another system.'),task('Apply known rules','Run explicit branches and business validations. Route unknown conditions to an operator with the original input.'),task('Call the destination','Pass the operation ID to the adapter. Reconcile a missing response with the destination before issuing another write.'),task('Record the result','Return a verified result or a durable pending status, and identify who owns any unresolved exception.')],
    immediate:task('Map one operation, including its retry','Take one real request and write its fields, rule checks, destination call, success evidence and recovery behavior. Add a duplicate request and a timeout-after-acceptance example.'),
    artifact:'A process sketch plus three fixtures: normal, duplicate and uncertain outcome.',
    gates:['Known fixtures take the intended branches and produce the expected values.','A duplicate operation does not create a second business effect.','A timeout after a write enters reconciliation instead of an unconditional retry.'],
    reads:['workflow','retry','ledger','iam'],
  },
  workflow:{
    purpose:'Build a repeatable process that uses a model for a defined task, such as classifying an input or drafting an output. Code decides when the model runs and validates its result before the process continues.',
    nodes:[['input','Request + sources'],['step-functions','Step Functions'],['bedrock','Bedrock model'],['lambda','Validate output']],
    services:[
      service('AWS Step Functions','step-functions','Own the sequence and distinguish model errors, invalid outputs and business exceptions.','Use the Bedrock InvokeModel integration for the model step, followed by a Lambda validation Task and explicit success or review branches.','Build one successful route and one invalid-output route. Pass large documents by reference instead of filling workflow state with file contents.','model'),
      service('Amazon Bedrock','bedrock','Perform the bounded language task using supplied evidence and an output schema.','The workflow supplies the input, source context and instruction. Treat the model response as untrusted input to the next validation step.','Define fields, allowed values and source references in the output contract. Compare several representative inputs to human-produced results.','model'),
      service('AWS Lambda','lambda','Validate the response schema and enforce numerical and business constraints.','Receive the model output from Step Functions, run deterministic checks, and return accepted fields or an explicit review reason.','Reject missing evidence, malformed fields and amounts that do not reconcile; do not let model wording bypass a failed check.','workflow'),
    ],
    flow:[task('Define the job','Accept one document or request type and validate its required context.'),task('Run a bounded model step','Provide the model with the relevant evidence and a precise output contract. Keep the routing logic in code.'),task('Validate before continuing','Parse the output, check required fields, recompute calculations, and verify source support.'),task('Deliver or route to review','Return a valid result through the chosen authority boundary. Route invalid or ambiguous results with the original input and a clear review reason.')],
    immediate:task('Write one output contract and ten examples','Select a single request type. Define the fields a person needs, their validation rules, and what a correct output looks like. Prepare 10 examples, including incomplete input and a plausible but wrong result.'),
    artifact:'A versioned output schema, validation rules and a small input / expected-output set.',
    gates:['The output conforms to the contract and passes business checks.','Malformed or unsupported model output stops before a downstream action.','A person can correct and resubmit an exception without losing its original context.'],
    reads:['model','workflow','retry','iam'],
  },
  agent:{
    purpose:'Build an assistant that can choose its next information-gathering step from a small approved tool set. It should explain what it found, preserve evidence, and stop when it cannot resolve the task within its authority.',
    nodes:[['input','Task + identity'],['agentcore','AgentCore harness'],['agentcore','Gateway tools'],['check','Verified result']],
    services:[
      service('Amazon Bedrock AgentCore harness','agentcore','Run the model-and-tool loop with explicit limits. Use Runtime instead if you need to own the orchestration code.','The backend invokes the harness with the task and session ID. Configure a Bedrock model and the permitted tool endpoints; tool results return to the loop.','Start with one task, two read tools, an iteration limit and a defined handoff response.','harness'),
      service('AgentCore Gateway + authenticated tools','agentcore','Expose a small set of business capabilities through tool schemas and controlled credentials.','Connect the harness to an authenticated Gateway. Map each target to a Lambda adapter or supported API, and authorize the caller at the boundary.','Describe each tool’s arguments, output and allowed operations. Configure authentication; do not carry a no-auth tutorial setting into a shared pilot.','gateway'),
      service('AWS Lambda / existing API adapters','lambda','Translate a constrained tool call into a permitted business query.','Validate arguments and authorization before calling the source system; return structured data with identifiers, source time and explicit errors.','Implement one read tool with fixed scope and a mock source. Reject an out-of-scope resource even when the model requests it.','lambdaTools'),
    ],
    flow:[task('Accept a bounded task','Carry caller identity and a task ID from the backend; define what completion means.'),task('Choose and authorize a tool','The agent proposes a tool call. The tool boundary validates its arguments and the caller’s scope before accessing a source.'),task('Inspect evidence and continue','Return structured results to the agent. It may choose another permitted tool if the evidence warrants it; retrieved text cannot grant new permissions.'),task('Stop with a supported outcome','Finish with sources and unresolved questions, or hand off when the iteration, time or authority limit is reached.')],
    immediate:task('Design two tools around one real task','Trace a task a person completed. Identify two read-only tools that would supply the evidence. Write their input/output schemas, authorized resources and failure responses, then mock both tools.'),
    artifact:'A task transcript, two tool contracts and an expected evidence-backed result.',
    gates:['The tool trace supports the conclusion and stays within the intended task.','A hostile tool response cannot expand permissions or trigger an unauthorized operation.','A repeated or unproductive loop reaches its limit and hands off with useful context.'],
    reads:['runtime','harness','gateway','trace'],
  },
  hybrid:{
    purpose:'Keep the business process in a durable workflow and call an agent only for the uncertain part. The agent returns a proposal; deterministic checks and the selected authority decide what the workflow may deliver or execute.',
    nodes:[['input','Request + operation ID'],['step-functions','Step Functions'],['agentcore','Bounded investigation'],['check','Validate + deliver']],
    services:[
      service('AWS Step Functions Standard workflow','step-functions','Own process state, deterministic steps and the handoff into and out of investigation.','Use the AgentCore InvokeHarness integration for the uncertain step. Parse and validate its final output before entering a separate delivery or authorized execution branch.','Model proposed, validated, delivered and unresolved outcomes. Keep the operation ID stable across retries.','hybrid'),
      service('Amazon Bedrock AgentCore harness','agentcore','Investigate an exception using approved evidence and return a structured recommendation.','Step Functions supplies the exception context; the harness calls its tools and returns the final response. Tool permissions belong on the harness execution role.','Limit calls and runtime. Keep consequential write tools out of the first pilot; require evidence IDs and unresolved issues in the proposal.','harness'),
      service('AWS Lambda + AgentCore Gateway','lambda','Perform deterministic checks and expose controlled source-system tools.','Workflow Tasks run validators; Gateway targets expose investigation tools. Keep the write adapter separate from read tools and enforce the selected authority and a validated proposal ID.','Implement the validator before expanding the agent’s tool set. Verify source data, amount limits and operation state in code.','lambdaTools'),
    ],
    flow:[task('Validate and take ownership','Assign the business operation ID and check its existing state. Run known extraction, normalization or rule checks first.'),task('Investigate only the exception','Pass the ambiguous portion and source references to the harness; keep the rest of the process deterministic.'),task('Validate the proposal','Parse the returned result and check it against the original evidence. A confident explanation cannot override a failed business rule.'),task('Deliver a validated result','Persist the validated result and its source evidence. Deliver it only through the selected authority boundary; preserve unresolved issues for the owner.')],
    immediate:task('Specify one exception and its evidence contract','Choose one exception category and collect 10 completed examples. Record evidence IDs, the expected resolution, unresolved questions and a stable task key. Define the agent’s result schema and deterministic validation rules.'),
    artifact:'An exception / evidence / expected result set and a state sketch for validation and recovery.',
    gates:['The agent only receives the exception task and returns a verifiable proposal.','Unsupported, malformed and stale proposals fail validation before delivery or execution.','A duplicate request or lost downstream response cannot create a second action.'],
    reads:['hybrid','lambdaTools','ledger'],
  },
  multi:{
    purpose:'Split a task only when separate expertise, context or permissions justify it. A coordinator assigns bounded jobs to specialists, then resolves disagreements and assembles a result whose evidence can be traced back to each worker.',
    nodes:[['input','Complex task'],['agentcore','Coordinator'],['agentcore','Scoped specialists'],['check','Reconcile + verify']],
    services:[
      service('AgentCore Runtime + your agent framework','agentcore','Host coordinator and specialist code while you define the delegation and merge logic.','The coordinator invokes workers through explicit interfaces. Return typed results with evidence, status and unresolved questions; do not let worker prose grant additional permissions.','Start with two workers and compare against a single-agent baseline on the same examples.','runtime'),
      service('AgentCore Gateway + scoped adapters','agentcore','Give specialists the tools appropriate to their jobs.','Authorize each tool call. If specialists need different security boundaries, use separate execution identities or deployments; prompts alone do not isolate permissions.','Write a tool-to-specialist permission matrix and deny a cross-role call in the first test.','gateway'),
      service('Coordinator validation code','tools','Check completeness, reconcile conflicting claims and decide whether the combined result is deliverable.','Collect worker outputs, enforce the shared schema, deduplicate evidence and route unresolved contradictions to review.','Define what happens when a worker times out, repeats a task or disagrees with another worker.','runtime'),
    ],
    flow:[task('Decompose the task','Name each specialist’s input, allowed evidence, output contract and stopping condition.'),task('Dispatch independent work','The coordinator sends only the required context to each worker and assigns a task ID and call budget.'),task('Collect and reconcile','Verify returned schemas and evidence. Resolve contradictions explicitly and record missing or failed work.'),task('Deliver one accountable result','The coordinator produces a combined answer and preserves the evidence trail. Escalate unresolved disagreement before any action.')],
    immediate:task('Prove why two specialists are needed','Take five representative tasks. Write the independent sub-jobs, their permissions and the merge rule. Produce a single-agent baseline before implementing the coordinator.'),
    artifact:'Two worker contracts, a reconciliation rule and baseline results for the same tasks.',
    gates:['Specialists improve a measured outcome enough to justify coordination cost.','A worker cannot use another worker’s authority or claim completion without evidence.','Missing, duplicated and contradictory worker results have deterministic handling.'],
    reads:['runtime','lambdaTools','gateway','trace'],
  },
};

export function resolveUseCase(r,cases,context){
  const selected=cases.find(c=>c.id===context?.id),a=r.answers;
  const eligible=selected&&selected.goal===a.goal&&(a.domains.includes('any')||a.domains.includes(selected.domain))&&permitted(selected,a);
  return {case:eligible?selected:r.matches[0]||null,basis:eligible&&context?.basis==='selected'?'selected':'example'};
}
export function answersForCase(c){return {goal:c.goal,domains:[c.domain],control:({automation:'fixed',grounded:'lookup',workflow:'model',agent:'adaptive',hybrid:'adaptive',multi:'decomposed'})[c.pattern],authority:({read:'read',draft:'draft',write:'auto',critical:'review'})[c.action],data:[...c.data],continuity:c.continuity||'interactive',priority:c.pattern==='multi'?'quality':'simple',build:'custom',separation:c.pattern==='multi'?'context':'none',impact:c.action==='critical'?'consequential':'bounded',sensitivity:c.sensitivity||'internal'};}
export function buildImplementation(r,cases,context){
  const a=r.answers,{case:c,basis}=resolveUseCase(r,cases,context),base=structuredClone(PROFILES[r.pattern]);
  const plan={...base,case:c,basis,pattern:r.pattern,route:'Custom AWS implementation',considerations:[],roadmap:[],readings:[],sourceNote:'',checkedOn:'October 6, 2026'};
  plan.input=c?.architecture.input||DATA[a.data[0]]||'A scoped request';
  plan.output=c?.architecture.output||GOALS[a.goal];
  plan.scope=({read:'Read sources and return information. Business systems remain read only.',draft:'Prepare a draft or proposal for a person. The application does not execute it.',review:'Prepare a proposal and require approval for the exact consequential change before execution.',auto:'Allow only pre-authorized routine changes with enforced limits and a recovery path.'})[a.authority];
  if(c && /Q Business/.test(c.architecture.services))plan.considerations.push(task('Historical source versus a new deployment','The original article and diagram describe Q Business. New customers should evaluate Amazon Quick; the custom retrieval guide uses current Bedrock options. Source diagrams are historical references, not current provisioning instructions.'));
  if(c && c.pattern!==r.pattern)plan.sourceNote=`The original catalog starts this example with ${PATTERNS[c.pattern].short.toLowerCase()}. Your answers favor ${PATTERNS[r.pattern].short.toLowerCase()}; the connection plan below follows your choices.`;
  const extraData=c?.data.filter(d=>!a.data.includes(d))||[];
  if(extraData.length)plan.sourceNote+=(plan.sourceNote?' ':'')+`The full source scenario also uses ${extraData.map(d=>DATA[d].toLowerCase()).join(', ')}. Add those only after explicitly expanding your current data scope.`;

  if(a.build==='business'){
    const product='Amazon Quick',doc='quick';
    plan.route='Managed workspace first';
    plan.nodes=[['input','Approved sources'],['quick',product],['check','Enforce permissions'],['check','Validated outcome']];
    plan.services=[service(product,'quick','Evaluate a packaged workspace against the actual source connectors, output requirements and action limits.','Connect one approved source, map users and groups, and exercise the task in the workspace. Confirm the intended connector and approval behavior before committing to this route.','Run the same acceptance examples with two users who have different permissions; record capability gaps. ',doc,'Evaluate first')];
    plan.flow=[task('Connect one source','Have the source owner approve the connector and permission mapping. Use a representative collection before broad rollout.'),task('Exercise the real task','Run the case’s inputs and expected outputs in the workspace. Verify that source references and any computed values are correct.'),task('Check the action boundary','Confirm the product can enforce your selected authority and the required execution boundary. If it cannot, keep the operation with a person or a separately controlled workflow.'),task('Decide whether to extend','Keep a list of capability gaps. Use the custom architecture only for requirements the workspace cannot meet; do not duplicate working native features.')];
    plan.immediate=task(`Test one source in ${product}`,`Choose one supported source and run five representative tasks, including a restricted document or record. Record whether the result, permission boundary and execution boundary can be achieved with native features.`);
    plan.artifact='A connector-and-permissions proof plus a concrete list of unmet requirements.';
    plan.reads=[doc,'iam'];
    plan.purpose='Evaluate the managed workspace against the task contract before committing to it. Native capabilities must satisfy the selected data, authority and output requirements.';
    plan.gates=['Results cite permitted sources and preserve the required output contract.','Two users with different access cannot retrieve each other’s restricted evidence.','Missing connectors, unsupported execution controls and trace gaps are recorded as unresolved requirements.'];
    plan.considerations.push(task('Confirm product fit before extending','A managed workspace is a delivery choice, not proof that every agent pattern is supported. Treat missing connectors, execution controls or traceability as design gaps to resolve.'));
    if(c && /Q Business/.test(c.architecture.services))plan.considerations.push(task('Historical product in the source','The source describes Amazon Q Business. It is closed to new customers; evaluate Amazon Quick for a new workspace and verify migration gaps rather than assuming feature parity.'));
  } else if(a.build==='existing'){
    plan.route='Extend your existing application';
    plan.considerations.push(task('Keep existing ownership boundaries','Map each responsibility below to the service you already operate. Reuse your authenticated entry point, data access layer and workflow engine where they meet the contract; add AWS components only for missing capabilities.'));
  }

  if(a.build!=='business' && r.pattern==='grounded'){
    plan.considerations.push(task('Choose the knowledge-base mode explicitly','Evaluate Managed Knowledge Base first. A customer-managed knowledge base remains an alternative when S3 or custom ingestion and control over the vector store are requirements. Since September 30, 2026, new Confluence, SharePoint, Salesforce and Web Crawler connectors are unavailable in customer-managed knowledge bases; verify an appropriate supported connector in Managed Knowledge Base before choosing it.'));
    plan.reads.push('customerKb','customerSync','vector');
  }
  if(a.build!=='business' && a.data.includes('structured') && c?.id==='051'){
    plan.services.push(service('Purchase-order lookup · existing API or DynamoDB','dynamodb','Supply the authoritative purchase order, vendor and previous invoice status for matching.','A read-only Lambda adapter fetches approved PO fields by PO or vendor identifier. Return line items, amounts, currency, version and source time to the validator and investigation tool.','Start with one purchase-order source. Verify that the invoice and PO use the same currency and units, and distinguish missing records from mismatches.','lambdaTools','Purchase-order evidence'));
    plan.considerations.push(task('Use the purchase order as the source of truth','Match vendor, currency, quantity and line-item amounts against the approved PO version. An agent may propose a correspondence between descriptions; it cannot approve a price difference or invent a missing PO.'));
  } else if(a.build!=='business' && a.data.includes('structured')){
    plan.services.push(service('Read-only query adapter · Athena or your warehouse','athena','Answer numerical questions through governed definitions and executable queries.','Expose parameterized, bounded queries through the backend or a tool adapter. Return column names, filters, freshness and query ID along with the values.','Define one certified metric and an expected result. Start with approved templates and deny arbitrary writes.','query','When using tables'));
    plan.considerations.push(task('Metric meaning and query safety','Define grain, time zone, joins, exclusions and freshness before interpreting a number. Parameterization does not authorize arbitrary SQL; constrain tables, operations and query cost in the adapter.'));
  }
  if(a.build!=='business' && a.data.includes('api') && !['agent','hybrid','multi','automation'].includes(r.pattern))plan.services.push(service('AWS Lambda / business API adapter','lambda','Retrieve the business records required for the bounded model task.','The backend or workflow calls a scoped adapter before the model. Pass record IDs and approved fields rather than broad credentials.','Document one API contract and test not-found, unauthorized and timeout responses.','workflow','When using APIs'));
  if(a.build!=='business' && a.data.includes('docs') && ['agent','multi'].includes(r.pattern))plan.services.push(service('Bedrock Knowledge Bases retrieval tool','bedrock','Let the investigator or specialist retrieve relevant document evidence.','Wrap retrieval in an authorized tool and return passages with source IDs; the agent cannot choose its own access policy.','Index one approved collection and test retrieval with two different permission scopes.','kb','When using documents'));
  if(a.build!=='business' && a.data.includes('browser'))plan.services.push(service('AgentCore Browser','agentcore','Interact with a web interface when an appropriate API is unavailable.','Start an isolated session for the task, scope site credentials, and inspect resulting application state after each step.','Prototype a read-only flow first; check session expiry, unexpected navigation and a changed page layout.','browser','When using web interfaces'));
  const invoice=c?.id==='051'&&a.data.includes('docs')&&a.build!=='business';
  if(invoice){
    plan.nodes=[['s3','Invoice in S3'],['textract','Textract extraction'],...plan.nodes.slice(1)];
    plan.services.unshift(service('Amazon S3 + Amazon Textract','textract','Preserve the invoice and extract line items, totals and confidence scores before matching.','Route an S3 upload into the workflow. Use Textract expense analysis; pass the object reference and extracted fields to deterministic validation.','Collect invoices and matching POs. Mark ambiguous scans and set a review threshold with the accounts-payable owner.','textract','Invoice ingestion'));
    plan.flow.unshift(task('Extract and check the invoice','Keep the original file in S3. Extract fields with Textract, validate totals and vendor identifiers, and send low-confidence extraction directly to review.'));
    plan.immediate=task('Build an invoice-to-PO test pack','Collect 10 sanitized invoices with their purchase orders and the accounts-payable decisions. Include an ambiguous amount, a mismatched line item and a duplicate. Define the invoice business key and the fields that must be reviewed.');
    plan.artifact='Ten invoice / PO / expected decision examples plus a confidence-review rule and duplicate key.';
    plan.considerations.push(task('Extraction and matching fail differently','A poor scan needs source review before semantic matching. Keep totals, duplicate detection and payment status in deterministic code; compare model matching proposals against the PO evidence.'));
    plan.reads.unshift('textract');
  }
  if(c?.domain==='compliance-security-governance'&&/GuardDuty|CloudTrail/.test(c.architecture.services)&&a.data.includes('api')&&a.build!=='business'){
    const finding=/GuardDuty/.test(c.architecture.services);
    plan.services.push(service(finding?'GuardDuty findings + audit evidence':'CloudTrail / authorized security evidence',finding?'guardduty':'cloudtrail','Supply the findings, resource context and event history needed for this security case.','Expose read-only adapters through Gateway or the workflow. Preserve finding IDs, account, resource, source time and the evidence behind each conclusion.','Choose one authorized account and historical case. Compare the collected evidence and timeline with an analyst-reviewed investigation.',finding?'findings':'audit','Security evidence'));
    plan.considerations.push(task('Preserve evidence and distinguish triage from containment','Keep the original finding and source timestamps. A severity label or investigation conclusion is not permission to isolate a resource; apply the selected authority boundary to every remediation tool.'));
    plan.reads.push(finding?'findings':'audit');
    if(c.id==='111'){
      plan.immediate=task('Replay five analyst-reviewed security alerts','Select five sanitized historical alerts with their resource context, relevant audit events and analyst outcomes. Define the required triage fields: classification, severity, evidence IDs, unresolved questions and analyst handoff.');
      plan.artifact='Five alert / evidence / expected triage examples and two read-only evidence tool contracts.';
      plan.gates.push('Triage classification and severity have evidence, and the handoff retains the finding ID and unresolved questions.');
    }
  }
  if(a.build!=='business' && a.continuity==='background')plan.services.push(service('Amazon EventBridge / EventBridge Scheduler','eventbridge','Start work on a relevant event or a chosen schedule.','An event rule routes matching events to your workflow or backend. Use Scheduler for timed runs and pass a stable task identity.','Filter one event type and test duplicate delivery; establish a failure destination and operator ownership.','events','Background trigger'));
  if(a.build!=='business' && (a.continuity==='durable'||['review','auto'].includes(a.authority))){
    plan.services.push(service('Amazon DynamoDB / your transaction database','dynamodb','Store durable business status and duplicate-protection keys independently of conversation memory.','Read the operation record before acting and use conditional state transitions. Store proposed, validated, committed or uncertain status and the external operation ID.','Write a duplicate-request test and a timeout-after-acceptance test. Conditional writes in your database do not make an external API exactly once.','ledger','For state and recovery'));
  }
  if(a.authority==='review'){
    plan.considerations.push(task('Bind approval to an exact proposal','Record the approver, proposed fields, version and expiry. A changed proposal requires a fresh approval. In Step Functions, implement the human wait as a separate supported callback task; InvokeHarness itself is Request Response only.'));
    if(a.build!=='business')plan.services.push(service('Approval UI + Step Functions callback task','people','Let an authorized person approve or reject a specific proposed action.','A separate callback Task sends the proposal to your review application; the backend validates the decision and resumes the workflow using the protected task token.','Define expiry, rejection and resume behavior. Keep callback tokens on the server and out of model prompts.','approval','For reviewed actions'));
  }
  if(['read','draft'].includes(a.authority)&&r.pattern==='automation')plan.flow[2]=task('Compute and validate the result','Run the bounded calculation or read query. Preserve source identifiers and explicit errors; keep business mutation endpoints unavailable.');
  if(a.authority==='review')plan.flow.push(task('Approve the exact proposal, then execute','Validate business rules first. Bind the authorized reviewer, proposal version and expiry to a separate write step; reconcile uncertain results before retrying.'));
  if(a.authority==='auto')plan.flow.push(task('Execute within pre-authorized limits','Enforce allowed resources, reversible change limits and a stable operation key in code. Verify the downstream outcome and exercise rollback or compensation. Escalate anything outside those limits.'));
  if(['read','draft'].includes(a.authority))plan.flow[plan.flow.length-1]=task('Return the result within your authority',a.authority==='read'?'Return evidence-backed information to the caller. Keep business write APIs unavailable even if a source document or tool result asks the system to act.':'Return a proposal or draft with evidence and unresolved questions. A person performs any business action outside this pilot; do not silently add an execution tool.');
  plan.nodes[plan.nodes.length-1]=[a.authority==='review'?'people':'check',({read:'Verified information',draft:'Evidence + draft',review:'Approve → execute',auto:'Bounded write + verify'})[a.authority]];
  plan.considerations.push(...r.prerequisites.map(detail=>task('Pilot prerequisite',detail)),...r.warnings.map(detail=>task('Scope to resolve',detail)));
  plan.considerations.push(task('Identity, evidence and instruction boundaries','Derive access from the signed-in user and approved workload role. Source content is evidence, not permission. Restrict source scope before retrieval or tool execution and keep credentials outside model context.'));
  if(['agent','hybrid','multi'].includes(r.pattern)&&a.build!=='business'){
    plan.services.push(service('AgentCore Policy + Gateway','agentcore','Enforce deterministic tool permissions outside the model, alongside caller identity and adapter checks.','Attach a policy engine to the Gateway and test Cedar policies against tool arguments and caller scope. Gateway policy does not control calls that bypass the gateway. Keep business validation and approval state in the application.','Test an allowed call, a denied resource, an excessive amount and a missing identity before allowing any write tool.','policy','Tool authorization'));
    plan.services.push(service('AgentCore Observability + CloudWatch','cloudwatch','Review the actual sequence of model and tool calls and relate it to task outcomes.','Enable the required tracing and correlate request, session and business operation IDs. Set log redaction and retention for sensitive evidence.','Inspect a success trace and a deliberately failed tool call before the first user pilot.','trace','From the first pilot'));
    plan.considerations.push(task('Bound work and plan the handoff','Set task time and tool-call limits, define which failures can retry, and preserve unresolved questions for an operator. For Step Functions → InvokeHarness, the Task has a maximum of 15 minutes (900 seconds), even with a larger TimeoutSeconds. Configure the harness timeout at or below that ceiling. Stopping or timing out the workflow does not stop the harness. Only the final assistant text is returned; parse and validate its explicit result schema. Tool and reasoning blocks are omitted, so retain traces separately. Use a separate asynchronous orchestration design for longer work.'));
  } else plan.considerations.push(task('Trace the complete request','Record a correlation ID, source or prompt version, validation outcome, elapsed time and cost inputs. Restrict sensitive logging and record enough context for an operator to reproduce a failed case.'));
  plan.considerations.push(task('Measure the tradeoff you selected',r.priority));
  if(a.data.includes('unknown')){
    plan.immediate=task('Identify the source of truth before connecting services','Choose one representative task. With its owner, identify the authoritative source, available interface, allowed audience, refresh needs and retention requirements. Mark inaccessible or missing evidence explicitly.');
    plan.artifact='An approved source inventory and one traceable input-to-output example.';
    plan.considerations.unshift(task('Your data map is still incomplete','The services below are candidates. Do not select a connector, index or query engine until the source inventory establishes which evidence is actually available.'));
  }
  if(a.goal==='execute'&&['read','draft'].includes(a.authority)){
    plan.purpose=`Your current scope supports ${a.authority==='read'?'inspection and explanation':'preparing a proposal for a person'}. No complete library process fits that authority. Build the permitted part first and explicitly assign the execution step to a person or a separately authorized system.`;
    plan.output=a.authority==='read'?'Inspection result with evidence':'Reviewed proposal for a person';
    plan.nodes[plan.nodes.length-1]=['check',plan.output];
  }
  if(a.control==='unknown')plan.considerations.unshift(task('The route is still an assumption','Walk through several real tasks with an operator. Mark fixed decisions and evidence-dependent decisions; only introduce an agent after that exercise identifies a need for adaptive tool choice.'));
  if(!c&&a.authority==='read')plan.output='Verified information with source evidence';
  if(!c&&a.authority==='draft')plan.output='Draft or proposal for a person, with supporting evidence';
  plan.roadmap=[
    task('1 · Define the pilot',`${plan.immediate.detail} Finish with: ${plan.artifact}`),
    task('2 · Build one complete path',a.build==='business'?'Configure one connector, one user group and the target workspace task. Demonstrate the required output before adding more data or automation.':`Connect one input to ${plan.output.toLowerCase()} using the core services in the connection plan. Stub writes during development, retain source references and check the result with the task owner.`),
    task('3 · Exercise the failure paths','Run the acceptance checks below, then add stale evidence, denied access, malformed output, timeouts and duplicate inputs as applicable. Record the expected handoff and compare results to the baseline.'),
    task('4 · Pilot with an owner','Start with a small authorized group or a replay of historical work. Agree success criteria, latency and cost limits, escalation ownership and rollback behavior; expand one source or capability at a time.'),
  ];
  if(a.authority==='read')plan.gates.push('No business records are changed, including through tool side effects.');
  if(a.authority==='draft')plan.gates.push('The output is explicitly a draft; no downstream execution happens automatically.');
  if(a.authority==='review')plan.gates.push('Rejected, expired and mismatched approvals all leave the business action unexecuted.');
  if(a.authority==='auto')plan.gates.push('Routine changes stay inside configured limits, and a tested recovery path exists.');
  plan.readings=[...new Set([...plan.reads,...plan.services.map(s=>s.doc),...(a.data.includes('structured')&&a.build!=='business'?[c?.id==='051'?'lambdaTools':'query']:[]),...(a.data.includes('browser')&&a.build!=='business'?['browser']:[])])].map((key,i)=>({key,title:DOCS[key][0],url:DOCS[key][1],why:({kb:'Configure the evidence retrieval foundation.',retrieve:'Understand the request, response and citation contract.',sync:'Plan how source changes reach the index.',iam:'Define the identities and permissions before widening access.',workflow:'Build the deterministic route and Task boundaries.',model:'Wire the model call into a controlled workflow.',retry:'Specify retryable failures and explicit recovery paths.',ledger:'Implement conditional business-state transitions.',runtime:'Choose who owns the orchestration loop.',harness:'Create the smallest runnable agent.',gateway:'Connect authenticated tool endpoints.',trace:'Inspect what the agent actually did.',hybrid:'Wire the agent Task and understand its limits.',lambdaTools:'Define tool schemas and adapter behavior.',approval:'Implement a separate human approval wait.',textract:'Inspect extracted fields and confidence values.',quick:'Check native workspace features against this case.',qbusiness:'Understand the availability change and migration gaps.',query:'Constrain query inputs and inspect actual execution.',browser:'Understand session behavior before adding UI automation.'})[key]||'Use this guide for the next implementation decision.',order:i+1}));
  return plan;
}
