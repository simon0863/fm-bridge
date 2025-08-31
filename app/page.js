// this is the home page that desribes FMBridge to users.


import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import AuthIcon from '@/components/auth/AuthIcon';

// Function to discover components from the app directory
function discoverComponents() {
  try {
    const appDir = join(process.cwd(), 'app');
    const components = [];
    
    function scanDirectory(dir, basePath = '') {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip special Next.js directories
          if (['layout.js', 'loading.js', 'error.js', 'not-found.js'].includes(item)) {
            continue;
          }
          
          // Check if this directory has a page.js file
          const pagePath = join(fullPath, 'page.js');
          try {
            statSync(pagePath);
            // This is a valid page component
            const routePath = basePath ? `${basePath}/${item}` : item;
            components.push({
              name: item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1'),
              path: routePath,
              url: `/${routePath}`
            });
          } catch {
            // No page.js, but might have subdirectories
            scanDirectory(fullPath, basePath ? `${basePath}/${item}` : item);
          }
        }
      }
    }
    
    scanDirectory(appDir);
    return components;
  } catch (error) {
    console.error('Error discovering components:', error);
    return [];
  }
}

export default function Home() {
  const components = discoverComponents();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-white shadow-xs border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-900 mb-4">
            FileMaker Bridge
          </div>
          <AuthIcon />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Header */}
        <header className="text-center mb-12">
        
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A collection of reusable React components that work both as web pages and within FileMaker WebViewers.
          </p>
        </header>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {components.map((component) => (
            <div
              key={component.path}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {component.name}
              </h3>
              <p className="text-gray-600 mb-4">
                Route: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{component.path}</code>
              </p>
              <a
                href={component.url}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                View Component
              </a>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Web Access</h3>
              <p className="text-gray-600">
                Each component is accessible via its own URL and can be composed together for richer web experiences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">FileMaker Integration</h3>
              <p className="text-gray-600">
                Components can be embedded directly in FileMaker WebViewers for seamless integration with your existing workflows. Or you can compose them into a richer web experience.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>
            Components automatically discovered from your app directory structure.
            Add new pages to see them appear here!
          </p>
        </footer>
      </div>
    </div>
  );
}


