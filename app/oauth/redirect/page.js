"use client"

/**
 * FileMaker OAuth Redirect Handler
 * 
 * This page handles the redirect from FileMaker's OAuth flow and forwards
 * the parameters to our existing callback API route.
 */

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function OAuthRedirectContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Processing redirect...')

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Get all the parameters from FileMaker's redirect
        const trackingID = searchParams.get('trackingID')
        const identifier = searchParams.get('identifier')
        const hiddenemail = searchParams.get('hiddenemail')
        const error = searchParams.get('error')

        if (error && error !== '0') {
          // There was an error in the OAuth flow
          setStatus('OAuth error occurred')
          router.push(`/auth/oauth-error?error=${error}&description=OAuth flow failed`)
          return
        }

        if (!trackingID || !identifier) {
          setStatus('Missing required parameters')
          router.push('/auth/oauth-error?error=missing_params&description=Missing trackingID or identifier')
          return
        }

        // Forward to our existing callback API
        setStatus('Forwarding to callback...')
        
        // Construct the callback URL with all parameters
        const callbackUrl = `/api/filemaker-auth/oauth/callback?trackingID=${trackingID}&identifier=${identifier}${hiddenemail ? `&hiddenemail=${hiddenemail}` : ''}`
        
        // Redirect to our callback API
        window.location.href = callbackUrl
        
      } catch (err) {
        console.error('Redirect handling error:', err)
        setStatus('Error processing redirect')
        router.push('/auth/oauth-error?error=redirect_error&description=Failed to process redirect')
      }
    }

    handleRedirect()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}

export default function OAuthRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OAuthRedirectContent />
    </Suspense>
  )
}
