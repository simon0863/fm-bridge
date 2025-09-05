// FileMaker OAuth Service
// Manages OAuth sessions for FileMaker
// Based on the FileMaker OAuth service example by Rob Hopkins @NeptuneDigital

import crypto from 'crypto'

export class FileMakerOAuthService {
  constructor() {
    this.fmHost = process.env.FILEMAKER_HOST;
    this.fmDatabase = process.env.FILEMAKER_DATABASE;
    this.fmApiVersion = process.env.DEFAULT_API_VERSION;
    const environment = process.env.NODE_ENV;
    if (environment === "development") {
      if (!global.oauthSessions) {
        global.oauthSessions = new Map();
        // console.log('======Created new global oauthSessions Map======')
      } else {
        // console.log('======Using existing global oauthSessions Map======')
      }
      this.oauthSessions = global.oauthSessions
    } else {
      // console.log('======FileMakerOAuthService constructor called======')
      this.oauthSessions = new Map() // Store OAuth sessions server-side
    }
  }

  // Get available OAuth providers from FileMaker server
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

  // Initiate OAuth flow with FileMaker
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

      const returnUrl = `${process.env.NEXTAUTH_URL}/api/oauth/callback`

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
      console.log(`FileMaker OAuth URL response: ${responseBody.substring(0, 200)}...`);

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

  // Check OAuth completion status
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

  // Complete OAuth session this updates the session with all it needs
  // to retrieve a filemaker session token.
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
    console.log('======OAuth session completed======');
    console.log(session)

    return session
  }

  // Create FileMaker session and return token using OAuth credentials
  async createFileMakerSession(oauthResult) {
    try {
      // Check we have the identifier and request id else return  error
      if (!oauthResult.identifier || !oauthResult.requestId) {
        console.log('createFileMakerSession missing parameters')
        return {
          success: false,
          error: 'createFileMakerSession missing parameters'
        }
      }

      const url = `https://${this.fmHost}/fmi/data/${this.fmApiVersion}/databases/${this.fmDatabase}/sessions`;
      console.log(`Proxying database login request to: ${url}`);

      // For OAuth, we need to send the authorization code in the correct format
      // According to FileMaker docs, the identifier should be the authorization code
      const requestBody = {
        // Empty body for OAuth authentication
      };

      console.log(`Authenticating with FileMaker using identifier: ${oauthResult.identifier ? oauthResult.identifier.substring(0, 10) + '...' : 'missing'}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FM-Data-OAuth-Request-Id': oauthResult.requestId,
          'X-FM-Data-OAuth-Identifier': oauthResult.identifier
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`FileMaker authentication: ${response.status === 200 ? 'Success' : 'Failed'} (${response.status})`);

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

// Export singleton instance
export const filemakerOAuthService = new FileMakerOAuthService()