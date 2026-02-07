/**
 * PUBLIC CONFIGURATION FILE
 * SAFE TO COMMIT TO GITHUB
 * Real secrets are injected by Vercel Environment Variables
 */

window.publicConfig = {
  // ============ APP INFO ============
  APP_NAME: 'FleetX Transport ERP',
  APP_VERSION: '2.0.0',
  COMPANY_NAME: 'Azam Afridi Goods Transport',
  DEVELOPER: 'Waqas Gilani',
  
  // ============ PUBLIC URLs ============
  SUPABASE_URL: 'https://sjclcjhkmpfrwekukptg.supabase.co',
  API_BASE_URL: 'https://sjclcjhkmpfrwekukptg.supabase.co',
  
  // ============ FEATURE FLAGS ============
  FEATURES: {
    MULTI_TENANT: true,
    SIGNUP_ENABLED: true,
    ACCOUNTING_SYSTEM: true,
    INVOICE_GENERATION: true,
    TRIP_TRACKING: true,
    INVENTORY_MANAGEMENT: true
  },
  
  // ============ BUSINESS CONFIG ============
  BUSINESS: {
    DEFAULT_CURRENCY: 'PKR',
    DEFAULT_TIMEZONE: 'Asia/Karachi',
    CURRENCY_SYMBOL: 'Rs ',
    DATE_FORMAT: 'DD/MM/YYYY',
    DECIMAL_PLACES: 2
  },
  
  // ============ SUPPORT INFO ============
  SUPPORT: {
    EMAIL: 'support@fleetx.com',
    PHONE: '+92 300 1234567',
    WHATSAPP: 'https://wa.me/923001234567',
    BUSINESS_HOURS: '9:00 AM - 6:00 PM (PKT)'
  },
  
  // ============ PRICING PLANS ============
  PRICING: {
    FREE_TRIAL: {
      name: '30-Day Trial',
      price: 0,
      duration: '30 days',
      features: [
        'Up to 5 vehicles',
        '50 trips/month',
        'Basic reports',
        'Email support'
      ]
    },
    STARTER: {
      name: 'Starter',
      price: 4999,
      duration: 'monthly',
      features: [
        'Up to 10 vehicles',
        'Unlimited trips',
        'Advanced reports',
        '3 users included'
      ]
    },
    BUSINESS: {
      name: 'Business',
      price: 9999,
      duration: 'monthly',
      features: [
        'Up to 25 vehicles',
        'CFO-level accounting',
        'WhatsApp support',
        '10 users included'
      ]
    }
  },
  
  // ============ PAYMENT METHODS ============
  PAYMENT_METHODS: [
    { id: 'jazzcash', name: 'JazzCash', icon: '💳', enabled: true },
    { id: 'easypaisa', name: 'EasyPaisa', icon: '📱', enabled: true },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', enabled: true },
    { id: 'card', name: 'Credit/Debit Card', icon: '💎', enabled: false }
  ],
  
  // ============ UTILITY FUNCTIONS ============
  getEnvironment: function() {
    const hostname = window.location.hostname;
    return {
      isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
      isDevelopment: hostname.includes('vercel.app'),
      isProduction: !hostname.includes('localhost') && 
                   !hostname.includes('vercel.app') &&
                   !hostname.includes('127.0.0.1'),
      hostname: hostname
    };
  },
  
  getAppInfo: function() {
    return {
      name: this.APP_NAME,
      version: this.APP_VERSION,
      company: this.COMPANY_NAME,
      environment: this.getEnvironment()
    };
  },
  
  formatCurrency: function(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return this.BUSINESS.CURRENCY_SYMBOL + '0';
    }
    return this.BUSINESS.CURRENCY_SYMBOL + 
           parseFloat(amount).toLocaleString('en-PK', {
             minimumFractionDigits: this.BUSINESS.DECIMAL_PLACES,
             maximumFractionDigits: this.BUSINESS.DECIMAL_PLACES
           });
  }
};

// Auto-initialize
(function() {
  console.group('🚚 FleetX ERP Configuration');
  console.log('App:', window.publicConfig.getAppInfo());
  console.log('Features:', window.publicConfig.FEATURES);
  console.log('Environment:', window.publicConfig.getEnvironment());
  console.groupEnd();
  
  // Add to window for easy access
  window.formatCurrency = window.publicConfig.formatCurrency;
  
  // Development helpers
  if (window.publicConfig.getEnvironment().isLocalhost) {
    console.log('🔧 Tip: API keys will be injected by Vercel in production');
  }
})();
