import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar.jsx';

// Auth
import Login from './components/auth/Login.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Signup from './modules/auth/Signup.jsx';

// Modules
import Dashboard from './modules/dashboard/Dashboard';
import OrderManager from './modules/orders/OrderManager';
import TripManager from './modules/trips/TripManager';
import BillingView from './modules/billing/BillingView';

// Services
import { testConnection } from './services/supabase/client';

/* -------------------- UI HELPERS -------------------- */

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2">FleetX ERP</h1>
      <p className="text-slate-400">Initializing system...</p>
    </div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center max-w-md">
      <h2 className="text-2xl font-bold mb-3">Connection Error</h2>
      <p className="text-slate-400 mb-6">
        {message || 'Unable to connect to backend'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 rounded-lg font-semibold"
      >
        Retry
      </button>
    </div>
  </div>
);

/* -------------------- MAIN APP -------------------- */

function App() {
  const { user, loading: authLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Backend connection check
  useEffect(() => {
    const init = async () => {
      try {
        const res = await testConnection();
        if (!res?.success) {
          setConnectionError(res?.message || 'Connection failed');
        }
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
    <div className="min-h-screen flex bg-slate-100">
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </aside>

      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );

  return (
    <>
      <Router>
        <Routes>

          {/* -------- PUBLIC ROUTES -------- */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />

          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/dashboard" />}
          />

          {/* -------- PROTECTED ROUTES -------- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OrderManager />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TripManager />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BillingView />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* -------- DEFAULT -------- */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
