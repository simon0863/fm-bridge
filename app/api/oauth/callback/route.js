import { NextResponse } from 'next/server'
import { filemakerOAuthService } from '@/lib/filemaker-oauth-service'
import { FileMakerService } from '@/lib/filemaker-service'



export async function GET(request) {
  const { searchParams } = new URL(request.url)

  // Log all parameters for debugging
  console.log('OAuth callback received:')
  for (const [key, value] of searchParams.entries()) {
    console.log(`  ${key}: ${value}`)
  }

  const trackingID = searchParams.get('trackingID')
  const identifier = searchParams.get('identifier')
  const hiddenemail = searchParams.get('hiddenemail')
  const error = searchParams.get('error')
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // Handle FileMaker's direct callback (like Rob's /oauth/capture)
  if (trackingID && identifier) {
    console.log('FileMaker direct callback received')

    // error = '0' means success in FileMaker
    if (error && error !== '0') {
      console.error('FileMaker OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=${error}`
      )
    }

    try {
      // Store the completion in your OAuth service
      const oauthResult = await filemakerOAuthService.completeOAuth(trackingID, {
        identifier,
        hiddenemail,
        error: error === '0' ? null : error
      })

      // Create FileMaker session
      const filemakerSession = await filemakerOAuthService.createFileMakerSession(oauthResult)

      if (!filemakerSession.success) {
        console.error('FileMaker session creation failed:', filemakerSession.error)
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=filemaker_session_creation_failed&description=${filemakerSession.error}`
        )
      }

      // OK now so we have a filemaker session token to use.
      // Use this to create a JWT from Filemaker and validate it using the validateJWT module.

      // This functionality exists in the filemaker-service.js file, we will use it here.
      // get a singleton instance of the filemaker service.

      const service = FileMakerService.getInstance();

      const nextAuthUser = await service.authenticateFileMakerUser(null, null, filemakerSession.accessToken)

      console.log('NextAuthUser:', nextAuthUser)

      // Encode user data for URL
      const userData = encodeURIComponent(JSON.stringify(nextAuthUser))

      // Redirect to a success page with the user data
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/oauth-success?user=${userData}`)


    } catch (error) {
      console.error('FileMaker callback error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=callback_failed&description=${error.message}`
      )
    }
  }

  // Handle Microsoft's OAuth callback (like Rob's /oauth/redirect)
  if (code && state) {
    console.log('Microsoft OAuth callback received')
    // This would be the more complex flow that exchanges code for identifier
    // For now, redirect to error since we need to implement this
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=not_implemented`
    )
  }

  // No valid callback parameters
  console.error('Invalid OAuth callback - no valid parameters')
  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/auth/oauth-error?error=invalid_callback`
  )
}