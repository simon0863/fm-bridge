import { NextResponse } from "next/server"
import { filemakerService } from "@/lib/filemaker-service"

export async function GET(request, { params }) {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    try {
        switch (id) {
            case "get-token":
                const sessionToken = await filemakerService.createSession("data");
                return NextResponse.json({ 
                    success: true, 
                    token: sessionToken,
                    message: "Data session created successfully" 
                });
                
            case "validate-session":
                // The token is passed as a query parameter
                if (!token) {
                    return NextResponse.json({ 
                        success: false, 
                        error: "No token provided for validation" 
                    });
                }
                
                const isValid = await filemakerService.validateSession(token);
                return NextResponse.json({ 
                    success: true, 
                    token: token,
                    isValid: isValid,
                    message: isValid ? "Session is valid" : "Session is invalid or expired"
                });
                
            case "revoke-session":
                // The token is passed as a query parameter
                if (!token) {
                    return NextResponse.json({ 
                        success: false, 
                        error: "No token provided for revocation" 
                    });
                }
                
                const revokeSuccess = await filemakerService.revokeSession(token);
                return NextResponse.json({ 
                    success: true, 
                    token: token,
                    revoked: revokeSuccess,
                    message: revokeSuccess ? "Session revoked successfully" : "Failed to revoke session"
                });
                
            case "test-connection":
                // Test basic connection by creating and immediately revoking a session
                const testToken = await filemakerService.createSession("data");
                const revokeResult = await filemakerService.revokeSession(testToken);
                return NextResponse.json({ 
                    success: true, 
                    message: "Connection test successful",
                    tokenCreated: !!testToken,
                    tokenRevoked: revokeResult
                });

            case "test-shared-session":
                // Test the new shared session management
                try {
                    const sharedToken1 = await filemakerService.getDataSession();
                    const sharedToken2 = await filemakerService.getDataSession();
                    const isSameToken = sharedToken1 === sharedToken2;
                    const sessionExpiry = filemakerService.dataSessionExpiry;
                    const timeUntilExpiry = sessionExpiry ? Math.round((sessionExpiry - Date.now()) / 1000) : 0;
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: "Shared session test successful",
                        token1: sharedToken1,
                        token2: sharedToken2,
                        isSameToken: isSameToken,
                        timeUntilExpiry: timeUntilExpiry,
                        sessionExpiry: sessionExpiry
                    });
                } catch (error) {
                    return NextResponse.json({ 
                        success: false, 
                        error: error.message 
                    });
                }

            case "test-session-recovery":
                // Test session recovery by forcing a health check
                try {
                    console.log('🧪 Testing session recovery...');
                    
                    // Get initial session
                    const initialToken = await filemakerService.getDataSession();
                    console.log('🧪 Initial token:', initialToken ? initialToken.substring(0, 20) + '...' : 'null');
                    
                    // Force a health check to validate the session
                    console.log('🧪 Forcing health check...');
                    const healthResult = await filemakerService.healthCheck();
                    console.log('🧪 Health check result:', healthResult);
                    
                    // Get session again after health check
                    const afterHealthToken = await filemakerService.getDataSession();
                    console.log('🧪 After health check token:', afterHealthToken ? afterHealthToken.substring(0, 20) + '...' : 'null');
                    
                    const sessionSurvived = initialToken === afterHealthToken;
                    const sessionExpiry = filemakerService.dataSessionExpiry;
                    const timeUntilExpiry = sessionExpiry ? Math.round((sessionExpiry - Date.now()) / 1000) : 0;
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: "Session recovery test completed",
                        initialToken: initialToken,
                        afterHealthToken: afterHealthToken,
                        sessionSurvived: sessionSurvived,
                        healthCheckResult: healthResult,
                        timeUntilExpiry: timeUntilExpiry,
                        sessionExpiry: sessionExpiry
                    });
                } catch (error) {
                    return NextResponse.json({ 
                        success: false, 
                        error: error.message 
                    });
                }

            case "test-irpm-api":
                // Test the IRPM API endpoint
                try {
                    console.log('🧪 Testing IRPM API...');
                    
                    // Test with a sample record ID (you'll need to adjust this)
                    const testRecordId = "1"; // Adjust this to a real record ID
                    
                    // Test GET request
                    const getResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/roundup/irpm/${testRecordId}`);
                    const getData = await getResponse.json();
                    
                    console.log('🧪 IRPM GET response:', getData);
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: "IRPM API test completed",
                        testRecordId: testRecordId,
                        getResponse: getData,
                        getStatus: getResponse.status
                    });
                } catch (error) {
                    return NextResponse.json({ 
                        success: false, 
                        error: error.message 
                    });
                }
                
            default:
                return NextResponse.json({ 
                    success: false, 
                    error: "Invalid action. Use: get-token, validate-session, revoke-session, or test-connection" 
                }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}