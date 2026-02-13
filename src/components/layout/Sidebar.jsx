import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  FileText,
  Banknote,
  Users,
  Package,
  TrendingUp,
  CreditCard,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut, tenant } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/orders', icon: FileText, label: 'Order Manager' },
    { path: '/trips', icon: Truck, label: 'Trip Manager' },
    { path: '/billing', icon: CreditCard, label: 'Billing View' },
    { path: '/accounts', icon: Users, label: 'Accounts' },
    { path: '/reports', icon: TrendingUp, label: 'Reports' },
    { path: '/store', icon: Package, label: 'Store' },
    { path: '/payments', icon: Banknote, label: 'Payments' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">

      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck size={18} />
          </div>
          <span className="font-bold text-xl">FleetX</span>
        </div>
        <p className="text-xs text-slate-500">
          {tenant?.company_name || 'Transport Company'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition ${
                isActive
                  ? 'bg-blue-600'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="m-4 flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-900/30"
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
