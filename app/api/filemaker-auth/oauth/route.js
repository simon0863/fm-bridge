/**
 * FileMaker OAuth API Route
 * 
 * This API route handles the FileMaker proxied OAuth flow for Microsoft authentication.
 * FileMaker acts as a proxy between our app and Microsoft OAuth, allowing us to use
 * Microsoft SSO through FileMaker's Data API OAuth endpoints.
 * 
 * Flow:
 * 1. App initiates OAuth with FileMaker (action=initiate)
 * 2. FileMaker redirects user to Microsoft OAuth
 * 3. Microsoft redirects back to FileMaker
 * 4. FileMaker redirects back to our app with OAuth data
 * 5. App completes OAuth and creates FileMaker session (action=complete)
 * 6. App exchanges FileMaker session for JWT and creates NextAuth session
 * 
 * Supported Actions:
 * - providers: Get available OAuth providers from FileMaker
 * - initiate: Start OAuth flow with specified provider
 * - status: Check status of OAuth session by tracking ID
 * - complete: Complete OAuth flow with callback data
 * - sessions: Get all active OAuth sessions (debugging)
 * - full-flow: Test complete OAuth flow end-to-end
 * 
 * Usage:
 * GET /api/filemaker-auth/oauth?action=initiate&provider=Microsoft
 * GET /api/filemaker-auth/oauth?action=status&trackingId=12345
 * GET /api/filemaker-auth/oauth?action=sessions
 */

import { NextResponse } from "next/server"
import { filemakerOAuthService } from "@/lib/filemaker-oauth-service"

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'providers'
    const host = process.env.FILEMAKER_HOST
    const provider = searchParams.get('provider') || 'Microsoft' // Default provider

    try {
        switch (action) {
            case 'providers':
                // Step 1: Get OAuth providers
                const providers = await filemakerOAuthService.getOAuthProviders(host)
                
                return NextResponse.json({
                    success: true,
                    action: 'providers',
                    data: providers
                })

            case 'initiate':
                // Step 2: Initiate OAuth flow ultimatley leading to a callback from filemaker
                const oauthInit = await filemakerOAuthService.initiateOAuth(host, provider)
                
                return NextResponse.json({
                    success: true,
                    action: 'initiate',
                    data: oauthInit,
                    message: `OAuth flow initiated. Tracking ID: ${oauthInit.trackingId}`
                })

            case 'status':
                // Step 3: Check OAuth status
                const trackingId = searchParams.get('trackingId')
                if (!trackingId) {
                    return NextResponse.json({
                        success: false,
                        error: 'trackingId parameter required for status check'
                    }, { status: 400 })
                }

                const status = await filemakerOAuthService.checkOAuthStatus(trackingId)
                
                return NextResponse.json({
                    success: true,
                    action: 'status',
                    trackingId,
                    data: status
                })

            case 'complete':
                // Step 4: Complete OAuth (simulate callback)
                const completeTrackingId = searchParams.get('trackingId')
                const oauthResult = searchParams.get('result') || '{"userId": "test-user", "userName": "Test User"}'
                
                if (!completeTrackingId) {
                    return NextResponse.json({
                        success: false,
                        error: 'trackingId parameter required for completion'
                    }, { status: 400 })
                }

                const completed = await filemakerOAuthService.completeOAuth(completeTrackingId, JSON.parse(oauthResult))
                
                return NextResponse.json({
                    success: true,
                    action: 'complete',
                    trackingId: completeTrackingId,
                    data: completed
                })

            case 'full-flow':
                // Test the complete flow
                
                // 1. Get providers
                const providersResult = await filemakerOAuthService.getOAuthProviders(host)
                
                // 2. Initiate OAuth
                const initiateResult = await filemakerOAuthService.initiateOAuth(host, provider)
                
                // 3. Check status (should be pending)
                const statusResult = await filemakerOAuthService.checkOAuthStatus(initiateResult.trackingId)
                
                return NextResponse.json({
                    success: true,
                    action: 'full-flow',
                    data: {
                        providers: providersResult,
                        initiation: initiateResult,
                        status: statusResult
                    }
                })

            case 'sessions':
                // Get all current OAuth sessions
                const sessions = Array.from(filemakerOAuthService.oauthSessions.entries()).map(([trackingId, session]) => ({
                    trackingId,
                    ...session
                }))
                
                return NextResponse.json({
                    success: true,
                    action: 'sessions',
                    data: {
                        sessions,
                        count: sessions.length
                    }
                })

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: providers, initiate, status, complete, full-flow, or sessions'
                }, { status: 400 })
        }
    } catch (error) {
        console.error('OAuth test error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            action
        }, { status: 500 })
    }
}