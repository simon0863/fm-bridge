import { getSession, signIn, signOut, useSession } from "next-auth/react"

// Client-side authentication utilities
export const authUtils = {
  // Sign in with FileMaker credentials
  signIn: async (username, password) => {
    try {
      const result = await signIn("filemaker", {
        username,
        password,
        redirect: false,
      })
      return result
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: "Authentication failed" }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut({ redirect: false })
      return { success: true }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: "Sign out failed" }
    }
  },

  // Get current session
  getSession: async () => {
    try {
      return await getSession()
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const session = await getSession()
    return !!session
  }
}

// Re-export NextAuth hooks for convenience
export { useSession, getSession, signIn, signOut }

// Default export for the utilities
export default authUtils
