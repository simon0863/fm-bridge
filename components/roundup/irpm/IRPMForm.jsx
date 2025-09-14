'use client'

import React, { useState, useEffect } from 'react'
import PremiumRow from './PremiumRow'

/**
 * IRPMForm Component
 * 
 * Handles the main IRPM calculation form with dynamic premium type rows
 * 
 * @param {Object} data - FileMaker data for calculations and display
 * @param {Function} onRowStateChange - Callback when row values change
 */
export default function IRPMForm({ data, onRowStateChange }) {
  // Track all row values by name
  const [rowValues, setRowValues] = useState({})

  // Debug logging
  console.log('🔄 IRPMForm received data:', data)
  console.log('🔄 premiumTypes:', data?.premiumTypes)
  console.log('�� premiumTypes length:', data?.premiumTypes?.length)
  console.log('🔄 rowValues state:', rowValues)

  // Initialize row values when data changes
  useEffect(() => {
    console.log('📥 useEffect triggered - data changed:', data)
    if (data?.premiumTypes && Array.isArray(data.premiumTypes)) {
      console.log('✅ Initializing row values with premium types:', data.premiumTypes)
      const initialRowValues = {}
      data.premiumTypes.forEach((premium) => {
        initialRowValues[premium.name] = {
          targetPremium: premium.currentPremium,
          currentPremium: premium.currentPremium,
          IRPMadjustment: premium.IRPMadjustment,
          newIRPM: premium.irpm
        }
      })
      console.log('✅ Setting row values:', initialRowValues)
      setRowValues(initialRowValues)
    } else {
      console.log('❌ No valid premium types found')
    }
  }, [data])

  // Notify parent component when row values change
  useEffect(() => {
    console.log('�� Notifying parent of row values change:', rowValues)
    if (onRowStateChange) {
      onRowStateChange(rowValues)
    }
  }, [rowValues, onRowStateChange])

  // Update the correct row on change - FIXED: Match original function signature
  const handlePremiumUpdate = (
    premiumName,
    targetPremium,
    currentPremium,
    IRPMadjustment,
    newIRPM
  ) => {
    console.log('🔄 Premium update:', { premiumName, targetPremium, currentPremium, IRPMadjustment, newIRPM })
    setRowValues(prev => ({
      ...prev,
      [premiumName]: {
        targetPremium,
        currentPremium,
        IRPMadjustment,
        newIRPM
      }
    }))
  }

  // Calculate totals from all rows
  const totals = Object.values(rowValues).reduce(
    (acc, row) => ({
      targetTotal: acc.targetTotal + (row.targetPremium || 0),
      currentTotal: acc.currentTotal + (row.currentPremium || 0)
    }),
    { targetTotal: 0, currentTotal: 0 }
  )

  // Check if any premium types permit IRPM adjustment
  const showAdjustColumn = data?.premiumTypes?.some((premium) => premium.permitIRPMAdjustment) || false

  // Debug: Show what we're checking
  console.log('�� Data check:', {
    hasData: !!data,
    hasPremiumTypes: !!data?.premiumTypes,
    isArray: Array.isArray(data?.premiumTypes),
    length: data?.premiumTypes?.length,
    dataKeys: data ? Object.keys(data) : 'no data'
  })

  // Don't render if no data
  if (!data || !data.premiumTypes || !Array.isArray(data.premiumTypes) || data.premiumTypes.length === 0) {
    console.log('❌ Rendering no data message')
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No premium data available</p>
        <p className="text-sm mt-2">Debug: data={JSON.stringify(data)}</p>
        <p className="text-sm mt-2">Row values: {JSON.stringify(rowValues)}</p>
      </div>
    )
  }

  console.log('✅ Rendering premium rows')
  return (
    <div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          {/* Header row */}
          <tr>
            <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}></th>
            <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}>Original Premium</th>
            <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}>% Premium Change</th>
            <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}>$ Premium Target</th>
            <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}>Current Renewal Premium</th>
            <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}>New IRPM</th>
            {showAdjustColumn && (
              <th style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", backgroundColor: "#F9F9F9", color: "#89898B", textAlign: "left", fontSize: "12px", fontFamily: "Helvetica", fontWeight: "bold" }}>Adjust</th>
            )}
          </tr>
        </thead>
        <tbody>
          {/* Body rows */}
          {data.premiumTypes.map((premium, index) => {
            console.log(`🎯 Rendering premium row ${index}:`, premium)
            return (
              <PremiumRow 
                key={index} 
                premium={premium} 
                rowState={rowValues[premium.name]}
                onPremiumUpdate={handlePremiumUpdate}
                index={index}
              />
            )
          })}
          {/* Total row */}
          <tr>
            {/* Cell 1: Total */}
            <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", fontWeight: "bold", textAlign: "left", color: "#89898B", fontSize: "12px", fontFamily: "Helvetica" }}>Total</td>
            {/* Cell 2: Previous Total */}
            <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "12px", fontFamily: "Arial", color: "#515262" }}>
              {data?.totals?.previousTotal ? `$${Math.round(data.totals.previousTotal).toLocaleString()}` : ""}
            </td>
            {/* Cell 3: % Premium Change Percentage*/}
            <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "12px", fontFamily: "Arial", color: "#515262" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontFamily: "Arial", color: "#515262" }}>
                  {totals.targetTotal > 0 && data?.totals?.previousTotal > 0 
                    ? (((totals.targetTotal - data?.totals?.previousTotal) / data?.totals?.previousTotal) * 100).toFixed(1)
                    : "0"}%
                </span>
              </div>
            </td>
            {/* Cell 4: Premium target total */}
            <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "12px", fontFamily: "Arial", color: "#515262" }}>
              {totals.targetTotal > 0 ? `$${Math.round(totals.targetTotal).toLocaleString()}` : ""}
            </td>
            {/* Cell 5: Current renewal total*/}
            <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "12px", fontFamily: "Arial", color: "#515262" }}>
              {totals.currentTotal > 0 ? `$${Math.round(totals.currentTotal).toLocaleString()}` : ""}
            </td>
            {/* Cell 6: Blank*/}
            <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "12px", fontFamily: "Arial", color: "#515262" }}></td>
            {/* Cell 7: blank*/}
            {showAdjustColumn && (
              <td style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "12px", fontFamily: "Arial", color: "#515262" }}></td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  )
}