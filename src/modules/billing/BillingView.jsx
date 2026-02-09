import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  Search, 
  Filter,
  DollarSign,
  Calendar,
  User,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BillingView = () => {
  const { tenant } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Mock data
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      clientId: 'CL-001',
      clientName: 'Al Wahab Goods',
      date: '2024-01-15',
      dueDate: '2024-01-30',
      amount: 145000,
      paid: 100000,
      status: 'partially_paid',
      trips: ['TRIP-2024-001', 'TRIP-2024-002'],
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-002',
      clientId: 'CL-002',
      clientName: 'Speed Cargo',
      date: '2024-01-16',
      dueDate: '2024-01-31',
      amount: 85000,
      paid: 0,
      status: 'pending',
      trips: ['TRIP-2024-003'],
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-003',
      clientId: 'CL-003',
      clientName: 'National Logistics',
      date: '2024-01-14',
      dueDate: '2024-01-29',
      amount: 28000,
      paid: 28000,
      status: 'paid',
      trips: ['TRIP-2024-004'],
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-004',
      clientId: 'CL-004',
      clientName: 'Global Transport',
      date: '2024-01-10',
      dueDate: '2024-01-25',
      amount: 52000,
      paid: 52000,
      status: 'paid',
      trips: ['TRIP-2024-005'],
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-005',
      clientId: 'CL-005',
      clientName: 'Fast Track Cargo',
      date: '2024-01-12',
      dueDate: '2024-01-27',
      amount: 32000,
      paid: 0,
      status: 'overdue',
      trips: [],
      downloadUrl: '#'
    }
  ];

  const mockClients = [
    { id: 'CL-001', name: 'Al Wahab Goods', balance: 45000 },
    { id: 'CL-002', name: 'Speed Cargo', balance: 85000 },
    { id: 'CL-003', name: 'National Logistics', balance: 0 },
    { id: 'CL-004', name: 'Global Transport', balance: 0 },
    { id: 'CL-005', name: 'Fast Track Cargo', balance: 32000 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setInvoices(mockInvoices);
        setClients(mockClients);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Failed to load billing data');
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (selectedClient !== 'all' && invoice.clientId !== selectedClient) return false;
    if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;
    if (searchTerm && !invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'partially_paid': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={14} />;
      case 'partially_paid': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'overdue': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const calculateTotals = () => {
    const totalInvoices = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.paid, 0);
    const totalPending = totalAmount - totalPaid;
    
    return { totalInvoices, totalAmount, totalPaid, totalPending };
  };

  const totals = calculateTotals();

  const handleGenerateInvoice = () => {
    toast.success('Invoice generation feature coming soon!');
    setShowGenerateModal(false);
  };

  const handleSendReminder = (invoiceId) => {
    toast.success(`Payment reminder sent for ${invoiceId}`);
  };

  const handleDownloadInvoice = (invoiceId) => {
    toast.success(`Invoice ${invoiceId} downloaded`);
  };

  const handlePrintInvoice = (invoiceId) => {
    toast.success(`Printing invoice ${invoiceId}`);
    window.print();
  };

  const InvoiceCard = ({ invoice }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-800">{invoice.id}</h3>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              {invoice.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <User size={14} />
            <span className="font-medium">{invoice.clientName}</span>
            <Calendar size={14} className="ml-4" />
            <span>Due: {new Date(invoice.dueDate).toLocaleDateString('en-PK')}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            Rs {invoice.amount.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">
            Paid: Rs {invoice.paid.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>Payment Progress</span>
            <span>{((invoice.paid / invoice.amount) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(invoice.paid / invoice.amount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Trip details */}
        {invoice.trips.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-2">Included Trips</p>
            <div className="flex flex-wrap gap-2">
              {invoice.trips.map(tripId => (
                <span key={tripId} className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                  {tripId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Issued: {new Date(invoice.date).toLocaleDateString('en-PK')}
          </div>
          
          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={() => handleSendReminder(invoice.id)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Reminder
              </button>
            )}
            <button
              onClick={() => handleDownloadInvoice(invoice.id)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => handlePrintInvoice(invoice.id)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Print"
            >
              <Printer size={16} />
            </button>
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Email">
              <Mail size={16} />
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
            <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
            <p className="text-slate-600">Loading invoices...</p>
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
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
          <p className="text-slate-600">
            Manage invoices and track payments
            {tenant && <span className="ml-2 text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
              {tenant.company_name}
            </span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Generate Invoice
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Invoices</p>
              <h3 className="text-2xl font-bold">{totals.totalInvoices}</h3>
            </div>
            <FileText size={24} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Total Amount</p>
              <h3 className="text-2xl font-bold">Rs {totals.totalAmount.toLocaleString()}</h3>
            </div>
            <DollarSign size={24} className="text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm mb-1">Total Paid</p>
              <h3 className="text-2xl font-bold">Rs {totals.totalPaid.toLocaleString()}</h3>
            </div>
            <CheckCircle size={24} className="text-amber-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm mb-1">Pending</p>
              <h3 className="text-2xl font-bold">Rs {totals.totalPending.toLocaleString()}</h3>
            </div>
            <Clock size={24} className="text-red-200" />
          </div>
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
                placeholder="Search invoices by ID or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-2">
            <User size={20} className="text-slate-500" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
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
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Invoices Found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'No invoices match your search.' : 'You haven\'t created any invoices yet.'}
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Your First Invoice
            </button>
          </div>
        )}
      </div>

      {/* Clients Receivables */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Client Receivables</h3>
          <p className="text-slate-600 text-sm">Pending payments from clients</p>
        </div>
        <div className="divide-y divide-slate-100">
          {clients.filter(c => c.balance > 0).map(client => (
            <div key={client.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{client.name}</p>
                  <p className="text-sm text-slate-500">Pending payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">Rs {client.balance.toLocaleString()}</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Send Reminder
                </button>
              </div>
            </div>
          ))}
          {clients.filter(c => c.balance > 0).length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
              <p>All clients are up to date with payments</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Generate Invoice</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <AlertCircle size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Client
                </label>
                <select className="w-full p-3 border border-slate-300 rounded-xl">
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.balance > 0 && `(Rs ${client.balance.toLocaleString()} pending)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trip Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Trips to Include
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-slate-300 rounded-xl">
                  {mockInvoices.flatMap(inv => inv.trips).map((tripId, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                      <input type="checkbox" id={`trip-${index}`} />
                      <label htmlFor={`trip-${index}`} className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{tripId}</span>
                          <span className="text-slate-500">Rs 45,000</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Charges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Detention Charges
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full p-3 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    LOLO Charges
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full p-3 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
