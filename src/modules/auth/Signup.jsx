import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    city: 'Lahore',
    province: 'Punjab',
    
    // Business Details
    fleetSize: '1-5',
    monthlyTrips: 'Less than 20',
    primaryRoutes: 'Lahore-Karachi',
    
    // Login Credentials
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir'];
  const cities = {
    'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'],
    'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat'],
    'Balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Chaman'],
    'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza'],
    'Azad Kashmir': ['Muzaffarabad', 'Mirpur', 'Kotli']
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.companyName || !formData.ownerName || !formData.ownerEmail) {
        setError('Please fill all required fields');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.ownerEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      if (!formData.address || !formData.city || !formData.province) {
        setError('Please fill all address fields');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare user data
      const userData = {
        company_name: formData.companyName,
        company_type: formData.companyType,
        registration_number: formData.registrationNumber,
        established_year: formData.establishedYear,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        owner_cnic: formData.ownerCNIC,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        fleet_size: formData.fleetSize,
        monthly_trips: formData.monthlyTrips,
        primary_routes: formData.primaryRoutes,
        username: formData.username
      };
      
      // Call signup API
      const result = await signUp(formData.ownerEmail, formData.password, userData);
      
      if (result.success) {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/login');
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      companyName: 'Demo Transport Co.',
      companyType: 'Transport',
      registrationNumber: 'TRN-123456',
      establishedYear: 2020,
      ownerName: 'Demo Owner',
      ownerEmail: 'demo@fleetx.com',
      ownerPhone: '03001234567',
      ownerCNIC: '12345-6789012-3',
      address: '123 Demo Street, Gulberg',
      city: 'Lahore',
      province: 'Punjab',
      fleetSize: '6-10',
      monthlyTrips: '20-50 Trips',
      primaryRoutes: 'Lahore-Karachi, Islamabad-Peshawar',
      username: 'demo_owner',
      password: 'Demo@12345',
      confirmPassword: 'Demo@12345',
      agreeTerms: true
    });
    
    toast.success('Demo data loaded. You can modify as needed.');
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
          } font-bold`}>
            {step > s ? <CheckCircle size={16} /> : s}
          </div>
          {s < 3 && (
            <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl mb-4">
            <Truck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join FleetX</h1>
          <p className="text-slate-300 text-lg">Professional Transport Management ERP</p>
          <p className="text-slate-400 text-sm mt-2">30-Day Free Trial • No Credit Card Required</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <StepIndicator />
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 1 && 'Company Information'}
                {step === 2 && 'Business Details'}
                {step === 3 && 'Create Account'}
              </h2>
              <p className="text-slate-300">
                {step === 1 && 'Tell us about your transport business'}
                {step === 2 && 'Complete your business profile'}
                {step === 3 && 'Setup your login credentials'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={18} />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Form Steps */}
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Al Wahab Goods Transport"
                          required
                        />
                      </div>
                    </div>

                    {/* Company Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Business Type
                      </label>
                      <select
                        value={formData.companyType}
                        onChange={(e) => setFormData({...formData, companyType: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Transport">Transport & Logistics</option>
                        <option value="Goods">Goods Transport</option>
                        <option value="Cargo">Cargo Services</option>
                        <option value="Logistics">Logistics Company</option>
                        <option value="Freight">Freight Forwarding</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner Name */}
                  <div>
  <label className="block text-sm font-medium text-slate-300 mb-2">
    Owner Name *
  </label>

  <div className="relative">
    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />

    <input
      type="text"
      className="w-full pl-10 pr-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Enter owner name"
    />
  </div>
</div>
