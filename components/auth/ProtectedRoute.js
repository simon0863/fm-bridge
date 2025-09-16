// components/auth/ProtectedRoute.js
"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Home, LogIn } from 'lucide-react'

// NotLoggedIn component for showing a user-friendly message
function NotLoggedInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You need to be logged in to access this page. Please sign in to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Content component with useSearchParams()
function ProtectedRouteContent({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isProcessingJWT, setIsProcessingJWT] = useState(false)

  // Get the unauthorized redirect behavior from environment variable
  const unauthorizedRedirect = process.env.NEXT_PUBLIC_SITE_SETTINGS_UNAUTHORIZED_REDIRECT || 'redirect'

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
            router.replace(pathname) // Remove query params
            router.push('/auth/magikLinkError')
            return // Exit early, don't continue
          }
          
          // Success - clean URL by removing JWT parameters
          router.replace(pathname) // Remove query params
          
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
        if (unauthorizedRedirect === 'redirect') {
          router.push('/auth/login')
        }
        // If unauthorizedRedirect is 'show-message', we don't redirect - just let the component render the message
      }
    }
  
    processSession()
  }, [searchParams, session, status, isProcessingJWT, router, pathname, unauthorizedRedirect])

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

  // Handle unauthenticated users based on environment variable
  if (!session) {
    if (unauthorizedRedirect === 'show-message') {
      return <NotLoggedInPage />
    }
    // For 'redirect' behavior, return null (will redirect in useEffect)
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