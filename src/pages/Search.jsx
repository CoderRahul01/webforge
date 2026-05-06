import { useState } from 'react'
import { searchWeb } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Search({ addHistory }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function run() {
    if (!query) return setError('Enter a search query')
    setLoading(true); setError('')
    try {
      const data = await searchWeb(query, location, language)
      setResults(data)
      addHistory({ type: 'search', title: query, url: `search:${query}` })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function extractUrl(url) {
    nav('/xray')
    // Store in sessionStorage so XRay can pick it up
    sessionStorage.setItem('wf_xray_url', url)
  }

  return (
    <div className="page-animate">
      <div className="module-header">
        <h1 className="module-title">Web <span className="gradient-text">Search</span></h1>
        <p className="module-sub">Search the web and extract from any result</p>
      </div>
      <div className="command-bar">
        <div className="command-bar-inner">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search anything…" onKeyDown={e => e.key === 'Enter' && run()} />
          <button className={`cmd-btn${loading ? ' loading' : ''}`} onClick={run} disabled={loading}>
            <span className="btn-t">Search</span><span className="btn-l" />
          </button>
        </div>
        <div className="command-options">
          <div className="opt-group"><label className="opt-label">Region</label>
            <select value={location} onChange={e => setLocation(e.target.value)}><option value="">Global</option><option value="US">🇺🇸 US</option><option value="GB">🇬🇧 UK</option><option value="DE">🇩🇪 DE</option><option value="FR">🇫🇷 FR</option><option value="JP">🇯🇵 JP</option></select>
          </div>
          <div className="opt-group"><label className="opt-label">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="fr">French</option><option value="de">German</option><option value="ja">Japanese</option></select>
          </div>
        </div>
      </div>
      {error && <div className="inline-error">{error}</div>}
      {results && (
        <div className="search-results">
          <p className="results-count">{results.total_results} results for &quot;{results.query}&quot;</p>
          {results.results?.map((r, i) => (
            <div key={i} className="sr-card">
              <div className="sr-site">{r.site_name || new URL(r.url).hostname}</div>
              <div className="sr-title"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a></div>
              <div className="sr-snippet">{r.snippet}</div>
              <div className="sr-url">{r.url}</div>
              <div className="sr-actions">
                <button className="ic sr-extract" onClick={() => extractUrl(r.url)}>🔍 X-Ray this</button>
                <a className="ic sr-extract" href={r.url} target="_blank" rel="noopener noreferrer">↗ Open</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
