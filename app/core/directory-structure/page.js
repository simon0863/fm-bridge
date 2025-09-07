import Link from 'next/link';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Function to discover the actual directory structure
function discoverDirectoryStructure() {
  try {
    const appDir = join(process.cwd(), 'app');
    const componentsDir = join(process.cwd(), 'components');
    const libDir = join(process.cwd(), 'lib');
    
    const structure = {};
    
    // Only include the three main directories if they exist
    if (statSync(appDir).isDirectory()) {
      structure['app/'] = scanDirectory(appDir, 'app');
    }
    
    if (statSync(componentsDir).isDirectory()) {
      structure['components/'] = scanDirectory(componentsDir, 'components');
    }
    
    if (statSync(libDir).isDirectory()) {
      structure['lib/'] = scanDirectory(libDir, 'lib');
    }
    
    return structure;
  } catch (error) {
    console.error('Error discovering directory structure:', error);
    return {};
  }
}

// Recursively scan a directory and return its structure
function scanDirectory(dir, basePath = '') {
  try {
    const items = readdirSync(dir);
    const result = {
      description: getDirectoryDescription(basePath),
      subdirectories: {},
      files: []
    };
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip special Next.js directories and node_modules
        if (['.next', 'node_modules', '.git'].includes(item)) {
          continue;
        }
        
        const subPath = basePath ? `${basePath}/${item}` : item;
        result.subdirectories[item + '/'] = scanDirectory(fullPath, subPath);
      } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
        // Include all JavaScript/TypeScript files in the directories
        const description = getFileDescription(item, basePath);
        result.files.push(`${item} - ${description}`);
      }
    }
    
    // Clean up empty subdirectories
    if (Object.keys(result.subdirectories).length === 0) {
      delete result.subdirectories;
    }
    
    // Clean up empty files array
    if (result.files.length === 0) {
      delete result.files;
    }
    
    return result;
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
    return { description: 'Error reading directory' };
  }
}

// Get description for directories
function getDirectoryDescription(path) {
  const descriptions = {
    'app': 'Next.js App Router pages and API routes',
    'app/api': 'API routes (server-side endpoints)',
    'app/api/auth': 'NextAuth.js configuration and session management',
    'app/api/filemaker-auth': 'FileMaker OAuth proxy for Microsoft SSO',
    'app/api/roundup': 'Roundup-specific API endpoints',
    'app/api/supabase': 'Supabase connectivity and testing endpoints',
    'app/auth': 'Authentication pages (NextAuth.js)',
    'app/core': 'Core system pages (reusable across projects)',
    'app/roundup': 'Roundup-specific pages',
    'components': 'Reusable React components',
    'components/auth': 'Authentication-related components',
    'components/core': 'Core system components (reusable across projects)',
    'components/roundup': 'Roundup-specific components',
    'lib': 'Utility functions and services'
  };
  
  return descriptions[path] || 'Directory';
}

// Get description for files
function getFileDescription(filename, basePath) {
  const descriptions = {
    'route.js': 'API route handler',
    'page.js': 'Next.js page component',
    'layout.js': 'Next.js layout component',
    'SessionProvider.js': 'NextAuth session provider',
    'AuthIcon.js': 'User authentication status icon',
    'LoginFormFMSecurity.js': 'FileMaker security login form',
    'ProtectedRoute.js': 'Route protection wrapper',
    'Header.js': 'Main application header',
    'filemaker-oauth-service.js': 'FileMaker OAuth proxy service',
    'filemaker-service.js': 'FileMaker Data API integration',
    'supabase-service.js': 'Supabase client and utilities',
    'validateJWTToNextAuthUser.js': 'JWT validation for NextAuth'
  };
  
  return descriptions[filename] || 'Component or utility file';
}

export default function DirectoryStructurePage() {
  const directoryStructure = discoverDirectoryStructure();

  const placementGuide = [
    {
      question: "Where should I put a new authentication page?",
      answer: "app/auth/ - All NextAuth.js related pages go here (login, logout, error pages, etc.)"
    },
    {
      question: "Where should I put a new core system page?",
      answer: "app/core/ - Pages that are reusable across different projects and integrations"
    },
    {
      question: "Where should I put a new Roundup-specific page?",
      answer: "app/roundup/ - Pages specific to the Roundup integration"
    },
    {
      question: "Where should I put a new API endpoint?",
      answer: "app/api/ - Create subdirectories based on functionality (auth, roundup, supabase, etc.)"
    },
    {
      question: "Where should I put a new authentication component?",
      answer: "components/auth/ - Components related to user authentication and session management"
    },
    {
      question: "Where should I put a new core component?",
      answer: "components/core/ - Reusable components that work across different projects"
    },
    {
      question: "Where should I put a new Roundup component?",
      answer: "components/roundup/ - Components specific to Roundup functionality"
    },
    {
      question: "Where should I put a new utility function?",
      answer: "lib/ - All utility functions, services, and helper modules go here"
    },
    {
      question: "Where should I put a new integration?",
      answer: "Create new directories in both app/ and components/ (e.g., app/integration-name/, components/integration-name/)"
    }
  ];

  const bestPractices = [
    "Keep related functionality grouped together in the same directory",
    "Use descriptive directory names that clearly indicate their purpose",
    "Follow the established pattern: app/ for pages, components/ for UI components, lib/ for utilities",
    "Create subdirectories for complex features (e.g., reporting/, layout/)",
    "Place shared/reusable code in core/ directories",
    "Place integration-specific code in dedicated directories",
    "Keep API routes organized by functionality in app/api/",
    "Use consistent naming conventions (camelCase for files, kebab-case for directories)"
  ];

  const DirectoryTree = ({ structure, level = 0 }) => {
    const entries = Object.entries(structure);
    
    return (
      <div className="space-y-1">
        {entries.map(([name, details], index) => {
          return (
            <div key={name}>
              {/* Directory/File line */}
              <div className="flex items-center py-1">
                <div className="w-6 text-gray-400 text-center">
                  {level === 0 ? '📁' : '└─'}
                </div>
                <span className="font-semibold text-blue-600 mr-3 min-w-0 flex-shrink-0">
                  {name}
                </span>
                {typeof details === 'object' && details.description && (
                  <span className="text-gray-600 text-sm">
                    {details.description}
                  </span>
                )}
              </div>
              
              {/* Subdirectories */}
              {typeof details === 'object' && details.subdirectories && (
                <div className="ml-4">
                  <DirectoryTree 
                    structure={details.subdirectories} 
                    level={level + 1}
                  />
                </div>
              )}
              
              {/* Files */}
              {typeof details === 'object' && details.files && (
                <div className="ml-4 space-y-1">
                  {details.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center py-1">
                      <div className="w-6 text-gray-400 text-center">
                        📄
                      </div>
                      <span className="font-semibold text-green-600 mr-3 min-w-0 flex-shrink-0">
                        {file.split(' - ')[0]}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {file.split(' - ')[1]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* String descriptions */}
              {typeof details === 'string' && (
                <div className="ml-4 flex items-center py-1">
                  <div className="w-6 text-gray-400 text-center">
                    ℹ️
                  </div>
                  <span className="text-gray-600 text-sm">
                    {details}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Directory Structure Guide
            </h1>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-lg text-gray-600">
            A comprehensive guide to understanding and navigating the FM Bridge project structure.
            Use this page to determine where to place new files and components.
          </p>
        </div>

        {/* Directory Structure */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📁 Project Structure
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <DirectoryTree structure={directoryStructure} />
          </div>
        </div>

        {/* Placement Guide */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🤔 Where Should I Put...?
          </h2>
          <div className="space-y-4">
            {placementGuide.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.question}
                </h3>
                <p className="text-gray-700">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            ✅ Best Practices
          </h2>
          <ul className="space-y-2">
            {bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-gray-700">{practice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Reference */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            🚀 Quick Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Pages</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>app/auth/</code> - Authentication pages</li>
                <li>• <code>app/core/</code> - Core system pages</li>
                <li>• <code>app/roundup/</code> - Roundup pages</li>
                <li>• <code>app/api/</code> - API endpoints</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Components</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>components/auth/</code> - Auth components</li>
                <li>• <code>components/core/</code> - Core components</li>
                <li>• <code>components/roundup/</code> - Roundup components</li>
                <li>• <code>lib/</code> - Utilities & services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
