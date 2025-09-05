// app/oauth-test/page.js
// This page is used to test the OAuth flow for the FileMaker OAuth service.

"use client"

import { useState } from 'react'


export default function OAuthTestPage() {
  const [providersResponse, setProvidersResponse] = useState('')
  const [initiationResponse, setInitiationResponse] = useState('')
  const [fullFlowResponse, setFullFlowResponse] = useState('')
  const [sessionsResponse, setSessionsResponse] = useState('')
  const [loading, setLoading] = useState({})

  const handleTest = async (action, setResponse) => {
    setLoading(prev => ({ ...prev, [action]: true }))
    
    try {
      const url = `/api/test-filemaker-oauth-session?action=${action}&provider=Microsoft`
      const response = await fetch(url)
      const data = await response.json()
      
      setResponse(JSON.stringify(data, null, 2))
      
      // Auto-refresh sessions after any action completes
      if (action !== 'sessions') {
        const sessionsResponse = await fetch('/api/test-filemaker-oauth-session?action=sessions')
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
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FileMaker OAuth Test Page
        </h1>
        
        <div className="mb-6">
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear All Responses
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
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
              Starts OAuth authentication with Microsoft provider
            </p>
            <button
              onClick={() => handleTest('initiate', setInitiationResponse)}
              disabled={loading.initiate}
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

          {/* Step 3: Full Flow */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Step 3: Complete OAuth Flow
            </h2>
            <p className="text-gray-600 mb-4">
              Tests the complete flow: get providers + initiate OAuth
            </p>
            <button
              onClick={() => handleTest('full-flow', setFullFlowResponse)}
              disabled={loading['full-flow']}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300 mb-4"
            >
              {loading['full-flow'] ? 'Loading...' : 'Test Full Flow'}
            </button>
            <textarea
              value={fullFlowResponse}
              onChange={(e) => setFullFlowResponse(e.target.value)}
              placeholder="Response will appear here..."
              className="w-full h-80 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* OAuth Sessions Debug */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
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
            <li><strong>Step 1:</strong> Click "Get Providers" to see available OAuth providers from your FileMaker server</li>
            <li><strong>Step 2:</strong> Click "Initiate OAuth" to start the OAuth flow and get the redirect URL</li>
            <li><strong>Step 3:</strong> Click "Test Full Flow" to run both steps together</li>
            <li><strong>Watch Sessions:</strong> The OAuth Sessions section automatically updates after each step to show the current session state</li>
            <li><strong>Debug:</strong> Use the responses to understand the OAuth flow and troubleshoot issues</li>
          </ol>
        </div>

      </div>
    </div>
  )
}
