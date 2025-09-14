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