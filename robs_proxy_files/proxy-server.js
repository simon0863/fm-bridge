const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configuration from environment variables
const PORT = process.env.PROXY_PORT || 3002;
const HOST = process.env.PROXY_HOST || 'localhost';
const OAUTH_REDIRECT_BASE_URL = process.env.OAUTH_REDIRECT_BASE_URL || `http://${HOST}:${PORT}`;
const DEFAULT_FILEMAKER_HOST = process.env.FILEMAKER_HOST || 'your-filemaker-server.com';
const DEFAULT_DATABASE = process.env.DEFAULT_DATABASE || 'YourDatabase';
const DEFAULT_API_VERSION = process.env.DEFAULT_API_VERSION || 'vLatest';

// Store active OAuth sessions for server-side capture
const oauthSessions = new Map();

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // For parsing application/json

// Serve static files
app.use(express.static('.'));

// Configuration endpoint for client-side defaults
app.get('/api/config', (req, res) => {
    res.json({
        defaultFileMakerHost: DEFAULT_FILEMAKER_HOST,
        defaultDatabase: DEFAULT_DATABASE,
        defaultApiVersion: DEFAULT_API_VERSION,
        redirectBaseUrl: OAUTH_REDIRECT_BASE_URL,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Proxy endpoint for FileMaker OAuth providers
app.get('/api/oauth-providers', async (req, res) => {
    try {
        const host = req.query.host;
        if (!host) {
            return res.status(400).json({ error: 'Host parameter is required' });
        }

        const url = `http://${host}/fmws/oauthproviderinfo`;
        console.log(`Proxying OAuth providers request to: ${url}`);

        const response = await fetch(url);
        const data = await response.text();
        
        res.set('Content-Type', 'application/json');
        res.status(response.status).send(data);
        
    } catch (error) {
        console.error('Error proxying OAuth providers:', error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint for FileMaker tracking ID
app.get('/api/tracking-id', async (req, res) => {
    try {
        const { host, trackingId, provider } = req.query;
        
        if (!host || !trackingId || !provider) {
            return res.status(400).json({ error: 'Host, trackingId, and provider parameters are required' });
        }

        const url = `https://${host}/oauth/getoauthurl?trackingID=${trackingId}&provider=${encodeURIComponent(provider)}&address=${host}&X-FMS-OAuth-AuthType=2`;
        console.log(`Proxying tracking ID request to: ${url}`);

        // Use the proxy server as the return URL to capture OAuth completion
        // This must match the redirect URL configured in your OAuth App registration
        const returnUrl = `${OAUTH_REDIRECT_BASE_URL}/oauth/redirect`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-FMS-Application-Type': '9',
                'X-FMS-Application-Version': '15',
                'X-FMS-Return-URL': returnUrl
            }
        });
        
        console.log(`Setting OAuth return URL to: ${returnUrl}`);

        // Get response headers
        const requestId = response.headers.get('X-FMS-Request-ID');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('FileMaker server error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `FileMaker server error: ${response.status}`,
                details: errorText
            });
        }

        // Get the response body (this should be the OAuth URL to redirect to)
        const responseBody = await response.text();
        console.log(`FileMaker OAuth URL response: ${responseBody.substring(0, 200)}...`);
        
        // Store OAuth session for server-side capture
        if (requestId && trackingId) {
            oauthSessions.set(trackingId, {
                requestId: requestId,
                trackingId: trackingId,
                provider: provider,
                host: host,
                timestamp: new Date(),
                status: 'pending',
                oauthUrl: responseBody.trim(),
                returnUrlConfigured: returnUrl
            });
            console.log(`Stored OAuth session for tracking ID: ${trackingId}`);
            console.log(`OAuth URL to open: ${responseBody.trim()}`);
            console.log(`Return URL configured: ${returnUrl}`);
        }

        // Return success with headers and body
        res.json({
            success: true,
            requestId: requestId,
            returnUrl: responseBody,
            status: response.status,
            returnUrlConfigured: returnUrl
        });

    } catch (error) {
        console.error('Error proxying tracking ID:', error);
        res.status(500).json({ error: error.message });
    }
});

// Server-side OAuth completion polling endpoint
app.get('/api/oauth-status/:trackingId', (req, res) => {
    const { trackingId } = req.params;
    
    if (!trackingId) {
        return res.status(400).json({ error: 'Tracking ID is required' });
    }
    
    const session = oauthSessions.get(trackingId);
    
    if (!session) {
        return res.status(404).json({ error: 'OAuth session not found' });
    }
    
    res.json({
        success: true,
        session: session
    });
});

// Server-side OAuth completion check for all active sessions
app.get('/api/oauth-check-all', (req, res) => {
    const activeSessions = Array.from(oauthSessions.entries()).map(([trackingId, session]) => ({
        trackingId,
        ...session
    }));
    
    res.json({
        success: true,
        sessions: activeSessions,
        count: activeSessions.length
    });
});

// Proxy endpoint for database login
app.post('/api/database-login', async (req, res) => {
    try {
        console.log('Database login request received:', {
            body: req.body,
            contentType: req.get('Content-Type'),
            method: req.method
        });
        
        // Check if req.body exists
        if (!req.body) {
            console.error('Request body is undefined');
            return res.status(400).json({ error: 'Request body is required' });
        }
        
        const { host, databaseName, apiVersion, requestId, identifier } = req.body;
        
        console.log('Extracted parameters:', { host, databaseName, apiVersion, requestId, identifier });
        
        if (!host || !databaseName || !apiVersion || !requestId || !identifier) {
            const missingParams = [];
            if (!host) missingParams.push('host');
            if (!databaseName) missingParams.push('databaseName');
            if (!apiVersion) missingParams.push('apiVersion');
            if (!requestId) missingParams.push('requestId');
            if (!identifier) missingParams.push('identifier');
            
            return res.status(400).json({ 
                error: `Missing required parameters: ${missingParams.join(', ')}`,
                received: { host, databaseName, apiVersion, requestId, identifier }
            });
        }

        const url = `https://${host}/fmi/data/${apiVersion}/databases/${databaseName}/sessions`;
        console.log(`Proxying database login request to: ${url}`);

        // For OAuth, we need to send the authorization code in the correct format
        // According to FileMaker docs, the identifier should be the authorization code
        const requestBody = {
            // Empty body for OAuth authentication
        };

        console.log(`Authenticating with FileMaker using identifier: ${identifier ? identifier.substring(0, 10) + '...' : 'missing'}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-FM-Data-OAuth-Request-Id': requestId,
                'X-FM-Data-OAuth-Identifier': identifier
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
                
                return res.status(response.status).json({
                    error: `OAuth authentication failed: ${errorMessage} (Code: ${errorCode})`,
                    details: responseData,
                    suggestions: [
                        'The authorization code may have expired',
                        'The OAuth provider may not be properly configured',
                        'The request ID may not match the OAuth session',
                        'Try completing the OAuth flow again'
                    ]
                });
            }
            
            return res.status(response.status).json({
                error: `Database login failed: ${response.status}`,
                details: responseData,
                headers: Object.fromEntries(response.headers.entries())
            });
        }

        if (!accessToken) {
            console.error('No access token received from FileMaker');
            return res.status(500).json({
                error: 'No access token received from FileMaker',
                details: responseData,
                headers: Object.fromEntries(response.headers.entries())
            });
        }

        res.json({
            success: true,
            accessToken: accessToken,
            response: responseData
        });

    } catch (error) {
        console.error('Error proxying database login:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle OAuth redirect
app.get('/oauth/redirect', async (req, res) => {
    let { code, state, session_state, identifier, trackingID, error } = req.query;

    console.log('OAuth redirect received:');
    console.log('  - code:', code ? 'present' : 'missing');
    console.log('  - state:', state ? 'present' : 'missing');
    console.log('  - session_state:', session_state ? 'present' : 'missing');
    console.log('  - identifier:', identifier ? 'present' : 'missing');
    console.log('  - trackingID:', trackingID ? 'present' : 'missing');
    console.log('  - error:', error ? 'present' : 'missing');

    // Extract trackingID from state parameter if not directly provided
    if (!trackingID && state) {
        try {
            // FileMaker encodes tracking information in the state parameter
            const decodedState = Buffer.from(state, 'base64').toString('utf-8');
            console.log(`Decoded state: ${decodedState}`);
            
            // Look for tracking ID patterns in the decoded state
            const trackingMatch = decodedState.match(/trackingID[=:]([^&\s]+)/i);
            if (trackingMatch) {
                trackingID = trackingMatch[1];
                console.log(`✅ Extracted trackingID from state: ${trackingID}`);
            } else {
                // Try to find any UUID pattern in the state
                const uuidMatch = decodedState.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
                if (uuidMatch) {
                    trackingID = uuidMatch[1];
                    console.log(`✅ Found UUID in state, using as trackingID: ${trackingID}`);
                }
            }
        } catch (stateError) {
            console.log(`Could not decode state parameter: ${stateError.message}`);
        }
    }

    // If no trackingID found, try to find the most recent pending session
    if (!trackingID && code && !identifier) {
        const pendingSessions = Array.from(oauthSessions.entries())
            .filter(([_, session]) => session.status === 'pending')
            .sort((a, b) => b[1].timestamp - a[1].timestamp);
        
        if (pendingSessions.length > 0) {
            trackingID = pendingSessions[0][0];
            console.log(`📋 Using most recent pending session: ${trackingID}`);
        }
    }

    // If we have an authorization code but no identifier, we need to exchange it with FileMaker
    if (code && !identifier && trackingID && oauthSessions.has(trackingID)) {
        const session = oauthSessions.get(trackingID);
        const host = session.host;
        
        console.log(`🔄 Exchanging authorization code with FileMaker for identifier...`);
        
        try {
            // Forward the OAuth code to FileMaker to get the identifier
            const fmOauthUrl = `https://${host}/oauth/return?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}&trackingID=${encodeURIComponent(trackingID)}`;
            console.log(`Forwarding to FileMaker: ${fmOauthUrl}`);
            
            const fmResponse = await fetch(fmOauthUrl, {
                method: 'GET',
                redirect: 'manual' // Don't follow redirects automatically
            });
            
            console.log(`FileMaker response status: ${fmResponse.status}`);
            
            // Check if FileMaker redirected with an identifier
            if (fmResponse.status >= 300 && fmResponse.status < 400) {
                const location = fmResponse.headers.get('location');
                console.log(`FileMaker redirect location: ${location}`);
                
                if (location && location.includes('identifier=')) {
                    const urlParams = new URLSearchParams(location.split('?')[1] || '');
                    const fmIdentifier = urlParams.get('identifier');
                    const fmError = urlParams.get('error');
                    
                    console.log(`✅ Extracted identifier from FileMaker redirect: ${fmIdentifier}`);
                    
                    // Update the identifier
                    identifier = fmIdentifier;
                    error = fmError;
                }
            }
        } catch (fmError) {
            console.error(`Error exchanging code with FileMaker: ${fmError.message}`);
        }
    }

    // Store the OAuth completion in the session for server-side polling
    if (trackingID && oauthSessions.has(trackingID)) {
        const session = oauthSessions.get(trackingID);
        session.code = code;
        session.state = state;
        session.session_state = session_state;
        session.identifier = identifier;
        session.error = error;
        session.status = (code || identifier) ? 'completed' : 'error';
        session.completedAt = new Date();
        oauthSessions.set(trackingID, session);
        console.log(`✅ OAuth session ${trackingID} completed - Identifier: ${identifier ? 'captured' : 'missing'}`);
    } else if (trackingID) {
        // Create a new session if one doesn't exist  
        oauthSessions.set(trackingID, {
            trackingId: trackingID,
            code: code,
            state: state,
            session_state: session_state,
            identifier: identifier,
            error: error,
            status: (code || identifier) ? 'completed' : 'error',
            timestamp: new Date(),
            completedAt: new Date()
        });
        console.log(`✅ Created new OAuth session ${trackingID} with completion data`);
    } else {
        console.log('⚠️ No trackingID found in OAuth redirect - cannot store session data');
    }

    // Create a simple HTML page to show the OAuth completion
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Redirect</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; background: #2a2a2a; padding: 30px; border-radius: 10px; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .code { background: #333; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; }
        .close-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .url-info { background: #444; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="success">✅ OAuth Authentication Successful!</h1>
        <p>Your OAuth authentication has been completed successfully.</p>

        <div class="url-info">
            <h3>🔍 Current URL Information:</h3>
            <p><strong>URL:</strong> <span class="code">OAuth redirect completed</span></p>
            <p><strong>Look for:</strong> <code>identifier=</code> parameter in the URL above</p>
        </div>

        <h3>Authorization Code:</h3>
        <div class="code">${code || 'No code received'}</div>

        <h3>State:</h3>
        <div class="code">${state || 'No state received'}</div>

        ${session_state ? `<h3>Session State:</h3><div class="code">${session_state}</div>` : ''}

        ${identifier ? `<h3>✅ FileMaker Identifier (Found!):</h3><div class="code">${identifier}</div>` : ''}

        ${trackingID ? `<h3>Tracking ID:</h3><div class="code">${trackingID}</div>` : ''}

        ${error ? `<h3>Error:</h3><div class="code error">${error}</div>` : ''}

        ${!identifier ? `
        <div class="warning">
            <h3>⚠️ Manual Identifier Required</h3>
            <p>No FileMaker identifier was found in the URL. Please:</p>
            <ol>
                <li>Look at the URL in your browser's address bar</li>
                <li>Find the <code>identifier=</code> parameter</li>
                <li>Copy the value after <code>identifier=</code></li>
                <li>Paste it in the manual input field on the main page</li>
            </ol>
            <p><strong>Example URL:</strong> <code>https://myhost.com/?trackingID=123&identifier=A7321F9CA1AA8B9957898D83563D923C</code></p>
            <p><strong>Identifier to copy:</strong> <code>123</code></p>
        </div>
        ` : ''}

        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Return to the main page to continue with the OAuth flow</li>
            <li>${identifier ? 'Use the FileMaker identifier above' : 'Enter the identifier manually using the input field'}</li>
        </ul>

        <button class="close-btn" onclick="window.close()">Close Window</button>
        <button class="close-btn" onclick="window.opener.focus()">Return to Main Page</button>
    </div>

    <script>
        // Notify the parent window that OAuth is complete
        if (window.opener) {
            const message = {
                type: 'oauth_complete',
                code: '${code || ''}',
                state: '${state || ''}',
                session_state: '${session_state || ''}',
                identifier: '${identifier || ''}',
                trackingID: '${trackingID || ''}',
                error: '${error || ''}'
            };
            
            console.log('✅ Sending OAuth completion via postMessage:', message);
            window.opener.postMessage(message, '*');
        } else {
            console.log('⚠️ No opener window found - cannot send postMessage');
        }
        
        // Log the current URL for debugging
        console.log('OAuth redirect completed');
        
        // TEMPORARILY DISABLED - Leave window open to see tracking URL
        // Wait 5 seconds before closing to ensure postMessage is sent
        // setTimeout(() => {
        //     if (window.opener) {
        //         window.close();
        //     }
        // }, 5000);
    </script>
</body>
</html>`;

    res.send(html);
});

// Handle FileMaker server redirect and capture identifier automatically
app.get('/oauth/capture', async (req, res) => {
    const { trackingID, identifier, hiddenemail, error } = req.query;

    console.log('FileMaker redirect captured:');
    console.log('  - trackingID:', trackingID ? 'present' : 'missing');
    console.log('  - identifier:', identifier ? 'present' : 'missing');
    console.log('  - hiddenemail:', hiddenemail ? 'present' : 'missing');
    console.log('  - error:', error ? 'present' : 'missing');

    // Store the OAuth completion in the session
    if (trackingID && oauthSessions.has(trackingID)) {
        const session = oauthSessions.get(trackingID);
        session.identifier = identifier;
        session.error = error;
        session.hiddenemail = hiddenemail;
        session.status = identifier ? 'completed' : 'error';
        session.completedAt = new Date();
        oauthSessions.set(trackingID, session);
        console.log(`Updated OAuth session ${trackingID} with completion data`);
    } else if (trackingID) {
        // Create a new session if one doesn't exist
        oauthSessions.set(trackingID, {
            trackingId: trackingID,
            identifier: identifier,
            error: error,
            hiddenemail: hiddenemail,
            status: identifier ? 'completed' : 'error',
            timestamp: new Date(),
            completedAt: new Date()
        });
        console.log(`Created new OAuth session ${trackingID} with completion data`);
    }

    // Create a simple HTML page that automatically captures the identifier and sends it to the parent window
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Capture</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
        .container { max-width: 600px; margin: 0 auto; background: #2a2a2a; padding: 30px; border-radius: 10px; }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .code { background: #333; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; }
        .close-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="success">✅ OAuth Authentication Captured!</h1>
        <p>Your OAuth authentication has been completed and captured successfully.</p>

        ${identifier ? `
        <h3>✅ FileMaker Identifier (Captured!):</h3>
        <div class="code">${identifier}</div>
        ` : `
        <h3>⚠️ No Identifier Found:</h3>
        <div class="code error">No identifier parameter found in the URL</div>
        `}

        ${trackingID ? `<h3>Tracking ID:</h3><div class="code">${trackingID}</div>` : ''}
        ${error ? `<h3>Error:</h3><div class="code error">${error}</div>` : ''}

        <p><strong>Status:</strong> ${identifier ? 'Success - Identifier captured automatically' : 'Warning - Manual input may be required'}</p>

        <button class="close-btn" onclick="window.close()">Close Window</button>
        <button class="close-btn" onclick="window.opener.focus()">Return to Main Page</button>
    </div>

    <script>
        // Automatically notify the parent window that OAuth is complete with the captured identifier
        if (window.opener) {
            const message = {
                type: 'oauth_complete',
                identifier: '${identifier || ''}',
                trackingID: '${trackingID || ''}',
                error: '${error || ''}',
                status: '${identifier ? 'completed' : 'missing_identifier'}'
            };
            
            console.log('Sending OAuth completion via postMessage:', message);
            window.opener.postMessage(message, '*');
        }
        
        // Log the captured data
        console.log('OAuth capture completed:', {
            identifier: '${identifier || ''}',
            trackingID: '${trackingID || ''}',
            error: '${error || ''}'
        });
        
        // Auto-close after 1 second if identifier was captured
        ${identifier ? `
        setTimeout(() => {
            if (window.opener) {
                window.close();
            }
        }, 1000);
        ` : ''}
    </script>
</body>
</html>`;

    res.send(html);
});

app.listen(PORT, HOST, () => {
    console.log(`FileMaker OAuth Proxy Server running on ${OAUTH_REDIRECT_BASE_URL}`);
    console.log('This server handles FileMaker API requests server-side to avoid CORS issues.');
    console.log(`Default FileMaker Host: ${DEFAULT_FILEMAKER_HOST}`);
    console.log(`Default Database: ${DEFAULT_DATABASE}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
