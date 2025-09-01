// Global variables to store OAuth data
let oauthData = {
    providers: [],
    selectedProvider: '',
    trackingId: '',
    requestId: '',
    returnUrl: '',
    identifier: '',
    accessToken: '',
    authorizationCode: '', // Added for OAuth completion
    state: '', // Added for OAuth completion
    sessionState: '' // Added for OAuth completion
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}\n`;
    const statusLog = document.getElementById('statusLog');
    statusLog.textContent += logEntry;
    statusLog.scrollTop = statusLog.scrollHeight;
    console.log(logEntry.trim());
}

function clearLogs() {
    document.getElementById('statusLog').textContent = '';
}

function showResult(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    const resultDiv = element.closest('.result');
    
    if (isError) {
        resultDiv.classList.add('error');
        resultDiv.classList.remove('success');
    } else {
        resultDiv.classList.add('success');
        resultDiv.classList.remove('error');
    }
    
    element.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
}

function enableNextStep(stepNumber) {
    const nextStep = document.querySelector(`#step${stepNumber + 1}`);
    if (nextStep) {
        const button = nextStep.querySelector('button');
        if (button) {
            button.disabled = false;
        }
    }
}

// UUID Generator function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Generate new Tracking ID
function generateTrackingId() {
    const newTrackingId = generateUUID();
    document.getElementById('trackingId').value = newTrackingId;
    log(`Generated new Tracking ID: ${newTrackingId}`, 'info');
    
    // Enable the next step if a provider is selected
    checkTrackingIdStep();
}

// Check if tracking ID step can be enabled
function checkTrackingIdStep() {
    const trackingId = document.getElementById('trackingId').value.trim();
    const selectedProvider = oauthData.selectedProvider;
    const step2Button = document.querySelector('#step2 button[onclick="getTrackingId()"]');
    
    console.log('checkTrackingIdStep called:', {
        trackingId: trackingId,
        selectedProvider: selectedProvider,
        isValidUUID: isValidUUID(trackingId),
        step2Button: step2Button,
        step2ButtonExists: !!step2Button
    });
    
    if (!step2Button) {
        console.error('Step 2 button not found!');
        return;
    }
    
    if (trackingId && selectedProvider && isValidUUID(trackingId)) {
        step2Button.disabled = false;
        console.log('Step 2 button enabled');
    } else {
        step2Button.disabled = true;
        console.log('Step 2 button disabled - reasons:', {
            noTrackingId: !trackingId,
            noProvider: !selectedProvider,
            invalidUUID: !isValidUUID(trackingId)
        });
    }
}

// Validate UUID format
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

// Step 1: Get OAuth Providers
async function getOAuthProviders() {
    const host = document.getElementById('host').value.trim();
    if (!host) {
        alert('Please enter a FileMaker Server host');
        return;
    }

    log(`Getting OAuth providers from ${host}...`);
    
    try {
        const url = `/api/oauth-providers?host=${encodeURIComponent(host)}`;
        log(`Making request to: ${url}`);
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
            log(`Parsed JSON successfully`);
        } catch (parseError) {
            log(`JSON parse error: ${parseError.message}`);
            throw new Error(`Invalid JSON response: ${parseError.message}`);
        }
        
        // Handle the correct JSON structure: data.Provider array
        oauthData.providers = data.data?.Provider || data.providers || [];
        
        log(`Found ${oauthData.providers.length} OAuth providers`);
        
        // Show the result first
        showResult('oauthProvidersOutput', data);
        log('OAuth providers retrieved successfully', 'success');
        
        // Populate the select dropdown (moved below the result)
        const select = document.getElementById('oauthProviderSelect');
        select.innerHTML = '<option value="">Select an OAuth provider...</option>';
        
        if (oauthData.providers.length > 0) {
            select.style.display = 'block';
            oauthData.providers.forEach(provider => {
                const option = document.createElement('option');
                option.value = provider.Name;
                option.textContent = provider.Name;
                select.appendChild(option);
            });
            
            // Add event listener for provider selection
            select.addEventListener('change', function() {
                oauthData.selectedProvider = this.value;
                log(`Selected OAuth provider: ${this.value}`);
                checkTrackingIdStep();
            });
            
            log('OAuth provider dropdown populated', 'success');
        } else {
            log('No OAuth providers found', 'warning');
        }
        
        // Mark step as completed
        document.getElementById('step1').classList.add('completed');
        
    } catch (error) {
        log(`Error getting OAuth providers: ${error.message}`, 'error');
        
        // Provide specific guidance for common issues
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            const errorMessage = `Connection Error: Unable to connect to FileMaker Server.

This could be due to:
1. **Network connectivity** - Check your internet connection
2. **FileMaker Server** - Ensure the server is running and accessible
3. **Host configuration** - Verify the host address is correct
4. **Proxy server** - Make sure the proxy server is running (npm run proxy)

Try:
1. Check the host address: ${host}
2. Ensure FileMaker Server is running
3. Verify network connectivity
4. Restart the proxy server if needed

Error details: ${error.message}`;
            
            showResult('oauthProvidersOutput', errorMessage, true);
            log('Connection issue - check server and network', 'error');
        } else {
            showResult('oauthProvidersOutput', `Error: ${error.message}`, true);
        }
    }
}

// Step 2: Get Tracking ID
async function getTrackingId() {
    const host = document.getElementById('host').value.trim();
    const trackingId = document.getElementById('trackingId').value.trim();
    const selectedProvider = oauthData.selectedProvider;
    
    if (!host || !trackingId || !selectedProvider) {
        alert('Please fill in all required fields');
        return;
    }

    // Validate UUID format
    if (!isValidUUID(trackingId)) {
        alert('Please enter a valid UUID format (e.g., xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)');
        return;
    }

    log(`Getting tracking ID for provider: ${selectedProvider}`);
    
    try {
        const url = `/api/tracking-id?host=${encodeURIComponent(host)}&trackingId=${encodeURIComponent(trackingId)}&provider=${encodeURIComponent(selectedProvider)}`;
        log(`Making request to: ${url}`);
        
        const response = await fetch(url);

        if (!response.ok) {
            // Try to get the error response body
            let errorDetails = '';
            try {
                const errorText = await response.text();
                errorDetails = errorText ? ` - ${errorText}` : '';
                log(`Error response body: ${errorText}`);
                
                // Log the full response for debugging
                log(`Full response status: ${response.status} ${response.statusText}`);
                log(`Response headers: ${JSON.stringify([...response.headers.entries()])}`);
                
                // Also log the exact URL that was requested
                log(`Requested URL: ${url}`);
                
                // Log the exact parameters being sent
                log(`Parameters being sent:`);
                log(`  - host: ${host}`);
                log(`  - trackingId: ${trackingId}`);
                log(`  - provider: ${selectedProvider}`);
                
            } catch (e) {
                errorDetails = ' - Could not read error response';
                log(`Could not read error response: ${e.message}`);
            }
            throw new Error(`HTTP error! status: ${response.status}${errorDetails}`);
        }

        const responseData = await response.json();
        
        if (!responseData.success) {
            throw new Error(`Proxy error: ${responseData.error || 'Unknown error'}`);
        }

        const requestId = responseData.requestId;
        const returnUrl = responseData.returnUrl;
        
        if (!requestId) {
            throw new Error('X-FMS-Request-ID header not found in response');
        }

        oauthData.trackingId = trackingId;
        oauthData.requestId = requestId;
        oauthData.returnUrl = returnUrl;
        
        log(`Request ID: ${requestId}`);
        log(`OAuth URL to open: ${oauthData.returnUrl}`);
        log(`Return URL configured on server: ${responseData.returnUrlConfigured || 'Not specified'}`);
        log(`Response data: ${JSON.stringify(responseData.response, null, 2)}`);
        log(`Raw response body: ${responseData.rawBody || 'No raw body'}`);
        
        // Update the return URL field
        document.getElementById('returnUrl').value = oauthData.returnUrl;
        
        const resultData = {
            requestId: requestId,
            returnUrl: oauthData.returnUrl,
            trackingId: trackingId,
            provider: selectedProvider,
            response: responseData.response,
            rawBody: responseData.rawBody
        };
        
        showResult('trackingOutput', resultData);
        log('Tracking ID retrieved successfully', 'success');
        enableNextStep(2);
        
    } catch (error) {
        log(`Error getting tracking ID: ${error.message}`, 'error');
        
        // Provide specific guidance for common issues
        if (error.message.includes('400')) {
            const errorMessage = `400 Bad Request Error: Invalid request parameters.

This usually means:
1. **Invalid Tracking ID format** - Must be a valid UUID
2. **Invalid Provider name** - Must match exactly what's configured on the server
3. **Missing required headers** - X-FMS headers are required
4. **Invalid Return URL** - Must be a valid URL

Current values:
- Tracking ID: ${trackingId}
- Provider: ${selectedProvider}
- Host: ${host}

Try:
1. Generate a new Tracking ID (UUID)
2. Verify the provider name matches exactly
3. Check that the host is correct
4. Ensure OAuth is properly configured on the server

Error details: ${error.message}`;
            
            showResult('trackingOutput', errorMessage, true);
            log('400 error - check request parameters', 'error');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            const errorMessage = `Connection Error: Unable to connect to FileMaker Server for tracking ID.

This could be due to:
1. **Network connectivity** - Check your internet connection
2. **FileMaker Server** - Ensure the server is running and accessible
3. **Host configuration** - Verify the host address is correct
4. **Proxy server** - Make sure the proxy server is running (npm run proxy)

Try:
1. Check the host address: ${host}
2. Ensure FileMaker Server is running
3. Verify network connectivity
4. Restart the proxy server if needed

Error details: ${error.message}`;
            
            showResult('trackingOutput', errorMessage, true);
            log('Connection issue - check server and network', 'error');
        } else {
            showResult('trackingOutput', `Error: ${error.message}`, true);
        }
    }
}

// Function to extract identifier from URL
// Manual identifier functions removed - OAuth completion is now handled automatically via server-side capture

// Step 3: Open OAuth Window
function openOAuthWindow() {
    if (!oauthData.returnUrl) {
        alert('Please complete step 2 first');
        return;
    }

    // Convert HTTPS to HTTP for local development
    let oauthUrl = oauthData.returnUrl;
    if (oauthUrl.includes('https://localhost:3002')) {
        oauthUrl = oauthUrl.replace('https://localhost:3002', 'http://localhost:3002');
        log('Converted HTTPS to HTTP for local development');
    }

    log(`Opening OAuth window...`);
    
    // Open the OAuth window
    const oauthWindow = window.open(
        oauthUrl,
        'oauth_window',
        'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    
    if (!oauthWindow) {
        alert('Please allow popups for this site to continue with OAuth authentication');
        return;
    }
    
    // Start server-side polling only (most reliable method)
    startServerSidePolling(oauthData.trackingId);
    
    // PostMessage support is still available via proxy server OAuth redirect page
    
    // Listen for OAuth completion message from the capture page (fallback)
    const fallbackMessageHandler = (event) => {
        if (event.data && event.data.type === 'oauth_complete') {
            log('OAuth completion message received', 'success');
            log(`Identifier: ${event.data.identifier ? 'present' : 'missing'}`);
            log(`Tracking ID: ${event.data.trackingID ? 'present' : 'missing'}`);
            
            // Store the identifier
            oauthData.identifier = event.data.identifier;
            oauthData.trackingID = event.data.trackingID;
            oauthData.error = event.data.error;
            
            // Remove the message listener
            window.removeEventListener('message', messageHandler);
            
            // Clear the interval
            clearInterval(checkOAuthCompletion);
            
            // Show completion result
            showResult('oauthOutput', {
                identifier: event.data.identifier,
                trackingID: event.data.trackingID,
                error: event.data.error,
                status: event.data.status
            });
            
            log('OAuth authentication completed successfully!', 'success');
            if (event.data.identifier) {
                log(`FileMaker identifier received: ${event.data.identifier}`, 'success');
                enableNextStep(3);
            } else {
                log('No FileMaker identifier received - you may need to manually extract it from the redirect URL', 'warning');
                log('Please check the OAuth redirect URL for the identifier parameter', 'warning');
                // Show the manual identifier input as fallback
                document.getElementById('manualIdentifierGroup').style.display = 'block';
                // Still enable the next step but warn the user
                enableNextStep(3);
            }
        }
    };
    
    // Add message listener
    window.addEventListener('message', messageHandler);
    
    // Monitor the window for completion (fallback)
    const checkOAuthCompletion = setInterval(() => {
        try {
            if (oauthWindow.closed) {
                clearInterval(checkOAuthCompletion);
                log('OAuth window closed - checking for completion...');
                
                // If we don't have an identifier, show manual input as fallback
                if (!oauthData.identifier) {
                    log('OAuth window closed - please check the FileMaker server URL for the identifier parameter', 'info');
                    log('Look for a URL like: https://myhost.com/?trackingID=...&identifier=XXXXX...', 'info');
                    log('Copy the identifier value and paste it in the manual input field below', 'info');
                    // Show the manual identifier input as fallback
                    document.getElementById('manualIdentifierGroup').style.display = 'block';
                    enableNextStep(3);
                }
            } else {
                // Try to get the current URL from the OAuth window
                try {
                    const currentUrl = oauthWindow.location.href;
                    
                    if (currentUrl && currentUrl.includes('identifier=')) {
                        // Extract identifier from URL
                        const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
                        const identifier = urlParams.get('identifier');
                        const trackingID = urlParams.get('trackingID');
                        
                        if (identifier) {
                            log(`✅ Identifier found in URL: ${identifier}`, 'success');
                            log(`✅ Tracking ID found: ${trackingID}`, 'success');
                            
                            // Store the identifier
                            oauthData.identifier = identifier;
                            oauthData.trackingID = trackingID;
                            
                            // Show completion result
                            showResult('oauthOutput', {
                                identifier: identifier,
                                trackingID: trackingID,
                                status: 'completed',
                                source: 'automatic URL monitoring'
                            });
                            
                            // Close the window
                            oauthWindow.close();
                            
                            // Clear the interval
                            clearInterval(checkOAuthCompletion);
                            
                            // Remove the message listener
                            window.removeEventListener('message', messageHandler);
                            
                            log('OAuth authentication completed successfully!', 'success');
                            enableNextStep(3);
                        }
                    }
                } catch (urlError) {
                    // Cross-origin error - this is expected when window is on different domain
                    // This is normal behavior, continue monitoring
                }
            }
        } catch (error) {
            // Window might be cross-origin, which is expected
        }
    }, 500);
    
    log('OAuth window opened - complete authentication to continue', 'info');
}

// OAuth monitoring functions removed - using server-side polling only

// Global variable for server-side polling
let serverPollingInterval = null;

// Function to stop server-side polling
function stopServerPolling() {
    if (serverPollingInterval) {
        clearInterval(serverPollingInterval);
        serverPollingInterval = null;
        log('Server-side polling stopped', 'info');
    }
}

// Function to start server-side polling (Method 3: Server-Side Capture)
function startServerSidePolling(trackingId) {
    if (!trackingId) {
        log('No tracking ID provided for server-side polling', 'warning');
        return;
    }
    
    log(`Starting server-side OAuth completion polling for tracking ID: ${trackingId}`, 'info');
    
    let pollCount = 0;
    serverPollingInterval = setInterval(async () => {
        try {
            pollCount++;
            
            const response = await fetch(`/api/oauth-status/${trackingId}`);
            const data = await response.json();
            
            if (response.ok && data.success && data.session) {
                const session = data.session;
                
                // Log polling status every 20 attempts  
                if (pollCount % 20 === 0) {
                    log(`Checking OAuth status... (${pollCount} checks)`, 'info');
                }
                
                const oauthIdentifier = session.identifier || session.code;
                
                if (session.status === 'completed' && oauthIdentifier) {
                    log(`✅ OAuth completion detected - Identifier: ${oauthIdentifier}`, 'success');
                    
                    // Stop server-side polling
                    stopServerPolling();
                    
                    oauthData.identifier = oauthIdentifier;
                    oauthData.trackingID = session.trackingId;
                    oauthData.authorizationCode = session.code;
                    
                    // Show completion result
                    showResult('oauthOutput', {
                        identifier: oauthIdentifier,
                        authorizationCode: session.code,
                        trackingID: session.trackingId,
                        error: session.error,
                        status: 'completed',
                        source: 'server-side polling'
                    });
                    
                    // Enable next step
                    enableNextStep(3);
                    
                    // Close popup window
                    const oauthWindow = window.open('', 'oauth_window');
                    if (oauthWindow && !oauthWindow.closed) {
                        setTimeout(() => {
                            oauthWindow.close();
                        }, 2000);
                    }
                    
                    log('OAuth authentication completed successfully via server-side capture!', 'success');
                }
            } else if (pollCount === 1) {
                log('Server-side polling started (session not found yet - this is normal)', 'info');
            }
            
            // Stop polling after 5 minutes (600 attempts at 500ms intervals)
            if (pollCount >= 600) {
                clearInterval(serverPollingInterval);
                serverPollingInterval = null;
                log('Server-side polling stopped after 5 minutes timeout', 'warning');
            }
            
        } catch (error) {
            if (pollCount === 1) {
                log(`Server-side polling error (will continue trying): ${error.message}`, 'warning');
                
                // Try to get the raw response to understand what we're receiving
                try {
                    const debugResponse = await fetch(`/api/oauth-status/${trackingId}`);
                    const debugText = await debugResponse.text();
                    log(`Debug - Raw server response: ${debugText.substring(0, 200)}...`, 'info');
                } catch (debugError) {
                    log(`Debug - Could not get raw response: ${debugError.message}`, 'warning');
                }
            }
            
            // Stop after too many errors
            if (pollCount >= 100) {
                clearInterval(serverPollingInterval);
                serverPollingInterval = null;
                log('Server-side polling stopped due to repeated errors', 'error');
            }
        }
    }, 500); // Poll every 500ms
}

// URL monitoring functions removed - using server-side polling only

// Manual processing function removed - using automatic server-side capture

// Simulate OAuth completion for demo purposes
function simulateOAuthCompletion() {
    // In a real implementation, you would get the identifier from the OAuth provider
    // For demo purposes, we'll create a mock identifier
    oauthData.identifier = `mock-identifier-${Date.now()}`;
    
    log(`OAuth completed - Identifier: ${oauthData.identifier}`, 'success');
    showResult('oauthOutput', {
        identifier: oauthData.identifier,
        status: 'completed',
        timestamp: new Date().toISOString()
    });
    
    enableNextStep(3);
}

// Step 4: Database Session Login
async function loginToDatabase() {
    const host = document.getElementById('host').value.trim();
    const databaseName = document.getElementById('databaseName').value.trim();
    const apiVersion = document.getElementById('apiVersion').value;
    
    if (!host || !databaseName || !oauthData.requestId || !oauthData.identifier) {
        let missingItems = [];
        if (!host) missingItems.push('host');
        if (!databaseName) missingItems.push('database name');
        if (!oauthData.requestId) missingItems.push('request ID (complete step 2)');
        if (!oauthData.identifier) missingItems.push('FileMaker identifier (complete step 3)');
        
        alert(`Please complete all previous steps and fill in: ${missingItems.join(', ')}`);
        
        // If identifier is missing, show the manual input
        if (!oauthData.identifier) {
            document.getElementById('manualIdentifierGroup').style.display = 'block';
            log('FileMaker identifier is missing - please enter it manually or complete the OAuth flow again', 'warning');
        }
        return;
    }

    log(`Logging into database: ${databaseName} with OAuth`);
    
    try {
        const url = `/api/database-login`;
        log(`Making request to: ${url}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                host: host,
                databaseName: databaseName,
                apiVersion: apiVersion,
                requestId: oauthData.requestId,
                identifier: oauthData.identifier // Use the FileMaker identifier, not the authorization code
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${responseData.error || 'Unknown error'}`);
        }

        if (!responseData.success) {
            throw new Error(`Database login failed: ${responseData.error || 'Unknown error'}`);
        }

        // Get the access token from response
        const accessToken = responseData.accessToken;
        
        if (!accessToken) {
            throw new Error('X-FM-Data-Access-Token header not found in response');
        }

        oauthData.accessToken = accessToken;
        
        const loginResult = {
            accessToken: accessToken,
            response: responseData.response,
            database: databaseName,
            apiVersion: apiVersion,
            timestamp: new Date().toISOString()
        };
        
        showResult('loginOutput', loginResult);
        log('Database login successful!', 'success');
        log(`Access Token: ${accessToken.substring(0, 20)}...`);
        
        // Mark step as completed
        document.getElementById('step4').classList.add('completed');
        
    } catch (error) {
        log(`Error logging into database: ${error.message}`, 'error');
        showResult('loginOutput', `Error: ${error.message}`, true);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    log('FileMaker Data API OAuth Test Page loaded');
    log('Loading configuration...', 'info');
    
    // Load configuration from server
    try {
        const configResponse = await fetch('/api/config');
        if (configResponse.ok) {
            const config = await configResponse.json();
            
            // Set default values if they're not the placeholder values
            if (config.defaultFileMakerHost && config.defaultFileMakerHost !== 'your-filemaker-server.com') {
                document.getElementById('host').value = config.defaultFileMakerHost;
                log(`Using default FileMaker host: ${config.defaultFileMakerHost}`, 'info');
            }
            
            if (config.defaultDatabase && config.defaultDatabase !== 'YourDatabase') {
                document.getElementById('databaseName').value = config.defaultDatabase;
                log(`Using default database: ${config.defaultDatabase}`, 'info');
            }
            
            if (config.defaultApiVersion) {
                document.getElementById('apiVersion').value = config.defaultApiVersion;
            }
            
            log(`Environment: ${config.environment}`, 'info');
            log(`OAuth redirect URL: ${config.redirectBaseUrl}/oauth/redirect`, 'info');
        }
    } catch (error) {
        log('Could not load configuration, using default values', 'warning');
    }
    
    // Generate initial UUID for tracking ID
    const initialTrackingId = generateUUID();
    document.getElementById('trackingId').value = initialTrackingId;
    log(`Generated initial Tracking ID: ${initialTrackingId}`, 'info');
    
    // Add event listeners for better UX
    document.getElementById('host').addEventListener('input', function() {
        if (this.value.trim()) {
            document.querySelector('#step1 button').disabled = false;
        }
    });
    
    document.getElementById('trackingId').addEventListener('input', function() {
        checkTrackingIdStep();
    });
    
    document.getElementById('databaseName').addEventListener('input', function() {
        if (this.value.trim() && oauthData.identifier) {
            document.querySelector('#step4 button').disabled = false;
        }
    });
    
    // Initial check for tracking ID step
    checkTrackingIdStep();
});

// Export functions for global access
window.getOAuthProviders = getOAuthProviders;
window.getTrackingId = getTrackingId;
window.openOAuthWindow = openOAuthWindow;
window.loginToDatabase = loginToDatabase;
window.clearLogs = clearLogs;
window.generateTrackingId = generateTrackingId;
window.checkTrackingIdStep = checkTrackingIdStep;