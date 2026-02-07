export const PRICING_PLANS = [
  {
    id: 'free_trial',
    name: '30-Day Trial',
    price: 0,
    duration: '30 days',
    features: [
      'Up to 5 vehicles',
      '50 trips/month',
      'Basic reporting',
      'Email support',
      'Single admin user'
    ],
    limits: {
      vehicles: 5,
      tripsPerMonth: 50,
      storage: '1GB',
      users: 1
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19999, // PKR per month
    duration: 'monthly',
    features: [
      'Up to 10 vehicles',
      'Unlimited trips',
      'Advanced reporting',
      'Priority support',
      '3 users included'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 29999,
    duration: 'monthly',
    features: [
      'Up to 25 vehicles',
      'Unlimited trips',
      'CFO-level accounting',
      'WhatsApp support',
      '10 users included',
      'Custom reporting'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 59999,
    duration: 'monthly',
    features: [
      'Unlimited vehicles',
      'Dedicated account manager',
      'API access',
      'White-label solution',
      'Unlimited users',
      'On-premise deployment'
    ]
  }
]

export const PAYMENT_METHODS = [
  { id: 'jazzcash', name: 'JazzCash', icon: '💳' },
  { id: 'easypaisa', name: 'EasyPaisa', icon: '📱' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'credit_card', name: 'Credit/Debit Card', icon: '💎' }
]
