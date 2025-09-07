// this is a protected page that can only be accessed by logged in users.
// is uses the ProtectedRoute component to protect the page.
// wrap any protected pages in this component.
// like the below !

"use client"

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function ExampleProtectedPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Example Protected Page
          </h1>
          <p className="text-gray-600 text-center mb-6">
            This is a protected page that can only be accessed by logged in users.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Authentication</h3>
              <p className="text-blue-700 text-sm">
                This page is wrapped in the ProtectedRoute component
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">Access</h3>
              <p className="text-green-700 text-sm">
                Only authenticated users can view this content.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="block w-full text-center bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors mt-6"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}

