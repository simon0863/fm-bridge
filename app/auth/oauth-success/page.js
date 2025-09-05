'use client'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function OAuthSuccess() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing...')
  
  useEffect(() => {
    const userData = searchParams.get('user')
    
    if (userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData))
        
        // Use NextAuth's signIn to create the session
        signIn('oauth-success', {
          redirect: false,
          user: user // Pass the user data
        }).then((result) => {
          if (result?.ok) {
            setStatus('Success! Redirecting...')
            window.location.href = '/'
          } else {
            setStatus('Failed to create session')
          }
        })
      } catch (error) {
        setStatus('Error parsing user data')
      }
    }
  }, [searchParams])
  
  return <div>{status}</div>
}