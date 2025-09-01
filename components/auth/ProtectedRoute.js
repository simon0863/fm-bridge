// this is a protected route for users
// it useed to protect pages that require users to be logged in
// this functions for all authentication providers 
// Those protected pages have components that are wrapped in this component
// See for example app/auth/exampleProtectedPage/page.js
"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'

export default function ProtectedRoute({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessingJWT, setIsProcessingJWT] = useState(false)

  useEffect(() => {
    const processSession = async () => {
      const jwt = searchParams.get('jwt')
      // Is this a magic link?
      if (jwt && !session && !isProcessingJWT) {
        setIsProcessingJWT(true)
        // Yes, it is a magic link. Process it.
        try {
          const result = await signIn('filemakerMagicLink', {
            magicLink: jwt,
            redirect: false,
          })
          // Did the magic link fail to authenticate?
          if (result?.error) {
            // Handle magic link error - don't let other useEffect redirect
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('jwt')
            newUrl.searchParams.delete('token')
            router.replace(newUrl.pathname)
            router.push('/auth/magikLinkError')
            return // Exit early, don't continue
          }
          
          // Success - clean URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('jwt')
          newUrl.searchParams.delete('token')
          router.replace(newUrl.pathname)
          
        } catch (error) {
          console.error('Magic link processing error:', error)
          router.push('/auth/magikLinkError')
          return // Exit early
        } finally {
          setIsProcessingJWT(false)
        }
      }
      
      // Only check for regular auth if no magic link processing
      if (!jwt && status !== 'loading' && !isProcessingJWT && !session) {
        router.push('/auth/login')
      }
    }
  
    processSession()
  }, [searchParams, session, status, isProcessingJWT, router])

  // Show loading while checking authentication or processing JWT
  if (status === 'loading' || isProcessingJWT) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isProcessingJWT ? 'Processing magic link...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!session) {
    return null
  }

  // Render protected content
  return children
}