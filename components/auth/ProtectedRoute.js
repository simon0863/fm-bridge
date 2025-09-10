// this is a protected route for users
// it useed to protect pages that require users to be logged in
// this functions for all authentication providers 
// Those protected pages have components that are wrapped in this component
// See for example app/auth/exampleProtectedPage/page.js
"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'

// Content component with useSearchParams()
function ProtectedRouteContent({ children }) {
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
            // Handle magic link error - clean URL and redirect to error page
            router.replace(router.asPath.split('?')[0]) // Remove query params
            router.push('/auth/magikLinkError')
            return // Exit early, don't continue
          }
          
          // Success - clean URL by removing JWT parameters
          router.replace(router.asPath.split('?')[0]) // Remove query params
          
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

// Main component with Suspense wrapper
export default function ProtectedRoute({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </Suspense>
  )
}