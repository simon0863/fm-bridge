'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import IRPMForm from '@/components/roundup/irpm/IRPMForm'
import { testIRPMData } from '@/lib/irpm-test-data'  // Updated import path


export default function IRPMPage() {
  const params = useParams()
  const { id } = params
  const testMode = !id || id === 'undefined' || id === '[id]' || id === '%5Bid%5D' || id.trim() === '';
  console.log('Test mode:', testMode)
  console.log('ID:', id)
  
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rowValues, setRowValues] = useState({})

  // Load data from test data or API
  useEffect(() => {
    if (testMode) {
      // Simulate loading data
      console.log('IRPM Page loaded for policy:', id)
      
      // Load test data after a short delay
      setTimeout(() => {
        setData(testIRPMData)
        setLoading(false)
      }, 1000)
    } else {
      // Load data from API
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null); // Clear previous errors
          console.log('🔍 Fetching IRPM data for record:', id);
          
          const response = await fetch(`/api/roundup/irpm/${id}`);
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ IRPM data loaded:', result.data);
            setData(result.data);
          } else {
            console.error('❌ API Error:', result.error);
            setError(result.error);
            // Fallback to test data on error
            setData(testIRPMData);
          }
        } catch (error) {
          console.error('❌ Network error:', error);
          setError(error.message);
          // Fallback to test data on network error
          setData(testIRPMData);
        } finally {
          setLoading(false);
        }
      };
      
      if (id) {
        fetchData();
      }
    }
  }, [id, testMode]);
  // Handle row value changes from IRPMForm
  const handleRowStateChange = (newRowValues) => {
    setRowValues(newRowValues)
    console.log('Row values updated:', newRowValues)
  }

  // Retry function for failed requests
  const retryFetch = () => {
    setError(null);
    if (id) {
      fetchData();
    }
  }

  // Update IRPM data function
  const updateIRPMData = async (updateType) => {
    // Check if in test mode
    if (testMode) {
      alert(`Unable to update policy IRPM values in test mode.\n\nTest mode is active because no valid policy ID of a renewal quote was provided. To update real data, please navigate to the IRPM calculator with a valid policy ID of a renewal quote.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Updating IRPM data with type:', updateType);
      
      const response = await fetch(`/api/roundup/irpm/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            premiumTypes: data.premiumTypes?.map(premium => ({
              ...premium,
              irpm: rowValues[premium.name]?.newIRPM || premium.irpm
            })) || [],
            totals: data.totals || {}
          },
          updateType: updateType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ IRPM data updated successfully:', result.data);
        // Optionally refresh data or show success message
        alert(`IRPM data updated successfully! ${result.data.message}`);
      } else {
        console.error('❌ Update failed:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
        </div>

        {/* Test Mode Indicator */}
        {testMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Test Mode Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>No policy ID has been provided. Test data is being used for demonstration purposes.</p>
                  <p className="mt-1">You can see the component functioning and data being updated in the debug info below.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={retryFetch}
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* IRPM Form */}
        <IRPMForm 
          data={data} 
          onRowStateChange={handleRowStateChange}
        />

        {/* Update Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => updateIRPMData('property')}
            disabled={loading}
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {loading ? 'Updating...' : 'Update Property'}
          </button>
          <button
            onClick={() => updateIRPMData('liability')}
            disabled={loading}
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {loading ? 'Updating...' : 'Update Liability'}
          </button>
          <button
            onClick={() => updateIRPMData('all')}
            disabled={loading}
            className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update All'}
          </button>
        </div>

        {/* Debug info (remove this later) */}
        {testMode && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-sm text-gray-600">
              {JSON.stringify(rowValues, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}