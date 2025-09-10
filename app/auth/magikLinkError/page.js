// This is an error page when a magic link is invalid.

export default function MagicLinkErrorPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Magic Link Error
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Their was an error with the link you used to access this page.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Try Again</h3>
            <p className="text-blue-900 text-sm">
              Try to use the link again.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900">If it still doesn&apos;t work</h3>
            <p className="text-green-700 text-sm">
              Contact us to get a new link.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
