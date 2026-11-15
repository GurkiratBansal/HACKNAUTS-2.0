// FRESH:FILE  Catches render errors and shows a recovery screen instead of a blank page.
// FRESH:AREA  Layout

import { Component } from 'react'

// FRESH:Layout  Class component that catches render errors and shows a recovery screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
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
            onClick={() => {
              try {
                localStorage.clear()
              } finally {
                window.location.reload()
              }
            }}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Clear saved data and reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
