// this is a protected page that can only be accessed by logged in users.
// is uses the ProtectedRoute component to protect the page.
// wrap any protected pages in this component.
// like the below !

"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'


export default function ExampleProtectedPage() {
  return <ProtectedRoute>
    <div>
      <h1>Example Protected Page</h1>
      <p>This is a protected page that can only be accessed by logged in users.</p>
    </div>
  </ProtectedRoute>;
}

