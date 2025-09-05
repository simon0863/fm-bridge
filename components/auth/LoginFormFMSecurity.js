// This is a login form for users managed via filemaker security and Microsoft SSO proxy via filemaker.
"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('filemaker', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Authentication failed. Please check your credentials.')
      } else {
        // Redirect to home page or dashboard
        router.push('/')
      }
    } catch (error) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Call your custom OAuth initiation endpoint
      const response = await fetch('/api/test-filemaker-oauth-session?action=initiate&provider=Microsoft')
      const responsedata = await response.json()
      
      // Pull the oauthUrl from the response data 
      const oauthUrl = responsedata.data.oauthUrl

      console.log('in client try block url is', oauthUrl)

      if (oauthUrl) {
        console.log('about to redirect to Microsoft OAuth')
        // Redirect to Microsoft OAuth
        window.open(oauthUrl, '_self')
      } else {
        setError('Failed to initiate Microsoft authentication. Please try again.')
      }
    } catch (error) {
      console.error('OAuth initiation failed:', error)
      setError('An unexpected error occurred with Microsoft authentication.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to FileMaker Bridge
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use your FileMaker credentials to access the system
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">OR</span>
        </div>
      </div>

      {/* Microsoft Login Button */}
      <div>
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#f25022" d="M1 1h10v10H1z"/>
            <path fill="#7fba00" d="M13 1h10v10H13z"/>
            <path fill="#00a4ef" d="M1 13h10v10H1z"/>
            <path fill="#ffb900" d="M13 13h10v10H13z"/>
          </svg>
          {isLoading ? 'Connecting...' : 'Login with Microsoft'}
        </button>
      </div>
    </div>
  )
}