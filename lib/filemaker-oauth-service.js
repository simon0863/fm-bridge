// FileMaker OAuth Service
// Manages OAuth sessions for FileMaker
// Based on the FileMaker OAuth service example by Rob Hopkins @NeptuneDigital.
// in dev HMR breaks this file, so if you change this file, you need to restart the dev server.

import crypto from 'crypto'

// ============================================================================
// FILEMAKER OAUTH SERVICE CLASS - Singleton pattern for managing OAuth sessions
// ============================================================================

export class FileMakerOAuthService {
    // Singleton instance - ensures only one service instance exists
    static instance;

    // FileMaker OAuth configuration - loaded from environment variables
    fmHost;         // FileMaker server host (e.g., your-server.com)
    fmDatabase;     // FileMaker database name
    fmApiVersion;   // FileMaker Data API version
    oauthSessions;  // Map to store OAuth session data

    // ============================================================================
    // CONSTRUCTOR - Private constructor for singleton pattern
    // ============================================================================

    constructor() {
        // Load FileMaker OAuth configuration from environment variables
        // These should be set in your .env.local file
        this.fmHost = process.env.FILEMAKER_HOST;
        this.fmDatabase = process.env.FILEMAKER_DATABASE;
        this.fmApiVersion = process.env.DEFAULT_API_VERSION;
        
        // Simple Map - no global state complexity
        this.oauthSessions = new Map();
    }

    // ============================================================================
    // SINGLETON GETTER - Returns the single instance of the service
    // ============================================================================

    /**
     * Get the singleton instance of FileMakerOAuthService
     * @returns {FileMakerOAuthService} - The singleton instance
     */
    static getInstance() {
        // Create instance if it doesn't exist, otherwise return existing instance
        if (!FileMakerOAuthService.instance) {
            FileMakerOAuthService.instance = new FileMakerOAuthService();
        }
        return FileMakerOAuthService.instance;
    }

    // ============================================================================
    // OAUTH PROVIDER DISCOVERY - Get available OAuth providers from FileMaker
    // ============================================================================

    /**
     * Get available OAuth providers from FileMaker server
     * @param {string} host - FileMaker server host
     * @returns {Promise<Object>} - Available OAuth providers
     */
    async getOAuthProviders(host) {
    try {
      const response = await fetch(`http://${host}/fmws/oauthproviderinfo`, {
        headers: {
          'X-FMS-Application-Type': '9',
          'X-FMS-Application-Version': '15'
        }
      })

      if (!response.ok) {
        throw new Error(`FileMaker server error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting OAuth providers:', error)
      throw error
    }
  }

    // ============================================================================
    // OAUTH INITIATION - Start OAuth flow with FileMaker
    // ============================================================================

    /**
     * Initiate OAuth flow with FileMaker
     * @param {string} host - FileMaker server host
     * @param {string} provider - OAuth provider name (e.g., 'Microsoft')
     * @returns {Promise<Object>} - OAuth initiation result with tracking ID and URL
     */
    async initiateOAuth(host, provider) {
    try {
      const trackingId = crypto.randomUUID()

      // Store session for later retrieval
      this.oauthSessions.set(trackingId, {
        host,
        provider,
        status: 'pending',
        createdAt: Date.now()
      })

      const returnUrl = `${process.env.NEXTAUTH_URL}/oauth/redirect`
      // const returnUrl = `${process.env.NEXTAUTH_URL}/api/filemaker-auth/oauth/callback`

      const response = await fetch(
        `https://${host}/oauth/getoauthurl?trackingID=${trackingId}&provider=${encodeURIComponent(provider)}&address=${host}&X-FMS-OAuth-AuthType=2`,
        {
          method: 'GET',
          headers: {
            'X-FMS-Application-Type': '9',
            'X-FMS-Application-Version': '15',
            'X-FMS-Return-URL': returnUrl
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OAuth initiation failed: ${response.status} - ${errorText}`)
      }

      // Get the response body (this should be the OAuth URL to redirect to)
      const responseBody = await response.text();

      // Update the session with response data
      const session = this.oauthSessions.get(trackingId)
      session.oauthUrl = responseBody.trim()
      session.requestId = response.headers.get('X-FMS-Request-ID')
      this.oauthSessions.set(trackingId, session)

      return {
        trackingId,
        oauthUrl: responseBody.trim(),
        requestId: response.headers.get('X-FMS-Request-ID')
      }

    } catch (error) {
      console.error('Error initiating OAuth:', error)
      throw error
    }
  }

    // ============================================================================
    // OAUTH STATUS CHECKING - Check OAuth completion status
    // ============================================================================

    /**
     * Check OAuth completion status
     * @param {string} trackingId - OAuth session tracking ID
     * @returns {Promise<Object|null>} - OAuth result if completed, null if pending
     */
    async checkOAuthStatus(trackingId) {
    const session = this.oauthSessions.get(trackingId)
    if (!session) {
      throw new Error('OAuth session not found')
    }

    // Check if session has been completed
    if (session.status === 'completed') {
      return session.result
    }

    // Check if session has expired (5 minutes)
    if (Date.now() - session.createdAt > 5 * 60 * 1000) {
      this.oauthSessions.delete(trackingId)
      throw new Error('OAuth session expired')
    }

    return null // Still pending
  }

    // ============================================================================
    // OAUTH COMPLETION - Complete OAuth session with callback data
    // ============================================================================

    /**
     * Complete OAuth session with callback data from FileMaker
     * @param {string} trackingId - OAuth session tracking ID
     * @param {Object} oauthResult - OAuth callback data from FileMaker
     * @returns {Promise<Object>} - Completed OAuth session data
     */
    async completeOAuth(trackingId, oauthResult) {
    const session = this.oauthSessions.get(trackingId)
    if (!session) {
      throw new Error('OAuth session not found')
    }

    session.status = 'completed'
    session.identifier = oauthResult.identifier
    session.error = oauthResult.error
    session.hiddenemail = oauthResult.hiddenemail
    session.completedAt = Date.now()

    return session
  }

    // ============================================================================
    // FILEMAKER SESSION CREATION - Create FileMaker session using OAuth credentials
    // ============================================================================

    /**
     * Create FileMaker session and return token using OAuth credentials
     * @param {Object} oauthResult - Completed OAuth session data
     * @returns {Promise<Object>} - FileMaker session creation result
     */
    async createFileMakerSession(oauthResult) {
    try {
      // Check we have the identifier and request id else return  error
      if (!oauthResult.identifier || !oauthResult.requestId) {
        return {
          success: false,
          error: 'createFileMakerSession missing parameters'
        }
      }

      const url = `https://${this.fmHost}/fmi/data/${this.fmApiVersion}/databases/${this.fmDatabase}/sessions`;

      // For OAuth, we need to send the authorization code in the correct format
      // According to FileMaker docs, the identifier should be the authorization code
      const requestBody = {
        // Empty body for OAuth authentication
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FM-Data-OAuth-Request-Id': oauthResult.requestId,
          'X-FM-Data-OAuth-Identifier': oauthResult.identifier
        },
        body: JSON.stringify(requestBody)
      });

      const accessToken = response.headers.get('X-FM-Data-Access-Token');

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        const responseText = await response.text();
        responseData = { body: responseText };
      }

      if (!response.ok) {
        console.error('FileMaker database login failed:', response.status, responseData);

        // Check for specific OAuth errors
        if (response.status === 401 && responseData.messages) {
          const errorMessage = responseData.messages[0]?.message || 'Unknown OAuth error';
          const errorCode = responseData.messages[0]?.code || 'unknown';

          return {
            success: false,
            error: `OAuth authentication failed: ${errorMessage} (Code: ${errorCode})`,
            details: responseData,
            suggestions: [
              'The authorization code may have expired',
              'The OAuth provider may not be properly configured',
              'The request ID may not match the OAuth session',
              'Try completing the OAuth flow again'
            ]
          };
        }

        return {
          success: false,
          error: `Database login failed: ${response.status}`,
          details: responseData,
          headers: Object.fromEntries(response.headers.entries())
        };
      }

      if (!accessToken) {
        console.error('No access token received from FileMaker');
        return {
          success: false,
          error: 'No access token received from FileMaker',
          details: responseData,
          headers: Object.fromEntries(response.headers.entries())
        };
      }

      return {
        success: true,
        accessToken: accessToken,
        response: responseData
      };

    } catch (error) {
      console.error('Error proxying database login:', error);
      return {
        success: false,
        error: error.message,
        type: 'network_error'
      };
    }
  }
}

// ============================================================================
// SINGLETON EXPORT - Export the singleton instance for use throughout the app
// ============================================================================

// Export singleton instance - this ensures we always use the same service instance
export const filemakerOAuthService = FileMakerOAuthService.getInstance()