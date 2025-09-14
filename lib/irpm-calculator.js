/**
 * IRPM Calculator Utilities
 * 
 * Core calculation functions for Insurance Risk Premium Multiplier
 * Converted from TypeScript to JavaScript
 */

/**
 * Calculate IRPM required to meet target premium
 * 
 * @param {number} renewalPremium - Current renewal premium
 * @param {number} renewalPremiumNotSubjectToIRPM - Premium amount not subject to IRPM
 * @param {number} targetPremium - Desired target premium
 * @param {number} originalIRPM - Current IRPM value
 * @returns {number} Calculated IRPM value
 */
export function calculateIRPMRequiredToMeetTarget(
    renewalPremium,
    renewalPremiumNotSubjectToIRPM,
    targetPremium,
    originalIRPM
  ) {
    // Calculate premium subject to IRPM
    const premiumSubjectToIRPM = renewalPremium - renewalPremiumNotSubjectToIRPM
  
    // Calculate premium without IRPM (base premium)
    const premiumWithoutIRPM = premiumSubjectToIRPM / originalIRPM
  
    // Calculate target premium without IRPM
    const targetPremiumWithoutIRPM = targetPremium - renewalPremiumNotSubjectToIRPM
  
    // Calculate new IRPM required
    const newIRPM = targetPremiumWithoutIRPM / premiumWithoutIRPM
  
    // Return the calculated IRPM (round to 4 decimal places)
    return Math.round(newIRPM * 10000) / 10000
  }
  
  /**
   * Calculate premium with IRPM uplift
   * 
   * @param {number} basePremium - Base premium amount
   * @param {number} irpm - IRPM multiplier
   * @param {number} exemptAmount - Amount exempt from IRPM
   * @returns {number} Premium with IRPM applied
   */
  export function calculatePremiumWithIRPM(basePremium, irpm, exemptAmount = 0) {
    const premiumSubjectToIRPM = basePremium - exemptAmount
    const premiumWithIRPM = (premiumSubjectToIRPM * irpm) + exemptAmount
    return Math.round(premiumWithIRPM * 100) / 100
  }
  
  /**
   * Calculate IRPM adjustment percentage
   * 
   * @param {number} currentIRPM - Current IRPM value
   * @param {number} newIRPM - New IRPM value
   * @returns {number} Percentage change
   */
  export function calculateIRPMAdjustmentPercentage(currentIRPM, newIRPM) {
    if (currentIRPM === 0) return 0
    const percentage = ((newIRPM - currentIRPM) / currentIRPM) * 100
    return Math.round(percentage * 100) / 100
  }
  
  /**
   * Validate IRPM calculation inputs
   * 
   * @param {Object} inputs - Input values to validate
   * @returns {Object} Validation result with errors array
   */
  export function validateIRPMInputs(inputs) {
    const errors = []
    
    if (!inputs.renewalPremium || inputs.renewalPremium < 0) {
      errors.push('Renewal premium must be a positive number')
    }
    
    if (!inputs.targetPremium || inputs.targetPremium < 0) {
      errors.push('Target premium must be a positive number')
    }
    
    if (!inputs.originalIRPM || inputs.originalIRPM <= 0) {
      errors.push('Original IRPM must be greater than 0')
    }
    
    if (inputs.renewalPremiumNotSubjectToIRPM < 0) {
      errors.push('Premium not subject to IRPM cannot be negative')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Format IRPM value for display
   * 
   * @param {number} irpm - IRPM value to format
   * @param {number} decimals - Number of decimal places (default: 4)
   * @returns {string} Formatted IRPM string
   */
  export function formatIRPM(irpm, decimals = 4) {
    if (isNaN(irpm) || irpm === null || irpm === undefined) {
      return '0.0000'
    }
    return irpm.toFixed(decimals)
  }
  
  /**
   * Format currency value for display
   * 
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: 'USD')
   * @returns {string} Formatted currency string
   */
  export function formatCurrency(amount, currency = 'USD') {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00'
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }