import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
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
      
      <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
        <div className="h-full bg-blue-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
      </div>
      
      <p className="text-sm text-slate-500 animate-pulse">Initializing system...</p>
    </div>
  </div>
);

// Error Component
const ErrorScreen = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Error</h2>
      <p className="text-slate-600 mb-6">{message || 'Unable to connect to server'}</p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Retry Connection
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
);

// Main App Component
function App() {
  const { user, loading: authLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Test database connection on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);
        const result = await testConnection();
        
        if (!result.success) {
          setConnectionError(result.message);
        } else {
          console.log('✅ App initialized successfully');
          setConnectionError(null);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setConnectionError(error.message);
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading screen
  if (appLoading || authLoading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (connectionError) {
    return <ErrorScreen message={connectionError} onRetry={() => window.location.reload()} />;
  }

  // App layout for authenticated users
  const AppLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg">FleetX</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 fixed md:relative inset-0 z-40`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <AppLayout>
                <OrderManager />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/trips" element={
            <ProtectedRoute>
              <AppLayout>
                <TripManager />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/billing" element={
            <ProtectedRoute>
              <AppLayout>
                <BillingView />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white'
            }
          }
        }}
      />

      {/* Environment Badge (Development only) */}
      {window.location.hostname.includes('localhost') && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50">
          DEVELOPMENT
        </div>
      )}
    </>
  );
}

export default App;
