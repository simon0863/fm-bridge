'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function OAuthSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')
  
  useEffect(() => {
    const userData = searchParams.get('user')
    
    if (userData) {
      try {
        //const user = JSON.parse(decodeURIComponent(userData))
        const user = decodeURIComponent(userData)
        console.log('in oath sucess pageuser data is ', user)
        
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