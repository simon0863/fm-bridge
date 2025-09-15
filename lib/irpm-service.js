import { filemakerService } from './filemaker-service.js';


/**
 * IRPM Service - Handles FileMaker Data API calls for IRPM data
 * Uses the shared session management from FileMakerService
 */
export class IRPMService {
    constructor() {
        this.fmServer = process.env.FILEMAKER_SERVER;
        this.database = process.env.FILEMAKER_DATABASE;
        
        if (!this.fmServer || !this.database) {
            throw new Error('FileMaker configuration missing: check FILEMAKER_SERVER and FILEMAKER_DATABASE');
        }
    }

    /**
     * Get IRPM data for a specific record ID
     * @param {string} recordId - The FileMaker record ID
     * @returns {Promise<Object>} - IRPM data object
     */
    async getIRPMData(recordId) {
        // Input validation
        if (!recordId || typeof recordId !== 'string' || recordId.trim() === '') {
            throw new Error('Invalid recordId: must be a non-empty string');
        }
        
        try {
            console.log('🔍 IRPMService.getIRPMData() called for record:', recordId);
            const callId = crypto.randomUUID()
            
            // Get shared session
            const sessionToken = await filemakerService.getDataSession();
            console.log('🔍 Using session token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'null');

            // Make API call to FileMaker
            const response = await fetch(`${this.fmServer}/fmi/data/v1/databases/${this.database}/layouts/API_REQUEST/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    fieldData: {
                        d__type: "v1_ReturnIRPMHelperData",
                        a_sk_Policy_id: recordId,
                        d__importResult_Json: JSON.stringify({policyId: recordId}),
                        a_sk_Call_id: callId
                    },
                    options: {
                        entrymode: "user",
                        prohibitmode: "user"
                    },
                    "script": "v1_ReturnIRPMHelperData",
                    "script.param": callId
                })
            }
        );
            
        

            if (!response.ok) {
                throw new Error(`FileMaker API error: ${response.status} ${response.statusText}`);
            }

            if (response.status === 200) {
                const data = await response.json();
                const message = data.messages[0];
                if (message.code === "0") { 
                    console.log('✅ IRPM data retrieved successfully');
                    console.log('🔍 Raw scriptResult:', data.response.scriptResult);
                    
                    // Parse the JSON string to JavaScript object
                    const parsedData = JSON.parse(data.response.scriptResult);
                    console.log('✅ Parsed IRPM data:', parsedData);
                    
                    // Validate data structure
                    if (!parsedData.premiumTypes || !Array.isArray(parsedData.premiumTypes)) {
                        throw new Error('Invalid IRPM data: missing or invalid premiumTypes array');
                    }
                    if (!parsedData.totals || typeof parsedData.totals !== 'object') {
                        throw new Error('Invalid IRPM data: missing or invalid totals object');
                    }
                    if (typeof parsedData.totals.currentTotal !== 'number' || typeof parsedData.totals.previousTotal !== 'number') {
                        throw new Error('Invalid IRPM data: totals must contain numeric currentTotal and previousTotal');
                    }
                    
                    return parsedData;
                } else {
                    throw new Error(`FileMaker script error: ${message.message}`);
                }
            } else {
                throw new Error(`FileMaker API error: ${response.status} ${response.statusText}`);
            }
            


        } catch (error) {
            console.error('❌ Error getting IRPM data:', error.message);
            throw error;
        
    }}

    /**
     * Update IRPM data for a specific record ID
     * @param {string} recordId - The FileMaker record ID
     * @param {Object} irpmData - The IRPM data to update
     * @param {string} updateType - Type of update: 'all', 'property', 'liability'
     * @returns {Promise<Object>} - Update result
     */
    async updateIRPMData(recordId, irpmData, updateType = 'all') {
        // Input validation
        if (!recordId || typeof recordId !== 'string' || recordId.trim() === '') {
            throw new Error('Invalid recordId: must be a non-empty string');
        }
        if (!irpmData || typeof irpmData !== 'object') {
            throw new Error('Invalid irpmData: must be an object');
        }
        if (!['all', 'property', 'liability'].includes(updateType)) {
            throw new Error('Invalid updateType: must be "all", "property", or "liability"');
        }
        
        try {
            console.log('🔍 IRPMService.updateIRPMData() called for record:', recordId);
            console.log('🔍 Update type:', updateType);
            console.log('🔍 Update data:', irpmData);
            const callId = crypto.randomUUID();
            
            // Get shared session
            const sessionToken = await filemakerService.getDataSession();
            console.log('🔍 Using session token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'null');

            // Transform our data format to FileMaker format based on update type
            const fmData = this.transformToFileMakerFormat(irpmData, updateType);

            // Make API call to FileMaker using the correct structure
            const response = await fetch(`${this.fmServer}/fmi/data/v1/databases/${this.database}/layouts/API_REQUEST/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    fieldData: {
                        d__type: "v1_SetIRPMDataFromHelper",
                        a_sk_Policy_id: recordId,
                        d__importResult_Json: JSON.stringify(fmData),
                        a_sk_Call_id: callId
                    },
                    options: {
                        entrymode: "user",
                        prohibitmode: "user"
                    },
                    "script": "v1_SetIRPMDataFromHelper",
                    "script.param": callId
                })
            });

            if (!response.ok) {
                throw new Error(`FileMaker API error: ${response.status} ${response.statusText}`);
            }

            if (response.status === 200) {
                const data = await response.json();
                const message = data.messages[0];
                if (message.code === "0") {
                    console.log('✅ IRPM data updated successfully');
                    console.log('🔍 Script result:', data.response.scriptResult);
                    
                    // Parse the script result to get the update status
                    const scriptResult = JSON.parse(data.response.scriptResult);
                    return {
                        success: true,
                        message: scriptResult.Message,
                        statusCode: scriptResult.statusCode,
                        recordId: data.response.recordId
                    };
                } else {
                    throw new Error(`FileMaker script error: ${message.message}`);
                }
            } else {
                throw new Error(`FileMaker API error: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Error updating IRPM data:', error.message);
            throw error;
        }
    }

    /**
     * Transform FileMaker response to our expected IRPM data format
     * @param {Object} fmResponse - FileMaker API response
     * @returns {Object} - Transformed IRPM data
     */
    transformIRPMData(fmResponse) {
        try {
            // This is a placeholder - you'll need to adjust based on your actual FileMaker layout
            // For now, return the test data structure
            console.log('🔄 Transforming FileMaker response to IRPM format');
            
            // Extract data from FileMaker response
            const record = fmResponse.response?.data?.[0];
            if (!record) {
                throw new Error('No record data found in FileMaker response');
            }

            // Transform to our expected format
            // You'll need to map your actual FileMaker field names here
            const transformedData = {
                premiumTypes: [
                    {
                        IRPMadjustment: record.fieldData?.IRPMadjustment || 0,
                        currentPremium: record.fieldData?.currentPremium || 0,
                        defaultUplift: record.fieldData?.defaultUplift || 0,
                        exemptAmount: record.fieldData?.exemptAmount || 0,
                        irpm: record.fieldData?.irpm || 1,
                        name: record.fieldData?.name || 'Unknown',
                        permitIRPMAdjustment: record.fieldData?.permitIRPMAdjustment || false,
                        previousIrpm: record.fieldData?.previousIrpm || 1,
                        previousPremium: record.fieldData?.previousPremium || 0
                    }
                ],
                totals: {
                    currentTotal: record.fieldData?.currentTotal || 0,
                    previousTotal: record.fieldData?.previousTotal || 0
                }
            };

            console.log('✅ Data transformation completed');
            return transformedData;
            
        } catch (error) {
            console.error('❌ Error transforming IRPM data:', error.message);
            throw error;
        }
    }

    /**
     * Transform our IRPM data format to FileMaker field format
     * @param {Object} irpmData - Our IRPM data format
     * @param {string} updateType - Type of update: 'all', 'property', 'liability'
     * @returns {Object} - FileMaker field data format
     */
    transformToFileMakerFormat(irpmData, updateType = 'all') {
        try {
            console.log('🔄 Transforming IRPM data to FileMaker format for update type:', updateType);
            
            // Field mapping for premium types
            const fieldMapping = {
                'Property': 'propertyIRPM',
                'Liability': 'liabilityIRPM',
                'Inland Marine': 'inlandmarineIRPM',
                'Farm Excess Liability': 'farmexcessliabilityIRPM'
            };
            
            const fmData = {};
            
            // Get all adjustable premium types
            if (irpmData.premiumTypes && Array.isArray(irpmData.premiumTypes)) {
                const adjustableTypes = irpmData.premiumTypes.filter(premium => 
                    premium.permitIRPMAdjustment === true
                );
                
                console.log('🔍 Adjustable types found:', adjustableTypes.map(p => p.name));
                
                // Process each adjustable type
                adjustableTypes.forEach((premium) => {
                    const fieldName = fieldMapping[premium.name];
                    if (fieldName) {
                        // Determine if this field should be updated based on updateType
                        let shouldUpdate = false;
                        let value = '';
                        
                        switch (updateType) {
                            case 'all':
                                shouldUpdate = true;
                                value = premium.irpm?.toString() || '';
                                break;
                            case 'property':
                                shouldUpdate = premium.name === 'Property';
                                value = shouldUpdate ? (premium.irpm?.toString() || '') : '';
                                break;
                            case 'liability':
                                shouldUpdate = premium.name === 'Liability';
                                value = shouldUpdate ? (premium.irpm?.toString() || '') : '';
                                break;
                        }
                        
                        // Always include the field, but use empty string if not updating
                        fmData[fieldName] = shouldUpdate ? value : '';
                    }
                });
            }

            console.log('✅ FileMaker format transformation completed:', fmData);
            return fmData;
            
        } catch (error) {
            console.error('❌ Error transforming to FileMaker format:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
export const irpmService = new IRPMService();
