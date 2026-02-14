import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { role } = useAuth();

  return (
    <div className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold">FleetX ERP</h2>

      {role === "master_admin" ? (
        <>
          <Link to="/" className="hover:text-blue-400">Master Dashboard</Link>
        </>
      ) : (
        <>
          <Link to="/" className="hover:text-blue-400">Dashboard</Link>
          <Link to="/orders" className="hover:text-blue-400">Orders</Link>
          <Link to="/trips" className="hover:text-blue-400">Trips</Link>
          <Link to="/billing" className="hover:text-blue-400">Billing</Link>
        </>
      )}
    </div>
  );
}
