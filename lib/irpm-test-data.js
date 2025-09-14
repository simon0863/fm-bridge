/**
 * Test Data for IRPM Calculator
 * 
 * Sample data for testing IRPM calculations and form rendering
 */

export const testIRPMData = {"premiumTypes" : 
	[
		{
			"IRPMadjustment" : 0,
			"currentPremium" : 5271,
			"defaultUplift" : 6,
			"exemptAmount" : 575,
			"irpm" : 1.25,
			"name" : "Property",
			"permitIRPMAdjustment" : true,
			"previousIrpm" : 1.25,
			"previousPremium" : 6023
		},
		{
			"IRPMadjustment" : 0,
			"currentPremium" : 301,
			"defaultUplift" : 3,
			"exemptAmount" : 0,
			"irpm" : 1.25,
			"name" : "Liability",
			"permitIRPMAdjustment" : true,
			"previousIrpm" : 1.25,
			"previousPremium" : 301
		},
		{
			"IRPMadjustment" : 0,
			"currentPremium" : 0,
			"defaultUplift" : 0,
			"exemptAmount" : "0",
			"irpm" : 1,
			"name" : "Inland Marine",
			"permitIRPMAdjustment" : false,
			"previousIrpm" : 1,
			"previousPremium" : 0
		},
		{
			"IRPMadjustment" : 0,
			"currentPremium" : 0,
			"defaultUplift" : 0,
			"exemptAmount" : 0,
			"irpm" : 1,
			"name" : "Farm Excess Liability",
			"permitIRPMAdjustment" : false,
			"previousIrpm" : 1,
			"previousPremium" : 0
		}
	],
	"totals" : 
	{
		"currentTotal" : 5572,
		"previousTotal" : 6324
	}}



export const testIRPMData1 = {
    "premiumTypes": [
      {
        "IRPMadjustment": 0,
        "currentPremium": 500,
        "defaultUplift": 6,
        "exemptAmount": 0,
        "irpm": 1,
        "name": "Property",
        "permitIRPMAdjustment": true,
        "previousIrpm": 1,
        "previousPremium": 1000
      },
      {
        "IRPMadjustment": 0,
        "currentPremium": 350,
        "defaultUplift": 3,
        "exemptAmount": 0,
        "irpm": 1,
        "name": "Liability",
        "permitIRPMAdjustment": true,
        "previousIrpm": 1,
        "previousPremium": 700
      },
      {
        "IRPMadjustment": 0,
        "currentPremium": 0,
        "defaultUplift": 0,
        "exemptAmount": "0",
        "irpm": 1,
        "name": "Inland Marine",
        "permitIRPMAdjustment": false,
        "previousIrpm": 1,
        "previousPremium": 0
      },
      {
        "IRPMadjustment": 0,
        "currentPremium": 425,
        "defaultUplift": 0,
        "exemptAmount": 0,
        "irpm": 1,
        "name": "Farm Excess Liability",
        "permitIRPMAdjustment": false,
        "previousIrpm": 1,
        "previousPremium": 425
      }
    ],
    "totals": {
      "currentTotal": 1126,
      "previousTotal": 2125
    }
  }
  
  /**
   * Additional test data scenarios
   */
  export const testIRPMDataScenarios = {
    // Scenario with higher premiums
    highPremiums: {
      "premiumTypes": [
        {
          "IRPMadjustment": 0,
          "currentPremium": 2500,
          "defaultUplift": 8,
          "exemptAmount": 0,
          "irpm": 1.2,
          "name": "Property",
          "permitIRPMAdjustment": true,
          "previousIrpm": 1.0,
          "previousPremium": 2000
        },
        {
          "IRPMadjustment": 0,
          "currentPremium": 1800,
          "defaultUplift": 5,
          "exemptAmount": 0,
          "irpm": 1.1,
          "name": "Liability",
          "permitIRPMAdjustment": true,
          "previousIrpm": 1.0,
          "previousPremium": 1500
        }
      ],
      "totals": {
        "currentTotal": 4300,
        "previousTotal": 3500
      }
    },
    
    // Scenario with mixed adjustable/fixed
    mixedTypes: {
      "premiumTypes": [
        {
          "IRPMadjustment": 0,
          "currentPremium": 1000,
          "defaultUplift": 10,
          "exemptAmount": 100,
          "irpm": 1.5,
          "name": "Property",
          "permitIRPMAdjustment": true,
          "previousIrpm": 1.0,
          "previousPremium": 800
        },
        {
          "IRPMadjustment": 0,
          "currentPremium": 500,
          "defaultUplift": 0,
          "exemptAmount": 0,
          "irpm": 1.0,
          "name": "Fixed Coverage",
          "permitIRPMAdjustment": false,
          "previousIrpm": 1.0,
          "previousPremium": 500
        }
      ],
      "totals": {
        "currentTotal": 1500,
        "previousTotal": 1300
      }
    }
  }