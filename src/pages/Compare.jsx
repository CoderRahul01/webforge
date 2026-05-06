import { useState } from 'react'
import { fetchExtractAll } from '../lib/api'

function analyzeTokens(html) {
  if (!html) return { colors: [], fonts: [], sizes: [] }
  return {
    colors: [...new Set((html.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g) || []))].slice(0, 20),
    fonts: [...new Set((html.match(/font-family:\s*([^;}"]+)/gi) || []).map(f => f.replace(/font-family:\s*/i, '').trim()))].slice(0, 8),
    sizes: [...new Set((html.match(/font-size:\s*([^;}"]+)/gi) || []).map(s => s.replace(/font-size:\s*/i, '').trim()))].slice(0, 10),
  }
}

export default function Compare({ addHistory }) {
  const [urlA, setUrlA] = useState('')
  const [urlB, setUrlB] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  async function run() {
    if (!urlA || !urlB) return setError('Both URLs required')
    setLoading(true); setError(''); setData(null)
    try {
      const [a, b] = await Promise.all([fetchExtractAll(urlA), fetchExtractAll(urlB)])
      const pa = a.html?.results?.[0]; const pb = b.html?.results?.[0]
      setData({
        a: { meta: pa, tokens: analyzeTokens(pa?.text) },
        b: { meta: pb, tokens: analyzeTokens(pb?.text) },
      })
      addHistory({ type: 'compare', title: `${new URL(urlA).hostname} vs ${new URL(urlB).hostname}`, url: urlA })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="page-animate">
      <div className="module-header">
        <h1 className="module-title">Side-by-Side <span className="gradient-text">Compare</span></h1>
        <p className="module-sub">Compare two websites head-to-head — design tokens, content, structure</p>
      </div>
      <div className="compare-inputs">
        <div className="compare-col">
          <label className="opt-label">Website A</label>
          <input className="compare-input" type="url" value={urlA} onChange={e => setUrlA(e.target.value)} placeholder="https://site-a.com" />
        </div>
        <div className="compare-vs">VS</div>
        <div className="compare-col">
          <label className="opt-label">Website B</label>
          <input className="compare-input" type="url" value={urlB} onChange={e => setUrlB(e.target.value)} placeholder="https://site-b.com" />
        </div>
      </div>
      <button className={`cmd-btn compare-btn${loading ? ' loading' : ''}`} onClick={run} disabled={loading}>
        <span className="btn-t">Compare</span><span className="btn-l" />
      </button>
      {error && <div className="inline-error">{error}</div>}
      {loading && <div className="progress-wrap"><div className="pbar-track"><div className="pbar-fill" style={{ width: '50%' }} /></div></div>}
      {data && (
        <div className="compare-grid">
          {[{ side: data.a, url: urlA }, { side: data.b, url: urlB }].map((s, i) => (
            <div key={i} className="compare-side">
              <h3>{s.side.meta?.title || new URL(s.url).hostname}</h3>
              <p style={{ fontSize: '.72rem', color: 'var(--text4)', marginBottom: '12px' }}>{s.side.meta?.description?.slice(0, 100)}</p>
              {s.side.tokens.colors.length > 0 && (
                <div className="tok-section" style={{ marginBottom: '12px' }}>
                  <div className="tok-header">🎨 Colors ({s.side.tokens.colors.length})</div>
                  <div className="tok-body">{s.side.tokens.colors.map((c, j) => <div key={j} className="color-chip"><div className="color-sw" style={{ background: c }} />{c}</div>)}</div>
                </div>
              )}
              {s.side.tokens.fonts.length > 0 && (
                <div className="tok-section" style={{ marginBottom: '12px' }}>
                  <div className="tok-header">🔤 Fonts</div>
                  <div className="tok-body">{s.side.tokens.fonts.map((f, j) => <div key={j} className="font-chip">{f}</div>)}</div>
                </div>
              )}
              {s.side.tokens.sizes.length > 0 && (
                <div className="tok-section">
                  <div className="tok-header">📏 Sizes</div>
                  <div className="tok-body"><ul className="tok-list">{s.side.tokens.sizes.map((sz, j) => <li key={j}>{sz}</li>)}</ul></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
