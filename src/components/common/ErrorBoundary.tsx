import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
    
    // In production, you would send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Sanitize error data before logging
    const sanitizedError = {
      message: error.message,
      stack: error.stack?.substring(0, 1000), // Limit stack trace size
      componentStack: errorInfo.componentStack?.substring(0, 1000),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Only log in production and don't expose sensitive information
    if (!import.meta.env.DEV) {
      // Replace with your error logging service
      // errorLogger.log(sanitizedError)
      console.warn('Error logged:', sanitizedError.message)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  Something went wrong
                </h1>
                
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>

                {import.meta.env.DEV && this.state.error && (
                  <details className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 text-sm">
                    <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">
                      Error Details (Development Only)
                    </summary>
                    <pre className="text-red-700 dark:text-red-300 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Refresh Page
                  </button>
                  <button
                    onClick={() => this.setState({ hasError: false })}
                    className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}