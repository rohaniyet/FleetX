// SUPABASE CONFIG (Recommended)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// OR FIREBASE MULTI-TENANT
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Multi-tenant configuration
const getTenantConfig = (tenantId) => {
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${tenantId}.firebaseapp.com`,
    projectId: `${tenantId}`,
    storageBucket: `${tenantId}.appspot.com`,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  }
}

export const initializeTenant = (tenantId) => {
  const config = getTenantConfig(tenantId)
  const app = initializeApp(config, tenantId)
  return {
    auth: getAuth(app),
    db: getFirestore(app),
    tenantId
  }
}
