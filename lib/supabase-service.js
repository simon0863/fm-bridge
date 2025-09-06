// Supabase Service
// Manages Supabase database connections and operations

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// JSDoc Type Definitions
// ============================================================================

/**
 * @typedef {Object} SupabaseConfig
 * @property {string} url - Supabase project URL
 * @property {string} anonKey - Supabase anonymous key
 * @property {string} serviceKey - Supabase service role key
 */

/**
 * @typedef {Object} SupabaseResponse
 * @property {any} data - Response data
 * @property {any} error - Error object if any
 */

// ============================================================================
// SUPABASE SERVICE CLASS - Singleton pattern for managing Supabase connections
// ============================================================================

export class SupabaseService {
    // Singleton instance - ensures only one service instance exists
    static instance;

    // Supabase connection configuration - loaded from environment variables
    url;           // Supabase project URL
    anonKey;       // Supabase anonymous key
    serviceKey;    // Supabase service role key
    client;        // Supabase client instance

    // ============================================================================
    // CONSTRUCTOR - Private constructor for singleton pattern
    // ============================================================================

    constructor() {
        // Load Supabase configuration from environment variables
        // These should be set in your .env.local file
        this.url = process.env.SUPABASE_URL || '';
        this.anonKey = process.env.SUPABASE_ANON_KEY || '';
        this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        this.client = null;
    }

    // ============================================================================
    // SINGLETON GETTER - Returns the single instance of the service
    // ============================================================================

    /**
     * Get the singleton instance of SupabaseService
     * @returns {SupabaseService} - The singleton instance
     */
    static getInstance() {
        // Create instance if it doesn't exist, otherwise return existing instance
        if (!SupabaseService.instance) {
            SupabaseService.instance = new SupabaseService();
        }
        return SupabaseService.instance;
    }

    // ============================================================================
    // CONNECTION MANAGEMENT - Initialize Supabase client
    // ============================================================================

    /**
     * Connect to Supabase and initialize the client
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            if (!this.url || !this.anonKey) {
                throw new Error('Supabase URL and anonymous key are required');
            }

            this.client = createClient(this.url, this.anonKey);
        } catch (error) {
            console.error('Failed to connect to Supabase:', error);
            throw error;
        }
    }

    // ============================================================================
    // DATA OPERATIONS - Read and write data to Supabase
    // ============================================================================

    /**
     * Read data from a Supabase table
     * @param {string} table - Table name
     * @param {Object} filters - Filter conditions
     * @returns {Promise<any|null>} - Query result or null if error
     */
    async readData(table, filters = {}) {
        try {
            if (!this.client) {
                await this.connect();
            }

            let query = this.client.from(table).select('*');

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { data, error } = await query.single();

            if (error) {
                console.error('Supabase read error:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to read data from Supabase:', error);
            return null;
        }
    }

    /**
     * Write data to a Supabase table
     * @param {string} table - Table name
     * @param {Object} data - Data to insert
     * @returns {Promise<any|null>} - Inserted record or null if error
     */
    async writeData(table, data) {
        try {
            if (!this.client) {
                await this.connect();
            }

            const { data: result, error } = await this.client
                .from(table)
                .insert(data)
                .select()
                .single();

            if (error) {
                console.error('Supabase write error:', error);
                return null;
            }

            return result;
        } catch (error) {
            console.error('Failed to write data to Supabase:', error);
            return null;
        }
    }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();
