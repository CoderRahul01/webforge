import { NavLink } from 'react-router-dom'

const links = [
  { to: '/xray', label: 'X-Ray', icon: 'M11 3a8 8 0 100 16 8 8 0 000-16zm0 0l10 10m-10-5v5m-3-3h6' },
  { to: '/agent', label: 'Agent', icon: 'M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a4 4 0 00-4-4z' },
  { to: '/search', label: 'Search', icon: 'M21 21l-5.35-5.35M11 3a8 8 0 100 16 8 8 0 000-16z' },
  { to: '/browser', label: 'Browser', icon: 'M2 3h20v14H2zM8 21h8M12 17v4' },
  { to: '/compare', label: 'Compare', icon: 'M2 4h8v16H2zM14 4h8v16h-8zM12 2v20' },
  { to: '/history', label: 'History', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2' },
]

export default function Sidebar({ apiOk }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
          <circle cx="16" cy="16" r="13" stroke="url(#sg)" strokeWidth="2.5"/>
          <path d="M10 16l4 4 8-8" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <defs><linearGradient id="sg" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
        </svg>
        <span>WebForge</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={l.icon}/>
            </svg>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="api-status">
          <span className={`status-dot ${apiOk === true ? 'ok' : apiOk === false ? 'err' : ''}`}/>
          <span className="status-text">{apiOk === true ? 'API Connected' : apiOk === false ? 'API Key Missing' : 'Checking…'}</span>
        </div>
      </div>
    </aside>
  )
}
