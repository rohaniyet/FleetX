import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Package, 
  FileText, 
  PlusCircle, 
  TrendingUp, 
  Menu, 
  X, 
  Save, 
  Trash2, 
  Plus, 
  Edit2, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  CreditCard, 
  Wallet, 
  Filter, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Banknote, 
  ClipboardList, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  Scale, 
  Landmark, 
  Anchor, 
  MapPin,
  Map,
  Lock,
  LogOut,
  ShoppingCart,
  Search
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment, 
  writeBatch 
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAA4mTxBvsy71nE46Qj1UDYjDOU76O1aes",
  authDomain: "fleetx-wg.firebaseapp.com",
  projectId: "fleetx-wg",
  storageBucket: "fleetx-wg.firebasestorage.app",
  messagingSenderId: "155966676723",
  appId: "1:155966676723:web:f4b6fb2c7778d56ecaa186",
  measurementId: "G-3QDCZSE1LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Data Path ID (Data yahan save hoga)
const appId = 'fleetx_v1';

// --- Utility Functions ---
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'Rs 0';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return '';
  if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString('en-GB');
  if (date instanceof Date) return date.toLocaleDateString('en-GB');
  return '';
};

const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

// --- Main App Component ---
export default function FleetXApp() {
  // App State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing/Modal States
  const [editingTrip, setEditingTrip] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState(null);

  // --- Auth & Data Listeners ---
  useEffect(() => {
    const session = sessionStorage.getItem('fleetx_auth');
    if (session === 'true') setIsAuthenticated(true);

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Firebase Auth Error:", error);
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/admin-restricted-operation') {
          setFirebaseError('Please enable "Anonymous" sign-in in Firebase Console > Authentication.');
        } else {
          setFirebaseError(`Database Connection Error: ${error.message}`);
        }
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && !firebaseError) {
         // Still loading or not signed in
      } else {
         setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [firebaseError]);

  useEffect(() => {
    if (!user) return;

    const unsubAccounts = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'accounts')), (snapshot) => {
      setAccounts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("Accounts Sync Error:", error));

    const unsubTrans = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("Trans Sync Error:", error));

    const unsubInv = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'inventory')), (snapshot) => {
      setInventory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("Inventory Sync Error:", error));

    const unsubOrders = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => console.error("Orders Sync Error:", error));

    return () => { unsubAccounts(); unsubTrans(); unsubInv(); unsubOrders(); };
  }, [user]);

  // --- Login Handler ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === 'admin' && loginCreds.password === '12345') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fleetx_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid Username or Password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('fleetx_auth');
    setLoginCreds({ username: '', password: '' });
  };

  // --- Calculations ---
  const accountBalances = useMemo(() => {
    const bals = {};
    accounts.forEach(acc => bals[acc.id] = 0);
    transactions.forEach(t => {
      t.entries?.forEach(entry => {
        if (bals[entry.accountId] !== undefined) {
          if (entry.type === 'debit') bals[entry.accountId] += Number(entry.amount);
          else bals[entry.accountId] -= Number(entry.amount);
        }
      });
    });
    return bals;
  }, [accounts, transactions]);

  const getCategoryBalance = (category) => {
    return accounts
      .filter(a => a.category === category || (category === 'Cash' && a.category === 'Cash/Bank')) 
      .reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0);
  };

  const getAccountId = (nameLike) => {
    // Try to find exact match first or partial
    const found = accounts.find(a => a.name.toLowerCase().includes(nameLike.toLowerCase()));
    return found ? found.id : null;
  };

  // Auto Create System Accounts if missing
  const ensureSystemAccounts = async () => {
    const required = [
      { name: 'Inventory Profit', category: 'Income', type: 'Income' },
      { name: 'Store Inventory', category: 'Asset', type: 'Asset' }
    ];
    
    for (let req of required) {
      const exists = accounts.find(a => a.name === req.name);
      if (!exists) {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'), { ...req, createdAt: serverTimestamp() });
      }
    }
  };
  
  // Call once when accounts load
  useEffect(() => {
    if(accounts.length > 0) ensureSystemAccounts();
  }, [accounts.length]);


  const pnlStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    const incomeAccounts = accounts.filter(a => a.type === 'Income');
    const expenseAccounts = accounts.filter(a => a.type === 'Expense');
    
    expenseAccounts.forEach(acc => {
      totalExpense += (accountBalances[acc.id] || 0); 
    });

    incomeAccounts.forEach(acc => {
      totalIncome += Math.abs(accountBalances[acc.id] || 0); 
    });

    let closedTripProfit = 0;
    transactions.filter(t => t.type === 'Trip' && t.status === 'Closed').forEach(t => {
      const inc = Number(t.totalAmount || 0) + Number(t.detentionAmount || 0) + Number(t.loloAmount || 0);
      const exp = t.expenseDetails?.reduce((s, e) => s + Number(e.amount), 0) || 0;
      closedTripProfit += (inc - exp);
    });

    // General Expenses and Payments logic adjustments could be here
    // For now using simple aggregation from account balances for non-trip items

    return { income: totalIncome, expense: totalExpense, profit: closedTripProfit + totalIncome - totalExpense }; // Added totalIncome (like Inv Profit) to profit
  }, [transactions, accounts, accountBalances]);

  // --- Sub Components ---
  // (Dashboard, OrderManager, TripManager, PaymentsManager, AccountManager, BillingView are same as before, see StoreManager updates below)

  const Dashboard = () => {
    // ... existing dashboard code ...
    const receivables = getCategoryBalance('Client');
    const payables = Math.abs(accounts.filter(a => a.category === 'Vendor').reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0));
    const cashInHand = accounts.filter(a => a.category === 'Cash').reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const openTripsCount = transactions.filter(t => t.type === 'Trip' && t.status === 'Open').length;
    const vehiclesInLahore = accounts.filter(a => a.category === 'Vehicle' && (!a.currentLocation || a.currentLocation === 'Lahore')).length;
    const vehiclesOut = accounts.filter(a => a.category === 'Vehicle' && a.currentLocation && a.currentLocation !== 'Lahore');
    const bankAccounts = accounts.filter(a => a.category === 'Bank');
    const receivableAccounts = accounts.filter(a => a.category === 'Client' && accountBalances[a.id] > 0);
    const payableAccounts = accounts.filter(a => a.category === 'Vendor' && accountBalances[a.id] < 0);

    if (dashboardFilter) {
      let listData = [];
      let title = '';
      if (dashboardFilter === 'receivables') { listData = receivableAccounts; title = 'Receivables Detail'; }
      else if (dashboardFilter === 'payables') { listData = payableAccounts; title = 'Payables Detail'; }
      else if (dashboardFilter === 'outstation') { listData = vehiclesOut; title = 'Fleet Outstation Details'; }

      return (
        <div className="animate-fade-in space-y-4">
          <button onClick={() => setDashboardFilter(null)} className="flex items-center text-slate-500 hover:text-slate-800"><ArrowRight className="rotate-180 mr-1" size={16}/> Back to Dashboard</button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-lg">{title}</div>
            <div className="divide-y divide-slate-100">{listData.map(acc => { if(dashboardFilter==='outstation'){ const activeTrip=transactions.find(t=>t.type==='Trip'&&t.status==='Open'&&t.vehicleId===acc.id); const order=activeTrip?orders.find(o=>o.id===activeTrip.orderId):null; const clientName=order?accounts.find(a=>a.id===order.clientId)?.name:'N/A'; return (<div key={acc.id} className="p-4 hover:bg-slate-50"><div className="flex justify-between items-start"><div><span className="font-bold text-slate-800 block">{acc.name}</span><span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> Current: {acc.currentLocation}</span></div><div className="text-right text-xs">{activeTrip?(<><span className="block text-emerald-600 font-bold">On Active Trip</span><span className="block text-slate-500">Client: {clientName}</span><span className="block text-slate-400">{activeTrip.route}</span></>):(<span className="text-orange-500 font-bold">Idle / Completed</span>)}</div></div></div>); } else { return (<div key={acc.id} className="p-4 flex justify-between items-center"><span className="font-medium text-slate-700">{acc.name}</span><span className={`font-mono font-bold ${accountBalances[acc.id] < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(accountBalances[acc.id]))}</span></div>); } })}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-slate-800 p-4 rounded-2xl text-white shadow-md"><p className="text-slate-300 text-xs uppercase tracking-wider mb-1">Fleet in Lahore</p><h3 className="text-2xl font-bold flex items-center gap-2"><MapPin size={20} className="text-red-400" /> {vehiclesInLahore}</h3></div>
           <button onClick={() => setDashboardFilter('outstation')} className="bg-slate-700 p-4 rounded-2xl text-white shadow-md text-left hover:bg-slate-600 transition-colors"><p className="text-slate-300 text-xs uppercase tracking-wider mb-1">Fleet Outstation</p><h3 className="text-2xl font-bold flex items-center gap-2"><Truck size={20} className="text-blue-400" /> {vehiclesOut.length}</h3><p className="text-[10px] text-slate-400 mt-1">Click for Details</p></button>
           <button onClick={() => setActiveView('trip-manager')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-blue-300 hover:shadow-md transition-all"><p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Trips</p><h3 className="text-2xl font-bold mt-1 text-slate-800">{openTripsCount}</h3></button>
           <button onClick={() => setActiveView('reports')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-emerald-300 hover:shadow-md transition-all"><p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Net Profit</p><h3 className={`text-2xl font-bold mt-1 ${pnlStats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(pnlStats.profit)}</h3></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setDashboardFilter('receivables')} className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl text-white shadow-lg text-left hover:scale-[1.02] transition-transform"><p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Receivables</p><h3 className="text-2xl font-bold mt-1">{formatCurrency(receivables)}</h3><p className="text-[10px] text-blue-200 mt-2 flex items-center gap-1">Click to view list <ArrowRight size={10}/></p></button>
          <button onClick={() => setActiveView('order-manager')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-orange-300 hover:shadow-md transition-all group"><p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending Orders</p><h3 className="text-2xl font-bold mt-1 text-orange-600">{pendingOrders}</h3><p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 group-hover:text-orange-500">Need CRO/Action <ArrowRight size={10}/></p></button>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div className="flex justify-between items-start"><div><p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Cash In Hand</p><h3 className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(cashInHand)}</h3></div><Wallet className="text-emerald-100" size={24} /></div></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit"><div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2"><CreditCard size={18} className="text-slate-500"/><h3 className="font-bold text-slate-800">Bank Accounts</h3></div><div className="divide-y divide-slate-100">{bankAccounts.map(acc => (<div key={acc.id} className="p-4 flex justify-between items-center hover:bg-slate-50"><span className="text-sm font-medium text-slate-700">{acc.name}</span><span className="font-mono font-bold text-slate-800 text-sm">{formatCurrency(accountBalances[acc.id] || 0)}</span></div>))}</div></div>
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-bold text-slate-800">Recent Activity</h3><button onClick={() => setActiveView('trip-manager')} className="text-sm text-blue-600 hover:underline">View All Trips</button></div><div className="divide-y divide-slate-100">{transactions.slice(0, 5).map(t => (<div key={t.id} className="p-4 hover:bg-slate-50 transition-colors"><div className="flex justify-between items-start"><div><div className="flex items-center gap-2">{t.type === 'Payment' ? <Banknote size={16} className="text-slate-400"/> : null}<p className="font-semibold text-slate-800">{t.description}</p>{t.status && (<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{t.status.toUpperCase()}</span>)}</div><p className="text-xs text-slate-500">{formatDate(t.createdAt)} • Ref: {t.id.slice(0, 4)}</p></div><span className="font-mono font-medium text-slate-700">{formatCurrency(t.totalAmount || t.entries?.[0]?.amount)}</span></div></div>))}</div></div>
        </div>
      </div>
    );
  };

  const OrderManager = () => {
    // ... OrderManager logic same as previous ...
    const [mode, setMode] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [newOrder, setNewOrder] = useState({ clientId: '', locationFrom: 'Lahore', locationTo: 'Karachi', weight: '', singleVehicles: 0, doubleVehicles: 0, rateSingle: '', rateDouble: '', weightSingle: '', weightDouble: '', containerSize: '20ft', type: 'Local', croNo: '', status: 'Pending', invoiceStatus: 'Unbilled', fulfilledSingle: 0, fulfilledDouble: 0 });
    const getRefLabel = () => { if (newOrder.type === 'Import') return 'GD Number'; if (newOrder.type === 'Export') return 'CRO Number'; return 'Ref / Bilty / GD No'; };
    const handleSaveOrder = async (e) => { e.preventDefault(); if (!newOrder.clientId || !newOrder.locationFrom) return alert('Please fill basics'); const status = newOrder.croNo ? 'Confirmed' : 'Pending'; if (editingId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', editingId), { ...newOrder, status }); alert('Order Updated Successfully!'); } else { const orderRef = generateOrderId(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), { ...newOrder, orderRef, status, createdAt: serverTimestamp() }); alert('Order Booked Successfully!'); } resetForm(); };
    const handleEditOrder = (order) => { setNewOrder({ clientId: order.clientId, locationFrom: order.locationFrom, locationTo: order.locationTo, weight: order.weight, weightSingle: order.weightSingle || '', weightDouble: order.weightDouble || '', singleVehicles: order.singleVehicles, doubleVehicles: order.doubleVehicles, rateSingle: order.rateSingle, rateDouble: order.rateDouble, containerSize: order.containerSize, type: order.type, croNo: order.croNo || '', status: order.status, invoiceStatus: order.invoiceStatus || 'Unbilled', fulfilledSingle: order.fulfilledSingle || 0, fulfilledDouble: order.fulfilledDouble || 0 }); setEditingId(order.id); setMode('new'); };
    const handleConfirmOrder = async (id, cro) => { if(!cro) return alert('Enter Ref Number'); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { croNo: cro, status: 'Confirmed' }); };
    const resetForm = () => { setNewOrder({ clientId: '', locationFrom: 'Lahore', locationTo: 'Karachi', weight: '', weightSingle: '', weightDouble: '', singleVehicles: 0, doubleVehicles: 0, rateSingle: '', rateDouble: '', containerSize: '20ft', type: 'Local', croNo: '', status: 'Pending', invoiceStatus: 'Unbilled', fulfilledSingle: 0, fulfilledDouble: 0 }); setEditingId(null); setMode('list'); };
    return ( <div className="space-y-6 animate-fade-in"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Order Manager</h2><button onClick={() => mode === 'list' ? setMode('new') : resetForm()} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${mode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{mode === 'list' ? <><Plus size={18}/> New Booking</> : 'Cancel / View List'}</button></div>{mode === 'new' && ( <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto"><h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Order' : 'Book New Order'}</h3><form onSubmit={handleSaveOrder} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Client</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.clientId} onChange={e => setNewOrder({...newOrder, clientId: e.target.value})} required><option value="">Select Client...</option>{accounts.filter(a => a.category === 'Client').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-slate-500 mb-1">Type</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.type} onChange={e => setNewOrder({...newOrder, type: e.target.value})}><option>Local</option><option>Import</option><option>Export</option><option>Shifting</option><option>Open</option></select></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Size</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.containerSize} onChange={e => setNewOrder({...newOrder, containerSize: e.target.value})}><option>20ft</option><option>40ft</option></select></div></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">From</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.locationFrom} onChange={e => setNewOrder({...newOrder, locationFrom: e.target.value})} required /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">To</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.locationTo} onChange={e => setNewOrder({...newOrder, locationTo: e.target.value})} required /></div></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Total Est. Order Weight (MT)</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: e.target.value})} /></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h4 className="font-bold text-slate-700 text-sm mb-3">Vehicles & Rates</h4><div className="grid grid-cols-3 gap-3 mb-2"><div><label className="block text-xs font-bold text-slate-500 mb-1">Single Veh Qty</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newOrder.singleVehicles} onChange={e => setNewOrder({...newOrder, singleVehicles: Number(e.target.value)})} /></div><div><label className="block text-xs font-bold text-emerald-600 mb-1">Rate (Single)</label><input type="number" className="w-full p-2 border border-emerald-200 rounded-lg" placeholder="Rate" value={newOrder.rateSingle} onChange={e => setNewOrder({...newOrder, rateSingle: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Weight (MT)</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Load" value={newOrder.weightSingle} onChange={e => setNewOrder({...newOrder, weightSingle: e.target.value})} /></div></div><div className="grid grid-cols-3 gap-3"><div><label className="block text-xs font-bold text-slate-500 mb-1">Double Veh Qty</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newOrder.doubleVehicles} onChange={e => setNewOrder({...newOrder, doubleVehicles: Number(e.target.value)})} /></div><div><label className="block text-xs font-bold text-emerald-600 mb-1">Rate (Double)</label><input type="number" className="w-full p-2 border border-emerald-200 rounded-lg" placeholder="Rate" value={newOrder.rateDouble} onChange={e => setNewOrder({...newOrder, rateDouble: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Weight (MT)</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Load" value={newOrder.weightDouble} onChange={e => setNewOrder({...newOrder, weightDouble: e.target.value})} /></div></div></div><div className="pt-2"><label className="block text-xs font-bold text-slate-500 mb-1">{getRefLabel()}</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.croNo} onChange={e => setNewOrder({...newOrder, croNo: e.target.value})} placeholder="Enter to confirm instantly (Optional)"/></div><button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">{editingId ? 'Update Order' : 'Save Booking'}</button></form></div> )}{mode === 'list' && ( <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{orders.map(order => { const pendingSingle = order.singleVehicles - order.fulfilledSingle; const pendingDouble = order.doubleVehicles - order.fulfilledDouble; const refLabel = order.type === 'Import' ? 'GD No' : (order.type === 'Export' ? 'CRO No' : 'Ref'); return ( <div key={order.id} className={`p-5 rounded-xl border-l-4 shadow-sm bg-white group relative ${order.status === 'Confirmed' ? 'border-l-emerald-500' : 'border-l-orange-400'}`}><button onClick={() => handleEditOrder(order)} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors z-10" title="Edit Order"><Edit2 size={16} /></button><div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-800">{order.orderRef} • {accounts.find(a => a.id === order.clientId)?.name}</h3><span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{order.status}</span></div><div className="text-sm text-slate-600 space-y-1 mb-4"><p><span className="font-medium">Route:</span> {order.locationFrom} <ArrowRight size={12} className="inline"/> {order.locationTo}</p><p><span className="font-medium">Spec:</span> {order.containerSize} • {order.type} • Total Weight: {order.weight || '-'} MT</p><div className="grid grid-cols-2 gap-2 mt-2"><div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs"><span className="block font-bold mb-1">Single Vehicles</span><span>{order.fulfilledSingle} / {order.singleVehicles} Done</span><span className={`block font-bold ${pendingSingle > 0 ? 'text-red-500' : 'text-emerald-500'}`}>({pendingSingle} Pending)</span></div><div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs"><span className="block font-bold mb-1">Double Vehicles</span><span>{order.fulfilledDouble} / {order.doubleVehicles} Done</span><span className={`block font-bold ${pendingDouble > 0 ? 'text-red-500' : 'text-emerald-500'}`}>({pendingDouble} Pending)</span></div></div><p className="mt-2"><span className="font-medium">{refLabel}:</span> {order.croNo || 'Pending'}</p>{order.invoiceStatus === 'Billed' && <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold">INVOICED</span>}</div>{order.status === 'Pending' && (<div className="flex gap-2"><input type="text" placeholder={`Enter ${refLabel}`} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" id={`cro-${order.id}`} /><button onClick={() => handleConfirmOrder(order.id, document.getElementById(`cro-${order.id}`).value)} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold">Confirm</button></div>)}</div> ); })}</div> )}</div>
    );
  };

  const TripManager = () => { /* Same as before */
    const [tab, setTab] = useState('open'); const [selectedOrderId, setSelectedOrderId] = useState(''); const [tripData, setTripData] = useState({ vehicleId: '', clientId: '', route: '', biltyNo: '', croNo: '', status: 'Open', freightAmount: '', weight: '', description: '', vehicleType: 'Single' }); const [expenses, setExpenses] = useState([{ name: '', amount: '' }]); const [detentionData, setDetentionData] = useState({ orderId: '', tripId: '', amount: '', loloAmount: '', remarks: '' }); const openTrips = transactions.filter(t => t.type === 'Trip' && t.status === 'Open'); const closedTrips = transactions.filter(t => t.type === 'Trip' && t.status === 'Closed'); const busyVehicleIds = new Set(openTrips.map(t => t.vehicleId)); const selectedOrderOrigin = orders.find(o => o.id === selectedOrderId)?.locationFrom; const availableVehicles = accounts.filter(a => { if(a.category !== 'Vehicle') return false; if(busyVehicleIds.has(a.id)) return false; if (selectedOrderOrigin) { const currentLoc = a.currentLocation || 'Lahore'; return currentLoc.toLowerCase().includes(selectedOrderOrigin.toLowerCase()) || selectedOrderOrigin.toLowerCase().includes(currentLoc.toLowerCase()); } return true; }); const confirmedOrders = orders.filter(o => o.status === 'Confirmed' && ((o.fulfilledSingle < o.singleVehicles) || (o.fulfilledDouble < o.doubleVehicles)));
    useEffect(() => { if(selectedOrderId) { const ord = orders.find(o => o.id === selectedOrderId); if(ord) { const defaultType = ord.fulfilledSingle < ord.singleVehicles ? 'Single' : 'Double'; setTripData(prev => ({ ...prev, clientId: ord.clientId, route: `${ord.locationFrom} to ${ord.locationTo}`, croNo: ord.croNo, vehicleType: defaultType, weight: defaultType === 'Single' ? ord.weightSingle : ord.weightDouble, freightAmount: defaultType === 'Single' ? ord.rateSingle : ord.rateDouble })); } } }, [selectedOrderId, orders]);
    const addExpenseRow = () => setExpenses([...expenses, { name: '', amount: '' }]); const removeExpenseRow = (index) => setExpenses(expenses.filter((_, i) => i !== index)); const updateExpense = (idx, field, val) => { const newExp = [...expenses]; newExp[idx][field] = val; setExpenses(newExp); };
    const handleTripSubmit = async (e) => { e.preventDefault(); if (!tripData.vehicleId || !selectedOrderId) return alert("Select Order and Vehicle"); const freight = Number(tripData.freightAmount); let totalExpense = 0; expenses.forEach(exp => { if(exp.amount) totalExpense += Number(exp.amount); }); const vehicleName = accounts.find(a=>a.id===tripData.vehicleId)?.name; const orderRef = orders.find(o => o.id === selectedOrderId)?.orderRef; const desc = `Trip: ${tripData.route} (${vehicleName}) - Order: ${orderRef}`; const entries = [{ accountId: tripData.clientId, type: 'debit', amount: freight }, { accountId: getAccountId('Vehicle Income'), type: 'credit', amount: freight }]; if (totalExpense > 0) { entries.push({ accountId: getAccountId('Trip Expense'), type: 'debit', amount: totalExpense }); entries.push({ accountId: getAccountId('Cash'), type: 'credit', amount: totalExpense }); } await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', tripData.vehicleId), { currentLocation: 'On Trip' }); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { ...tripData, orderId: selectedOrderId, description: desc, totalAmount: freight, expenseDetails: expenses.filter(e => e.name && e.amount), entries, createdAt: serverTimestamp(), type: 'Trip' }); const ord = orders.find(o => o.id === selectedOrderId); const updateField = tripData.vehicleType === 'Single' ? { fulfilledSingle: increment(1) } : { fulfilledDouble: increment(1) }; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', selectedOrderId), updateField); alert("Trip Started!"); setTab('open'); };
    const handleCloseTrip = async (trip) => { const destination = trip.route.split(' to ')[1] || 'Lahore'; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', trip.id), { status: 'Closed' }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', trip.vehicleId), { currentLocation: destination.trim() }); alert(`Trip Completed! Vehicle is now at ${destination}`); setEditingTrip(null); };
    const handleDetentionSubmit = async (e) => { e.preventDefault(); if(!detentionData.tripId || (!detentionData.amount && !detentionData.loloAmount)) return; const detAmount = Number(detentionData.amount) || 0; const loloAmount = Number(detentionData.loloAmount) || 0; const totalAmount = detAmount + loloAmount; const trip = transactions.find(t => t.id === detentionData.tripId); const clientId = trip.entries.find(e => e.type === 'debit')?.accountId; const newEntries = [...trip.entries]; newEntries.push({ accountId: clientId, type: 'debit', amount: totalAmount }); newEntries.push({ accountId: getAccountId('Income'), type: 'credit', amount: totalAmount }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', detentionData.tripId), { detentionAmount: (trip.detentionAmount || 0) + detAmount, loloAmount: (trip.loloAmount || 0) + loloAmount, entries: newEntries, detentionRemarks: detentionData.remarks }); alert("Charges Added!"); setDetentionData({ orderId: '', tripId: '', amount: '', loloAmount: '', remarks: '' }); setTab('open'); };
    const handleUpdateBilty = async () => { if(!editingTrip || !editingTrip.biltyNo) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', editingTrip.id), { biltyNo: editingTrip.biltyNo }); alert("Bilty Updated!"); };
    if (editingTrip) { return ( <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg animate-fade-in"><div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl"><div><h2 className="text-xl font-bold text-slate-800">Manage Trip</h2><p className="text-sm text-slate-500">{editingTrip.description}</p></div><button onClick={() => setEditingTrip(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button></div><div className="p-6 space-y-6"><div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><div className="flex justify-between items-center mb-3"><div><h4 className="font-bold text-blue-800">Trip Status</h4><p className="text-sm text-blue-600">Current: <span className="font-bold">{editingTrip.status}</span></p></div>{editingTrip.status === 'Open' && (<button onClick={() => handleCloseTrip(editingTrip)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Complete & Update Location</button>)}</div><div className="flex gap-2 items-center"><input type="text" placeholder="Edit Bilty No" className="p-2 border border-blue-200 rounded text-sm w-full" value={editingTrip.biltyNo} onChange={(e) => setEditingTrip({...editingTrip, biltyNo: e.target.value})}/><button onClick={handleUpdateBilty} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold">Save Bilty</button></div></div><div><h4 className="font-bold text-slate-800 mb-3">Trip Expenses</h4><div className="space-y-2 mb-4">{editingTrip.expenseDetails?.map((exp, idx) => (<div key={idx} className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="font-medium text-slate-700">{exp.name}</span><span className="font-mono text-slate-600">{formatCurrency(exp.amount)}</span></div>))}</div><p className="text-sm font-bold text-slate-700 mb-2">Add New Expense:</p><form onSubmit={async (e) => { e.preventDefault(); const name = e.target.expName.value; const amount = Number(e.target.expAmount.value); if(!name || !amount) return; const newExpenses = [...(editingTrip.expenseDetails || []), { name, amount }]; const newEntries = [...editingTrip.entries]; newEntries.push({ accountId: getAccountId('Trip Expense'), type: 'debit', amount }); newEntries.push({ accountId: getAccountId('Cash'), type: 'credit', amount }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', editingTrip.id), { expenseDetails: newExpenses, entries: newEntries }); e.target.reset(); setEditingTrip({ ...editingTrip, expenseDetails: newExpenses, entries: newEntries }); }} className="flex gap-2"><input name="expName" type="text" placeholder="Expense Name" className="flex-1 p-2 border border-slate-300 rounded-lg" required /><input name="expAmount" type="number" placeholder="Amount" className="w-32 p-2 border border-slate-300 rounded-lg" required /><button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium">Add</button></form></div></div></div> ); }
    return ( <div className="space-y-6 animate-fade-in"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div><h2 className="text-2xl font-bold text-slate-800">Trip Manager</h2><p className="text-slate-500 text-sm">Manage open trips, assign vehicles, and history.</p></div><div className="flex bg-slate-100 p-1 rounded-lg"><button onClick={() => setTab('open')} className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${tab === 'open' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Open Trips</button><button onClick={() => setTab('new')} className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${tab === 'new' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>+ New Trip</button><button onClick={() => setTab('detention')} className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${tab === 'detention' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Add Extras</button><button onClick={() => setTab('closed')} className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${tab === 'closed' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>History</button></div></div>{tab === 'new' && ( <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto"><h3 className="font-bold text-xl mb-6 text-slate-800">Start Trip from Order</h3><form onSubmit={handleTripSubmit} className="space-y-6"><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-sm font-bold text-slate-700 mb-2">Select Confirmed Order</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} required><option value="">Choose Order...</option>{confirmedOrders.map(o => (<option key={o.id} value={o.id}>{o.orderRef} - {accounts.find(a=>a.id===o.clientId)?.name} ({o.locationTo})</option>))}</select>{selectedOrderId && (<div className="mt-2 text-xs text-slate-500 flex gap-4"><span>Slots: Single ({orders.find(o=>o.id===selectedOrderId)?.singleVehicles - orders.find(o=>o.id===selectedOrderId)?.fulfilledSingle} left)</span><span>Double ({orders.find(o=>o.id===selectedOrderId)?.doubleVehicles - orders.find(o=>o.id===selectedOrderId)?.fulfilledDouble} left)</span></div>)}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-bold text-slate-500 mb-1">Available Vehicle (At {selectedOrderOrigin})</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={tripData.vehicleId} onChange={e => setTripData({...tripData, vehicleId: e.target.value})} required><option value="">Select Vehicle...</option>{availableVehicles.map(a => <option key={a.id} value={a.id}>{a.name} (at {a.currentLocation || 'Lahore'})</option>)}</select></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Vehicle Type (For Slot)</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={tripData.vehicleType} onChange={e => { const ord = orders.find(o=>o.id===selectedOrderId); setTripData({...tripData, vehicleType: e.target.value, freightAmount: e.target.value==='Single' ? ord?.rateSingle : ord?.rateDouble, weight: e.target.value==='Single' ? ord?.weightSingle : ord?.weightDouble}); }}><option>Single</option><option>Double</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Bilty No.</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={tripData.biltyNo} onChange={e => setTripData({...tripData, biltyNo: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Ref / CRO / GD No.</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" value={tripData.croNo} readOnly /></div></div><div className="bg-blue-50 p-5 rounded-2xl border border-blue-100"><h4 className="font-bold text-blue-800 text-sm mb-3">Financials</h4><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-blue-600 mb-1">Total Freight (Rs)</label><input type="number" className="w-full p-3 border border-blue-200 rounded-xl" value={tripData.freightAmount} onChange={e => setTripData({...tripData, freightAmount: e.target.value})} required /></div><div><label className="block text-xs font-bold text-blue-600 mb-1">Weight (MT)</label><input type="number" className="w-full p-3 border border-blue-200 rounded-xl" placeholder="Metric Tons" value={tripData.weight} onChange={e => setTripData({...tripData, weight: e.target.value})} /></div></div></div><div className="bg-orange-50 p-5 rounded-2xl border border-orange-100"><div className="flex justify-between items-center mb-3"><h4 className="font-bold text-orange-800 text-sm">Trip Expenses</h4><button type="button" onClick={addExpenseRow} className="text-xs bg-white text-orange-700 px-2 py-1 rounded border border-orange-200">+ Add</button></div>{expenses.map((exp, idx) => (<div key={idx} className="flex gap-2 mb-2"><input type="text" placeholder="Exp Name" className="flex-1 p-2 border border-orange-200 rounded text-sm" value={exp.name} onChange={e => updateExpense(idx, 'name', e.target.value)} /><input type="number" placeholder="Amount" className="w-24 p-2 border border-orange-200 rounded text-sm" value={exp.amount} onChange={e => updateExpense(idx, 'amount', e.target.value)} /></div>))}</div><button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Start Trip</button></form></div> )}{tab === 'detention' && ( <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto"><h3 className="font-bold text-xl mb-6 text-red-700 flex items-center gap-2"><Anchor /> Add Extra Charges (Detention/LOLO)</h3><form onSubmit={handleDetentionSubmit} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Select Open Trip / Vehicle</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={detentionData.tripId} onChange={e => setDetentionData({...detentionData, tripId: e.target.value})} required><option value="">Select Trip...</option>{openTrips.map(t => (<option key={t.id} value={t.id}>{t.description} - {accounts.find(a=>a.id===t.vehicleId)?.name}</option>))}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Detention Amount</label><input type="number" className="w-full p-3 border border-slate-200 rounded-xl font-bold" value={detentionData.amount} onChange={e => setDetentionData({...detentionData, amount: e.target.value})} placeholder="0" /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">LOLO Charges</label><input type="number" className="w-full p-3 border border-slate-200 rounded-xl font-bold" value={detentionData.loloAmount} onChange={e => setDetentionData({...detentionData, loloAmount: e.target.value})} placeholder="0" /></div></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Remarks</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={detentionData.remarks} onChange={e => setDetentionData({...detentionData, remarks: e.target.value})} /></div><button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Add Charges to Bill</button></form></div> )}{tab === 'open' && ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{openTrips.map(trip => (<div key={trip.id} onClick={() => setEditingTrip(trip)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative"><div className="absolute top-4 right-4 text-blue-100 group-hover:text-blue-600 transition-colors"><Edit2 size={18} /></div><h3 className="font-bold text-slate-800 pr-8">{trip.description.split('(')[0]}</h3><p className="text-sm text-slate-500 font-bold text-blue-600 mb-2">{accounts.find(a => a.id === trip.clientId)?.name}</p><p className="text-xs text-slate-400 mb-3">{trip.description.split('(')[1]?.replace(')', '')}</p><div className="space-y-1 text-sm"><div className="flex justify-between"><span className="text-slate-400">Bilty:</span><span className="font-medium text-slate-700">{trip.biltyNo || 'N/A'}</span></div><div className="flex justify-between"><span className="text-slate-400">Freight:</span><span className="font-medium text-emerald-600">{formatCurrency(trip.totalAmount)}</span></div>{(trip.detentionAmount > 0 || trip.loloAmount > 0) && <div className="flex justify-between text-red-600 font-bold"><span className="text-red-400">Extras:</span><span>{formatCurrency((trip.detentionAmount||0) + (trip.loloAmount||0))}</span></div>}</div><div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">OPEN</span><span className="text-xs text-slate-400">{formatDate(trip.createdAt)}</span></div></div>))}</div> )}{tab === 'closed' && ( <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs"><tr><th className="p-3">Date</th><th className="p-3">Vehicle</th><th className="p-3">Client</th><th className="p-3 text-right">Freight</th><th className="p-3 text-right">Net Profit</th></tr></thead><tbody className="divide-y divide-slate-100">{closedTrips.map((t) => { const totalExp = t.expenseDetails?.reduce((sum, e) => sum + Number(e.amount), 0) || 0; const profit = Number(t.totalAmount) - totalExp; return (<tr key={t.id} className="hover:bg-slate-50"><td className="p-3">{formatDate(t.createdAt)}</td><td className="p-3 font-medium text-slate-800">{accounts.find(a => a.id === t.vehicleId)?.name}</td><td className="p-3 text-slate-600">{accounts.find(a => a.id === t.clientId)?.name}</td><td className="p-3 text-right font-medium">{formatCurrency(t.totalAmount)}</td><td className={`p-3 text-right font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(profit)}</td></tr>); })}</tbody></table></div></div> )}</div>
    );
  };

  const StoreManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sellModal, setSellModal] = useState(null); // { item, type: 'sale'|'issue' }
    const [newItem, setNewItem] = useState({ name: '', qty: '', cost: '' });
    const [txnData, setTxnData] = useState({ buyerId: '', salePrice: '', qty: '' });

    // Handle Adding New Item (Purchase)
    const handleAddItem = async (e) => {
      e.preventDefault();
      if (!newItem.name || !newItem.qty) return;
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), {
        name: newItem.name,
        qty: Number(newItem.qty),
        avgCost: Number(newItem.cost),
        value: Number(newItem.qty) * Number(newItem.cost),
        createdAt: serverTimestamp()
      });
      setNewItem({ name: '', qty: '', cost: '' });
      alert("Item Added to Inventory");
    };

    // Filter Items
    const filteredItems = inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Open Sell Modal
    const openSellModal = (item, type) => {
      setSellModal({ item, type });
      setTxnData({ buyerId: '', salePrice: type === 'issue' ? item.avgCost : '', qty: '' });
    };

    // Process Transaction
    const handleInventoryTransaction = async (e) => {
      e.preventDefault();
      const { item, type } = sellModal;
      const qty = Number(txnData.qty);
      const salePrice = Number(txnData.salePrice);
      
      if (qty > item.qty) return alert("Insufficient Stock");

      const totalCost = qty * item.avgCost;
      const totalSale = qty * salePrice;
      const profit = totalSale - totalCost;

      const entries = [];
      const desc = type === 'sale' ? `Sold ${qty} ${item.name}` : `Issued ${qty} ${item.name} to Vehicle`;

      // Accounting Entries
      if (type === 'sale') {
         // Debit Buyer/Cash
         entries.push({ accountId: txnData.buyerId, type: 'debit', amount: totalSale });
         // Credit Inventory Asset (Cost)
         const invAssetId = getAccountId('Store Inventory'); // System will autocreate if missing
         if (invAssetId) entries.push({ accountId: invAssetId, type: 'credit', amount: totalCost });
         
         // Credit Profit (Remaining)
         const profitId = getAccountId('Inventory Profit');
         if (profitId && profit > 0) entries.push({ accountId: profitId, type: 'credit', amount: profit });
      } else {
         // Issue (Internal)
         // Debit Vehicle Expense (using buyerId as Vehicle ID here)
         entries.push({ accountId: txnData.buyerId, type: 'debit', amount: totalCost });
         // Credit Inventory Asset
         const invAssetId = getAccountId('Store Inventory');
         if (invAssetId) entries.push({ accountId: invAssetId, type: 'credit', amount: totalCost });
      }

      // Save Transaction
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        description: desc,
        totalAmount: totalSale,
        entries,
        createdAt: serverTimestamp(),
        type: type === 'sale' ? 'Inventory Sale' : 'Inventory Issue'
      });

      // Update Inventory Qty
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'inventory', item.id), {
        qty: increment(-qty)
      });

      alert("Transaction Recorded!");
      setSellModal(null);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Top: Add New & Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input type="text" placeholder="Item Name (e.g. Tyres)" className="w-full p-3 border border-slate-200 rounded-xl" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
              <div className="flex gap-3">
                <input type="number" placeholder="Qty" className="flex-1 p-3 border border-slate-200 rounded-xl" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: e.target.value})} required />
                <input type="number" placeholder="Cost" className="flex-1 p-3 border border-slate-200 rounded-xl" value={newItem.cost} onChange={e => setNewItem({...newItem, cost: e.target.value})} required />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">Add to Stock</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
             <h3 className="font-bold text-lg mb-4 text-slate-800">Search Inventory</h3>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Item Name..." 
                  className="w-full pl-10 p-3 border border-slate-200 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex-1 overflow-y-auto max-h-60 space-y-2">
                {filteredItems.map(item => (
                  <div key={item.id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50">
                     <div>
                       <p className="font-bold text-slate-700">{item.name}</p>
                       <p className="text-xs text-slate-500">Qty: {item.qty} • Cost: {formatCurrency(item.avgCost)}</p>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => openSellModal(item, 'issue')} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 text-slate-600">Issue</button>
                        <button onClick={() => openSellModal(item, 'sale')} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 font-bold">Sell</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sell/Issue Modal */}
        {sellModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-xl text-slate-800">{sellModal.type === 'sale' ? 'Sell Inventory' : 'Issue to Vehicle'}</h3>
                   <button onClick={() => setSellModal(null)}><X /></button>
                </div>
                
                <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                   <p className="text-sm font-bold text-slate-700">{sellModal.item.name}</p>
                   <p className="text-xs text-slate-500">Available: {sellModal.item.qty}</p>
                   <p className="text-xs text-slate-500">Avg Cost: {formatCurrency(sellModal.item.avgCost)}</p>
                </div>

                <form onSubmit={handleInventoryTransaction} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">{sellModal.type === 'sale' ? 'Buyer / Cash' : 'Select Vehicle'}</label>
                     <select className="w-full p-3 border border-slate-200 rounded-xl" value={txnData.buyerId} onChange={(e) => setTxnData({...txnData, buyerId: e.target.value})} required>
                        <option value="">Select...</option>
                        {accounts.filter(a => sellModal.type === 'sale' ? (a.category === 'Client' || a.category === 'Cash') : a.category === 'Vehicle').map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                     </select>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Quantity</label>
                       <input type="number" className="w-full p-3 border border-slate-200 rounded-xl" value={txnData.qty} onChange={(e) => setTxnData({...txnData, qty: e.target.value})} max={sellModal.item.qty} required />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">{sellModal.type === 'sale' ? 'Sale Price' : 'Cost Price'}</label>
                       <input 
                         type="number" 
                         className="w-full p-3 border border-slate-200 rounded-xl" 
                         value={txnData.salePrice} 
                         onChange={(e) => setTxnData({...txnData, salePrice: e.target.value})} 
                         readOnly={sellModal.type === 'issue'} // Lock price if issuing
                         required 
                       />
                     </div>
                   </div>

                   {sellModal.type === 'sale' && txnData.salePrice && txnData.qty && (
                      <div className="text-right text-xs font-bold text-emerald-600">
                         Est. Profit: {formatCurrency((txnData.salePrice - sellModal.item.avgCost) * txnData.qty)}
                      </div>
                   )}

                   <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Confirm Transaction</button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  // Re-Use other components
  const PaymentsManager = () => { /* Same Payments logic */
    const [mode, setMode] = useState('in');
    const [payData, setPayData] = useState({ date: new Date().toISOString().split('T')[0], partyId: '', accountId: '', amount: '', method: 'Cash', chequeNo: '', bankName: '', description: '' });
    const handleSubmit = async (e) => { e.preventDefault(); if (!payData.partyId || !payData.accountId || !payData.amount) return; const amount = Number(payData.amount); const partyName = accounts.find(a => a.id === payData.partyId)?.name; const accountName = accounts.find(a => a.id === payData.accountId)?.name; let desc = mode === 'in' ? `Received from ${partyName}` : `Paid to ${partyName}`; desc += ` via ${payData.method}`; if (payData.method === 'Cheque') desc += ` (Chq# ${payData.chequeNo} - ${payData.bankName})`; else if (payData.method === 'Online') desc += ` (${accountName})`; if (payData.description) desc += ` - ${payData.description}`; const entries = []; if (mode === 'in') { entries.push({ accountId: payData.accountId, type: 'debit', amount }); entries.push({ accountId: payData.partyId, type: 'credit', amount }); } else { entries.push({ accountId: payData.partyId, type: 'debit', amount }); entries.push({ accountId: payData.accountId, type: 'credit', amount }); } await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { description: desc, totalAmount: amount, entries, createdAt: serverTimestamp(), type: 'Payment', paymentMethod: payData.method, chequeDetails: payData.method === 'Cheque' ? { number: payData.chequeNo, bank: payData.bankName } : null, userDate: payData.date }); alert("Payment Recorded!"); setPayData({ ...payData, amount: '', chequeNo: '', bankName: '', description: '' }); };
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in"><div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm"><button onClick={() => setMode('in')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'in' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500'}`}><ArrowDownLeft size={18} /> Receive Payment</button><button onClick={() => setMode('out')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'out' ? 'bg-red-50 text-red-700 shadow-sm' : 'text-slate-500'}`}><ArrowUpRight size={18} /> Make Payment</button></div><div className={`p-8 rounded-2xl border shadow-sm ${mode === 'in' ? 'bg-white border-emerald-100' : 'bg-white border-red-100'}`}><h3 className={`font-bold text-xl mb-6 ${mode === 'in' ? 'text-emerald-800' : 'text-red-800'}`}>{mode === 'in' ? 'Payment Received' : 'Payment Made'}</h3><form onSubmit={handleSubmit} className="space-y-5"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Date</label><input type="date" className="w-full p-3 border border-slate-200 rounded-xl" value={payData.date} onChange={e => setPayData({...payData, date: e.target.value})} required /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Amount</label><div className="relative"><span className="absolute left-3 top-3 text-slate-400 font-bold">Rs</span><input type="number" className="w-full pl-10 p-3 border border-slate-200 rounded-xl font-bold" value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})} required /></div></div></div><div><label className="block text-xs font-bold text-slate-500 mb-1">{mode === 'in' ? 'Received From (Party)' : 'Paid To (Party)'}</label><select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" value={payData.partyId} onChange={e => setPayData({...payData, partyId: e.target.value})} required><option value="">Select Account...</option>{accounts.filter(a => mode === 'in' ? a.category === 'Client' : true).map(a => <option key={a.id} value={a.id}>{a.name} ({a.category})</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Payment Method</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={payData.method} onChange={e => setPayData({...payData, method: e.target.value})}><option value="Cash">Cash</option><option value="Cheque">Cheque</option><option value="Online">Online / Bank Transfer</option></select></div><div><label className="block text-xs font-bold text-slate-500 mb-1">{mode === 'in' ? 'Deposit Into' : 'Paid From'}</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={payData.accountId} onChange={e => setPayData({...payData, accountId: e.target.value})} required><option value="">Select Cash/Bank...</option>{accounts.filter(a => ['Cash', 'Bank'].includes(a.category)).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div></div>{payData.method === 'Cheque' && (<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in"><h4 className="font-bold text-slate-700 text-sm mb-3">Cheque Details</h4><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Cheque No." className="p-3 border border-slate-200 rounded-xl" value={payData.chequeNo} onChange={e => setPayData({...payData, chequeNo: e.target.value})} /><input type="text" placeholder="Bank Name" className="p-3 border border-slate-200 rounded-xl" value={payData.bankName} onChange={e => setPayData({...payData, bankName: e.target.value})} /></div></div>)}<input type="text" placeholder="Description / Remarks" className="w-full p-3 border border-slate-200 rounded-xl" value={payData.description} onChange={e => setPayData({...payData, description: e.target.value})} /><button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${mode === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>{mode === 'in' ? 'Save Receipt' : 'Save Payment'}</button></form></div></div>
    );
  };

  const AccountManager = () => { /* Same Account Manager */
    const [formData, setFormData] = useState({ id: null, name: '', category: 'Client', type: 'Asset' });
    const [filter, setFilter] = useState('all');
    const handleSave = async (e) => { e.preventDefault(); if (!formData.name) return; let type = 'Asset'; if (['Client', 'Vehicle', 'Bank', 'Cash'].includes(formData.category)) type = 'Asset'; if (['Vendor', 'Liability'].includes(formData.category)) type = 'Liability'; if (['Income'].includes(formData.category)) type = 'Income'; if (['Expense'].includes(formData.category)) type = 'Expense'; if (['Capital'].includes(formData.category)) type = 'Capital'; if (formData.id) { const { id, ...data } = formData; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', id), { ...data, type }); } else { const { id, ...data } = formData; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'), { ...data, type, createdAt: serverTimestamp(), currentLocation: formData.category === 'Vehicle' ? 'Lahore' : null }); } setFormData({ id: null, name: '', category: 'Client', type: 'Asset' }); };
    const handleDelete = async (id) => { if(window.confirm('Delete this account?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', id)); };
    const categories = ['Client', 'Vehicle', 'Vendor', 'Cash', 'Bank', 'Expense', 'Income', 'Capital', 'Liability'];
    const filteredAccounts = accounts.filter(a => filter === 'all' || a.category === filter);
    return (
      <div className="space-y-6 animate-fade-in"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-bold text-lg mb-4">{formData.id ? 'Edit Account' : 'Add New Account'}</h3><form onSubmit={handleSave} className="flex flex-col md:flex-row gap-4 items-end"><div className="flex-1 w-full"><label className="text-xs font-bold text-slate-500 mb-1 block">Account Name</label><input type="text" placeholder="e.g., Al Wahab Goods / Meezan Bank" className="w-full p-3 border border-slate-200 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div className="w-full md:w-48"><label className="text-xs font-bold text-slate-500 mb-1 block">Category</label><select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="flex gap-2 w-full md:w-auto"><button type="submit" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">{formData.id ? 'Update' : 'Add'}</button></div></form></div><div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto"><button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${filter === 'all' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>All</button>{categories.map(c => (<button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${filter === c ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>{c}</button>))}</div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200"><tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Location</th><th className="p-4 text-right">Balance</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredAccounts.map(acc => (<tr key={acc.id} className="hover:bg-slate-50 group"><td className="p-4 font-medium text-slate-800">{acc.name}</td><td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{acc.category}</span></td><td className="p-4 text-xs text-slate-500">{acc.currentLocation || '-'}</td><td className={`p-4 text-right font-mono font-medium ${accountBalances[acc.id] < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(accountBalances[acc.id]))}</td><td className="p-4 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setFormData(acc)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 size={16}/></button><button onClick={() => handleDelete(acc.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button></div></td></tr>))}</tbody></table></div></div></div>
    );
  };

  const Reports = () => { /* Same Reports */
    const [reportType, setReportType] = useState('ledger');
    const [selectedAccount, setSelectedAccount] = useState('');
    const ledgerEntries = useMemo(() => { if (!selectedAccount) return []; const entries = []; transactions.forEach(t => { t.entries?.forEach(e => { if (e.accountId === selectedAccount) entries.push({ date: t.createdAt, desc: t.description, debit: e.type==='debit'?e.amount:0, credit: e.type==='credit'?e.amount:0 }); }); }); return entries; }, [selectedAccount, transactions]);
    const trialBalance = useMemo(() => { return accounts.map(acc => { const bal = accountBalances[acc.id] || 0; return { ...acc, debit: bal > 0 ? bal : 0, credit: bal < 0 ? Math.abs(bal) : 0 }; }).filter(a => a.debit > 0 || a.credit > 0); }, [accounts, accountBalances]);
    const balanceSheet = useMemo(() => { const assets = accounts.filter(a => a.type === 'Asset').map(a => ({...a, amount: accountBalances[a.id] || 0})); const liabilities = accounts.filter(a => a.type === 'Liability').map(a => ({...a, amount: Math.abs(accountBalances[a.id] || 0)})); const capital = accounts.filter(a => a.type === 'Capital').map(a => ({...a, amount: Math.abs(accountBalances[a.id] || 0)})); const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0); const totalLiabilities = liabilities.reduce((sum, a) => sum + a.amount, 0); const totalCapital = capital.reduce((sum, a) => sum + a.amount, 0); return { assets, liabilities, capital, totalAssets, totalLiabilities, totalCapital }; }, [accounts, accountBalances]);
    return (
      <div className="space-y-6 animate-fade-in"><div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto"><button onClick={() => setReportType('ledger')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${reportType === 'ledger' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><BookOpen size={16} className="inline mr-2"/>General Ledger</button><button onClick={() => setReportType('trial')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${reportType === 'trial' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><Scale size={16} className="inline mr-2"/>Trial Balance</button><button onClick={() => setReportType('pnl')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${reportType === 'pnl' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><TrendingUp size={16} className="inline mr-2"/>Profit & Loss</button><button onClick={() => setReportType('bs')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${reportType === 'bs' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><Landmark size={16} className="inline mr-2"/>Balance Sheet</button></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">{reportType === 'ledger' && (<div><h3 className="font-bold text-lg mb-4">General Ledger</h3><select className="w-full p-3 border border-slate-200 rounded-xl mb-4" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}><option value="">Select Account...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.category})</option>)}</select>{selectedAccount && (<div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th></tr></thead><tbody className="divide-y divide-slate-100">{ledgerEntries.map((e, idx) => (<tr key={idx}><td className="p-3 text-slate-500">{formatDate(e.date)}</td><td className="p-3 font-medium">{e.desc}</td><td className="p-3 text-right text-slate-500">{e.debit > 0 ? formatCurrency(e.debit) : '-'}</td><td className="p-3 text-right text-slate-500">{e.credit > 0 ? formatCurrency(e.credit) : '-'}</td></tr>))}<tr className="bg-slate-50 font-bold"><td colSpan="2" className="p-3 text-right">Closing Balance</td><td colSpan="2" className="p-3 text-right">{formatCurrency(accountBalances[selectedAccount] || 0)}</td></tr></tbody></table></div>)}</div>)}{reportType === 'trial' && (<div><h3 className="font-bold text-lg mb-4 text-slate-800">Trial Balance</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-3">Account Name</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th></tr></thead><tbody className="divide-y divide-slate-100">{trialBalance.map(acc => (<tr key={acc.id}><td className="p-3 font-medium text-slate-700">{acc.name}</td><td className="p-3 text-right">{acc.debit > 0 ? formatCurrency(acc.debit) : '-'}</td><td className="p-3 text-right">{acc.credit > 0 ? formatCurrency(acc.credit) : '-'}</td></tr>))}<tr className="bg-slate-100 font-bold border-t-2 border-slate-200"><td className="p-4">TOTALS</td><td className="p-4 text-right">{formatCurrency(trialBalance.reduce((s, a) => s + a.debit, 0))}</td><td className="p-4 text-right">{formatCurrency(trialBalance.reduce((s, a) => s + a.credit, 0))}</td></tr></tbody></table></div></div>)}{reportType === 'pnl' && (<div><h3 className="font-bold text-lg mb-6 text-slate-800 flex items-center gap-2">Profit & Loss Statement</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100"><h4 className="font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">Income (Revenue)</h4><div className="flex justify-between font-bold text-lg"><span>Total Income</span><span>{formatCurrency(pnlStats.income)}</span></div></div><div className="bg-red-50 rounded-xl p-6 border border-red-100"><h4 className="font-bold text-red-800 mb-4 border-b border-red-200 pb-2">Expenses</h4><div className="flex justify-between font-bold text-lg"><span>Total Expenses</span><span>{formatCurrency(pnlStats.expense)}</span></div></div></div><div className={`mt-6 p-6 rounded-xl text-center border-2 ${pnlStats.profit >= 0 ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-red-100 border-red-300 text-red-800'}`}><p className="text-sm font-bold uppercase tracking-widest mb-1">Net Profit / Loss</p><h2 className="text-4xl font-black">{formatCurrency(pnlStats.profit)}</h2></div></div>)}{reportType === 'bs' && (<div><h3 className="font-bold text-lg mb-6 text-slate-800">Balance Sheet</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="border border-slate-200 rounded-xl overflow-hidden"><div className="bg-slate-100 p-3 font-bold text-slate-700">Assets</div><div className="p-4 space-y-2">{balanceSheet.assets.map(a => (<div key={a.id} className="flex justify-between text-sm"><span>{a.name}</span><span>{formatCurrency(a.amount)}</span></div>))}</div><div className="bg-slate-50 p-3 font-bold flex justify-between border-t border-slate-200"><span>Total Assets</span><span>{formatCurrency(balanceSheet.totalAssets)}</span></div></div><div className="border border-slate-200 rounded-xl overflow-hidden"><div className="bg-slate-100 p-3 font-bold text-slate-700">Liabilities & Equity</div><div className="p-4 space-y-2"><p className="text-xs font-bold text-slate-400 uppercase mt-2">Liabilities</p>{balanceSheet.liabilities.map(a => (<div key={a.id} className="flex justify-between text-sm"><span>{a.name}</span><span>{formatCurrency(a.amount)}</span></div>))}<p className="text-xs font-bold text-slate-400 uppercase mt-4">Capital / Equity</p>{balanceSheet.capital.map(a => (<div key={a.id} className="flex justify-between text-sm"><span>{a.name}</span><span>{formatCurrency(a.amount)}</span></div>))}<div className="flex justify-between text-sm font-medium text-emerald-600"><span>Current Net Profit</span><span>{formatCurrency(pnlStats.profit)}</span></div></div><div className="bg-slate-50 p-3 font-bold flex justify-between border-t border-slate-200"><span>Total L & E</span><span>{formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalCapital + pnlStats.profit)}</span></div></div></div></div>)}</div></div>
    );
  };

  const Sidebar = ({ mobile }) => (
    <div className={`bg-slate-900 text-white h-full flex flex-col ${mobile ? 'w-full' : 'w-64'} print:hidden`}>
      <div className="p-6 border-b border-slate-800"><div className="flex items-center gap-3 mb-1"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Truck size={18}/></div><span className="font-bold text-xl tracking-tight">FleetX</span></div><p className="text-xs text-slate-500 pl-11">Azam Afridi Goods Transport</p></div>
      <nav className="flex-1 p-4 space-y-1">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'order-manager', icon: ClipboardList, label: 'Order Manager' },
          { id: 'trip-manager', icon: AlertCircle, label: 'Trip Manager' },
          { id: 'payments', icon: Banknote, label: 'Payments' },
          { id: 'billing', icon: FileText, label: 'Billing / Invoice' },
          { id: 'accounts', icon: Users, label: 'Accounts' },
          { id: 'store', icon: Package, label: 'Store/Inventory' },
          { id: 'reports', icon: TrendingUp, label: 'Accounting Reports' },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveView(item.id); if(mobile) setIsMobileMenuOpen(false); setDashboardFilter(null); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === item.id ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><item.icon size={18} /> <span className="font-medium text-sm">{item.label}</span></button>
        ))}
      </nav>
      {isAuthenticated && (
        <button onClick={handleLogout} className="m-4 flex items-center gap-3 p-3 rounded-xl transition-all text-red-400 hover:bg-red-900/30 hover:text-red-300">
          <LogOut size={18} /> <span className="font-medium text-sm">Logout</span>
        </button>
      )}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 bg-slate-50">Loading System...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 print:hidden"><div className="flex items-center gap-2"><Truck size={20} /><span className="font-bold">FleetX</span></div><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X /> : <Menu />}</button></div>
      {isMobileMenuOpen && <div className="fixed inset-0 z-10 bg-slate-900 pt-16 md:hidden"><Sidebar mobile /></div>}
      <aside className="hidden md:block h-screen sticky top-0"><Sidebar /></aside>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full print:p-0 print:w-full print:max-w-none">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'order-manager' && <OrderManager />}
        {activeView === 'trip-manager' && <TripManager />}
        {activeView === 'payments' && <PaymentsManager />}
        {activeView === 'billing' && <BillingView />}
        {activeView === 'accounts' && <AccountManager />}
        {activeView === 'store' && <StoreManager />}
        {activeView === 'reports' && <Reports />}
      </main>
    </div>
  );
}
