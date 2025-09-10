/**
 * Homepage Server Component - FMBridge Landing Page
 * 
 * This is the main homepage that describes FMBridge to users and provides navigation
 * to different components. It runs on the server and dynamically discovers available
 * pages/components from the app directory structure.
 * 
 * Why we need both page.js and HomeClient.js:
 * - page.js: Server-side component that handles data fetching, file system operations,
 *   and renders the initial HTML. Cannot use browser APIs or React hooks.
 * - HomeClient.js: Client-side component that handles interactive features like
 *   accordion toggles, state management, and user interactions. Runs in the browser.
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import AuthIcon from '@/components/auth/AuthIcon';
import HomeClient from './HomeClient';

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
              url: `/${routePath}`,
              category: getCategory(routePath)
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

// Function to categorize components
function getCategory(path) {
  if (path.startsWith('auth/')) return 'auth';
  if (path.startsWith('core/')) return 'core';
  if (path.startsWith('roundup/')) return 'roundup';
  return 'other';
}

// Accordion component
function AccordionSection({ title, children, isOpen, onToggle, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const components = discoverComponents();

  return <HomeClient components={components} />;
}


