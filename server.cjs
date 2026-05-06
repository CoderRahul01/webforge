require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In production, serve built React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

const API_KEY = process.env.TINYFISH_API_KEY;
const FETCH_URL = 'https://api.fetch.tinyfish.ai';
const SEARCH_URL = 'https://api.search.tinyfish.ai';
const AGENT_URL = 'https://agent.tinyfish.ai/v1/automation';
const BROWSER_URL = 'https://api.browser.tinyfish.ai';
const hdrs = () => ({ 'X-API-Key': API_KEY, 'Content-Type': 'application/json' });

/* ── Health ─────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!API_KEY && !API_KEY.includes('your_api_key') });
});

/* ── Fetch API — single format ──────────────────────────── */
app.post('/api/fetch', async (req, res) => {
  try {
    const { url, format = 'html', links = true, image_links = true } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const r = await axios.post(FETCH_URL, { urls: [url], format, links, image_links }, { headers: hdrs(), timeout: 120000 });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── Fetch API — all formats ────────────────────────────── */
app.post('/api/fetch/all', async (req, res) => {
  try {
    const { url, links = true, image_links = true } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const h = hdrs();
    const [html, md, json] = await Promise.allSettled([
      axios.post(FETCH_URL, { urls: [url], format: 'html', links, image_links }, { headers: h, timeout: 120000 }),
      axios.post(FETCH_URL, { urls: [url], format: 'markdown', links, image_links }, { headers: h, timeout: 120000 }),
      axios.post(FETCH_URL, { urls: [url], format: 'json', links, image_links }, { headers: h, timeout: 120000 }),
    ]);
    const ex = s => s.status === 'fulfilled' ? s.value.data : { error: s.reason?.message };
    res.json({ html: ex(html), markdown: ex(md), json: ex(json) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── Search API ─────────────────────────────────────────── */
app.get('/api/search', async (req, res) => {
  try {
    const { query, location, language, page } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const params = new URLSearchParams({ query });
    if (location) params.append('location', location);
    if (language) params.append('language', language);
    if (page) params.append('page', page);
    const r = await axios.get(`${SEARCH_URL}?${params}`, { headers: hdrs(), timeout: 30000 });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── Agent API — SSE streaming ──────────────────────────── */
app.post('/api/agent/run', async (req, res) => {
  try {
    const { url, goal, output_schema, browser_profile, proxy_config } = req.body;
    if (!url || !goal) return res.status(400).json({ error: 'URL and goal required' });
    const payload = { url, goal };
    if (output_schema) payload.output_schema = output_schema;
    if (browser_profile) payload.browser_profile = browser_profile;
    if (proxy_config) payload.proxy_config = proxy_config;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const response = await axios.post(`${AGENT_URL}/run-sse`, payload, {
      headers: hdrs(), responseType: 'stream', timeout: 300000,
    });
    response.data.on('data', c => res.write(c));
    response.data.on('end', () => res.end());
    response.data.on('error', err => {
      res.write(`data: ${JSON.stringify({ type: 'ERROR', error: err.message })}\n\n`);
      res.end();
    });
    req.on('close', () => response.data.destroy());
  } catch (e) {
    if (!res.headersSent) res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message });
  }
});

/* ── Agent — sync run ───────────────────────────────────── */
app.post('/api/agent/run-sync', async (req, res) => {
  try {
    const { url, goal, output_schema, browser_profile, proxy_config } = req.body;
    if (!url || !goal) return res.status(400).json({ error: 'URL and goal required' });
    const payload = { url, goal };
    if (output_schema) payload.output_schema = output_schema;
    if (browser_profile) payload.browser_profile = browser_profile;
    if (proxy_config) payload.proxy_config = proxy_config;
    const r = await axios.post(`${AGENT_URL}/run`, payload, { headers: hdrs(), timeout: 300000 });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── Agent — run status ─────────────────────────────────── */
app.get('/api/agent/runs/:id', async (req, res) => {
  try {
    const r = await axios.get(`https://agent.tinyfish.ai/v1/runs/${req.params.id}`, { headers: hdrs(), timeout: 15000 });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── Agent — cancel ─────────────────────────────────────── */
app.post('/api/agent/runs/:id/cancel', async (req, res) => {
  try {
    const r = await axios.post(`https://agent.tinyfish.ai/v1/runs/${req.params.id}/cancel`, {}, { headers: hdrs(), timeout: 15000 });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── Browser — create session ───────────────────────────── */
app.post('/api/browser/session', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const r = await axios.post(BROWSER_URL, { url, timeout_seconds: 300 }, { headers: hdrs(), timeout: 60000 });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── Browser — terminate session ────────────────────────── */
app.delete('/api/browser/session/:sessionId', async (req, res) => {
  try {
    await axios.delete(`${BROWSER_URL}/${req.params.sessionId}`, { headers: { 'X-API-Key': API_KEY }, timeout: 15000 });
    res.status(204).send();
  } catch (e) { res.status(e.response?.status || 500).json({ error: e.response?.data?.error || e.message }); }
});

/* ── SPA fallback (production) ──────────────────────────── */
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`\n⚡ WebForge API → http://localhost:${PORT}\n`));
