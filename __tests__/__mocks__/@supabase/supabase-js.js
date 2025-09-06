// Mock Supabase client for testing
export const createClient = jest.fn(() => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn()
  }))
}))

// Mock Supabase auth
export const createClientComponentClient = jest.fn(() => ({
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn()
  }
}))

// Mock Supabase server client
export const createServerComponentClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn()
  }
}))
