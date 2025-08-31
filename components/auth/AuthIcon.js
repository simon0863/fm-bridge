"use client"

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AuthIcon() {
  const { data: session, status } = useSession()

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
    )
  }

  // Show logout icon if user is authenticated
  if (session) {
    return (
      <Link 
        href="/auth/logout"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200"
        title="Sign Out"
      >
        <svg 
          className="w-5 h-5 text-red-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      </Link>
    )
  }

  // Show login icon if user is not authenticated
  return (
    <Link 
      href="/auth/loginFmSecurity"
      className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 transition-colors duration-200"
      title="Sign In"
    >
      <svg 
        className="w-5 h-5 text-green-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
        />
      </svg>
    </Link>
  )
}