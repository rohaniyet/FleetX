import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/supabase/client';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { tenant } = useAuth();
  const [stats, setStats] = useState({
    activeTrips: 0,
    pendingOrders: 0,
    vehiclesAvailable: 0,
    receivables: 0,
    payables: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      loadDashboardData();
    }
  }, [tenant]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In production, these would be real database queries
      // For now, using mock data
      const mockStats = {
        activeTrips: Math.floor(Math.random() * 10) + 5,
        pendingOrders: Math.floor(Math.random() * 20) + 10,
        vehiclesAvailable: Math.floor(Math.random() * 15) + 5,
        receivables: Math.floor(Math.random() * 500000) + 100000,
        payables: Math.floor(Math.random() * 200000) + 50000,
        monthlyRevenue: Math.floor(Math.random() * 1000000) + 500000,
        monthlyExpenses: Math.floor(Math.random() * 600000) + 200000
      };
      
      const mockActivities = [
        { id: 1, type: 'trip', title: 'Trip Started', description: 'LHR-101 to Karachi', time: '2 hours ago', amount: 45000 },
        { id: 2, type: 'order', title: 'New Order', description: 'Al Wahab Goods - 20ft Container', time: '4 hours ago', amount: 65000 },
        { id: 3, type: 'payment', title: 'Payment Received', description: 'Speed Cargo - Invoice #INV-2024-001', time: '1 day ago', amount: 120000 },
        { id: 4, type: 'expense', title: 'Fuel Expense', description: 'Vehicle LHR-101 - Diesel', time: '2 days ago', amount: 35000 },
        { id: 5, type: 'maintenance', title: 'Vehicle Maintenance', description: 'LHR-105 - Engine Service', time: '3 days ago', amount: 25000 }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getNetProfit = () => stats.monthlyRevenue - stats.monthlyExpenses;
  const getProfitMargin = () => {
    if (stats.monthlyRevenue === 0) return 0;
    return ((getNetProfit() / stats.monthlyRevenue) * 100).toFixed(1);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className={`mt-4 flex items-center text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="ml-1">{Math.abs(trend)}% from last month</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">Loading your business insights...</p>
          </div>
          <div className="animate-spin">
            <RefreshCw size={20} className="text-slate-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {tenant?.owner_name || tenant?.owner_email?.split('@')[0]} • 
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {tenant?.company_name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">
            <Calendar size={16} className="inline mr-1" />
            {new Date().toLocaleDateString('en-PK', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Trips"
          value={stats.activeTrips}
          icon={Truck}
          color="blue"
          trend={12}
          subtitle="On route currently"
        />
        
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Package}
          color="orange"
          trend={8}
          subtitle="Awaiting dispatch"
        />
        
        <StatCard
          title="Vehicles Available"
          value={stats.vehiclesAvailable}
          icon={MapPin}
          color="emerald"
          trend={-5}
          subtitle="In Lahore depot"
        />
        
        <StatCard
          title="Receivables"
          value={`Rs ${stats.receivables.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          trend={15}
          subtitle="Pending collections"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Expenses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Financial Overview</h2>
            <select className="text-sm border border-slate-300 rounded-lg px-3 py-1">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600">Monthly Revenue</p>
                  <h3 className="text-2xl font-bold text-emerald-600">
                    Rs {stats.monthlyRevenue.toLocaleString()}
                  </h3>
                </div>
                <TrendingUp size={24} className="text-emerald-500" />
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600">Monthly Expenses</p>
                  <h3 className="text-2xl font-bold text-red-600">
                    Rs {stats.monthlyExpenses.toLocaleString()}
                  </h3>
                </div>
                <ArrowDownRight size={24} className="text-red-500" />
              </div>
              <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Net Profit */}
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-700">Net Profit This Month</p>
                <h3 className={`text-3xl font-bold ${getNetProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  Rs {Math.abs(getNetProfit()).toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Profit Margin: {getProfitMargin()}%
                </p>
              </div>
              <BarChart3 size={32} className="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'trip' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'order' ? 'bg-orange-100 text-orange-600' :
                  activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {activity.type === 'trip' ? <Truck size={16} /> :
                   activity.type === 'order' ? <Package size={16} /> :
                   activity.type === 'payment' ? <DollarSign size={16} /> :
                   <AlertCircle size={16} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{activity.title}</p>
                  <p className="text-sm text-slate-600">{activity.description}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {activity.time}
                    </span>
                    <span className="text-sm font-mono font-bold">
                      Rs {activity.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Ready to Grow Your Business?</h2>
            <p className="text-blue-100">
              Upgrade to Business Plan for advanced features and unlimited trips.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
              View Plans
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
