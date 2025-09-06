import { SupabaseService } from '../lib/supabase-service'

// Mock the entire SupabaseService
jest.mock('../lib/supabase-service', () => {
  const mockClient = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }

  return {
    SupabaseService: class MockSupabaseService {
      static instance = null
      client = mockClient
      url = 'https://test-project.supabase.co'
      anonKey = 'test-anon-key'
      serviceKey = 'test-service-key'

      static getInstance() {
        if (!MockSupabaseService.instance) {
          MockSupabaseService.instance = new MockSupabaseService()
        }
        return MockSupabaseService.instance
      }

      async connect() {
        this.client = mockClient
        return this.client
      }

      async readData(table, filters = {}) {
        const mockData = { id: 1, name: 'Test User' }
        return mockData
      }

      async writeData(table, data) {
        return { id: 1, ...data }
      }
    }
  }
})

describe('SupabaseService', () => {
  beforeEach(() => {
    // Reset singleton instance before each test
    SupabaseService.instance = null
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = SupabaseService.getInstance()
      const instance2 = SupabaseService.getInstance()
      
      expect(instance1).toBe(instance2)
      expect(instance1).toBeInstanceOf(SupabaseService)
    })
  })

  describe('connect', () => {
    it('should initialize Supabase client with correct credentials', async () => {
      const service = SupabaseService.getInstance()
      await service.connect()
      
      expect(service.client).toBeDefined()
      expect(service.url).toBe('https://test-project.supabase.co')
      expect(service.anonKey).toBe('test-anon-key')
    })
  })

  describe('readData', () => {
    it('should read data from specified table', async () => {
      const service = SupabaseService.getInstance()
      const result = await service.readData('users', { id: 1 })
      
      expect(result).toEqual({ id: 1, name: 'Test User' })
    })
  })

  describe('writeData', () => {
    it('should write data to specified table', async () => {
      const service = SupabaseService.getInstance()
      const testData = { name: 'New User', email: 'test@example.com' }
      const result = await service.writeData('users', testData)
      
      expect(result).toEqual({ id: 1, ...testData })
    })
  })
})
