import { useState, useRef } from 'react'
import { agentRunSSE } from '../lib/api'

export default function Agent({ addHistory }) {
  const [url, setUrl] = useState('')
  const [goal, setGoal] = useState('')
  const [profile, setProfile] = useState('lite')
  const [proxy, setProxy] = useState('')
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [streamUrl, setStreamUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const readerRef = useRef(null)

  async function run() {
    if (!url || !goal) return setError('URL and goal are required')
    setLoading(true); setError(''); setEvents([]); setResult(null); setStreamUrl(null)
    try {
      const opts = { browser_profile: profile }
      if (proxy) opts.proxy_config = { enabled: true, type: 'tetra', country_code: proxy }

      const response = await agentRunSSE(url, goal, opts)
      if (!response.ok) { const e = await response.json(); throw new Error(e.error || 'Agent failed') }

      const reader = response.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            setEvents(prev => [...prev, ev])
            if (ev.type === 'STREAMING_URL' && ev.streaming_url) setStreamUrl(ev.streaming_url)
            if (ev.type === 'COMPLETE') {
              setResult(ev.result || ev)
              addHistory({ type: 'agent', title: goal.slice(0, 60), url })
            }
          } catch {}
        }
      }
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="page-animate">
      <div className="module-header">
        <h1 className="module-title">AI <span className="gradient-text">Agent</span></h1>
        <p className="module-sub">Describe what you want — the agent executes it with a live browser preview</p>
      </div>

      <div className="command-bar">
        <div className="command-bar-inner">
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Target URL…" />
        </div>
      </div>
      <div className="agent-goal-wrap">
        <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder={'Describe your goal…\ne.g. Extract all pricing plans. Return as JSON.'} rows={3} />
      </div>
      <div className="agent-options">
        <div className="opt-group">
          <label className="opt-label">Profile</label>
          <select value={profile} onChange={e => setProfile(e.target.value)}><option value="lite">Lite (Fast)</option><option value="stealth">Stealth (Anti-bot)</option></select>
        </div>
        <div className="opt-group">
          <label className="opt-label">Proxy Region</label>
          <select value={proxy} onChange={e => setProxy(e.target.value)}>
            <option value="">None</option><option value="US">🇺🇸 US</option><option value="GB">🇬🇧 UK</option><option value="DE">🇩🇪 DE</option><option value="FR">🇫🇷 FR</option><option value="JP">🇯🇵 JP</option><option value="AU">🇦🇺 AU</option><option value="CA">🇨🇦 CA</option>
          </select>
        </div>
        <button className={`cmd-btn agent-run-btn${loading ? ' loading' : ''}`} onClick={run} disabled={loading}>
          <span className="btn-t">▶ Run Agent</span><span className="btn-l" />
        </button>
      </div>

      {error && <div className="inline-error">{error}</div>}

      {(events.length > 0 || loading) && (
        <div className="agent-split">
          <div className="agent-timeline-col">
            <h3 className="col-title">Timeline</h3>
            <div className="agent-timeline">
              {events.map((ev, i) => (
                <div key={i} className={`tl-event ${ev.type?.toLowerCase() || ''}`}>
                  <span className="tl-type">{ev.type}</span>
                  {ev.purpose && <span>{ev.purpose}</span>}
                  {ev.run_id && !ev.purpose && <span className="tl-id">{ev.run_id}</span>}
                </div>
              ))}
              {loading && <div className="tl-event progress"><span className="tl-type">⏳</span> Working…</div>}
            </div>
          </div>
          <div className="agent-preview-col">
            <h3 className="col-title">Live Preview</h3>
            <div className="preview-frame-wrap">
              {streamUrl ? (
                <iframe className="preview-frame" src={streamUrl} title="Live Preview" />
              ) : (
                <div className="preview-overlay">Waiting for browser stream…</div>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="agent-result-card">
          <h3>✅ Result</h3>
          <pre className="code-block"><code>{JSON.stringify(result, null, 2)}</code></pre>
          <button className="ic" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>📋 Copy Result</button>
        </div>
      )}
    </div>
  )
}
