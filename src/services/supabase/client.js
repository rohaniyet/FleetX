import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = window.publicConfig?.SUPABASE_URL || 'https://sjclcjhkmpfrwekukptg.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
});

// Admin client (for server-side operations)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test connection
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (error) {
      // Table might not exist yet, that's okay
      if (error.code === '42P01') {
        return {
          success: true,
          message: '✅ Connected to Supabase (Tables not created yet)',
          tablesExist: false
        };
      }
      
      return {
        success: false,
        message: `❌ Connection failed: ${error.message}`,
        error: error.message
      };
    }

    return {
      success: true,
      message: '✅ Connected to Supabase successfully',
      tablesExist: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Connection error: ${error.message}`,
      error: error.message
    };
  }
};

// Database Service
export const dbService = {
  // Generic query
  async query(table, options = {}) {
    const { select = '*', where = {}, orderBy = {}, limit = null } = options;
    
    let query = supabase.from(table).select(select);
    
    // Apply where conditions
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply ordering
    if (orderBy.column) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  // Create record
  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },
  
  // Update record
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },
  
  // Delete record
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Tenant-specific queries
  async tenantQuery(tenantId, table, operation, data = {}) {
    if (!tenantId) throw new Error('Tenant ID required');
    
    const tableName = `${tenantId}_${table}`;
    
    switch (operation) {
      case 'select':
        return await this.query(tableName, data);
      
      case 'insert':
        return await this.create(tableName, data);
      
      case 'update':
        return await this.update(tableName, data.id, data.update);
      
      case 'delete':
        return await this.delete(tableName, data.id);
      
      default:
        throw new Error('Invalid operation');
    }
  }
};

// Auth Service
export const authService = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    
    if (error) throw new Error(`Signup failed: ${error.message}`);
    return data;
  },
  
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw new Error(`Login failed: ${error.message}`);
    return data;
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
  
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return true;
  }
};

// Export everything
export default {
  supabase,
  supabaseAdmin,
  testConnection,
  dbService,
  authService
};
