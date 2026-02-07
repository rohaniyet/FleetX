import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY

// Create main client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

// Create admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get tenant-specific client
export const getTenantClient = (tenantId) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: tenantId
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  })
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl.substring(0, 30) + '...')
    
    const { data, error } = await supabase.from('tenants').select('count')
    
    if (error) {
      console.error('❌ Supabase Connection Failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase Connected Successfully!')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Connection Test Error:', error)
    return { success: false, error: error.message }
  }
}

// Export Supabase service functions
export const supabaseService = {
  // Auth functions
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  },
  
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
  
  // Tenant management
  async createTenant(tenantData) {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .insert([tenantData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async getTenantById(tenantId) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Database operations
  async executeSQL(sql) {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { query: sql })
    if (error) throw error
    return data
  }
}

export default supabase
