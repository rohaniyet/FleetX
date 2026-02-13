import { createClient } from '@supabase/supabase-js';

/* ---------------------------------------------------
   ENV CONFIGURATION (VITE SAFE + DEBUG FRIENDLY)
--------------------------------------------------- */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || '';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase ENV Missing:', {
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY
  });

  throw new Error('Supabase environment variables are missing.');
}

/* ---------------------------------------------------
   SUPABASE CLIENT
--------------------------------------------------- */

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
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
  }
);

/* ---------------------------------------------------
   TEST CONNECTION
--------------------------------------------------- */

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected (tables not created yet)'
        };
      }

      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Connected successfully',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

/* ---------------------------------------------------
   DATABASE SERVICE
--------------------------------------------------- */

export const dbService = {
  async query(table, options = {}) {
    const { select = '*', where = {}, orderBy = {}, limit = null } = options;

    let query = supabase.from(table).select(select);

    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    if (orderBy.column) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending !== false
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

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

  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

/* ---------------------------------------------------
   AUTH SERVICE
--------------------------------------------------- */

export const authService = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);
    return { success: true, data };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }
};

export default {
  supabase,
  testConnection,
  dbService,
  authService
};
