import { createClient } from '@supabase/supabase-js'
import ConfigLoader from '../../config/supabase'

// SAFE CLIENT INITIALIZATION
const initializeSupabase = () => {
  try {
    const config = ConfigLoader.getConfig()
    
    if (!config.supabaseAnonKey && ConfigLoader.validateConfig()) {
      console.warn('Supabase key not available in this environment')
      // Return mock client for development
      return createMockClient()
    }
    
    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? localStorage : undefined
      },
      global: {
        headers: {
          'X-Client-Info': 'fleetx-web@2.0.0'
        }
      }
    })
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
    return createMockClient()
  }
}

// Mock client for development when keys aren't available
const createMockClient = () => {
  console.warn('⚠️ Using mock Supabase client for development')
  
  return {
    auth: {
      signUp: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    }),
    rpc: () => Promise.resolve({ data: null, error: null })
  }
}

// Export initialized client
export const supabase = initializeSupabase()

// Helper functions
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('tenants').select('count')
    
    if (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        isMock: !ConfigLoader.getConfig().supabaseAnonKey
      }
    }
    
    return {
      success: true,
      message: '✅ Connected to Supabase successfully',
      isMock: !ConfigLoader.getConfig().supabaseAnonKey
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message}`,
      isMock: true
    }
  }
}

// Service functions
export const supabaseService = {
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    
    if (error) throw new Error(`Signup failed: ${error.message}`)
    return data
  },
  
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw new Error(`Login failed: ${error.message}`)
    return data
  }
}
