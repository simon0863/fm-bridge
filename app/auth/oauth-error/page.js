"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OAuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')

  // Define error types and their messages
  const getErrorInfo = (errorCode) => {
    switch (errorCode) {
      case 'callback_failed':
        return {
          title: 'OAuth Callback Failed',
          message: 'There was an error processing your OAuth authentication.',
          details: description || 'Unknown error occurred during OAuth callback.',
          suggestions: [
            'Please try logging in again',
            'Check your internet connection',
            'Contact support if the problem persists'
          ]
        }
      case 'not_implemented':
        return {
          title: 'OAuth Flow Not Implemented',
          message: 'This OAuth flow is not yet fully implemented.',
          details: 'The Microsoft OAuth callback handling is still in development.',
          suggestions: [
            'Try using the username/password login instead',
            'Contact the development team for updates'
          ]
        }
      case 'invalid_callback':
        return {
          title: 'Invalid OAuth Callback',
          message: 'The OAuth callback received invalid parameters.',
          details: 'The authentication provider did not return the expected data.',
          suggestions: [
            'Try logging in again',
            'Clear your browser cache and cookies',
            'Contact support if the problem continues'
          ]
        }
      case 'session_not_found':
        return {
          title: 'OAuth Session Not Found',
          message: 'Your OAuth session could not be found.',
          details: 'The session may have expired or been lost.',
          suggestions: [
            'Try logging in again',
            'Make sure to complete the login process quickly',
            'Contact support if this keeps happening'
          ]
        }
      default:
        return {
          title: 'OAuth Authentication Error',
          message: 'An unexpected error occurred during authentication.',
          details: description || 'Please try again or contact support.',
          suggestions: [
            'Try logging in again',
            'Check your internet connection',
            'Contact support if the problem persists'
          ]
        }
    }
  }

  const errorInfo = getErrorInfo(error)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg 
              className="h-8 w-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {errorInfo.message}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Error Details
          </h2>
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-sm text-gray-700 font-mono break-words">
              {errorInfo.details}
            </p>
          </div>
          
          {error && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                <strong>Error Code:</strong> <code className="bg-gray-100 px-1 rounded">{error}</code>
              </p>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            What you can try:
          </h3>
          <ul className="space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20" className="h-4 w-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-blue-800 text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              Debug Information
            </h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Error:</strong> {error || 'none'}</p>
              <p><strong>Description:</strong> {description || 'none'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
