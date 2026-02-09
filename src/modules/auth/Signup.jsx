import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    companyType: 'Transport',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerCNIC: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    username: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const nextStep = () => {
    setError('');

    if (step === 1) {
      if (!formData.companyName || !formData.ownerName || !formData.ownerEmail) {
        setError('Please fill all required fields');
        return;
      }
    }

    if (step === 2) {
      if (!formData.address || !formData.city || !formData.province) {
        setError('Please complete address details');
        return;
      }
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Username and password required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must accept terms & conditions');
      return;
    }

    setLoading(true);

    try {
      const metaData = {
        company_name: formData.companyName,
        company_type: formData.companyType,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        owner_cnic: formData.ownerCNIC,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        username: formData.username
      };

      const result = await signUp(
        formData.ownerEmail,
        formData.password,
        metaData
      );

      if (!result?.success) {
        throw new Error(result?.error || 'Signup failed');
      }

      toast.success('Account created. Please verify email.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Truck className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">FleetX Signup</h1>
          <p className="text-slate-400 mt-1">Professional Transport ERP</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <Input label="Company Name *" icon={Building2} value={formData.companyName} onChange={(e) => update('companyName', e.target.value)} />
              <Input label="Owner Name *" icon={User} value={formData.ownerName} onChange={(e) => update('ownerName', e.target.value)} />
              <Input label="Owner Email *" icon={Mail} type="email" value={formData.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)} />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <Input label="Phone" icon={Phone} value={formData.ownerPhone} onChange={(e) => update('ownerPhone', e.target.value)} />
              <Input label="CNIC" icon={User} value={formData.ownerCNIC} onChange={(e) => update('ownerCNIC', e.target.value)} />
              <Input label="Address" icon={MapPin} value={formData.address} onChange={(e) => update('address', e.target.value)} />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <Input label="Username" icon={User} value={formData.username} onChange={(e) => update('username', e.target.value)} />

              <PasswordInput
                label="Password"
                value={formData.password}
                show={showPassword}
                toggle={() => setShowPassword(!showPassword)}
                onChange={(e) => update('password', e.target.value)}
              />

              <PasswordInput
                label="Confirm Password"
                value={formData.confirmPassword}
                show={showConfirmPassword}
                toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                onChange={(e) => update('confirmPassword', e.target.value)}
              />

              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => update('agreeTerms', e.target.checked)} />
                I agree to Terms & Conditions
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-2 bg-slate-700 text-white rounded-lg">
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                Next
              </button>
            ) : (
              <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

/* ---------- SMALL REUSABLE INPUTS ---------- */

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-slate-300 text-sm mb-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

const PasswordInput = ({ label, value, show, toggle, onChange }) => (
  <div>
    <label className="block text-slate-300 text-sm mb-1">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export default Signup;
