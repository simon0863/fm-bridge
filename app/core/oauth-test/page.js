// app/oauth-test/page.js
// This page is used to test the OAuth flow for the FileMaker OAuth service.

"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Content component with useSearchParams()
function OAuthTestContent() {
  const searchParams = useSearchParams()
  const [providersResponse, setProvidersResponse] = useState('')
  const [initiationResponse, setInitiationResponse] = useState('')
  const [sessionsResponse, setSessionsResponse] = useState('')
  const [loading, setLoading] = useState({})
  const [selectedProvider, setSelectedProvider] = useState('')
  const [availableProviders, setAvailableProviders] = useState([])
  const [oauthUrl, setOauthUrl] = useState('')



  const handleTest = async (action, setResponse) => {
    setLoading(prev => ({ ...prev, [action]: true }))
    
    try {
      // For providers action, don't include provider parameter
                  const url = action === 'providers'
                    ? `/api/filemaker-auth/oauth?action=${action}`
                    : `/api/filemaker-auth/oauth?action=${action}&provider=${selectedProvider}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      setResponse(JSON.stringify(data, null, 2))
      
      // If getting providers, update the available providers list
      if (action === 'providers' && data.success && data.data && data.data.data && data.data.data.Provider) {
        // Extract provider names from the nested structure
        const providerNames = data.data.data.Provider.map(provider => provider.Name)
        setAvailableProviders(providerNames)
        // Auto-select first provider if available
        if (providerNames.length > 0) {
          setSelectedProvider(providerNames[0])
        }
      }
      
      // If initiating OAuth, extract the OAuth URL
      if (action === 'initiate' && data.success && data.data && data.data.oauthUrl) {
        setOauthUrl(data.data.oauthUrl)
      }
      
      // Auto-refresh sessions after any action completes
      if (action !== 'sessions') {
        const sessionsResponse = await fetch('/api/filemaker-auth/oauth?action=sessions')
        const sessionsData = await sessionsResponse.json()
        setSessionsResponse(JSON.stringify(sessionsData, null, 2))
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const clearAll = () => {
    setProvidersResponse('')
    setInitiationResponse('')
    setFullFlowResponse('')
    setSessionsResponse('')
    setSelectedProvider('')
    setAvailableProviders([])
    setCallbackData('')
    setOauthUrl('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FileMaker OAuth Test Page
        </h1>
        
        <div className="mb-6 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Home
          </Link>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear All Responses
          </button>
        </div>

        <div className="space-y-8">
          
          {/* Step 1: Get Providers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Step 1: Get OAuth Providers
            </h2>
            <p className="text-gray-600 mb-4">
              Retrieves available OAuth providers from FileMaker server
            </p>
            <button
              onClick={() => handleTest('providers', setProvidersResponse)}
              disabled={loading.providers}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mb-4"
            >
              {loading.providers ? 'Loading...' : 'Get Providers'}
            </button>
            <textarea
              value={providersResponse}
              onChange={(e) => setProvidersResponse(e.target.value)}
              placeholder="Response will appear here..."
              className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Step 2: Initiate OAuth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Step 2: Initiate OAuth Flow
            </h2>
            <p className="text-gray-600 mb-4">
              Starts OAuth authentication with selected provider
            </p>
            
            {/* Provider Selection Dropdown */}
            <div className="mb-4">
              <label htmlFor="provider-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select OAuth Provider:
              </label>
              <select
                id="provider-select"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={availableProviders.length === 0}
              >
                <option value="">Select a provider...</option>
                {availableProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
              {availableProviders.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Run Step 1 first to load available providers
                </p>
              )}
            </div>

            <button
              onClick={() => handleTest('initiate', setInitiationResponse)}
              disabled={loading.initiate || !selectedProvider}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 mb-4"
            >
              {loading.initiate ? 'Loading...' : 'Initiate OAuth'}
            </button>
            <textarea
              value={initiationResponse}
              onChange={(e) => setInitiationResponse(e.target.value)}
              placeholder="Response will appear here..."
              className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Step 2.5: OAuth Callback Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">
              Step 2.5: OAuth Callback Data
            </h2>
            <p className="text-gray-600 mb-4">
              Shows the data returned from the OAuth callback after user authentication
            </p>
            
            {/* OAuth URL Button */}
            {oauthUrl && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">OAuth URL Ready:</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Click the button below to complete the OAuth authentication flow:
                </p>
                <a
                  href={oauthUrl}
                  target="_self"
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Complete OAuth Authentication
                </a>
                <p className="text-xs text-blue-600 mt-2">
                  This will redirect to Microsoft for authentication in the same tab
                </p>
                
                {/* Callback URL Display */}
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Callback URL:</h4>
                  <code className="text-sm text-gray-700 break-all">
                    {window.location.origin}/auth/oauth-success?user=...
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    This is where the OAuth provider will redirect after authentication
                  </p>
                </div>
                
                {/* Warning about relogin */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">Important Note:</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This will relogin the user. Any existing session will be replaced with the new OAuth session.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>


          {/* OAuth Sessions Debug */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              OAuth Sessions Debug
            </h2>
            <p className="text-gray-600 mb-4">
              Shows the current state of oauthSessions Map, after each step.
            </p>
            <textarea
              value={sessionsResponse}
              onChange={(e) => setSessionsResponse(e.target.value)}
              placeholder="Sessions will appear here..."
              className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50"
              readOnly
            />
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">
            How to Use This Test Page
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li><strong>Step 1:</strong> Click &quot;Get Providers&quot; to see available OAuth providers from your FileMaker server</li>
            <li><strong>Step 2:</strong> Click &quot;Initiate OAuth&quot; to start the OAuth flow and get the redirect URL</li>
            <li><strong>Step 3:</strong> Click &quot;Test Full Flow&quot; to run both steps together</li>
            <li><strong>Watch Sessions:</strong> The OAuth Sessions section automatically updates after each step to show the current session state</li>
            <li><strong>Debug:</strong> Use the responses to understand the OAuth flow and troubleshoot issues</li>
          </ol>
        </div>

      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function OAuthTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <OAuthTestContent />
    </Suspense>
  )
}
