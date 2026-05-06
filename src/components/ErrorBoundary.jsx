import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebForge Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="eb-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button className="cmd-btn" onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
            <span className="btn-t">Reload Page</span>
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
