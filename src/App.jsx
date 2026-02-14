import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Pages
import Login from "./components/auth/Login";
import MasterDashboard from "./modules/master/MasterDashboard";
import Dashboard from "./modules/dashboard/Dashboard";

// Layout
import Sidebar from "./components/layout/Sidebar";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div className="text-center animate-pulse">
      <h1 className="text-3xl font-bold mb-2">FleetX ERP</h1>
      <p className="text-slate-400">Loading secure workspace...</p>
    </div>
  </div>
);

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="hidden md:block w-64">
        <Sidebar />
      </aside>

      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Router>
        <Routes>

          {/* Login */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />

          {/* Root Redirect Logic */}
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" />
              ) : role === "master_admin" ? (
                <Navigate to="/master" />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Master Admin Panel */}
          <Route
            path="/master"
            element={
              user && role === "master_admin" ? (
                <AppLayout>
                  <MasterDashboard />
                </AppLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Transport Company Dashboard */}
          <Route
            path="/dashboard"
            element={
              user && role !== "master_admin" ? (
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
