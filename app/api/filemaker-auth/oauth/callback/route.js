/**
 * OAuth Callback Route
 * 
 * This API route handles OAuth callbacks from FileMaker after Microsoft SSO authentication.
 * FileMaker acts as a proxy between our app and Microsoft OAuth, so the flow is:
 * 
 * 1. User clicks "Login with Microsoft" → Redirects to FileMaker OAuth
 * 2. FileMaker redirects to Microsoft OAuth → User authenticates with Microsoft
 * 3. Microsoft redirects back to FileMaker → FileMaker processes the OAuth
 * 4. FileMaker redirects to this callback route → We complete the authentication
 * 5. We create a FileMaker session → Exchange it for a JWT → Create NextAuth session
 * 
 * This route handles two types of callbacks:
 * - FileMaker Direct Callback: When FileMaker redirects with trackingID + identifier
 * - Microsoft Direct Callback: When Microsoft redirects with code + state (not implemented)
 * 
 * The FileMaker callback contains:
 * - trackingID: Unique identifier for the OAuth session
 * - identifier: User identifier from Microsoft (email/username)
 * - hiddenemail: User's email address
 * - error: '0' means success, any other value means failure
 * 
 * After successful authentication, the user is redirected to /auth/oauth-success
 * with their user data, where a NextAuth session is created client-side.
 */

import { NextResponse } from 'next/server'
import { filemakerOAuthService } from '@/lib/filemaker-oauth-service'
import { FileMakerService } from '@/lib/filemaker-service'

export async function GET(request) {
  // ========================================================================
  // STEP 1: EXTRACT CALLBACK PARAMETERS
  // ========================================================================
  // Parse the URL to get all query parameters from the OAuth callback
  const { searchParams } = new URL(request.url)

  // Log all parameters for debugging purposes
  for (const [key, value] of searchParams.entries()) {
  }

  // Extract the specific parameters we need for OAuth processing
  const trackingID = searchParams.get('trackingID')    // Unique session identifier
  const identifier = searchParams.get('identifier')    // User ID from Microsoft
  const hiddenemail = searchParams.get('hiddenemail')  // User's email address
  const error = searchParams.get('error')              // '0' = success, other = error
  const code = searchParams.get('code')                // For direct Microsoft callbacks
  const state = searchParams.get('state')              // For direct Microsoft callbacks

  // ========================================================================
  // STEP 2: HANDLE FILEMAKER DIRECT CALLBACK
  // ========================================================================
  // This is the main flow: FileMaker → Microsoft → FileMaker → Our App
  // FileMaker redirects here with trackingID and identifier after processing Microsoft OAuth
  if (trackingID && identifier) {

    // Check for OAuth errors - FileMaker uses '0' to indicate success
    if (error && error !== '0') {
      console.error('FileMaker OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=${error}`
      )
    }

    try {
      // ========================================================================
      // STEP 3: COMPLETE OAUTH FLOW
      // ========================================================================
      // Update our OAuth session with the callback data from FileMaker
      // This links the trackingID to the actual user data from Microsoft
      const oauthResult = await filemakerOAuthService.completeOAuth(trackingID, {
        identifier,      // User identifier from Microsoft
        hiddenemail,     // User's email address
        error: error === '0' ? null : error  // Convert '0' to null for success
      })

      // ========================================================================
      // STEP 4: CREATE FILEMAKER SESSION
      // ========================================================================
      // Exchange the OAuth identifier for a FileMaker Data API session token
      // This allows us to make authenticated requests to FileMaker
      const filemakerSession = await filemakerOAuthService.createFileMakerSession(oauthResult)

      if (!filemakerSession.success) {
        console.error('FileMaker session creation failed:', filemakerSession.error)
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=filemaker_session_creation_failed&description=${filemakerSession.error}`
        )
      }

      // ========================================================================
      // STEP 5: EXCHANGE SESSION FOR JWT
      // ========================================================================
      // Use the FileMaker session token to authenticate and get a JWT
      // This JWT contains the user's FileMaker account information
      const service = FileMakerService.getInstance();
      const nextAuthUser = await service.authenticateFileMakerUser(
        null,                              // No username for OAuth
        null,                              // No password for OAuth  
        filemakerSession.accessToken       // Use the OAuth session token
      )


      // ========================================================================
      // STEP 6: PREPARE FOR CLIENT-SIDE SESSION CREATION
      // ========================================================================
      // Encode the user data for URL transmission to the success page
      // The success page will use this data to create a NextAuth session
      const userData = encodeURIComponent(JSON.stringify(nextAuthUser))

      // Redirect to success page where client-side session creation happens
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/oauth-success?user=${userData}`)

    } catch (error) {
      // ========================================================================
      // ERROR HANDLING
      // ========================================================================
      console.error('FileMaker callback error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=callback_failed&description=${error.message}`
      )
    }
  }

  // ========================================================================
  // STEP 7: HANDLE MICROSOFT DIRECT CALLBACK (NOT IMPLEMENTED)
  // ========================================================================
  // This would handle direct Microsoft OAuth callbacks (bypassing FileMaker)
  // Currently not implemented as we use FileMaker as a proxy
  if (code && state) {
    // This would be the more complex flow that exchanges code for identifier
    // For now, redirect to error since we need to implement this
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=not_implemented`
    )
  }

  // ========================================================================
  // STEP 8: INVALID CALLBACK HANDLING
  // ========================================================================
  // If we reach here, the callback doesn't have the expected parameters
  // This could happen if someone accesses the URL directly or with malformed data
  console.error('Invalid OAuth callback - no valid parameters')
  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=invalid_callback`
  )
}