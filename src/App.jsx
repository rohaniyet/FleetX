import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/layout/Sidebar.jsx';
import Login from './components/auth/Login.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import Dashboard from './modules/dashboard/Dashboard';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
    <div className="text-center space-y-3">
      <h1 className="text-3xl font-bold tracking-wide">FleetX ERP</h1>
      <p className="text-slate-400">Loading secure workspace...</p>
    </div>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const Layout = ({ children }) => (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 hidden md:block bg-slate-900">
        <Sidebar />
      </aside>

      <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        {children}
      </main>
    </div>
  );

  return (
    <>
      <Router>
        <Routes>
          import ResetPassword from "./pages/ResetPassword";

<Route path="/reset-password" element={<ResetPassword />} />

          {/* LOGIN ONLY */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />

          {/* MASTER AREA */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </Router>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
