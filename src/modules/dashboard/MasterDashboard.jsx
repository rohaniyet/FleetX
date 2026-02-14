import { useAuth } from "../../context/AuthContext";

export default function MasterDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">
        Master Admin Panel
      </h1>

      <p className="text-slate-400 mb-10">
        Welcome, {user?.email}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">
            Create New Transport Company
          </h2>
          <p className="text-slate-400 text-sm">
            Add new tenant & assign admin
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">
            View All Companies
          </h2>
          <p className="text-slate-400 text-sm">
            Manage SaaS tenants
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">
            System Analytics
          </h2>
          <p className="text-slate-400 text-sm">
            Revenue & usage stats
          </p>
        </div>

      </div>
    </div>
  );
}
