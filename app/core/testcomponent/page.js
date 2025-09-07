import Link from 'next/link'

export default function TestComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Test Component
        </h1>
        <p className="text-gray-600 text-center mb-6">
          This is a test component to demonstrate the automatic discovery system.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Component Info</h3>
            <p className="text-blue-700 text-sm">
              Route: /testcomponent
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900">Usage</h3>
            <p className="text-green-700 text-sm">
              This component can be used in both web browsers and FileMaker WebViewers.
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
  );
}
