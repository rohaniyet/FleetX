import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./modules/dashboard/Dashboard";
import OrderManager from "./modules/orders/OrderManager";
import TripManager from "./modules/trips/TripManager";
import BillingView from "./modules/billing/BillingView";

export default function App() {
  const { user, role } = useAuth();

  if (!user) {
    return <Login />;
  }

  if (role === "master_admin") {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-10">
        <h1 className="text-4xl font-bold">Master Admin Panel</h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <div className="flex-1 bg-slate-100 min-h-screen p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderManager />} />
            <Route path="/trips" element={<TripManager />} />
            <Route path="/billing" element={<BillingView />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
