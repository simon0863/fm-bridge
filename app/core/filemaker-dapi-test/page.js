"use client"
import { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function FileMakerDAPITestPage() {
  const [testResponse, setTestResponse] = useState('')
  const [tokenResponse, setTokenResponse] = useState('')
  const [validateResponse, setValidateResponse] = useState('')
  const [revokeResponse, setRevokeResponse] = useState('')
  const [sharedSessionResponse, setSharedSessionResponse] = useState('')
  const [sessionRecoveryResponse, setSessionRecoveryResponse] = useState('')
  const [irpmApiResponse, setIrpmApiResponse] = useState('')
  const [loading, setLoading] = useState({})
  const [currentToken, setCurrentToken] = useState('')

  const handleTest = async (action, setResponse) => {
    setLoading(prev => ({ ...prev, [action]: true }))
    try {
      const response = await fetch(`/api/filemaker-auth/dapi-test/${action}`)
      const data = await response.json()
      setResponse(JSON.stringify(data, null, 2))
      
      // Store token if we got one
      if (action === 'get-token' && data.success && data.token) {
        setCurrentToken(data.token)
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const handleValidateSession = async () => {
    if (!currentToken) {
      setValidateResponse('Error: No token available. Get a token first.')
      return
    }
    
    setLoading(prev => ({ ...prev, validate: true }))
    try {
      // Pass the token as the ID parameter with validate-session as the action
      const response = await fetch(`/api/filemaker-auth/dapi-test/validate-session?token=${encodeURIComponent(currentToken)}`)
      const data = await response.json()
      setValidateResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setValidateResponse(`Error: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, validate: false }))
    }
  }

  const handleRevokeSession = async () => {
    if (!currentToken) {
      setRevokeResponse('Error: No token available. Get a token first.')
      return
    }
    
    setLoading(prev => ({ ...prev, revoke: true }))
    try {
      // Pass the token as query parameter with revoke-session as the action
      const response = await fetch(`/api/filemaker-auth/dapi-test/revoke-session?token=${encodeURIComponent(currentToken)}`)
      const data = await response.json()
      setRevokeResponse(JSON.stringify(data, null, 2))
      
      // Clear the token after successful revocation
      if (data.success && data.revoked) {
        setCurrentToken('')
      }
    } catch (error) {
      setRevokeResponse(`Error: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, revoke: false }))
    }
  }

  const clearAll = () => {
    setTestResponse('')
    setTokenResponse('')
    setValidateResponse('')
    setRevokeResponse('')
    setSharedSessionResponse('')
    setSessionRecoveryResponse('')
    setIrpmApiResponse('')
    setCurrentToken('')
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FileMaker Data API Test Page
        </h1>

        <div className="mb-6 flex gap-4">
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Home
          </Link>
          <button onClick={clearAll} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Clear All Responses
          </button>
        </div>

        {/* Current Token Display */}
        {currentToken && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Current Session Token:</h3>
            <code className="text-sm text-green-700 break-all bg-green-100 p-2 rounded block">
              {currentToken}
            </code>
          </div>
        )}

        <div className="space-y-8">

          {/* Connection Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Step 1: Connection Test
            </h2>
            <p className="text-gray-600 mb-4">
              Test the connection to your FileMaker server by creating and immediately revoking a session
            </p>
            <button
              onClick={() => handleTest('test-connection', setTestResponse)}
              disabled={loading.test}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mb-4"
            >
              {loading.test ? 'Testing...' : 'Test Connection'}
            </button>
            <textarea
              value={testResponse}
              onChange={(e) => setTestResponse(e.target.value)}
              placeholder="Connection test result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Get Token */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Step 2: Get Data Session Token
            </h2>
            <p className="text-gray-600 mb-4">
              Create a new FileMaker Data API session for data operations
            </p>
            <button
              onClick={() => handleTest('get-token', setTokenResponse)}
              disabled={loading.token}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 mb-4"
            >
              {loading.token ? 'Creating...' : 'Get Data Session Token'}
            </button>
            <textarea
              value={tokenResponse}
              onChange={(e) => setTokenResponse(e.target.value)}
              placeholder="Token creation result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Validate Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">
              Step 3: Validate Session
            </h2>
            <p className="text-gray-600 mb-4">
              Validate if the current session token is still valid (requires token from Step 2)
            </p>
            <button
              onClick={handleValidateSession}
              disabled={loading.validate || !currentToken}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-orange-300 mb-4"
            >
              {loading.validate ? 'Validating...' : 'Validate Session'}
            </button>
            <textarea
              value={validateResponse}
              onChange={(e) => setValidateResponse(e.target.value)}
              placeholder="Session validation result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Revoke Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Step 4: Revoke Session
            </h2>
            <p className="text-gray-600 mb-4">
              Revoke the current session token to clean up (requires token from Step 2)
            </p>
            <button
              onClick={handleRevokeSession}
              disabled={loading.revoke || !currentToken}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 mb-4"
            >
              {loading.revoke ? 'Revoking...' : 'Revoke Session'}
            </button>
            <textarea
              value={revokeResponse}
              onChange={(e) => setRevokeResponse(e.target.value)}
              placeholder="Session revocation result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Test Shared Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Step 5: Test Shared Session Management
            </h2>
            <p className="text-gray-600 mb-4">
              Test the new shared session management - should reuse the same session token
            </p>
            <button
              onClick={() => handleTest('test-shared-session', setSharedSessionResponse)}
              disabled={loading['test-shared-session']}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300 mb-4"
            >
              {loading['test-shared-session'] ? 'Testing...' : 'Test Shared Session'}
            </button>
            <textarea
              value={sharedSessionResponse}
              onChange={(e) => setSharedSessionResponse(e.target.value)}
              placeholder="Shared session test result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Test Session Recovery */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">
              Step 6: Test Session Recovery
            </h2>
            <p className="text-gray-600 mb-4">
              Test session recovery by forcing a health check - this will validate if the session is still alive in FileMaker
            </p>
            <button
              onClick={() => handleTest('test-session-recovery', setSessionRecoveryResponse)}
              disabled={loading['test-session-recovery']}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-indigo-300 mb-4"
            >
              {loading['test-session-recovery'] ? 'Testing...' : 'Test Session Recovery'}
            </button>
            <textarea
              value={sessionRecoveryResponse}
              onChange={(e) => setSessionRecoveryResponse(e.target.value)}
              placeholder="Session recovery test result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Test IRPM API */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">
              Step 7: Test IRPM API
            </h2>
            <p className="text-gray-600 mb-4">
              Test the IRPM API endpoint - this will test the complete flow from shared session to FileMaker data retrieval
            </p>
            <button
              onClick={() => handleTest('test-irpm-api', setIrpmApiResponse)}
              disabled={loading['test-irpm-api']}
              className="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-teal-300 mb-4"
            >
              {loading['test-irpm-api'] ? 'Testing...' : 'Test IRPM API'}
            </button>
            <textarea
              value={irpmApiResponse}
              onChange={(e) => setIrpmApiResponse(e.target.value)}
              placeholder="IRPM API test result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to use this page:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li><strong>Test Connection:</strong> Verify your FileMaker server connection is working</li>
            <li><strong>Get Token:</strong> Create a data session token for FileMaker operations</li>
            <li><strong>Validate Session:</strong> Check if the current session is still valid</li>
            <li><strong>Revoke Session:</strong> Clean up by revoking the session token</li>
            <li><strong>Test Shared Session:</strong> Test the new shared session management system</li>
            <li><strong>Test Session Recovery:</strong> Test session recovery by forcing a health check</li>
            <li><strong>Test IRPM API:</strong> Test the complete IRPM API flow with FileMaker data</li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-100 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This page tests the FileMaker Data API connection. Make sure your .env.local file 
              contains the correct FILEMAKER_SERVER, FILEMAKER_DATABASE, FILEMAKER_DATA_USERNAME, and FILEMAKER_DATA_PASSWORD values.
            </p>
          </div>
        </div>

      </div>
    </div>
    </ProtectedRoute>
  )
}
