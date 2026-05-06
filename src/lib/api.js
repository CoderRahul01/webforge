const BASE = '';

export async function fetchHealth() {
  const r = await fetch(`${BASE}/api/health`);
  return r.json();
}

export async function fetchExtract(url, format = 'html', links = true, imageLinks = true) {
  const r = await fetch(`${BASE}/api/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, format, links, image_links: imageLinks }),
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Fetch failed');
  return r.json();
}

export async function fetchExtractAll(url, links = true, imageLinks = true) {
  const r = await fetch(`${BASE}/api/fetch/all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, links, image_links: imageLinks }),
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Fetch failed');
  return r.json();
}

export async function searchWeb(query, location, language, page) {
  const params = new URLSearchParams({ query });
  if (location) params.append('location', location);
  if (language) params.append('language', language);
  if (page) params.append('page', page);
  const r = await fetch(`${BASE}/api/search?${params}`);
  if (!r.ok) throw new Error((await r.json()).error || 'Search failed');
  return r.json();
}

export function agentRunSSE(url, goal, opts = {}) {
  const payload = { url, goal };
  if (opts.browser_profile) payload.browser_profile = opts.browser_profile;
  if (opts.proxy_config) payload.proxy_config = opts.proxy_config;
  if (opts.output_schema) payload.output_schema = opts.output_schema;

  return fetch(`${BASE}/api/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function agentRunSync(url, goal, opts = {}) {
  const payload = { url, goal, ...opts };
  const r = await fetch(`${BASE}/api/agent/run-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Agent failed');
  return r.json();
}

export async function browserCreateSession(url) {
  const r = await fetch(`${BASE}/api/browser/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Session failed');
  return r.json();
}

export async function browserDeleteSession(sessionId) {
  const r = await fetch(`${BASE}/api/browser/session/${sessionId}`, { method: 'DELETE' });
  if (!r.ok && r.status !== 204) throw new Error('Delete failed');
}
