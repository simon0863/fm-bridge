import { verify } from 'jsonwebtoken';


export async function validateJWT(jwt) {
    const jwtSecret = process.env.FILEMAKER_JWT_SECRET || '';

    try {
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }

        if (!jwt) {
            throw new Error('No JWT token provided');
        }

        // Verify and decode the JWT using the shared secret
        const payload = verify(jwt, jwtSecret);

        // Transform the JWT payload into NextAuth user object
        const nextAuthUser = {
            id:"1234",
            name: payload.user,
            group: payload.privilegeSet,
            // Add any other fields you need
            // This is the single place to maintain the mapping
        };

        

        // Return the NextAuth user object if valid
        return nextAuthUser;
      

    } catch (error) {
        console.error('JWT validation failed:', error);
        return false;
    }
}