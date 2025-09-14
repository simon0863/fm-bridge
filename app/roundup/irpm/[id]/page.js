'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import IRPMForm from '@/components/roundup/irpm/IRPMForm'
import { testIRPMData } from '@/lib/irpm-test-data'  // Updated import path

export default function IRPMPage() {
  const params = useParams()
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [rowValues, setRowValues] = useState({})

  // Get policy id from URL params
  const { id } = params

  useEffect(() => {
    // Simulate loading data
    console.log('IRPM Page loaded for policy:', id)
    
    // Load test data after a short delay
    setTimeout(() => {
      setData(testIRPMData)
      setLoading(false)
    }, 1000)
  }, [id])

  // Handle row value changes from IRPMForm
  const handleRowStateChange = (newRowValues) => {
    setRowValues(newRowValues)
    console.log('Row values updated:', newRowValues)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading IRPM data...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">IRPM Calculator</h1>
          <p className="text-muted-foreground">
            Policy ID: {id}
          </p>
        </div>

        {/* IRPM Form */}
        <IRPMForm 
          data={data} 
          onRowStateChange={handleRowStateChange}
        />

        {/* Debug info (remove this later) */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-sm text-gray-600">
            {JSON.stringify(rowValues, null, 2)}
          </pre>
        </div>
      </div>
    </ProtectedRoute>
  )
}