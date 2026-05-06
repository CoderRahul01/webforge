import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '🔍', title: 'X-Ray Extraction', desc: 'Extract HTML, Markdown, JSON, design tokens, and assets from any URL in seconds', color: '#6366f1' },
  { icon: '🤖', title: 'AI Agent', desc: 'Describe what you want in plain English. Watch it happen live with browser preview', color: '#a855f7' },
  { icon: '🌐', title: 'Web Search', desc: 'Search the web with geo-targeting and extract from results in one click', color: '#06b6d4' },
  { icon: '🖥️', title: 'Remote Browser', desc: 'Launch cloud browser sessions for interactive scraping and debugging', color: '#22c55e' },
  { icon: '📊', title: 'Compare', desc: 'Side-by-side website analysis — compare design tokens, content, and structure', color: '#f59e0b' },
  { icon: '📋', title: 'History & Export', desc: 'Track all extractions with full history. Export as JSON packages', color: '#ef4444' },
]

const stats = [
  { value: '4', label: 'TinyFish APIs' },
  { value: '6', label: 'Modules' },
  { value: '3', label: 'Output Formats' },
  { value: '∞', label: 'Websites' },
]

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">⚡ Powered by TinyFish AI</div>
        <h1 className="hero-title">
          Turn any website into<br />
          <span className="gradient-text-lg">structured intelligence</span>
        </h1>
        <p className="hero-sub">
          Extract content, analyze designs, automate workflows, and monitor competitors.<br />
          One platform. Any website. Powered by AI.
        </p>
        <div className="hero-actions">
          <button className="hero-btn primary" onClick={() => nav('/xray')}>
            Start Extracting →
          </button>
          <button className="hero-btn secondary" onClick={() => nav('/agent')}>
            Try AI Agent
          </button>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Everything you need to understand any website</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ '--fc': f.color }}>
              <div className="fc-icon">{f.icon}</div>
              <h3 className="fc-title">{f.title}</h3>
              <p className="fc-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to extract intelligence?</h2>
          <p>Start with X-Ray extraction or let the AI Agent do it for you.</p>
          <button className="hero-btn primary" onClick={() => nav('/xray')}>Get Started Free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>WebForge © {new Date().getFullYear()} · Built with TinyFish AI</p>
      </footer>
    </div>
  )
}
