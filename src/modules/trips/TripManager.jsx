import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Fuel, 
  Wrench,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  Users,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TripManager = () => {
  const { tenant } = useAuth();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock data for trips
  const mockTrips = [
    {
      id: 'TRIP-2024-001',
      vehicle: 'LHR-101 (Hino)',
      driver: 'Ali Ahmed',
      orderId: 'ORD-2024-001',
      client: 'Al Wahab Goods',
      from: 'Lahore',
      to: 'Karachi',
      distance: '1,250 km',
      freight: 45000,
      expenses: 12000,
      status: 'in_transit',
      startDate: '2024-01-15',
      estimatedEnd: '2024-01-17',
      biltyNo: 'BILTY-123',
      detention: 0,
      lolo: 0
    },
    {
      id: 'TRIP-2024-002',
      vehicle: 'LHR-105 (Toyota)',
      driver: 'Bilal Khan',
      orderId: 'ORD-2024-003',
      client: 'National Logistics',
      from: 'Lahore',
      to: 'Faisalabad',
      distance: '180 km',
      freight: 28000,
      expenses: 5000,
      status: 'completed',
      startDate: '2024-01-14',
      endDate: '2024-01-14',
      biltyNo: 'BILTY-456',
      detention: 2000,
      lolo: 0
    },
    {
      id: 'TRIP-2024-003',
      vehicle: 'KHI-202 (Mitsubishi)',
      driver: 'Usman Raza',
      orderId: 'ORD-2024-002',
      client: 'Speed Cargo',
      from: 'Karachi',
      to: 'Islamabad',
      distance: '1,450 km',
      freight: 45000,
      expenses: 15000,
      status: 'scheduled',
      startDate: '2024-01-18',
      estimatedEnd: '2024-01-20',
      biltyNo: '',
      detention: 0,
      lolo: 0
    },
    {
      id: 'TRIP-2024-004',
      vehicle: 'ISB-303 (Nissan)',
      driver: 'Haris Malik',
      orderId: 'ORD-2024-004',
      client: 'Global Transport',
      from: 'Islamabad',
      to: 'Peshawar',
      distance: '185 km',
      freight: 47500,
      expenses: 8000,
      status: 'completed',
      startDate: '2024-01-10',
      endDate: '2024-01-11',
      biltyNo: 'BILTY-789',
      detention: 3000,
      lolo: 1500
    },
    {
      id: 'TRIP-2024-005',
      vehicle: 'LHR-108 (Hino)',
      driver: 'Kamran Ali',
      orderId: '',
      client: 'Fast Track Cargo',
      from: 'Lahore',
      to: 'Multan',
      distance: '350 km',
      freight: 32000,
      expenses: 0,
      status: 'cancelled',
      startDate: '2024-01-12',
      endDate: '2024-01-12',
      biltyNo: '',
      detention: 0,
      lolo: 0
    }
  ];

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [searchTerm, statusFilter, activeTab, trips]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setTrips(mockTrips);
        setFilteredTrips(mockTrips);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Failed to load trips');
      setLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = [...trips];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.biltyNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }
    
    // Apply tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(trip => trip.status === 'in_transit');
    } else if (activeTab === 'scheduled') {
      filtered = filtered.filter(trip => trip.status === 'scheduled');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(trip => trip.status === 'completed');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(trip => trip.status === 'cancelled');
    }
    
    setFilteredTrips(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_transit': return <PlayCircle size={14} />;
      case 'scheduled': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getNetProfit = (trip) => trip.freight - trip.expenses + (trip.detention || 0) + (trip.lolo || 0);

  const handleStartTrip = async (tripId) => {
    try {
      // API call would go here
      setTrips(trips.map(trip => 
        trip.id === tripId ? { ...trip, status: 'in_transit' } : trip
      ));
      toast.success('Trip started successfully');
    } catch (error) {
      toast.error('Failed to start trip');
    }
  };

  const handleCompleteTrip = async (tripId) => {
    try {
      // API call would go here
      setTrips(trips.map(trip => 
        trip.id === tripId ? { 
          ...trip, 
          status: 'completed',
          endDate: new Date().toISOString().split('T')[0]
        } : trip
      ));
      toast.success('Trip completed successfully');
    } catch (error) {
      toast.error('Failed to complete trip');
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        // API call would go here
        setTrips(trips.map(trip => 
          trip.id === tripId ? { ...trip, status: 'cancelled' } : trip
        ));
        toast.success('Trip cancelled successfully');
      } catch (error) {
        toast.error('Failed to cancel trip');
      }
    }
  };

  const TripCard = ({ trip }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-800">{trip.id}</h3>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(trip.status)}`}>
              {getStatusIcon(trip.status)}
              {trip.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Truck size={16} />
            <span className="font-medium">{trip.vehicle}</span>
            <span className="text-slate-400">•</span>
            <Users size={16} />
            <span>{trip.driver}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            Rs {trip.freight.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{trip.distance}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Route */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center">
            <MapPin size={16} className="text-blue-600 mr-2" />
            <span className="font-medium">{trip.from}</span>
          </div>
          <div className="h-px flex-1 mx-4 bg-slate-300"></div>
          <div className="flex items-center">
            <MapPin size={16} className="text-emerald-600 mr-2" />
            <span className="font-medium">{trip.to}</span>
          </div>
        </div>

        {/* Client & Order */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Client</p>
            <p className="font-medium text-slate-800">{trip.client}</p>
            {trip.orderId && (
              <p className="text-xs text-slate-500 mt-1">Order: {trip.orderId}</p>
            )}
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Dates</p>
            <p className="font-medium text-slate-800">
              {new Date(trip.startDate).toLocaleDateString('en-PK')}
            </p>
            {trip.endDate ? (
              <p className="text-xs text-slate-500 mt-1">Ended: {new Date(trip.endDate).toLocaleDateString('en-PK')}</p>
            ) : (
              <p className="text-xs text-amber-600 mt-1">ETA: {trip.estimatedEnd}</p>
            )}
          </div>
        </div>

        {/* Financials */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 mb-2">Financial Summary</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-slate-500">Freight</p>
              <p className="font-bold text-slate-800">Rs {trip.freight.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Expenses</p>
              <p className="font-bold text-red-600">Rs {trip.expenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Net</p>
              <p className={`font-bold ${getNetProfit(trip) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                Rs {getNetProfit(trip).toLocaleString()}
              </p>
            </div>
          </div>
          {(trip.detention > 0 || trip.lolo > 0) && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex text-xs text-slate-500">
                {trip.detention > 0 && <span className="mr-3">Detention: Rs {trip.detention}</span>}
                {trip.lolo > 0 && <span>LOLO: Rs {trip.lolo}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            {trip.biltyNo && <span>Bilty: {trip.biltyNo}</span>}
          </div>
          
          <div className="flex items-center gap-2">
            {trip.status === 'scheduled' && (
              <button
                onClick={() => handleStartTrip(trip.id)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Trip
              </button>
            )}
            {trip.status === 'in_transit' && (
              <button
                onClick={() => handleCompleteTrip(trip.id)}
                className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Complete
              </button>
            )}
            {(trip.status === 'scheduled' || trip.status === 'in_transit') && (
              <button
                onClick={() => handleCancelTrip(trip.id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Trip Manager</h1>
            <p className="text-slate-600">Loading trips...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
              <div className="h-20 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trip Manager</h1>
          <p className="text-slate-600">
            Monitor and manage all vehicle trips
            {tenant && <span className="ml-2 text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
              {tenant.company_name}
            </span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Printer size={16} />
            Print
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            New Trip
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'all', label: 'All Trips', count: trips.length },
          { id: 'active', label: 'Active', count: trips.filter(t => t.status === 'in_transit').length },
          { id: 'scheduled', label: 'Scheduled', count: trips.filter(t => t.status === 'scheduled').length },
          { id: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length },
          { id: 'cancelled', label: 'Cancelled', count: trips.filter(t => t.status === 'cancelled').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search trips by ID, vehicle, driver, or bilty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Active Trips</p>
            <p className="text-2xl font-bold text-blue-600">
              {trips.filter(t => t.status === 'in_transit').length}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-amber-600">
              {trips.filter(t => t.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">
              Rs {trips.reduce((sum, trip) => sum + trip.freight, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-slate-900">
              Rs {trips.reduce((sum, trip) => sum + getNetProfit(trip), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrips.length > 0 ? (
          filteredTrips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Truck size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Trips Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'No trips match your search.' : 'You haven\'t created any trips yet.'}
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Create Your First Trip
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Trip Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {((trips.filter(t => t.status === 'completed').length / trips.length) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-slate-300">Completion Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              Rs {(trips.reduce((sum, trip) => sum + trip.expenses, 0) / trips.length || 0).toLocaleString()}
            </div>
            <p className="text-slate-300">Avg. Expenses per Trip</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {trips.filter(t => t.status === 'in_transit').length}
            </div>
            <p className="text-slate-300">Vehicles on Road Now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripManager;
