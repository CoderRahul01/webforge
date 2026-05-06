import { useState } from 'react'
import { browserCreateSession, browserDeleteSession } from '../lib/api'

export default function BrowserSession({ addHistory }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [error, setError] = useState('')

  async function create() {
    if (!url) return setError('Enter a URL')
    setLoading(true); setError('')
    try {
      const data = await browserCreateSession(url)
      setSessions(prev => [{ ...data, url, created: new Date().toISOString() }, ...prev])
      addHistory({ type: 'browser', title: `Session: ${url}`, url })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function kill(sessionId) {
    try {
      await browserDeleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="page-animate">
      <div className="module-header">
        <h1 className="module-title">Remote <span className="gradient-text">Browser</span></h1>
        <p className="module-sub">Launch cloud browser sessions — inspect, extract, or debug any site</p>
      </div>
      <div className="command-bar">
        <div className="command-bar-inner">
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL to open in remote browser…" onKeyDown={e => e.key === 'Enter' && create()} />
          <button className={`cmd-btn${loading ? ' loading' : ''}`} onClick={create} disabled={loading}>
            <span className="btn-t">Launch</span><span className="btn-l" />
          </button>
        </div>
      </div>
      {error && <div className="inline-error">{error}</div>}
      <div className="sessions-list">
        {sessions.length === 0 && <p className="empty-state">No active sessions. Launch one above.</p>}
        {sessions.map(s => (
          <div key={s.session_id} className="session-card">
            <div className="sc-header">
              <span className="sc-id">{s.session_id}</span>
              <button className="sc-kill" onClick={() => kill(s.session_id)}>✕ Terminate</button>
            </div>
            <div className="sc-url">{s.url}</div>
            <div className="sc-links">
              {s.cdp_url && <span className="sc-link" title={s.cdp_url}>CDP: {s.cdp_url.slice(0, 50)}…</span>}
              {s.base_url && <a className="sc-link" href={`${s.base_url}/pages`} target="_blank" rel="noopener noreferrer">DevTools Inspector</a>}
            </div>
            <p style={{ fontSize: '.7rem', color: 'var(--text5)', marginTop: '8px' }}>⏱️ Auto-expires after 1 hour of inactivity</p>
          </div>
        ))}
      </div>
    </div>
  )
}
