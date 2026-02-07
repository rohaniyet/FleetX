import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, tenant, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Verifying your access...</p>
          <p className="text-sm text-slate-500">FleetX Security Check</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Company Setup</h2>
          <p className="text-slate-600 mb-6">
            Your account is not associated with any transport company.
            Please complete your company registration to continue.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/setup-company'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Setup Company
            </button>
            <button
              onClick={() => window.location.href = '/logout'}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check roles if specified
  if (roles.length > 0 && !roles.includes(tenant.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this page.
            Required role: {roles.join(', ')}
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check subscription status
  if (tenant.subscription_status === 'expired' || tenant.subscription_status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Subscription Required</h2>
          <p className="text-slate-600 mb-6">
            Your subscription has expired. Please renew to continue using FleetX services.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/billing'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Renew Subscription
            </button>
            <button
              onClick={() => window.location.href = '/support'}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check trial status
  if (tenant.subscription_plan === 'free_trial' && tenant.trial_ends_at) {
    const trialEnds = new Date(tenant.trial_ends_at);
    const today = new Date();
    const daysLeft = Math.ceil((trialEnds - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Trial Expired</h2>
            <p className="text-slate-600 mb-6">
              Your 30-day free trial has ended. Upgrade to continue using FleetX.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/pricing'}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show trial warning if less than 3 days left
    if (daysLeft <= 3 && daysLeft > 0) {
      console.log(`⚠️ Trial ends in ${daysLeft} day(s)`);
    }
  }

  return children;
};

export default ProtectedRoute;
