import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";

import MasterDashboard from "./modules/dashboard/MasterDashboard";
import Dashboard from "./modules/dashboard/Dashboard";
import OrderManager from "./modules/orders/OrderManager";
import TripManager from "./modules/trips/TripManager";
import BillingView from "./modules/billing/BillingView";

import Login from "./components/auth/Login";

function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">Loading secure workspace...</h1>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <div className="flex-1 p-6">
          <Routes>
            {role === "master_admin" ? (
              <>
                <Route path="/" element={<MasterDashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/trips" element={<TripManager />} />
                <Route path="/billing" element={<BillingView />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
