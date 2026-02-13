import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar.jsx';

// Auth
import Login from './components/auth/Login.jsx';
import Signup from './modules/auth/Signup.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Modules
import Dashboard from './modules/dashboard/Dashboard';
import OrderManager from './modules/orders/OrderManager';
import TripManager from './modules/trips/TripManager';
import BillingView from './modules/billing/BillingView';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2">FleetX ERP</h1>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const AppLayout = ({ children }) => (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="md:w-64 hidden md:block">
        <Sidebar />
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

          {/* Public */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />

          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/dashboard" />}
          />

          {/* Protected */}
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

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
