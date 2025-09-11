'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'

// Content component with useSearchParams()
function OAuthSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')
  
  useEffect(() => {
    const userData = searchParams.get('user')
    
    if (userData) {
      try {
        //const user = JSON.parse(decodeURIComponent(userData))
        const user = decodeURIComponent(userData)
        
        // Use NextAuth's signIn to create the session
        signIn('filemaker-proxy', {
          user: user,
          redirect: false,
        }).then((result) => {
          if (result?.ok) {
            setStatus('Success! Redirecting...')
            router.push('/')
          } else {
            setStatus('Failed to create session')
          }
        })
      } catch (error) {
        setStatus('Error parsing user data')
      }
    }
  }, [searchParams, router])
  
  return <div>{status}</div>
}

// Main component with Suspense wrapper
export default function OAuthSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <OAuthSuccessContent />
    </Suspense>
  )
}