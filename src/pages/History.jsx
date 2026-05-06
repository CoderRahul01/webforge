export default function History({ items }) {
  const typeLabels = { xray: '🔍 X-Ray', agent: '🤖 Agent', search: '🌐 Search', browser: '🖥️ Browser', compare: '📊 Compare' }

  return (
    <div className="page-animate">
      <div className="module-header">
        <h1 className="module-title">Extraction <span className="gradient-text">History</span></h1>
        <p className="module-sub">All your past extractions, searches, and agent runs</p>
      </div>
      <div className="history-list">
        {items.length === 0 && <p className="empty-state">No history yet. Run an extraction to get started.</p>}
        {items.map(item => (
          <div key={item.id} className="hist-card">
            <div className="hist-info">
              <div className="hist-title">{item.title}</div>
              <div className="hist-url">{item.url}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="hist-type">{typeLabels[item.type] || item.type}</span>
              <span className="hist-time">{new Date(item.time).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="dl-bar" style={{ marginTop: '20px' }}>
          <button className="ic" onClick={() => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }))
            a.download = 'webforge-history.json'; a.click()
          }}>⬇️ Export History as JSON</button>
        </div>
      )}
    </div>
  )
}
