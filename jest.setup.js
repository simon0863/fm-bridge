import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://test-project.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.FILEMAKER_SERVER = 'https://test-filemaker.com'
process.env.FILEMAKER_DATABASE = 'test-database'
process.env.FILEMAKER_AUTH_USERNAME = 'test-auth-user'
process.env.FILEMAKER_AUTH_PASSWORD = 'test-auth-password'
process.env.FILEMAKER_DATA_USERNAME = 'test-data-user'
process.env.FILEMAKER_DATA_PASSWORD = 'test-data-password'
