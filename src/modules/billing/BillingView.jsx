import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Send, 
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Copy,
  DollarSign,
  Calendar,
  User,
  Truck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BillingView = () => {
  const { tenant } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Mock data for invoices
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      client: 'Al Wahab Goods',
      clientId: 'CLIENT-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      amount: 65000,
      paid: 65000,
      status: 'paid',
      type: 'Trip Charges',
      trips: ['TRIP-2024-001'],
      items: [
        { description: 'Freight Lahore to Karachi', quantity: 1, rate: 45000, amount: 45000 },
        { description: 'Detention Charges', quantity: 1, rate: 5000, amount: 5000 },
        { description: 'LOLO Charges', quantity: 1, rate: 15000, amount: 15000 }
      ]
    },
    {
      id: 'INV-2024-002',
      client: 'Speed Cargo',
      clientId: 'CLIENT-002',
      date: '2024-01-16',
      dueDate: '2024-02-16',
      amount: 45000,
      paid: 20000,
      status: 'partial',
      type: 'Transport Services',
      trips: ['TRIP-2024-003'],
      items: [
        { description: 'Freight Karachi to Islamabad', quantity: 1, rate: 45000, amount: 45000 }
      ]
    },
    {
      id: 'INV-2024-003',
      client: 'National Logistics',
      clientId: 'CLIENT-003',
      date: '2024-01-14',
      dueDate: '2024-02-14',
      amount: 28000,
      paid: 0,
      status: 'pending',
      type: 'Local Transport',
      trips: ['TRIP-2024-002'],
      items: [
        { description: 'Freight Lahore to Faisalabad', quantity: 1, rate: 28000, amount: 28000 }
      ]
    },
    {
      id: 'INV-2024-004',
      client: 'Global Transport',
      clientId: 'CLIENT-004',
      date: '2024-01-10',
      dueDate: '2024-02-10',
      amount: 95000,
      paid: 95000,
      status: 'paid',
      type: 'Container Transport',
      trips: ['TRIP-2024-004'],
      items: [
        { description: 'Double Vehicle Transport', quantity: 2, rate: 47500, amount: 95000 }
      ]
    },
    {
      id: 'INV-2024-005',
      client: 'Fast Track Cargo',
      clientId: 'CLIENT-005',
      date: '2024-01-12',
      dueDate: '2024-02-12',
      amount: 32000,
      paid: 0,
      status: 'overdue',
      type: 'Cancelled Trip',
      trips: ['TRIP-2024-005'],
      items: [
        { description: 'Cancellation Charges', quantity: 1, rate: 32000, amount: 32000 }
      ]
    }
  ];

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setInvoices(mockInvoices);
        setFilteredInvoices(mockInvoices);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={14} />;
      case 'partial': return <AlertCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'overdue': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      // API call would go here
      toast.success(`Invoice ${invoiceId} sent to client`);
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      // API call would go here
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'paid', paid: inv.amount } : inv
      ));
      toast.success('Invoice marked as paid');
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    // In production, this would generate PDF
    toast.success(`Downloading invoice ${invoiceId}...`);
  };

  const InvoiceCard = ({ invoice }) => {
    const daysLeft = getDaysLeft(invoice.dueDate);
    const isOverdue = daysLeft < 0;
    
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={18} className="text-blue-600" />
              <h3 className="font-bold text-lg text-slate-800">{invoice.id}</h3>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                {getStatusIcon(invoice.status)}
                {invoice.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center">
                <User size={14} className="mr-1" />
                <span>{invoice.client}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{new Date(invoice.date).toLocaleDateString('en-PK')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              Rs {invoice.amount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">
              Due: {new Date(invoice.dueDate).toLocaleDateString('en-PK')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Payment Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Payment Progress</span>
              <span className="font-medium">
                Rs {invoice.paid.toLocaleString()} / Rs {invoice.amount.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(invoice.paid / invoice.amount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Invoice Type</p>
              <p className="font-medium text-slate-800">{invoice.type}</p>
            </div>
            <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <p className="text-xs text-slate-600 mb-1">Payment Due</p>
              <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>
                {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
              </p>
            </div>
          </div>

          {/* Trips */}
          {invoice.trips && invoice.trips.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">Related Trips</p>
              <div className="flex flex-wrap gap-2">
                {invoice.trips.map(tripId => (
                  <span key={tripId} className="text-xs bg-white px-2 py-1 rounded border border-slate-300">
                    {tripId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              Balance: <span className="font-bold">Rs {(invoice.amount - invoice.paid).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewInvoice(invoice)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="View Invoice"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleDownloadInvoice(invoice.id)}
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                title="Download"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => handleSendInvoice(invoice.id)}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                title="Send to Client"
              >
                <Send size={16} />
              </button>
              {invoice.status !== 'paid' && (
                <button
                  onClick={() => handleMarkAsPaid(invoice.id)}
                  className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InvoiceModal = () => {
    if (!selectedInvoice) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Invoice {selectedInvoice.id}</h2>
              <p className="text-slate-600">
                {selectedInvoice.client} • {selectedInvoice.type}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                {selectedInvoice.status.toUpperCase()}
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="ml-4 p-2 hover:bg-slate-100 rounded-full"
              >
                <AlertCircle size={20} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h3 className="font-bold text-slate-700 mb-3">Bill From</h3>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="font-bold text-lg">{tenant?.company_name || 'FleetX Transport'}</p>
                  <p className="text-slate-600">{tenant?.company_address || 'Lahore, Pakistan'}</p>
                  <p className="text-slate-600">Phone: {tenant?.owner_phone || '+92 300 1234567'}</p>
                  <p className="text-slate-600">Email: {tenant?.owner_email || 'billing@fleetx.com'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-3">Bill To</h3>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="font-bold text-lg">{selectedInvoice.client}</p>
                  <p className="text-slate-600">Invoice Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  <p className="text-slate-600">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div>
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">Invoice Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-bold">Rs {selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax (0%)</span>
                    <span className="font-bold">Rs 0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Discount</span>
                    <span className="font-bold">Rs 0</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-emerald-600">Rs {selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="font-bold text-emerald-600">Rs {selectedInvoice.paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Balance Due</span>
                    <span className="font-bold text-red-600">
                      Rs {(selectedInvoice.amount - selectedInvoice.paid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-8">
            <h3 className="font-bold text-slate-700 mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">Rs {item.rate.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">Rs {item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="3" className="p-3 text-right">Total</td>
                    <td className="p-3 text-right text-emerald-600">
                      Rs {selectedInvoice.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mt-8 p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-800 mb-2">Payment Instructions</h4>
            <p className="text-sm text-amber-700">
              Please make payment to the following account within {getDaysLeft(selectedInvoice.dueDate)} days:
            </p>
            <div className="mt-2 text-sm">
              <p>Bank: Meezan Bank Limited</p>
              <p>Account Title: {tenant?.company_name || 'FleetX Transport'}</p>
              <p>Account No: 0123-45678901-2</p>
              <p>IBAN: PK36MEZN0001234567890123</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-between pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              <p>Thank you for your business!</p>
              <p className="mt-1">For any queries, contact {tenant?.owner_email || 'support@fleetx.com'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button
                onClick={() => handleSendInvoice(selectedInvoice.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Send size={16} />
                Send to Client
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Billing & Invoicing</h1>
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
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoicing</h1>
          <p className="text-slate-600">
            Manage invoices, payments, and billing
            {tenant && <span className="ml-2 text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
              {tenant.company_name}
            </span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Printer size={16} />
            Print All
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Invoiced</p>
              <p className="text-2xl font-bold text-slate-900">
                Rs {invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Amount Received</p>
              <p className="text-2xl font-bold text-emerald-600">
                Rs {invoices.reduce((sum, inv) => sum + inv.paid, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending Payment</p>
              <p className="text-2xl font-bold text-amber-600">
                Rs {invoices.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                Rs {invoices
                  .filter(inv => inv.status === 'overdue')
                  .reduce((sum, inv) => sum + (inv.amount - inv.paid), 0)
                  .toLocaleString()}
              </p>
            </div>
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
                placeholder="Search invoices by ID, client, or amount..."
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
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
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
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Create Your First Invoice
            </button>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && <InvoiceModal />}

      {/* Collection Performance */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Collection Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {((invoices.reduce((sum, inv) => sum + inv.paid, 0) / 
                 invoices.reduce((sum, inv) => sum + inv.amount, 0)) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-slate-300">Collection Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {invoices.filter(inv => inv.status === 'overdue').length}
            </div>
            <p className="text-slate-300">Overdue Invoices</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {Math.round(invoices.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0) / 
                invoices.filter(inv => inv.status !== 'paid').length) || 0}
            </div>
            <p className="text-slate-300">Avg. Pending per Invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
