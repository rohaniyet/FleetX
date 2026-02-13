import React from 'react';
import { Truck, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { tenant } = useAuth();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome to FleetX
        </h1>
        <p className="text-slate-600 mt-1">
          {tenant?.company_name}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          <Calendar size={14} className="inline mr-1" />
          {new Date().toLocaleDateString('en-PK')}
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <Truck size={40} className="text-blue-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Your account is ready
        </h2>

        <p className="text-slate-600 mb-6">
          Start by creating your first order or trip.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/orders"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Create Order
          </a>

          <a
            href="/trips"
            className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold"
          >
            Create Trip
          </a>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
