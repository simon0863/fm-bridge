// This is a login page for users managed via filemaker security.

"use client"

import LoginForm from '@/components/auth/LoginFormFMSecurity'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
