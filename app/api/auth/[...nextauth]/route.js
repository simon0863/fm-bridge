// This is the file that sets up the authentication providers for the nextauth authentication provider.
// Each array member of the providers array is a different authentication provider.
import NextAuth from "next-auth"
import { FileMakerService } from "@/lib/filemaker-service"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    // START FILEMAKER USERNAME PASSWORD PROVIDOR
    CredentialsProvider({
      id: "filemaker",
      name: "FileMaker",
      type: "credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your FileMaker username"
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your FileMaker password"
        }
      },



      async authorize(credentials) {
        // retrive single instance of FileMakerService

        try {
          const filemakerService = FileMakerService.getInstance();

          console.log("FileMaker auth attempt:", credentials.username);

          // authenticate the user, validate the JWT and return the user object.

          const fmJWT = await filemakerService.authenticateFileMakerUser(credentials.username, credentials.password)

          // user failed to authenticate
          if (!fmJWT) {
            console.log("FileMaker authentication failed for:", credentials.username)
            return null
          }

          // user authenticated successfully
          console.log("FileMaker authentication successful for:", credentials.username)

          // Return user object for NextAuth.js session
          return {
            user: fmJWT.user,
            group: fmJWT.privilegeSet,
          }

        } catch (error) {
          console.error("FileMaker authentication error:", error)
          return null
        }
      }
    }),
    // END FILEMAKER USERNAME PASSWORD PROVIDOR

    // START FILEMAKER MAGIC LINK PROVIDOR
    CredentialsProvider({
      id: "filemakerMagicLink",
      name: "FileMaker Magic Link",
      type: "credentials",
      credentials:
        { magicLink: 'JWT' },
      async authorize(credentials) {
        try {
          const filemakerService = FileMakerService.getInstance();
          const fmJWT = await filemakerService.validateMagicLink(credentials.magicLink);
          if (!fmJWT) {
            console.log("FileMaker authentication failed for filemaker magic link")
            return null;
          }
          // so jwt has been validated return user data to nextauth

          return {
            user: fmJWT.user,
            group: fmJWT.privilegeSet,
          }
        } catch (error) {
          console.error('Filemaker magic link login failed', error)
          return null
        }
      }
    })
    // END FILEMAKER MAGIC LINK PROVIDOR
  ],

  // Session configuration
  // Use  a JWT as the session token (not the fmJWT a NextAuth JWT)
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  // Callbacks for customizing the authentication flow
  callbacks: {
    async jwt({ token, user }) {
      // Add custom claims to JWT token
      if (user) {
        token.userId = user.id
        token.username = user.name
        token.filemakerData = user.filemakerData
      }
      return token
    },

    async session({ session, token }) {
      // Add custom data to session
      if (token) {
        session.user.id = token.userId
        session.user.username = token.username
        session.user.filemakerData = token.filemakerData
      }
      return session
    }
  },

  // Pages configuration
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  // Debug mode (remove in production)
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
