import React, { useState } from 'react'
import { Truck, Building2, User, Mail, Phone, MapPin } from 'lucide-react'
import { supabase } from '../../services/database/config'

const Signup = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    companyType: 'Transport',
    registrationNumber: '',
    establishedYear: new Date().getFullYear(),
    
    // Owner Details
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerCNIC: '',
    
    // Address
    address: '',
    city: '',
    province: '',
    
    // Business Details
    fleetSize: 1,
    monthlyTrips: 10,
    primaryRoutes: 'Lahore-Karachi',
    
    // Login Credentials
    username: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Create tenant database
    const tenantId = `fleetx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 2. Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.ownerEmail,
      password: formData.password,
      options: {
        data: {
          company_name: formData.companyName,
          tenant_id: tenantId,
          user_type: 'transporter_admin'
        }
      }
    })
    
    if (authError) throw authError
    
    // 3. Create tenant record
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({
        tenant_id: tenantId,
        company_name: formData.companyName,
        owner_name: formData.ownerName,
        contact_email: formData.ownerEmail,
        contact_phone: formData.ownerPhone,
        status: 'active',
        subscription_plan: 'free_trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (tenantError) throw tenantError
    
    // 4. Create default accounts for this tenant
    await createDefaultAccounts(tenantId)
    
    alert('Registration successful! Check your email for verification.')
  }

  const createDefaultAccounts = async (tenantId) => {
    const defaultAccounts = [
      { name: 'Cash', category: 'Cash', type: 'Asset', code: '1001' },
      { name: 'Bank', category: 'Bank', type: 'Asset', code: '1002' },
      { name: 'Accounts Receivable', category: 'Client', type: 'Asset', code: '1101' },
      { name: 'Accounts Payable', category: 'Vendor', type: 'Liability', code: '2001' },
      { name: 'Transport Income', category: 'Income', type: 'Income', code: '4001' },
      { name: 'Trip Expenses', category: 'Expense', type: 'Expense', code: '5001' },
      { name: 'Fuel Expenses', category: 'Expense', type: 'Expense', code: '5002' },
      { name: 'Maintenance', category: 'Expense', type: 'Expense', code: '5003' },
      { name: 'Owner\'s Capital', category: 'Capital', type: 'Capital', code: '3001' }
    ]
    
    // Create accounts in tenant's database
    for (const account of defaultAccounts) {
      await supabase
        .from(`${tenantId}_accounts`)
        .insert(account)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="md:flex">
          {/* Left Side - Branding */}
          <div className="md:w-2/5 bg-gradient-to-b from-blue-600 to-blue-800 text-white p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Truck size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">FleetX Pro</h1>
                  <p className="text-blue-200 text-sm">Transport ERP Solution</p>
                </div>
              </div>
              
              <h2 className="text-xl font-bold mb-4">Start Your Digital Journey</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">✓ Complete Transport Management</li>
                <li className="flex items-center gap-2">✓ Real-time Trip Tracking</li>
                <li className="flex items-center gap-2">✓ Professional Accounting</li>
                <li className="flex items-center gap-2">✓ Invoice & Billing System</li>
                <li className="flex items-center gap-2">✓ Driver & Fleet Management</li>
                <li className="flex items-center gap-2">✓ 30 Days Free Trial</li>
              </ul>
            </div>
            
            <div className="mt-8 text-sm text-blue-200">
              <p>Already have an account? <a href="/login" className="text-white font-semibold hover:underline">Login here</a></p>
            </div>
          </div>
          
          {/* Right Side - Form */}
          <div className="md:w-3/5 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><Building2 size={18}/> Company Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company Name *</label>
                    <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Registration No.</label>
                      <input type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Established Year</label>
                      <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={formData.establishedYear} onChange={(e) => setFormData({...formData, establishedYear: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Fleet Size</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg" value={formData.fleetSize} onChange={(e) => setFormData({...formData, fleetSize: e.target.value})}>
                        <option value="1">1-5 Vehicles</option>
                        <option value="2">6-10 Vehicles</option>
                        <option value="3">11-20 Vehicles</option>
                        <option value="4">21+ Vehicles</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Trips</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg" value={formData.monthlyTrips} onChange={(e) => setFormData({...formData, monthlyTrips: e.target.value})}>
                        <option value="10">Less than 20</option>
                        <option value="20">20-50 Trips</option>
                        <option value="50">50-100 Trips</option>
                        <option value="100">100+ Trips</option>
                      </select>
                    </div>
                  </div>
                  
                  <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Next →</button>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><User size={18}/> Owner Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Full Name *</label>
                    <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Email *</label>
                      <input type="email" required className="w-full p-3 border border-slate-300 rounded-lg" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Phone *</label>
                      <input type="tel" required className="w-full p-3 border border-slate-300 rounded-lg" value={formData.ownerPhone} onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">CNIC</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="XXXXX-XXXXXXX-X" value={formData.ownerCNIC} onChange={(e) => setFormData({...formData, ownerCNIC: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors">← Back</button>
                    <button type="button" onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Next →</button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><MapPin size={18}/> Address & Login</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Complete Address</label>
                    <textarea className="w-full p-3 border border-slate-300 rounded-lg h-24" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
                      <input type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Province</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})}>
                        <option value="">Select Province</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Gilgit">Gilgit-Baltistan</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Username *</label>
                      <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Password *</label>
                      <input type="password" required className="w-full p-3 border border-slate-300 rounded-lg" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors">← Back</button>
                    <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">Create Account</button>
                  </div>
                </div>
              )}
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <p>By signing up, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
