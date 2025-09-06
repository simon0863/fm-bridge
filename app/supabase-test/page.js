"use client"
import { useState } from 'react'

export default function SupabaseTestPage() {
  const [testResponse, setTestResponse] = useState('')
  const [readResponse, setReadResponse] = useState('')
  const [writeResponse, setWriteResponse] = useState('')
  const [deleteResponse, setDeleteResponse] = useState('')
  const [loading, setLoading] = useState({})

  const handleTest = async (action, setResponse) => {
    setLoading(prev => ({ ...prev, [action]: true }))
    try {
      const response = await fetch(`/api/supabase-test?action=${action}`)
      const data = await response.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const clearAll = () => {
    setTestResponse('')
    setReadResponse('')
    setWriteResponse('')
    setDeleteResponse('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Supabase Integration Test Page
        </h1>

        <div className="mb-6 flex gap-4">
          <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Home
          </a>
          <button onClick={clearAll} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Clear All Responses
          </button>
        </div>

        <div className="space-y-8">

          {/* Connection Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Step 1: Connection Test
            </h2>
            <p className="text-gray-600 mb-4">
              Test the connection to your Supabase test database
            </p>
            <button
              onClick={() => handleTest('test', setTestResponse)}
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

          {/* Read Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Step 2: Read Data
            </h2>
            <p className="text-gray-600 mb-4">
              Read all users from the test_users table
            </p>
            <button
              onClick={() => handleTest('read', setReadResponse)}
              disabled={loading.read}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 mb-4"
            >
              {loading.read ? 'Reading...' : 'Read Users'}
            </button>
            <textarea
              value={readResponse}
              onChange={(e) => setReadResponse(e.target.value)}
              placeholder="User data will appear here..."
              className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Write Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">
              Step 3: Write Data
            </h2>
            <p className="text-gray-600 mb-4">
              Create a new test user in the database
            </p>
            <button
              onClick={() => handleTest('write', setWriteResponse)}
              disabled={loading.write}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-orange-300 mb-4"
            >
              {loading.write ? 'Writing...' : 'Create Test User'}
            </button>
            <textarea
              value={writeResponse}
              onChange={(e) => setWriteResponse(e.target.value)}
              placeholder="Write operation result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

          {/* Cleanup */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Step 4: Cleanup
            </h2>
            <p className="text-gray-600 mb-4">
              Delete all test users (cleanup)
            </p>
            <button
              onClick={() => handleTest('delete', setDeleteResponse)}
              disabled={loading.delete}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 mb-4"
            >
              {loading.delete ? 'Cleaning...' : 'Cleanup Test Data'}
            </button>
            <textarea
              value={deleteResponse}
              onChange={(e) => setDeleteResponse(e.target.value)}
              placeholder="Cleanup result will appear here..."
              className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm"
            />
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to use this page:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li><strong>Test Connection:</strong> Verify your Supabase setup is working</li>
            <li><strong>Read Data:</strong> See what's currently in your test_users table</li>
            <li><strong>Write Data:</strong> Create a new test user to verify write operations</li>
            <li><strong>Cleanup:</strong> Remove test data to keep your database clean</li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-100 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This page uses your test Supabase database. Make sure your .env.local file 
              contains the correct SUPABASE_TEST_URL and SUPABASE_TEST_SERVICE_KEY values.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
