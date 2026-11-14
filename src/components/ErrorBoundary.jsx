import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="mx-auto max-w-2xl px-4 py-16 text-center"
        >
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
