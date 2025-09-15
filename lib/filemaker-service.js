// FileMaker Data API Service
// Manages FileMaker sessions and tokens for data operations and authentication

import crypto from 'crypto'
import { validateJWT } from './validateJWTToNextAuthUser';
// ============================================================================
// JSDoc Type Definitions - Define the structure of FileMaker API responses
// ============================================================================

/**
 * @typedef {Object} NextAuthUser
 * @property {Object} user - User information from FileMaker
 * @property {string} user.id - User ID
 * @property {string} user.name - User display name
 * @property {string} user.email - User email address
 * @property {string} group - User's privilege set/group
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
    fmAuthUsername;    // FileMaker username for authentication
    fmAuthPassword;    // FileMaker password for authentication
    fmDataUsername;    // FileMaker username for data access
    fmDataPassword;    // FileMaker password for data access

    // Shared session management for data operations
    dataSession;        // Current data session token
    dataSessionExpiry;  // Session expiration timestamp
    sessionLock;        // Prevent concurrent session creation
    lastHealthCheck;    // Last health check timestamp


    // ============================================================================
    // CONSTRUCTOR - Private constructor for singleton pattern
    // ============================================================================

    constructor() {
        // Load FileMaker configuration from environment variables
        // These should be set in your .env.local file
        this.fmServer = process.env.FILEMAKER_SERVER || '';
        this.fmDatabase = process.env.FILEMAKER_DATABASE || '';
        this.fmAuthUsername = process.env.FILEMAKER_AUTH_USERNAME || '';
        this.fmAuthPassword = process.env.FILEMAKER_AUTH_PASSWORD || '';
        this.fmDataUsername = process.env.FILEMAKER_DATA_USERNAME || '';
        this.fmDataPassword = process.env.FILEMAKER_DATA_PASSWORD || '';

        // Initialize session management properties
        this.dataSession = null;
        this.dataSessionExpiry = null;
        this.sessionLock = false;
        this.lastHealthCheck = 0;
    }

    // ============================================================================
    // SINGLETON GETTER - Returns the single instance of the service
    // ============================================================================

    /**
     * Get the singleton instance of FileMakerService
     * @returns {FileMakerService} - The singleton instance
     */
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
    //TODO check how the session is being created. If user has no fmdapi privileges, Originally we had two predefined sessions, data and auth.
    // where did they go?
    async createSession(sessionName) {
        try {
            let username;
            let password;
            if (sessionName === 'data') {
                username = this.fmDataUsername;
                password = this.fmDataPassword;
            } else {
                username = this.fmAuthUsername;
                password = this.fmAuthPassword;
            }
            // console.log(`Creating FileMaker session: ${sessionName}`);

            // Make POST request to FileMaker Data API to create a new session
            // Uses Basic authentication with username:password encoded in base64
            const response = await fetch(`${this.fmServer}/fmi/data/v1/databases/${this.fmDatabase}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Basic auth: encode username:password in base64
                    'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
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

    /**
     * Authenticate a FileMaker user and return NextAuth user object
     * @param {string|null} username - FileMaker username (null for OAuth)
     * @param {string|null} password - FileMaker password (null for OAuth)
     * @param {string|null} authtoken - OAuth session token (null for username/password)
     * @returns {Promise<NextAuthUser|null>} - NextAuth user object or null if authentication fails
     */
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
            // Use the correct FileMaker Data API validateSession endpoint
            const response = await fetch(`${this.fmServer}/fmi/data/v1/validateSession`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Use the session token for authentication
                }
            });

            if (!response.ok) {
                return false;  // Session is invalid
            }

            // Parse the response to check isSessionInUse
            const data = await response.json();
            
            // Return true if session is valid (regardless of isSessionInUse status)
            // isSessionInUse just tells us if the session is busy, not if it's valid the sucesssfull repsponse is enough to know the session is valid
            return true;
        } catch (error) {
            console.error('Error validating FileMaker session:', error);
            return false;  // Return false on any error
        }
    }

    // ============================================================================
    // SHARED SESSION MANAGEMENT - For data operations across the application
    // ============================================================================

    /**
     * Get or create a shared data session for FileMaker operations
     * @returns {Promise<string>} - The data session token
     */
    async getDataSession() {
        console.log('🔍 getDataSession() called');
        console.log('📊 Current session state:', {
            hasSession: !!this.dataSession,
            sessionExpiry: this.dataSessionExpiry,
            timeUntilExpiry: this.dataSessionExpiry ? Math.round((this.dataSessionExpiry - Date.now()) / 1000) : 'N/A',
            lastHealthCheck: this.lastHealthCheck,
            timeSinceLastCheck: Math.round((Date.now() - this.lastHealthCheck) / 1000)
        });

        // Health check every 5 minutes
        if (Date.now() - this.lastHealthCheck > 5 * 60 * 1000) {
            console.log('🏥 Running health check (5+ minutes since last check)');
            const healthResult = await this.healthCheck();
            console.log('🏥 Health check result:', healthResult);
            this.lastHealthCheck = Date.now();
        }

        // Check if session exists and is valid
        if (this.dataSession && this.dataSessionExpiry > Date.now()) {
            console.log('✅ Reusing existing valid session');
            return this.dataSession;
        }

        console.log('🔄 Creating new data session');
        // Create new session with retry logic
        return await this.createNewDataSession();
    }

    /**
     * Create a new data session with retry logic
     * @param {number} retries - Number of retry attempts
     * @returns {Promise<string>} - The data session token
     */
    async createNewDataSession(retries = 3) {
        console.log('🔄 createNewDataSession() called with retries:', retries);
        
        // Prevent concurrent session creation
        if (this.sessionLock) {
            console.log('⏳ Session creation in progress, waiting...');
            await this.waitForSession();
            console.log('✅ Session creation completed, returning existing session');
            return this.dataSession;
        }

        console.log('🔒 Setting session lock');
        this.sessionLock = true;
        
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`🔄 Attempt ${i + 1}/${retries}: Creating data session`);
                this.dataSession = await this.createSession("data");
                this.dataSessionExpiry = Date.now() + (15 * 60 * 1000); // 15 min expiry
                console.log('✅ Data session created successfully:', {
                    token: this.dataSession ? this.dataSession.substring(0, 20) + '...' : 'null',
                    expiry: new Date(this.dataSessionExpiry).toISOString(),
                    timeUntilExpiry: Math.round((this.dataSessionExpiry - Date.now()) / 1000)
                });
                this.sessionLock = false;
                return this.dataSession;
            } catch (error) {
                console.error(`❌ Data session creation attempt ${i + 1} failed:`, error.message);
                if (i === retries - 1) {
                    console.error('💥 All retry attempts failed, throwing error');
                    this.sessionLock = false;
                    throw error;
                }
                const delay = 1000 * (i + 1);
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Exponential backoff
            }
        }
    }

    /**
     * Wait for current session creation to complete
     * @returns {Promise<void>}
     */
    async waitForSession() {
        console.log('⏳ waitForSession() called');
        let waitCount = 0;
        // Simple polling until session is ready
        while (this.sessionLock) {
            waitCount++;
            if (waitCount % 10 === 0) {
                console.log(`⏳ Still waiting for session... (${waitCount * 100}ms)`);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('✅ Session wait completed after', waitCount * 100, 'ms');
    }

    /**
     * Health check for the current data session
     * @returns {Promise<boolean>} - Session health status
     */
    async healthCheck() {
        console.log('🏥 healthCheck() called');
        
        if (!this.dataSession) {
            console.log('🏥 No session to check, returning false');
            return false;
        }

        console.log('🏥 Validating session:', this.dataSession.substring(0, 20) + '...');
        
        try {
            const isValid = await this.validateSession(this.dataSession);
            console.log('🏥 Session validation result:', isValid);
            
            if (!isValid) {
                console.log('🏥 Session is invalid, clearing session data');
                this.dataSession = null;
                this.dataSessionExpiry = null;
            } else {
                console.log('🏥 Session is valid, keeping session data');
            }
            return isValid;
        } catch (error) {
            console.error('🏥 Health check failed with error:', error.message);
            console.log('🏥 Clearing session data due to error');
            this.dataSession = null;
            this.dataSessionExpiry = null;
            return false;
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
