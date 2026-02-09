import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/layout/Sidebar.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Modules
import Login from './modules/auth/Login';
import Signup from './modules/auth/Signup';
import ForgotPassword from './modules/auth/ForgotPassword';
import Dashboard from './modules/dashboard/Dashboard';
import OrderManager from './modules/orders/OrderManager';
import TripManager from './modules/trips/TripManager';
import BillingView from './modules/billing/BillingView';

// Services
import { testConnection } from './services/supabase/client';

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="absolute -inset-4 bg-blue-500/20 rounded-3xl blur-xl animate-pulse"></div>
      </div>

      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          FleetX ERP
        </h1>
        <p className="text-slate-600 mt-2">Professional Transport Management</p>
      </div>

      <p className="text-sm text-slate-500 animate-pulse">Initializing system...</p>
    </div>
  </div>
);

// Error Component
const ErrorScreen = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Error</h2>
      <p className="text-slate-600 mb-6">{message || 'Unable to connect to server'}</p>
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
      >
        Retry
      </button>
    </div>
  </div>
);

// Main App
function App() {
  const { user, loading: authLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await testConnection();
        if (!res.success) setConnectionError(res.message);
      } catch (err) {
        setConnectionError(err.message);
      } finally {
        setAppLoading(false);
      }
    };
    init();
  }, []);

  if (appLoading || authLoading) return <LoadingScreen />;
  if (connectionError) return <ErrorScreen message={connectionError} />;

  const AppLayout = ({ children }) => (
    <div className="min-h-screen flex bg-gray-50">
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <AppLayout><OrderManager /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/trips" element={
            <ProtectedRoute>
              <AppLayout><TripManager /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute>
              <AppLayout><BillingView /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
