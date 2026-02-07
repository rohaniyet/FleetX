import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit2, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  ArrowRight,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OrderManager = () => {
  const { tenant } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Mock data for orders
  const mockOrders = [
    {
      id: 'ORD-2024-001',
      client: 'Al Wahab Goods',
      from: 'Lahore',
      to: 'Karachi',
      weight: '25 MT',
      containerSize: '40ft',
      type: 'Export',
      vehicles: { single: 2, double: 1 },
      rate: 65000,
      status: 'confirmed',
      croNo: 'CRO-789456',
      biltyNo: 'BILTY-123',
      createdAt: '2024-01-15',
      fulfilled: { single: 1, double: 0 }
    },
    {
      id: 'ORD-2024-002',
      client: 'Speed Cargo',
      from: 'Karachi',
      to: 'Islamabad',
      weight: '18 MT',
      containerSize: '20ft',
      type: 'Import',
      vehicles: { single: 1, double: 0 },
      rate: 45000,
      status: 'pending',
      croNo: 'GD-123789',
      biltyNo: '',
      createdAt: '2024-01-16',
      fulfilled: { single: 0, double: 0 }
    },
    {
      id: 'ORD-2024-003',
      client: 'National Logistics',
      from: 'Lahore',
      to: 'Faisalabad',
      weight: '12 MT',
      containerSize: '20ft',
      type: 'Local',
      vehicles: { single: 1, double: 0 },
      rate: 28000,
      status: 'in_progress',
      croNo: 'REF-456123',
      biltyNo: 'BILTY-456',
      createdAt: '2024-01-14',
      fulfilled: { single: 1, double: 0 }
    },
    {
      id: 'ORD-2024-004',
      client: 'Global Transport',
      from: 'Islamabad',
      to: 'Peshawar',
      weight: '30 MT',
      containerSize: '40ft',
      type: 'Open',
      vehicles: { single: 0, double: 2 },
      rate: 95000,
      status: 'completed',
      croNo: 'CRO-789123',
      biltyNo: 'BILTY-789',
      createdAt: '2024-01-10',
      fulfilled: { single: 0, double: 2 }
    },
    {
      id: 'ORD-2024-005',
      client: 'Fast Track Cargo',
      from: 'Karachi',
      to: 'Lahore',
      weight: '22 MT',
      containerSize: '20ft',
      type: 'Export',
      vehicles: { single: 2, double: 0 },
      rate: 55000,
      status: 'cancelled',
      croNo: 'CRO-321654',
      biltyNo: '',
      createdAt: '2024-01-12',
      fulfilled: { single: 0, double: 0 }
    }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.croNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-slate-100 text-slate-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'in_progress': return <Truck size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowEditOrderModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        // API call would go here
        setOrders(orders.filter(order => order.id !== orderId));
        toast.success('Order deleted successfully');
      } catch (error) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      // API call would go here
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'confirmed' } : order
      ));
      toast.success('Order confirmed successfully');
    } catch (error) {
      toast.error('Failed to confirm order');
    }
  };

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-800">{order.id}</h3>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-slate-600 font-medium">{order.client}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            Rs {order.rate.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{order.weight} • {order.containerSize}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-slate-600">
          <MapPin size={14} className="mr-2" />
          <span className="font-medium">{order.from}</span>
          <ArrowRight size={14} className="mx-2" />
          <span className="font-medium">{order.to}</span>
          <span className="ml-auto text-xs bg-slate-100 px-2 py-1 rounded">
            {order.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Vehicles Required</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Truck size={16} className="text-blue-600" />
                  <span className="font-bold">{order.vehicles.single}</span>
                </div>
                <p className="text-xs text-slate-500">Single</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Truck size={16} className="text-purple-600" />
                  <span className="font-bold">{order.vehicles.double}</span>
                </div>
                <p className="text-xs text-slate-500">Double</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Fulfilled</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className={`font-bold ${
                  order.fulfilled.single === order.vehicles.single ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {order.fulfilled.single}/{order.vehicles.single}
                </span>
                <p className="text-xs text-slate-500">Single</p>
              </div>
              <div className="text-center">
                <span className={`font-bold ${
                  order.fulfilled.double === order.vehicles.double ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {order.fulfilled.double}/{order.vehicles.double}
                </span>
                <p className="text-xs text-slate-500">Double</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            {order.croNo && <span className="mr-3">CRO: {order.croNo}</span>}
            {order.biltyNo && <span>Bilty: {order.biltyNo}</span>}
          </div>
          
          <div className="flex items-center gap-2">
            {order.status === 'pending' && (
              <button
                onClick={() => handleConfirmOrder(order.id)}
                className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Confirm
              </button>
            )}
            <button
              onClick={() => handleEditOrder(order)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDeleteOrder(order.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
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
            <h1 className="text-2xl font-bold text-slate-800">Order Manager</h1>
            <p className="text-slate-600">Loading orders...</p>
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
          <h1 className="text-2xl font-bold text-slate-800">Order Manager</h1>
          <p className="text-slate-600">
            Manage your transport orders and bookings
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
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Order
          </button>
        </div>
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
                placeholder="Search orders by ID, client, CRO, or route..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {orders.filter(o => o.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-slate-900">
              Rs {orders.reduce((sum, order) => sum + order.rate, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Orders Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'No orders match your search.' : 'You haven\'t created any orders yet.'}
            </p>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Your First Order
            </button>
          </div>
        )}
      </div>

      {/* New Order Modal (Placeholder) */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Create New Order</h2>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <XCircle size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="text-center py-12">
              <Package size={64} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Order Form Coming Soon</h3>
              <p className="text-slate-500">This feature is under development.</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal (Placeholder) */}
      {showEditOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Edit Order: {selectedOrder.id}</h2>
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <XCircle size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="text-center py-12">
              <Edit2 size={64} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Edit Form Coming Soon</h3>
              <p className="text-slate-500">This feature is under development.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
