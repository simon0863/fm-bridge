// FileMaker Data API Service
// Manages FileMaker sessions and tokens for data operations and authentication

import crypto from 'crypto'
import { validateJWT } from './validateJWTToNextAuthUser';
// ============================================================================
// JSDoc Type Definitions - Define the structure of FileMaker API responses
// ============================================================================

/**
 * @typedef {Object} FileMakerSessionResponse
 * @property {Object} response
 * @property {string} response.token - The session token we need to store and use
 * @property {Array<Object>} messages
 * @property {string} messages[].code - FileMaker message code
 * @property {string} messages[].message - FileMaker message text
 */

/**
 * @typedef {Object} FileMakerError
 * @property {string} errorCode - FileMaker error code
 * @property {string} message - Error description
 */

// ============================================================================
// FILEMAKER SERVICE CLASS - Singleton pattern for managing FileMaker sessions
// ============================================================================

export class FileMakerService {
    // Singleton instance - ensures only one service instance exists
    static instance;

    // FileMaker connection configuration - loaded from environment variables
    fmServer;      // FileMaker server URL (e.g., https://your-server.com)
    fmDatabase;    // FileMaker database name
    fmUsername;    // FileMaker username for authentication
    fmPassword;    // FileMaker password for authentication


    // ============================================================================
    // CONSTRUCTOR - Private constructor for singleton pattern
    // ============================================================================

    constructor() {
        // Load FileMaker configuration from environment variables
        // These should be set in your .env.local file
        this.fmServer = process.env.FILEMAKER_SERVER || '';
        this.fmDatabase = process.env.FILEMAKER_DATABASE || '';
        this.fmUsername = process.env.FILEMAKER_USERNAME || '';
        this.fmPassword = process.env.FILEMAKER_PASSWORD || '';

    }

    // ============================================================================
    // SINGLETON GETTER - Returns the single instance of the service
    // ============================================================================

    static getInstance() {
        // Create instance if it doesn't exist, otherwise return existing instance
        if (!FileMakerService.instance) {
            FileMakerService.instance = new FileMakerService();
        }
        return FileMakerService.instance;
    }

    // ============================================================================
    // SESSION CREATION - Creates a new FileMaker Data API session
    // ============================================================================

    /**
     * Create a new FileMaker Data API session
     * @param {string} sessionName - Name to identify this session (e.g., 'data', 'auth')
     * @returns {Promise<string>} - The session token
     */
    async createSession(sessionName) {
        try {
            // console.log(`Creating FileMaker session: ${sessionName}`);

            // Make POST request to FileMaker Data API to create a new session
            // Uses Basic authentication with username:password encoded in base64
            const response = await fetch(`${this.fmServer}/fmi/data/v1/databases/${this.fmDatabase}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Basic auth: encode username:password in base64
                    'Authorization': `Basic ${Buffer.from(`${this.fmUsername}:${this.fmPassword}`).toString('base64')}`
                }
            });

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`Failed to create FileMaker session: ${response.status} ${response.statusText}`);
            }

            // Parse the JSON response from FileMaker
            const data = await response.json();

            // Extract the token from the response
            if (data.response && data.response.token) {
                // console.log(`FileMaker session created successfully: ${sessionName}`);
                return data.response.token;  // Return the session token
            } else {
                throw new Error('No token received from FileMaker');
            }
        } catch (error) {
            // console.error(`Error creating FileMaker session ${sessionName}:`, error);
            throw error;  // Re-throw the error for handling by calling code
        }
    }


    // ================================================
    // AUTHENTICATE FILEMAKER USER OVER FILEMAKER DAPI
    // ================================================

    //Step 1: Establish FileMaker session via Data API
    //Step 2: Call authentication script
    //Step 3: Validate the JWT response
    //Step 4: Return the user object

    async authenticateFileMakerUser(username, password, authtoken) {

        // Determine if this is an OAuth process
        const oauthProcess = !!authtoken;  // true if authtoken exists, false otherwise

        // Use authtoken if provided, otherwise create new session
        const sessionToken = authtoken || await this.createSession("auth");

        //Step 1: Establish FileMaker session via Data API if username password login

    

        //Step 2: Call authentication script
        try {
            const callId = crypto.randomUUID();
            const jwtResponse = await fetch(
                `${this.fmServer}/fmi/data/vLatest/databases/${this.fmDatabase}/layouts/API_REQUEST/_find`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionToken}`,
                    },
                    body: JSON.stringify({
                        "query": [
                            { "a_sk_Call_id": callId }
                        ],
                        "script.prerequest": "v1_ReturnUsersJWT",
                        "script.prerequest.param": JSON.stringify({
                            "username": username,
                            "password": password,
                            "a_sk_Call_id": callId,
                            "oauthProcess": oauthProcess
                        })
                    }),
                }
            );

            // regardless of sucess or failure, we need to revoke the session
            await this.revokeSession(sessionToken);


            // The filemaker response will always be a 200 response with a JSON object in the data field
            // The data field will contain the JWT if the authentication is successful or {"message":"Unable to login"}
            if (jwtResponse.ok) {
                const data = await jwtResponse.json();

                //JWT from filemaker
                const unvalidatedJWT = JSON.parse(data.response.data[0].fieldData.d__OutputResult_JSON).message;


                // now validate JWT and return nextauth userr object.
                const nextAuthUser = await validateJWT(unvalidatedJWT)// now pass the JWT to the next step.

                // send back to the callback route.
                return nextAuthUser;

            } else { throw new Error('Failed to authenticate FileMaker user'); }
        } catch (error) {
            console.error('Error authenticating FileMaker user:', error);
            await this.revokeSession(authtoken);
        }

    }




    // ============================================================================
    // SESSION REVOCATION - Revokes a FileMaker Data API session
    // ============================================================================

    /**
     * Revoke a FileMaker Data API session
     * @param {string} token - The session token to revoke
     * @returns {Promise<boolean>} - Success status
     */
    async revokeSession(token) {
        try {
            // console.log('Revoking FileMaker session');

            // Make DELETE request to FileMaker Data API to revoke the session
            // Uses Bearer authentication with the session token
            const response = await fetch(`${this.fmServer}/fmi/data/v1/databases/${this.fmDatabase}/sessions/${token}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`  // Use the session token for authentication
                }
            });

            // Check if the revocation was successful
            if (response.ok) {
                console.log('FileMaker session revoked successfully');
                return true;
            } else {
                //console.error(`Failed to revoke FileMaker session: ${response.status}`);
                return false;
            }
        } catch (error) {
            // console.error('Error revoking FileMaker session:', error);
            return false;  // Return false on any error
        }
    }

    // ============================================================================
    // SESSION VALIDATION - Checks if a FileMaker session token is still valid
    // ============================================================================

    /**
     * Validate if a FileMaker session token is still valid
     * @param {string} token - The session token to validate
     * @returns {Promise<boolean>} - Token validity
     */
    async validateSession(token) {
        try {
            // Make GET request to check if the session is still valid
            // FileMaker will return 200 if valid, 401 if invalid
            const response = await fetch(`${this.fmServer}/fmi/data/v1/databases/${this.fmDatabase}/sessions/${token}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`  // Use the session token for authentication
                }
            });

            // Return true if the session is valid (200 status), false otherwise
            return response.ok;
        } catch (error) {
            // console.error('Error validating FileMaker session:', error);
            return false;  // Return false on any error
        }
    }

    // ============================================================================
    // UTILITY METHODS - Getter methods for configuration
    // ============================================================================

    /**
     * Get the FileMaker server URL
     * @returns {string} - The server URL
     */
    getServerUrl() {
        return this.fmServer;
    }

    /**
     * Get the FileMaker database name
     * @returns {string} - The database name
     */
    getDatabaseName() {
        return this.fmDatabase;
    }
}

// ============================================================================
// SINGLETON EXPORT - Export the singleton instance for use throughout the app
// ============================================================================

// Export singleton instance - this ensures we always use the same service instance
export const filemakerService = FileMakerService.getInstance();
