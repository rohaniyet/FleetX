import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase/client';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTenantData(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadTenantData(session.user);
        } else {
          setTenant(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadTenantData = async (user) => {
    try {
      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id, user_role, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile not found, creating default...');
        // Create default profile if not exists
        await createDefaultProfile(user);
        return;
      }

      if (profile?.tenant_id) {
        // Get tenant details
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .single();

        if (tenantError) {
          console.error('Tenant not found:', tenantError);
          return;
        }

        setTenant({
          ...tenantData,
          role: profile.user_role || 'admin',
          userProfile: profile
        });
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
    }
  };

  const createDefaultProfile = async (user) => {
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          tenant_id: tenantId,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || '',
          user_role: 'admin'
        });

      if (profileError) throw profileError;

      // Create tenant
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          tenant_id: tenantId,
          company_name: `${user.user_metadata?.full_name || 'My'} Transport`,
          owner_name: user.user_metadata?.full_name || user.email,
          owner_email: user.email,
          subscription_plan: 'free_trial',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (tenantError) throw tenantError;

      // Reload tenant data
      await loadTenantData(user);
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setTenant(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createTenant = async (tenantData) => {
    try {
      if (!user) throw new Error('User must be logged in');

      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('tenants')
        .insert({
          tenant_id: tenantId,
          ...tenantData,
          owner_email: user.email,
          subscription_plan: 'free_trial',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      // Update profile with tenant_id
      await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', user.id);

      // Reload tenant data
      await loadTenantData(user);

      return { success: true, tenantId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Reload data
      await loadTenantData(user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    tenant,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    createTenant,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: tenant?.role === 'admin',
    isSuperAdmin: tenant?.role === 'super_admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
