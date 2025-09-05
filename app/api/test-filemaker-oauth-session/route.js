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
                console.log('Getting OAuth providers from:', host)
                const providers = await filemakerOAuthService.getOAuthProviders(host)
                console.log('OAuth providers:', providers)
                
                return NextResponse.json({
                    success: true,
                    action: 'providers',
                    data: providers
                })

            case 'initiate':
                // Step 2: Initiate OAuth flow
                console.log('Initiating OAuth flow with provider:', provider)
                const oauthInit = await filemakerOAuthService.initiateOAuth(host, provider)
                console.log('OAuth initiation result:', oauthInit)
                
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

                console.log('Checking OAuth status for tracking ID:', trackingId)
                const status = await filemakerOAuthService.checkOAuthStatus(trackingId)
                console.log('OAuth status:', status)
                
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

                console.log('Completing OAuth for tracking ID:', completeTrackingId)
                const completed = await filemakerOAuthService.completeOAuth(completeTrackingId, JSON.parse(oauthResult))
                console.log('OAuth completion result:', completed)
                
                return NextResponse.json({
                    success: true,
                    action: 'complete',
                    trackingId: completeTrackingId,
                    data: completed
                })

            case 'full-flow':
                // Test the complete flow
                console.log('Testing complete OAuth flow...')
                
                // 1. Get providers
                const providersResult = await filemakerOAuthService.getOAuthProviders(host)
                console.log('Providers:', providersResult)
                
                // 2. Initiate OAuth
                const initiateResult = await filemakerOAuthService.initiateOAuth(host, provider)
                console.log('Initiation:', initiateResult)
                
                // 3. Check status (should be pending)
                const statusResult = await filemakerOAuthService.checkOAuthStatus(initiateResult.trackingId)
                console.log('Status:', statusResult)
                
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
                console.log('Getting OAuth sessions...')
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