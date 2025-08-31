// this is the logout page for users
"use client"

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    // Automatically sign out when the page loads
    const performLogout = async () => {
      try {
        // Sign out from NextAuth with automatic redirect
        await signOut({ 
          callbackUrl: '/' // NextAuth will redirect here after logout
        })
      } catch (error) {
        console.error('Logout error:', error)
        // If there's an error, NextAuth will still redirect
      }
    }

    performLogout()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Signing you out...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Please wait while we securely log you out.
        </p>
      </div>
    </div>
  )
}