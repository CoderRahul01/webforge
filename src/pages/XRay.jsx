import { useState, useEffect } from 'react'
import { fetchExtractAll, fetchExtract } from '../lib/api'
import { useToast } from '../components/Toast'
import { CardSkeleton } from '../components/Skeleton'

function escHtml(s) {
  if (typeof s !== 'string') return JSON.stringify(s, null, 2)
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function analyzeTokens(html) {
  if (!html) return null
  const colors = [...new Set((html.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g) || []))].slice(0, 30)
  const fonts = [...new Set((html.match(/font-family:\s*([^;}"]+)/gi) || []).map(f => f.replace(/font-family:\s*/i, '').trim()))].slice(0, 10)
  const sizes = [...new Set((html.match(/font-size:\s*([^;}"]+)/gi) || []).map(s => s.replace(/font-size:\s*/i, '').trim()))].slice(0, 15)
  const radii = [...new Set((html.match(/border-radius:\s*([^;}"]+)/gi) || []).map(r => r.replace(/border-radius:\s*/i, '').trim()))].slice(0, 10)
  return { colors, fonts, sizes, radii }
}

export default function XRay({ addHistory }) {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('all')
  const [links, setLinks] = useState(true)
  const [images, setImages] = useState(true)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('html')
  const [error, setError] = useState('')
  const toast = useToast()

  // Pick up URL from Search page redirect
  useEffect(() => {
    const saved = sessionStorage.getItem('wf_xray_url')
    if (saved) { setUrl(saved); sessionStorage.removeItem('wf_xray_url') }
  }, [])

  async function extract() {
    if (!url) return setError('Enter a URL')
    setLoading(true); setError(''); setData(null)
    try {
      let result
      if (format === 'all') {
        result = await fetchExtractAll(url, links, images)
        result._html = result.html?.results?.[0]
        result._md = result.markdown?.results?.[0]
        result._json = result.json?.results?.[0]
      } else {
        const r = await fetchExtract(url, format, links, images)
        result = { [`_${format === 'markdown' ? 'md' : format}`]: r.results?.[0] }
      }
      result._tokens = analyzeTokens(result._html?.text || '')
      const primary = result._html || result._md || result._json
      result._meta = primary ? { title: primary.title, url: primary.final_url || primary.url || url, description: primary.description, language: primary.language } : null
      setData(result)
      addHistory({ type: 'xray', title: result._meta?.title || url, url })
      toast.success(`Extracted ${result._meta?.title || url}`)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function copyText(text) {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2))
    toast.success('Copied to clipboard')
  }

  function download(name, content, mime = 'text/plain') {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], { type: mime }))
    a.download = name; a.click(); URL.revokeObjectURL(a.href)
  }

  const quickUrls = ['https://clearform-3v4.caffeine.xyz/dpa', 'https://stripe.com', 'https://linear.app']

  return (
    <div className="page-animate">
      <div className="module-header">
        <h1 className="module-title">X-Ray <span className="gradient-text">Extraction</span></h1>
        <p className="module-sub">Deep-extract content, design tokens, and assets from any website</p>
      </div>

      <div className="command-bar">
        <div className="command-bar-inner">
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste any website URL…"
            onKeyDown={e => e.key === 'Enter' && extract()} />
          <button className={`cmd-btn${loading ? ' loading' : ''}`} onClick={extract} disabled={loading}>
            <span className="btn-t">Extract</span><span className="btn-l" />
          </button>
        </div>
        <div className="command-options">
          <div className="opt-group">
            <label className="opt-label">Format</label>
            <div className="pill-group">
              {['all', 'html', 'markdown', 'json'].map(f => (
                <button key={f} className={`pill${format === f ? ' active' : ''}`} onClick={() => setFormat(f)}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
          </div>
          <label className="cb-wrap"><input type="checkbox" checked={links} onChange={e => setLinks(e.target.checked)} /> Links</label>
          <label className="cb-wrap"><input type="checkbox" checked={images} onChange={e => setImages(e.target.checked)} /> Images</label>
        </div>
      </div>

      <div className="quick-row">
        <span className="qr-label">Quick:</span>
        {quickUrls.map(u => <button key={u} className="qr-btn" onClick={() => setUrl(u)}>{new URL(u).hostname}</button>)}
      </div>

      {error && <div className="inline-error">{error}</div>}

      {loading && (
        <>
          <div className="progress-wrap"><div className="pbar-track"><div className="pbar-fill" style={{ width: '60%' }} /></div></div>
          <CardSkeleton />
        </>
      )}

      {data && (
        <>
          {data._meta && (
            <div className="meta-card">
              <h2 className="meta-title">{data._meta.title || 'Untitled'}</h2>
              <p className="meta-url">{data._meta.url}</p>
              <div className="meta-details">
                {data._meta.language && <div className="detail"><span className="detail-label">Language</span><span className="detail-value">{data._meta.language}</span></div>}
                {data._meta.description && <div className="detail"><span className="detail-label">Description</span><span className="detail-value">{data._meta.description.slice(0, 120)}</span></div>}
              </div>
            </div>
          )}

          <div className="tabs-wrap">
            <div className="tabs-nav">
              {['html', 'md', 'json', 'design', 'assets'].map(t => (
                <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'md' ? 'Markdown' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="tab-body">
              {tab === 'html' && (
                <div className="tpanel-content">
                  <div className="tp-bar"><span>{data._html ? `${String(data._html.text || '').length.toLocaleString()} chars` : 'N/A'}</span>
                    <div><button className="ic" onClick={() => copyText(data._html?.text)}>📋</button> <button className="ic" onClick={() => download('extract.html', data._html?.text, 'text/html')}>⬇️</button></div>
                  </div>
                  <pre className="code-block"><code dangerouslySetInnerHTML={{ __html: escHtml(data._html?.text || 'No HTML data') }} /></pre>
                </div>
              )}
              {tab === 'md' && (
                <div className="tpanel-content">
                  <div className="tp-bar"><span>{data._md ? `${String(data._md.text || '').length.toLocaleString()} chars` : 'N/A'}</span>
                    <div><button className="ic" onClick={() => copyText(data._md?.text)}>📋</button> <button className="ic" onClick={() => download('extract.md', data._md?.text)}>⬇️</button></div>
                  </div>
                  <pre className="code-block"><code dangerouslySetInnerHTML={{ __html: escHtml(data._md?.text || 'No Markdown data') }} /></pre>
                </div>
              )}
              {tab === 'json' && (
                <div className="tpanel-content">
                  <div className="tp-bar"><span>Structured document tree</span>
                    <div><button className="ic" onClick={() => copyText(data._json?.text)}>📋</button> <button className="ic" onClick={() => download('extract.json', data._json?.text, 'application/json')}>⬇️</button></div>
                  </div>
                  <pre className="code-block"><code dangerouslySetInnerHTML={{ __html: escHtml(data._json?.text || 'No JSON data') }} /></pre>
                </div>
              )}
              {tab === 'design' && data._tokens && (
                <div className="design-grid">
                  {data._tokens.colors.length > 0 && (
                    <div className="tok-section"><div className="tok-header">🎨 Colors ({data._tokens.colors.length})</div>
                      <div className="tok-body">{data._tokens.colors.map((c, i) => <div key={i} className="color-chip"><div className="color-sw" style={{ background: c }} />{c}</div>)}</div>
                    </div>
                  )}
                  {data._tokens.fonts.length > 0 && (
                    <div className="tok-section"><div className="tok-header">🔤 Fonts ({data._tokens.fonts.length})</div>
                      <div className="tok-body">{data._tokens.fonts.map((f, i) => <div key={i} className="font-chip">{f}</div>)}</div>
                    </div>
                  )}
                  {data._tokens.sizes.length > 0 && (
                    <div className="tok-section"><div className="tok-header">📏 Font Sizes</div>
                      <div className="tok-body"><ul className="tok-list">{data._tokens.sizes.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                    </div>
                  )}
                  {data._tokens.radii.length > 0 && (
                    <div className="tok-section"><div className="tok-header">⬛ Border Radius</div>
                      <div className="tok-body"><ul className="tok-list">{data._tokens.radii.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                    </div>
                  )}
                </div>
              )}
              {tab === 'assets' && (() => {
                const p = data._html || data._md || data._json
                const al = p?.links || []; const il = p?.image_links || []
                return (
                  <div className="assets-wrap">
                    {il.length > 0 && <div className="asset-sec"><div className="asset-title">🖼️ Images <span className="asset-count">{il.length}</span></div>
                      <div className="img-grid">{il.map((img, i) => <div key={i} className="img-card"><img src={img} alt="" loading="lazy" onError={e => { e.target.style.display = 'none' }} /><div className="img-url">{img}</div></div>)}</div>
                    </div>}
                    {al.length > 0 && <div className="asset-sec"><div className="asset-title">🔗 Links <span className="asset-count">{al.length}</span></div>
                      <ul className="link-list">{al.slice(0, 80).map((l, i) => <li key={i}><a href={typeof l === 'string' ? l : l.url} target="_blank" rel="noopener noreferrer">{typeof l === 'string' ? l : l.text || l.url}</a></li>)}</ul>
                    </div>}
                    {!il.length && !al.length && <p className="empty-state">No assets found</p>}
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="dl-bar">
            <button className="dl-all-btn" onClick={() => {
              if (data._html?.text) download('extract.html', data._html.text, 'text/html')
              if (data._md?.text) setTimeout(() => download('extract.md', data._md.text), 200)
              if (data._json?.text) setTimeout(() => download('extract.json', data._json.text, 'application/json'), 400)
              if (data._tokens) setTimeout(() => download('design-tokens.json', data._tokens, 'application/json'), 600)
            }}>⬇️ Download Full Package</button>
          </div>
        </>
      )}
    </div>
  )
}
