"use client";

import { useState } from 'react';
import AuthIcon from '@/components/auth/AuthIcon';

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

export default function HomeClient({ components }) {
  const [openSections, setOpenSections] = useState({
    coreAuth: true,  // Open by default
    roundup: false,
    other: false
  });

  // Group components by category
  const coreAuthComponents = components.filter(c => c.category === 'core' || c.category === 'auth');
  const roundupComponents = components.filter(c => c.category === 'roundup');
  const otherComponents = components.filter(c => c.category === 'other');

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ComponentCard = ({ component }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
        {component.name}
      </h3>
      <p className="text-gray-600 mb-3">
        Route: <code className="bg-gray-200 px-2 py-1 rounded text-sm break-all">{component.path}</code>
      </p>
      <a
        href={component.url}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
      >
        View Component
      </a>
    </div>
  );

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-white shadow-xs border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-900">
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

        {/* Accordion Sections */}
        <div className="space-y-4 mb-12">
          {/* Core & Auth Section */}
          <AccordionSection
            title={`Core & Auth Components (${coreAuthComponents.length})`}
            isOpen={openSections.coreAuth}
            onToggle={() => toggleSection('coreAuth')}
            icon={
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coreAuthComponents.map((component) => (
                <ComponentCard key={component.path} component={component} />
              ))}
            </div>
          </AccordionSection>

          {/* Roundup Section */}
          <AccordionSection
            title={`Roundup Components (${roundupComponents.length})`}
            isOpen={openSections.roundup}
            onToggle={() => toggleSection('roundup')}
            icon={
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
          >
            {roundupComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundupComponents.map((component) => (
                  <ComponentCard key={component.path} component={component} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No Roundup components available yet.</p>
            )}
          </AccordionSection>

          {/* Other Integrations Section */}
          <AccordionSection
            title={`Other Integrations (${otherComponents.length})`}
            isOpen={openSections.other}
            onToggle={() => toggleSection('other')}
            icon={
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            }
          >
            {otherComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherComponents.map((component) => (
                  <ComponentCard key={component.path} component={component} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No other integrations available yet.</p>
            )}
          </AccordionSection>
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
