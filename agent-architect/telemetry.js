// Events describe completed UI actions, never personal data or questionnaire answers.
const events = new Set(['aa_view', 'aa_finder_start', 'aa_recommendation',
  'aa_case_view', 'aa_brief_download', 'aa_mission_start', 'aa_mission_end',
  'aa_replay_copy', 'aa_card_download']);
const fields = new Set(['view', 'pattern', 'case_id', 'mission_id', 'strategy',
  'practice', 'success', 'objectives_met', 'method']);
export function track(name, parameters = {}) {
  if (!events.has(name) || !window.__buildWithAwsAnalytics || typeof window.gtag !== 'function') return;
  const safe = {send_to: window.__buildWithAwsAnalytics, tool_name: 'agent_architect'};
  for (const [key, value] of Object.entries(parameters)) {
    if (fields.has(key) && (typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(value)))) safe[key] = value;
  }
  window.gtag('event', name, safe);
}

// Keep acquisition/linker parameters while discarding replay payloads on navigation.
export function routeUrl(hash = '') {
  const url = new URL(location.href);
  for (const key of [...url.searchParams.keys()]) {
    if (!['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', '_gl'].includes(key)) url.searchParams.delete(key);
  }
  return url.pathname + url.search + hash;
}

export function subscribeCard(placement) {
  return `<aside class="subscribe-card" aria-label="Build With AWS newsletter"><div><p class="eyebrow">KEEP BUILDING WITH AWS</p><h3>Understand the decisions behind the design.</h3><p>Get practical AWS architecture breakdowns and hands-on projects in the free Build With AWS newsletter.</p></div><a class="button primary" href="https://buildwithaws.substack.com/subscribe" target="_blank" rel="noopener" data-analytics-id="aa_${placement}_subscribe" data-analytics-intent="subscribe">Subscribe free ↗</a></aside>`;
}
