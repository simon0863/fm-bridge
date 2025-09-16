'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Shield, 
  Zap, 
  Globe, 
  Code, 
  Layers,
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  Settings
} from 'lucide-react'

export default function AboutPage() {
  const coreFeatures = [
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: "FileMaker Data API Integration",
      description: "Seamless connection to FileMaker databases using the Data API with shared session management, automatic reconnection, and robust error handling."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "NextAuth.js Authentication",
      description: "Enterprise-grade authentication supporting FileMaker credentials, magic links, and OAuth proxy for Microsoft SSO integration."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Real-time Data Synchronization",
      description: "Live data updates between FileMaker and web applications with automatic session management and connection pooling."
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "WebViewer Integration",
      description: "Optimized for FileMaker WebViewer with JWT-based authentication, session persistence, and responsive design."
    },
    {
      icon: <Shield className="h-8 w-8 text-orange-600" />,
      title: "Flexible Protected Routes",
      description: "Configurable authentication behavior with environment variables - redirect to login or show user-friendly access denied messages."
    }
  ]

  const techStack = [
    {
      category: "Frontend Framework",
      technologies: [
        { name: "Next.js 15", description: "React framework with App Router" },
        { name: "React 18", description: "Component-based UI library" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework" },
        { name: "Lucide React", description: "Beautiful icon library" }
      ]
    },
    {
      category: "Authentication & Security",
      technologies: [
        { name: "NextAuth.js", description: "Complete authentication solution" },
        { name: "JWT", description: "JSON Web Tokens for secure sessions" },
        { name: "OAuth 2.0", description: "Microsoft SSO integration" },
        { name: "HTTP-Only Cookies", description: "Secure session storage" },
        { name: "Protected Routes", description: "Configurable unauthorized access handling" }
      ]
    },
    {
      category: "FileMaker Integration",
      technologies: [
        { name: "FileMaker Data API", description: "RESTful API for database access" },
        { name: "Session Management", description: "Shared connection pooling" },
        { name: "Script Execution", description: "Remote script calling" },
        { name: "Error Handling", description: "Robust retry mechanisms" }
      ]
    },
    {
      category: "Development & Deployment",
      technologies: [
        { name: "JavaScript", description: "Modern ES6+ JavaScript" },
        { name: "ESLint", description: "Code quality and consistency" },
        { name: "Vercel", description: "Serverless deployment platform" },
        { name: "pnpm", description: "Fast package manager" }
      ]
    }
  ]

  const useCases = [
    {
      title: "Enhanced WebViewer Content",
      description: "Create rich, interactive web content that seamlessly integrates with your FileMaker solutions",
      examples: [
        "Interactive dashboards and reports",
        "Advanced data visualization",
        "Real-time collaboration tools",
        "Custom user interfaces"
      ]
    },
    {
      title: "Microsites & Portals",
      description: "Build standalone web applications that connect to your FileMaker backend",
      examples: [
        "Customer portals",
        "Public-facing websites",
        "Mobile-responsive applications",
        "Third-party integrations"
      ]
    },
    {
      title: "API-First Architecture",
      description: "Expose FileMaker data through modern REST APIs for broader integration",
      examples: [
        "Mobile app backends",
        "Third-party system integration",
        "Webhook implementations",
        "Data synchronization services"
      ]
    }
  ]

  const benefits = [
    "Leverage modern web technologies while maintaining FileMaker as your data source",
    "Build responsive, mobile-friendly interfaces that work across all devices",
    "Implement enterprise-grade security with industry-standard authentication",
    "Scale your FileMaker solutions with cloud-native architecture",
    "Reduce development time with pre-built components and services",
    "Maintain data consistency with real-time synchronization"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About FM-Bridge
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A modern web framework designed specifically for FileMaker developers to create 
            enhanced web content, microsites, and API integrations that seamlessly connect 
            to your FileMaker solutions.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Get Started
            </Link>
          </div>
        </div>

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Core Functionality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {techStack.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="mr-2 h-6 w-6 text-blue-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <Badge variant="secondary" className="mb-1">
                            {tech.name}
                          </Badge>
                          <p className="text-sm text-gray-600">{tech.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perfect For FileMaker Developers
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-blue-600" />
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{example}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-blue-900">
                Why Choose FM-Bridge?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Target Audience */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <Users className="mr-3 h-8 w-8 text-blue-600" />
                Built for FileMaker Developers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center max-w-4xl mx-auto">
                <p className="text-lg text-gray-600 mb-6">
                  FM-Bridge is specifically designed for FileMaker developers who want to extend 
                  their solutions with modern web technologies while maintaining the power and 
                  flexibility of FileMaker as their data source.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">Perfect if you want to:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Create modern web interfaces for FileMaker data</li>
                      <li>• Build responsive, mobile-friendly applications</li>
                      <li>• Integrate with third-party services and APIs</li>
                      <li>• Implement advanced authentication and security</li>
                      <li>• Scale your FileMaker solutions to the cloud</li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">Ideal for:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• FileMaker developers expanding to web</li>
                      <li>• Teams building microsites and portals</li>
                      <li>• Organizations needing API integrations</li>
                      <li>• Projects requiring modern UI/UX</li>
                      <li>• Solutions needing cloud deployment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Getting Started */}
        <section className="text-center">
          <Card className="bg-gray-900 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Start building modern web applications that seamlessly integrate with your FileMaker solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/core/directory-structure"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Code className="mr-2 h-5 w-5" />
                  Explore Documentation
                </Link>
                <Link
                  href="/core/filemaker-dapi-test"
                  className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Test FileMaker Integration
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}