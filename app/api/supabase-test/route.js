import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'test'
    
    // Create Supabase client with service key (server-side only)
    const supabase = createClient(
      process.env.SUPABASE_TEST_URL,
      process.env.SUPABASE_TEST_SERVICE_KEY
    )
    
    let result
    
    switch (action) {
      case 'test':
        // Simple connection test
        const { data, error } = await supabase
          .from('test_users')
          .select('*')
        
        result = {
          success: !error,
          data: data,
          error: error?.message || null,
          message: 'Connection test completed'
        }
        break
        
      case 'read':
        // Read all users
        const { data: readData, error: readError } = await supabase
          .from('test_users')
          .select('*')
          .order('created_at', { ascending: false })
        
        result = {
          success: !readError,
          data: readData,
          error: readError?.message || null,
          message: 'Read operation completed'
        }
        break
        
      case 'write':
        // Write a test user
        const testUser = {
          name: `Test User ${Date.now()}`,
          email: `test${Date.now()}@example.com`
        }
        
        const { data: writeData, error: writeError } = await supabase
          .from('test_users')
          .insert([testUser])
          .select()
          .single()
        
        result = {
          success: !writeError,
          data: writeData,
          error: writeError?.message || null,
          message: 'Write operation completed'
        }
        break
        
      case 'delete':
        // Delete test users (cleanup)
        const { error: deleteError } = await supabase
          .from('test_users')
          .delete()
          .like('email', 'test%')
        
        result = {
          success: !deleteError,
          data: null,
          error: deleteError?.message || null,
          message: 'Cleanup completed'
        }
        break
        
      default:
        result = {
          success: false,
          data: null,
          error: 'Invalid action',
          message: 'Available actions: test, read, write, delete'
        }
    }
    
    return Response.json(result)
    
  } catch (error) {
    console.error('Supabase API error:', error)
    return Response.json({
      success: false,
      data: null,
      error: error.message,
      message: 'API error occurred'
    }, { status: 500 })
  }
}
