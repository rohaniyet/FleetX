// src/components/layout/Sidebar.jsx

import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Package, 
  FileText,
  Banknote,
  TrendingUp,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ 
  activeView, 
  setActiveView, 
  onLogout, 
  mobile = false,
  isMobileMenuOpen,
  setIsMobileMenuOpen 
}) => {
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'order-manager', icon: FileText, label: 'Order Manager' },
    { id: 'trip-manager', icon: Truck, label: 'Trip Manager' },
    { id: 'payments', icon: Banknote, label: 'Payments' },
    { id: 'accounts', icon: Users, label: 'Accounts' },
    { id: 'store', icon: Package, label: 'Store/Inventory' },
    { id: 'reports', icon: TrendingUp, label: 'Reports' },
  ];

  const handleItemClick = (id) => {
    setActiveView(id);
    if (mobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className={`${mobile ? 'w-full pt-16' : 'w-64'} bg-slate-900 text-white h-full flex flex-col`}>
      
      {/* Mobile header agar mobile view hai */}
      {mobile && (
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-20">
          <div className="flex items-center gap-2">
            <Truck size={20} />
            <span className="font-bold">FleetX</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}
      
      {/* Desktop header */}
      {!mobile && (
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">FleetX</span>
          </div>
          <p className="text-xs text-slate-500 pl-11">Azam Afridi Goods Transport</p>
        </div>
      )}
      
      {/* Menu items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-blue-600 shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Logout button */}
      <button
        onClick={onLogout}
        className="m-4 flex items-center gap-3 p-3 rounded-xl transition-all text-red-400 hover:bg-red-900/30 hover:text-red-300"
      >
        <LogOut size={18} />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
