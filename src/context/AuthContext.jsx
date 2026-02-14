import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase/client'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)

  // =============================
  // INIT SESSION
  // =============================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()

      if (data?.session?.user) {
        setUser(data.session.user)
        await loadProfile(data.session.user.id)
      }

      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setTenant(null)
        }
        setLoading(false)
      }
    )

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  // =============================
  // LOAD PROFILE
  // =============================
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.warn('Profile not found')
      return
    }

    setProfile(data)

    if (data.tenant_id) {
      await loadTenant(data.tenant_id)
    }
  }

  // =============================
  // LOAD TENANT
  // =============================
  const loadTenant = async (tenantId) => {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (data) {
      setTenant(data)
    }
  }

  // =============================
  // LOGIN
  // =============================
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return { success: false, error: error.message }

    return { success: true }
  }

  // =============================
  // LOGOUT
  // =============================
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setTenant(null)
  }

  // =============================
  // CREATE NEW TENANT (MASTER ONLY)
  // =============================
  const createTenant = async (companyName) => {
    if (!isMasterAdmin) return { success: false }

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        company_name: companyName,
        accounting_mode: 'standard',
        inventory_method: 'fifo',
        pra_enabled: false,
        base_currency: 'PKR'
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    return { success: true, tenant: data }
  }

  const value = {
    user,
    profile,
    tenant,
    loading,

    signIn,
    signOut,
    createTenant,

    isAuthenticated: !!user,
    isMasterAdmin: profile?.role === 'master_admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
