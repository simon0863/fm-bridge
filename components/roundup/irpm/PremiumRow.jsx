'use client'

import React, { useState, useEffect, useRef } from 'react'
import { calculateIRPMRequiredToMeetTarget } from '@/lib/irpm-calculator'

/**
 * PremiumRow Component
 * 
 * Individual row for each premium type with IRPM calculations
 * Only the slider is editable - all other values are calculated
 * 
 * @param {Object} premium - Premium type data from FileMaker
 * @param {Object} rowState - Current row state values
 * @param {Function} onPremiumUpdate - Callback when row values change
 * @param {number} index - Row index for styling
 */
export default function PremiumRow({ premium, rowState, onPremiumUpdate, index }) {
  console.log(' PremiumRow render for:', premium.name, 'premium:', premium)
  
  const hasAppliedDefaultUplift = useRef(false)

  // Handle IRPM adjustment change (slider)
  const handleIRPMAdjustmentChange = (e) => {
    const IRPMAdjustmentPercent = Number(e.target.value)
    const calcTargetPremium = premium.previousPremium * (1 + IRPMAdjustmentPercent / 100)
    const calculatedNewIRPM = calculateIRPMRequiredToMeetTarget(
      premium.currentPremium, 
      premium.exemptAmount, 
      calcTargetPremium, 
      premium.irpm
    )
    onPremiumUpdate(
      premium.name,
      calcTargetPremium,
      premium.currentPremium,
      IRPMAdjustmentPercent,
      calculatedNewIRPM
    )
  }

  // Handle increment button
  const handleIncrement = (amount = 1) => {
    const currentValue = rowState?.IRPMadjustment ?? premium.IRPMadjustment
    const newValue = Math.min(100, currentValue + amount)
    const calcTargetPremium = premium.previousPremium * (1 + newValue / 100)
    const calculatedNewIRPM = calculateIRPMRequiredToMeetTarget(
      premium.currentPremium, 
      premium.exemptAmount, 
      calcTargetPremium, 
      premium.irpm
    )
    onPremiumUpdate(
      premium.name,
      calcTargetPremium,
      premium.currentPremium,
      newValue,
      calculatedNewIRPM
    )
  }

  // Handle decrement button
  const handleDecrement = (amount = 1) => {
    const currentValue = rowState?.IRPMadjustment ?? premium.IRPMadjustment
    const newValue = Math.max(-100, currentValue - amount)
    const calcTargetPremium = premium.previousPremium * (1 + newValue / 100)
    const calculatedNewIRPM = calculateIRPMRequiredToMeetTarget(
      premium.currentPremium, 
      premium.exemptAmount, 
      calcTargetPremium, 
      premium.irpm
    )
    onPremiumUpdate(
      premium.name,
      calcTargetPremium,
      premium.currentPremium,
      newValue,
      calculatedNewIRPM
    )
  }

  // Apply default uplift on initial load
  useEffect(() => {
    if (
      !hasAppliedDefaultUplift.current &&
      rowState?.newIRPM === premium.previousIrpm &&
      premium.defaultUplift !== 0
    ) {
      if (premium.defaultUplift > 0) {
        handleIncrement(premium.defaultUplift)
      } else if (premium.defaultUplift < 0) {
        handleDecrement(Math.abs(premium.defaultUplift))
      }
      hasAppliedDefaultUplift.current = true
    }
  }, [rowState?.newIRPM, premium.previousIrpm, premium.defaultUplift])

  return (
    <tr style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f7f7fa' }}>
      {/* Premium Type Name */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        fontWeight: "bold", 
        textAlign: "left", 
        color: "#89898B", 
        fontSize: "12px", 
        fontFamily: "Helvetica" 
      }}>
        {premium.name}
      </td>

      {/* Original Premium (previousPremium) */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        textAlign: "left", 
        fontSize: "12px", 
        fontFamily: "Arial", 
        color: "#515262" 
      }}>
        {premium.previousPremium ? `$${Math.round(premium.previousPremium).toLocaleString()}` : ""}
      </td>

      {/* % Premium Change (IRPMadjustment) */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        textAlign: "left", 
        fontSize: "12px", 
        fontFamily: "Arial", 
        color: "#515262" 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontFamily: "Arial", color: "#515262" }}>
            {rowState?.IRPMadjustment ?? premium.IRPMadjustment}%
          </span>
        </div>
      </td>

      {/* $ Premium Target (calculated) */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        textAlign: "left", 
        fontSize: "12px", 
        fontFamily: "Arial", 
        color: "#515262" 
      }}>
        {rowState?.targetPremium ? `$${Math.round(rowState.targetPremium).toLocaleString()}` : ""}
      </td>

      {/* Current Renewal Premium (display only) */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        textAlign: "left", 
        fontSize: "12px", 
        fontFamily: "Arial", 
        color: "#515262" 
      }}>
        {premium.currentPremium ? `$${Math.round(premium.currentPremium).toLocaleString()}` : ""}
      </td>

      {/* New IRPM (calculated) */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        textAlign: "left", 
        fontSize: "12px", 
        fontFamily: "Arial", 
        color: "#515262" 
      }}>
        {premium.permitIRPMAdjustment && rowState?.newIRPM != null ? Number(rowState.newIRPM).toFixed(2) : ""}
      </td>

      {/* Adjust Slider (only for adjustable premium types) */}
      <td style={{ 
        borderTop: "1px solid #ddd", 
        borderBottom: "1px solid #ddd", 
        padding: "8px", 
        textAlign: "left", 
        fontSize: "12px", 
        fontFamily: "Arial", 
        color: "#515262" 
      }}>
        {premium.permitIRPMAdjustment && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => handleDecrement()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#666',
                padding: '2px',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px'
              }}
              title="Decrease by 1"
            >
              −
            </button>
            <input
              type="range"
              value={rowState?.IRPMadjustment ?? premium.IRPMadjustment}
              onChange={handleIRPMAdjustmentChange}
              min={-100}
              max={100}
              step={1}
              style={{ width: '120px' }}
            />
            <button
              onClick={() => handleIncrement()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#666',
                padding: '2px',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px'
              }}
              title="Increase by 1"
            >
              +
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}