// SAFE CONFIG - NO SECRETS IN CODE

// Public configuration (safe for GitHub)
export const publicConfig = {
  appName: 'FleetX Transport ERP',
  defaultCurrency: 'PKR',
  defaultTimezone: 'Asia/Karachi',
  companyName: 'Azam Afridi Goods Transport',
  version: '2.0.0'
}

// Dynamic configuration loader
class ConfigLoader {
  static getSupabaseUrl() {
    // Priority: Vercel env → Public env → Default
    return (
      process.env.REACT_APP_SUPABASE_URL ||
      window.env?.REACT_APP_SUPABASE_URL ||
      'https://sjclcjhkmpfrwekukptg.supabase.co'
    )
  }

  static getSupabaseAnonKey() {
    // This will be injected by Vercel at build time
    return process.env.REACT_APP_SUPABASE_ANON_KEY || ''
  }

  static getConfig() {
    return {
      supabaseUrl: this.getSupabaseUrl(),
      supabaseAnonKey: this.getSupabaseAnonKey(),
      isProduction: process.env.NODE_ENV === 'production',
      ...publicConfig
    }
  }

  static validateConfig() {
    const config = this.getConfig()
    
    if (!config.supabaseUrl.includes('supabase.co')) {
      console.warn('⚠️ Invalid Supabase URL')
      return false
    }
    
    if (!config.supabaseAnonKey && config.isProduction) {
      console.error('❌ Missing Supabase key in production')
      return false
    }
    
    return true
  }
}

export default ConfigLoader
