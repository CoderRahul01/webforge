import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import XRay from './pages/XRay'
import Agent from './pages/Agent'
import Search from './pages/Search'
import BrowserSession from './pages/BrowserSession'
import Compare from './pages/Compare'
import History from './pages/History'
import { useState, useEffect } from 'react'
import { fetchHealth } from './lib/api'

export default function App() {
  const [apiOk, setApiOk] = useState(null)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wf_history') || '[]') } catch { return [] }
  })
  const location = useLocation()
  const isLanding = location.pathname === '/'

  const addHistory = (entry) => {
    const updated = [{ ...entry, id: Date.now(), time: new Date().toISOString() }, ...history].slice(0, 100)
    setHistory(updated)
    localStorage.setItem('wf_history', JSON.stringify(updated))
  }

  useEffect(() => {
    fetchHealth().then(d => setApiOk(d.hasApiKey)).catch(() => setApiOk(false))
  }, [])

  if (isLanding) {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <Landing />
        </ToastProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar apiOk={apiOk} />
          <main className="main-content">
            <Routes>
              <Route path="/xray" element={<XRay addHistory={addHistory} />} />
              <Route path="/agent" element={<Agent addHistory={addHistory} />} />
              <Route path="/search" element={<Search addHistory={addHistory} />} />
              <Route path="/browser" element={<BrowserSession addHistory={addHistory} />} />
              <Route path="/compare" element={<Compare addHistory={addHistory} />} />
              <Route path="/history" element={<History items={history} />} />
              <Route path="*" element={<Navigate to="/xray" replace />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}
