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
  LogOut
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
  writeBatch,
  getDoc
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

// Data Path ID (Fixed to prevent data loss)
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
         // Still loading
      } else {
         setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [firebaseError]);

  // Real-time Data Sync
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

  // Sync Editing Trip with Live Data (Fixes expense not showing issue)
  useEffect(() => {
    if (editingTrip) {
      const liveTrip = transactions.find(t => t.id === editingTrip.id);
      if (liveTrip) {
        setEditingTrip(liveTrip);
      }
    }
  }, [transactions]); // Sync whenever transactions update

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

  // --- Helper: Auto Create System Accounts ---
  const ensureSystemAccounts = async () => {
    const required = [
      { name: 'Vehicle Income', category: 'Income', type: 'Income' },
      { name: 'Trip Expense', category: 'Expense', type: 'Expense' },
      { name: 'Inventory Profit', category: 'Income', type: 'Income' },
      { name: 'Store Inventory', category: 'Asset', type: 'Asset' },
      { name: 'Cash', category: 'Cash', type: 'Asset' },
      { name: 'Income', category: 'Income', type: 'Income' } // General Income
    ];
    
    for (let req of required) {
      const exists = accounts.find(a => a.name.toLowerCase() === req.name.toLowerCase());
      if (!exists && user) {
         try {
           await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'), { 
             ...req, 
             createdAt: serverTimestamp() 
           });
         } catch (e) {
           console.error("Error creating system account:", e);
         }
      }
    }
  };
  
  useEffect(() => {
    if(accounts.length > 0 && user) ensureSystemAccounts();
  }, [accounts.length, user]);

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
    const found = accounts.find(a => a.name.toLowerCase().includes(nameLike.toLowerCase()));
    return found ? found.id : null;
  };

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

    let generalExpense = 0;
    transactions.filter(t => t.type === 'General' || t.type === 'Payment').forEach(t => {
       t.entries?.forEach(e => {
         const acc = accounts.find(a => a.id === e.accountId);
         if(acc && acc.type === 'Expense' && e.type === 'debit') generalExpense += Number(e.amount);
       });
    });

    return { income: totalIncome, expense: totalExpense, profit: closedTripProfit - generalExpense };
  }, [transactions, accounts, accountBalances]);

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Truck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">FleetX</h1>
            <p className="text-slate-500 text-sm">Secure Login Panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter username"
                value={loginCreds.username}
                onChange={(e) => setLoginCreds({...loginCreds, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter password"
                value={loginCreds.password}
                onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})}
              />
            </div>
            
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Access Dashboard
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">
            Developer - Waqas Gilani - ERP - FleetX
          </div>
          {firebaseError && (
            <div className="mt-4 p-3 bg-orange-50 text-orange-600 text-xs rounded border border-orange-200 text-center">
              System Check: {firebaseError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Views ---

  const Dashboard = () => {
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
      
      if (dashboardFilter === 'receivables') {
        listData = receivableAccounts;
        title = 'Receivables Detail';
      } else if (dashboardFilter === 'payables') {
        listData = payableAccounts;
        title = 'Payables Detail';
      } else if (dashboardFilter === 'outstation') {
        listData = vehiclesOut;
        title = 'Fleet Outstation Details';
      }

      return (
        <div className="animate-fade-in space-y-4">
          <button onClick={() => setDashboardFilter(null)} className="flex items-center text-slate-500 hover:text-slate-800"><ArrowRight className="rotate-180 mr-1" size={16}/> Back to Dashboard</button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-lg">{title}</div>
            <div className="divide-y divide-slate-100">
              {listData.map(acc => {
                if (dashboardFilter === 'outstation') {
                  const activeTrip = transactions.find(t => t.type === 'Trip' && t.status === 'Open' && t.vehicleId === acc.id);
                  const order = activeTrip ? orders.find(o => o.id === activeTrip.orderId) : null;
                  const clientName = order ? accounts.find(a => a.id === order.clientId)?.name : 'N/A';
                  return (
                    <div key={acc.id} className="p-4 hover:bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 block">{acc.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> Current: {acc.currentLocation}</span>
                        </div>
                        <div className="text-right text-xs">
                          {activeTrip ? (
                            <>
                              <span className="block text-emerald-600 font-bold">On Active Trip</span>
                              <span className="block text-slate-500">Client: {clientName}</span>
                              <span className="block text-slate-400">{activeTrip.route}</span>
                            </>
                          ) : (
                            <span className="text-orange-500 font-bold">Idle / Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={acc.id} className="p-4 flex justify-between items-center">
                      <span className="font-medium text-slate-700">{acc.name}</span>
                      <span className={`font-mono font-bold ${accountBalances[acc.id] < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(accountBalances[acc.id]))}</span>
                    </div>
                  );
                }
              })}
              {listData.length === 0 && <div className="p-8 text-center text-slate-400">No records found.</div>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {firebaseError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
             <AlertCircle size={24} />
             <div>
               <p className="font-bold">Database Connection Error</p>
               <p className="text-sm">{firebaseError}</p>
             </div>
          </div>
        )}

        {/* Row 1: Fleet & Trips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-slate-800 p-4 rounded-2xl text-white shadow-md">
              <p className="text-slate-300 text-xs uppercase tracking-wider mb-1">Fleet in Lahore</p>
              <h3 className="text-2xl font-bold flex items-center gap-2"><MapPin size={20} className="text-red-400" /> {vehiclesInLahore}</h3>
           </div>
           <button onClick={() => setDashboardFilter('outstation')} className="bg-slate-700 p-4 rounded-2xl text-white shadow-md text-left hover:bg-slate-600 transition-colors">
              <p className="text-slate-300 text-xs uppercase tracking-wider mb-1">Fleet Outstation</p>
              <h3 className="text-2xl font-bold flex items-center gap-2"><Truck size={20} className="text-blue-400" /> {vehiclesOut.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Click for Details</p>
           </button>
           <button onClick={() => setActiveView('trip-manager')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-blue-300 hover:shadow-md transition-all">
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Trips</p>
             <h3 className="text-2xl font-bold mt-1 text-slate-800">{openTripsCount}</h3>
           </button>
           <button onClick={() => setActiveView('reports')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-emerald-300 hover:shadow-md transition-all">
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Net Profit</p>
             <h3 className={`text-2xl font-bold mt-1 ${pnlStats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(pnlStats.profit)}</h3>
           </button>
        </div>

        {/* Row 2: Financials */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => setDashboardFilter('receivables')} className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl text-white shadow-lg text-left hover:scale-[1.02] transition-transform">
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Receivables</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(receivables)}</h3>
            <p className="text-[10px] text-blue-200 mt-2 flex items-center gap-1">Click to view list <ArrowRight size={10}/></p>
          </button>
          
          <button onClick={() => setDashboardFilter('payables')} className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm text-left hover:border-red-400 hover:shadow-md transition-all group">
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Payables (Vendors)</p>
             <h3 className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(payables)}</h3>
             <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 group-hover:text-red-500">Click to view list <ArrowRight size={10}/></p>
          </button>

          <button onClick={() => setActiveView('order-manager')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-orange-300 hover:shadow-md transition-all group">
             <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending Orders</p>
             <h3 className="text-2xl font-bold mt-1 text-orange-600">{pendingOrders}</h3>
             <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 group-hover:text-orange-500">Need CRO/Action <ArrowRight size={10}/></p>
          </button>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start"><div><p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Cash In Hand</p><h3 className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(cashInHand)}</h3></div><Wallet className="text-emerald-100" size={24} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2"><CreditCard size={18} className="text-slate-500"/><h3 className="font-bold text-slate-800">Bank Accounts</h3></div>
            <div className="divide-y divide-slate-100">{bankAccounts.map(acc => (<div key={acc.id} className="p-4 flex justify-between items-center hover:bg-slate-50"><span className="text-sm font-medium text-slate-700">{acc.name}</span><span className="font-mono font-bold text-slate-800 text-sm">{formatCurrency(accountBalances[acc.id] || 0)}</span></div>))}</div>
          </div>
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-bold text-slate-800">Recent Activity</h3><button onClick={() => setActiveView('trip-manager')} className="text-sm text-blue-600 hover:underline">View All Trips</button></div>
            <div className="divide-y divide-slate-100">{transactions.slice(0, 5).map(t => (<div key={t.id} className="p-4 hover:bg-slate-50 transition-colors"><div className="flex justify-between items-start"><div><div className="flex items-center gap-2">{t.type === 'Payment' ? <Banknote size={16} className="text-slate-400"/> : null}<p className="font-semibold text-slate-800">{t.description}</p>{t.status && (<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{t.status.toUpperCase()}</span>)}</div><p className="text-xs text-slate-500">{formatDate(t.createdAt)} • Ref: {t.id.slice(0, 4)}</p></div><span className="font-mono font-medium text-slate-700">{formatCurrency(t.totalAmount || t.entries?.[0]?.amount)}</span></div></div>))}</div>
          </div>
        </div>
      </div>
    );
  };

  const OrderManager = () => {
    const [mode, setMode] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [newOrder, setNewOrder] = useState({
      clientId: '', locationFrom: 'Lahore', locationTo: 'Karachi', weight: '',
      singleVehicles: 0, doubleVehicles: 0,
      rateSingle: '', rateDouble: '',
      weightSingle: '', weightDouble: '',
      containerSize: '20ft', type: 'Local', croNo: '', status: 'Pending',
      invoiceStatus: 'Unbilled',
      fulfilledSingle: 0, fulfilledDouble: 0
    });

    const getRefLabel = () => {
      if (newOrder.type === 'Import') return 'GD Number';
      if (newOrder.type === 'Export') return 'CRO Number';
      return 'Ref / Bilty / GD No';
    };

    const handleSaveOrder = async (e) => {
      e.preventDefault();
      if (!newOrder.clientId || !newOrder.locationFrom) return alert('Please fill basics');
      const status = newOrder.croNo ? 'Confirmed' : 'Pending';
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', editingId), { ...newOrder, status });
        alert('Order Updated Successfully!');
      } else {
        const orderRef = generateOrderId();
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), { ...newOrder, orderRef, status, createdAt: serverTimestamp() });
        alert('Order Booked Successfully!');
      }
      resetForm();
    };

    const handleEditOrder = (order) => {
      setNewOrder({
        clientId: order.clientId, locationFrom: order.locationFrom, locationTo: order.locationTo, weight: order.weight,
        weightSingle: order.weightSingle || '', weightDouble: order.weightDouble || '',
        singleVehicles: order.singleVehicles, doubleVehicles: order.doubleVehicles,
        rateSingle: order.rateSingle, rateDouble: order.rateDouble,
        containerSize: order.containerSize, type: order.type, croNo: order.croNo || '',
        status: order.status, invoiceStatus: order.invoiceStatus || 'Unbilled',
        fulfilledSingle: order.fulfilledSingle || 0, fulfilledDouble: order.fulfilledDouble || 0
      });
      setEditingId(order.id);
      setMode('new');
    };

    const handleConfirmOrder = async (id, cro) => {
      if(!cro) return alert('Enter Ref Number');
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { croNo: cro, status: 'Confirmed' });
    };

    const resetForm = () => {
      setNewOrder({ clientId: '', locationFrom: 'Lahore', locationTo: 'Karachi', weight: '', weightSingle: '', weightDouble: '', singleVehicles: 0, doubleVehicles: 0, rateSingle: '', rateDouble: '', containerSize: '20ft', type: 'Local', croNo: '', status: 'Pending', invoiceStatus: 'Unbilled', fulfilledSingle: 0, fulfilledDouble: 0 });
      setEditingId(null);
      setMode('list');
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Order Manager</h2><button onClick={() => mode === 'list' ? setMode('new') : resetForm()} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${mode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{mode === 'list' ? <><Plus size={18}/> New Booking</> : 'Cancel / View List'}</button></div>
        {mode === 'new' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto"><h3 className="font-bold text-lg mb-4">{editingId ? 'Edit Order' : 'Book New Order'}</h3>
            <form onSubmit={handleSaveOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Client</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.clientId} onChange={e => setNewOrder({...newOrder, clientId: e.target.value})} required><option value="">Select Client...</option>{accounts.filter(a => a.category === 'Client').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-slate-500 mb-1">Type</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.type} onChange={e => setNewOrder({...newOrder, type: e.target.value})}><option>Local</option><option>Import</option><option>Export</option><option>Shifting</option><option>Open</option></select></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Size</label><select className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.containerSize} onChange={e => setNewOrder({...newOrder, containerSize: e.target.value})}><option>20ft</option><option>40ft</option></select></div></div>
              </div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">From</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.locationFrom} onChange={e => setNewOrder({...newOrder, locationFrom: e.target.value})} required /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">To</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.locationTo} onChange={e => setNewOrder({...newOrder, locationTo: e.target.value})} required /></div></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Total Est. Order Weight (MT)</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: e.target.value})} /></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 text-sm mb-3">Vehicles & Rates</h4>
                <div className="grid grid-cols-3 gap-3 mb-2"><div><label className="block text-xs font-bold text-slate-500 mb-1">Single Veh Qty</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newOrder.singleVehicles} onChange={e => setNewOrder({...newOrder, singleVehicles: Number(e.target.value)})} /></div><div><label className="block text-xs font-bold text-emerald-600 mb-1">Rate (Single)</label><input type="number" className="w-full p-2 border border-emerald-200 rounded-lg" placeholder="Rate" value={newOrder.rateSingle} onChange={e => setNewOrder({...newOrder, rateSingle: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Weight (MT)</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Load" value={newOrder.weightSingle} onChange={e => setNewOrder({...newOrder, weightSingle: e.target.value})} /></div></div>
                <div className="grid grid-cols-3 gap-3"><div><label className="block text-xs font-bold text-slate-500 mb-1">Double Veh Qty</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newOrder.doubleVehicles} onChange={e => setNewOrder({...newOrder, doubleVehicles: Number(e.target.value)})} /></div><div><label className="block text-xs font-bold text-emerald-600 mb-1">Rate (Double)</label><input type="number" className="w-full p-2 border border-emerald-200 rounded-lg" placeholder="Rate" value={newOrder.rateDouble} onChange={e => setNewOrder({...newOrder, rateDouble: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Weight (MT)</label><input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Load" value={newOrder.weightDouble} onChange={e => setNewOrder({...newOrder, weightDouble: e.target.value})} /></div></div>
              </div>
              <div className="pt-2"><label className="block text-xs font-bold text-slate-500 mb-1">{getRefLabel()}</label><input type="text" className="w-full p-3 border border-slate-200 rounded-xl" value={newOrder.croNo} onChange={e => setNewOrder({...newOrder, croNo: e.target.value})} placeholder="Enter to confirm instantly (Optional)"/></div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">{editingId ? 'Update Order' : 'Save Booking'}</button>
            </form>
          </div>
        )}
        {mode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map(order => {
              const pendingSingle = order.singleVehicles - order.fulfilledSingle;
              const pendingDouble = order.doubleVehicles - order.fulfilledDouble;
              const refLabel = order.type === 'Import' ? 'GD No' : (order.type === 'Export' ? 'CRO No' : 'Ref');
              return (
                <div key={order.id} className={`p-5 rounded-xl border-l-4 shadow-sm bg-white group relative ${order.status === 'Confirmed' ? 'border-l-emerald-500' : 'border-l-orange-400'}`}>
                  <button onClick={() => handleEditOrder(order)} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors z-10" title="Edit Order"><Edit2 size={16} /></button>
                  <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-800">{order.orderRef} • {accounts.find(a => a.id === order.clientId)?.name}</h3><span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{order.status}</span></div>
                  <div className="text-sm text-slate-600 space-y-1 mb-4">
                    <p><span className="font-medium">Route:</span> {order.locationFrom} <ArrowRight size={12} className="inline"/> {order.locationTo}</p>
                    <p><span className="font-medium">Spec:</span> {order.containerSize} • {order.type} • Total Weight: {order.weight || '-'} MT</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs"><span className="block font-bold mb-1">Single Vehicles</span><span>{order.fulfilledSingle} / {order.singleVehicles} Done</span><span className={`block font-bold ${pendingSingle > 0 ? 'text-red-500' : 'text-emerald-500'}`}>({pendingSingle} Pending)</span></div>
                       <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs"><span className="block font-bold mb-1">Double Vehicles</span><span>{order.fulfilledDouble} / {order.doubleVehicles} Done</span><span className={`block font-bold ${pendingDouble > 0 ? 'text-red-500' : 'text-emerald-500'}`}>({pendingDouble} Pending)</span></div>
                    </div>
                    <p className="mt-2"><span className="font-medium">{refLabel}:</span> {order.croNo || 'Pending'}</p>
                    {order.invoiceStatus === 'Billed' && <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold">INVOICED</span>}
                  </div>
                  {order.status === 'Pending' && (<div className="flex gap-2"><input type="text" placeholder={`Enter ${refLabel}`} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" id={`cro-${order.id}`} /><button onClick={() => handleConfirmOrder(order.id, document.getElementById(`cro-${order.id}`).value)} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold">Confirm</button></div>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const TripManager = () => {
    const [tab, setTab] = useState('open'); 
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [tripData, setTripData] = useState({ vehicleId: '', clientId: '', route: '', biltyNo: '', croNo: '', status: 'Open', freightAmount: '', weight: '', description: '', vehicleType: 'Single' });
    const [expenses, setExpenses] = useState([{ name: '', amount: '' }]);
    const [detentionData, setDetentionData] = useState({ orderId: '', tripId: '', amount: '', loloAmount: '', remarks: '' });

    const openTrips = transactions.filter(t => t.type === 'Trip' && t.status === 'Open');
    const closedTrips = transactions.filter(t => t.type === 'Trip' && t.status === 'Closed');
    
    // ** Smart Location Logic **
    const busyVehicleIds = new Set(openTrips.map(t => t.vehicleId));
    
    // Determine which vehicles to show based on selected Order's Origin
    const selectedOrderOrigin = orders.find(o => o.id === selectedOrderId)?.locationFrom;
    
    const availableVehicles = accounts.filter(a => {
      if(a.category !== 'Vehicle') return false;
      if(busyVehicleIds.has(a.id)) return false; 
      if (selectedOrderOrigin) {
         const currentLoc = a.currentLocation || 'Lahore'; 
         // Simple check: current location should be related to origin
         return currentLoc.toLowerCase().includes(selectedOrderOrigin.toLowerCase()) || selectedOrderOrigin.toLowerCase().includes(currentLoc.toLowerCase());
      }
      return true;
    });

    const confirmedOrders = orders.filter(o => o.status === 'Confirmed' && ((o.fulfilledSingle < o.singleVehicles) || (o.fulfilledDouble < o.doubleVehicles)));

    // Auto-fill form when order selected
    useEffect(() => {
      if(selectedOrderId) {
        const ord = orders.find(o => o.id === selectedOrderId);
        if(ord) {
          const defaultType = ord.fulfilledSingle < ord.singleVehicles ? 'Single' : 'Double';
          setTripData(prev => ({
            ...prev, 
            clientId: ord.clientId, 
            route: `${ord.locationFrom} to ${ord.locationTo}`, 
            croNo: ord.croNo, 
            vehicleType: defaultType, 
            weight: defaultType === 'Single' ? ord.weightSingle : ord.weightDouble, 
            freightAmount: defaultType === 'Single' ? ord.rateSingle : ord.rateDouble
          }));
        }
      }
    }, [selectedOrderId]);

    // Trip Actions
    const addExpenseRow = () => setExpenses([...expenses, { name: '', amount: '' }]);
    const updateExpense = (idx, field, val) => { const newExp = [...expenses]; newExp[idx][field] = val; setExpenses(newExp); };

    // --- START TRIP ---
    const handleTripSubmit = async (e) => {
      e.preventDefault();
      try {
        if (!tripData.vehicleId || !selectedOrderId) return alert("Select Order and Vehicle");
        
        // Ensure System Accounts
        const vehIncomeId = getAccountId('Vehicle Income');
        if(!vehIncomeId) return alert("System Account 'Vehicle Income' missing. Refresh.");

        const freight = Number(tripData.freightAmount);
        
        // NOTE: Expenses added here are just stored in 'expenseDetails'. 
        // No Journal Entry for expenses yet (Account Method Requirement).
        const finalExpenses = expenses.filter(e => e.name && e.amount);
        
        const vehicleName = accounts.find(a=>a.id===tripData.vehicleId)?.name;
        const orderRef = orders.find(o => o.id === selectedOrderId)?.orderRef;
        const desc = `Trip: ${tripData.route} (${vehicleName}) - Order: ${orderRef}`;
        
        // Initial Entry: Debit Client (Receivable), Credit Vehicle Income
        const entries = [
            { accountId: tripData.clientId, type: 'debit', amount: freight }, 
            { accountId: vehIncomeId, type: 'credit', amount: freight }
        ];
        
        // 1. Create Trip Transaction
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { 
            ...tripData, 
            orderId: selectedOrderId, 
            description: desc, 
            totalAmount: freight, 
            expenseDetails: finalExpenses, // Stored but not posted to ledger yet
            entries, 
            createdAt: serverTimestamp(), 
            type: 'Trip' 
        });
        
        // 2. Update Vehicle Status
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', tripData.vehicleId), { currentLocation: 'On Trip' });

        // 3. Update Order Slots
        const updateField = tripData.vehicleType === 'Single' ? { fulfilledSingle: increment(1) } : { fulfilledDouble: increment(1) };
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', selectedOrderId), updateField);

        alert("Trip Started!");
        setTab('open');
        setExpenses([{name: '', amount: ''}]); // Reset expenses
      } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
      }
    };

    // --- CLOSE TRIP ---
    const handleCloseTrip = async (trip) => {
       try {
           const destination = trip.route.split(' to ')[1] || 'Lahore'; 
           
           // Calculate Total Expense to Post
           const totalExpense = trip.expenseDetails?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
           
           // Fetch Accounts
           const tripExpId = getAccountId('Trip Expense');
           const cashId = getAccountId('Cash');

           if (!tripExpId || !cashId) return alert("System Accounts Missing for Closing.");

           // Create Expense Ledger Entry (Debit Expense, Credit Cash)
           // We append this to the existing entries of the trip transaction
           const closingEntries = [...(trip.entries || [])];
           
           if (totalExpense > 0) {
               closingEntries.push({ accountId: tripExpId, type: 'debit', amount: totalExpense });
               closingEntries.push({ accountId: cashId, type: 'credit', amount: totalExpense });
           }

           // Update Transaction
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', trip.id), { 
               status: 'Closed',
               entries: closingEntries
           });

           // Update Vehicle Location
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', trip.vehicleId), { currentLocation: destination.trim() });
           
           alert(`Trip Completed! Expenses Posted. Vehicle at ${destination}`);
           setEditingTrip(null);
       } catch (err) {
           alert("Error Closing Trip: " + err.message);
       }
    };

    // --- ADD EXTRA CHARGE (Detention/LOLO) ---
    const handleDetentionSubmit = async (e) => {
      e.preventDefault();
      const incomeId = getAccountId('Income');
      const detAmt = Number(detentionData.amount) || 0;
      const loloAmt = Number(detentionData.loloAmount) || 0;
      const total = detAmt + loloAmt;

      if(!incomeId || total === 0) return;
      
      const trip = transactions.find(t => t.id === detentionData.tripId);
      // Debit Client (from trip entries), Credit Income
      const clientId = trip.entries.find(e => e.type === 'debit')?.accountId;
      const newEntries = [...trip.entries, 
        { accountId: clientId, type: 'debit', amount: total },
        { accountId: incomeId, type: 'credit', amount: total }
      ];

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', detentionData.tripId), {
          detentionAmount: (trip.detentionAmount || 0) + detAmt,
          loloAmount: (trip.loloAmount || 0) + loloAmt,
          entries: newEntries,
          detentionRemarks: detentionData.remarks
      });
      alert("Charges Added!");
      setDetentionData({ orderId: '', tripId: '', amount: '', loloAmount: '', remarks: '' });
      setTab('open');
    };
    
    // --- MANAGE TRIP MODAL ---
    if (editingTrip) {
        // Calculate current total
        const currentTotal = editingTrip.expenseDetails?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl m-auto">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Manage Trip</h2>
                            <p className="text-xs text-slate-500">{editingTrip.description}</p>
                        </div>
                        <button onClick={() => setEditingTrip(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                    </div>

                    <div className="space-y-6">
                        {/* Status Section */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                            <div><p className="text-xs text-blue-600 font-bold uppercase">Current Status</p><p className="font-bold text-blue-900">{editingTrip.status}</p></div>
                            {editingTrip.status === 'Open' && (
                                <button onClick={() => handleCloseTrip(editingTrip)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2">
                                    <CheckSquare size={16}/> Complete & Close
                                </button>
                            )}
                        </div>

                        {/* Expense Section */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Wallet size={18}/> Trip Expenses</h4>
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">Total: {formatCurrency(currentTotal)}</span>
                            </div>
                            
                            <div className="bg-slate-50 rounded-xl p-3 max-h-40 overflow-y-auto mb-3">
                                {editingTrip.expenseDetails?.length > 0 ? (
                                    editingTrip.expenseDetails.map((exp, idx) => (
                                        <div key={idx} className="flex justify-between py-2 border-b border-slate-200 last:border-0 text-sm">
                                            <span>{exp.name}</span>
                                            <span className="font-mono font-bold">{formatCurrency(exp.amount)}</span>
                                        </div>
                                    ))
                                ) : <p className="text-slate-400 text-xs text-center">No expenses added yet.</p>}
                            </div>

                            {editingTrip.status === 'Open' && (
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const name = e.target.elements.expName.value;
                                    const amount = Number(e.target.elements.expAmount.value);
                                    if(!name || !amount) return;

                                    const newExpenses = [...(editingTrip.expenseDetails || []), { name, amount }];
                                    // Just update the list, don't post to ledger yet
                                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', editingTrip.id), { 
                                        expenseDetails: newExpenses 
                                    });
                                    // No need to setEditingTrip here, the useEffect above will sync it
                                    e.target.reset();
                                }} className="flex gap-2">
                                    <input name="expName" placeholder="Expense Name" className="flex-1 p-2 border rounded-lg text-sm" required />
                                    <input name="expAmount" type="number" placeholder="Amount" className="w-24 p-2 border rounded-lg text-sm" required />
                                    <button type="submit" className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold">Add</button>
                                </form>
                            )}
                        </div>

                        {/* Bilty Edit */}
                        <div>
                            <label className="text-xs font-bold text-slate-500">Update Bilty No</label>
                            <div className="flex gap-2 mt-1">
                                <input 
                                    type="text" 
                                    className="flex-1 p-2 border rounded-lg text-sm" 
                                    defaultValue={editingTrip.biltyNo}
                                    onBlur={async (e) => {
                                        if(e.target.value !== editingTrip.biltyNo) {
                                            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', editingTrip.id), { biltyNo: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-4">
           <h2 className="text-2xl font-bold text-slate-800">Trip Manager</h2>
           <div className="flex bg-slate-100 p-1 rounded-lg">
             {['open', 'new', 'detention', 'closed'].map(t => (
               <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm capitalize font-medium transition-all ${tab === t ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
                 {t === 'new' ? '+ New Trip' : t}
               </button>
             ))}
           </div>
        </div>

        {tab === 'new' && (
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
             <h3 className="font-bold text-lg mb-4">Start New Trip</h3>
             <form onSubmit={handleTripSubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                   <label className="block text-xs font-bold text-slate-500 mb-1">Select Confirmed Order</label>
                   <select className="w-full p-2 border rounded-lg" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} required>
                      <option value="">Choose Order...</option>
                      {confirmedOrders.map(o => (<option key={o.id} value={o.id}>{o.orderRef} • {accounts.find(a=>a.id===o.clientId)?.name} ({o.locationTo})</option>))}
                   </select>
                   {selectedOrderId && (
                       <div className="mt-2 text-xs flex gap-3 text-slate-600">
                          <span>Slots Left: Single ({orders.find(o=>o.id===selectedOrderId)?.singleVehicles - orders.find(o=>o.id===selectedOrderId)?.fulfilledSingle})</span>
                          <span>Double ({orders.find(o=>o.id===selectedOrderId)?.doubleVehicles - orders.find(o=>o.id===selectedOrderId)?.fulfilledDouble})</span>
                       </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle (At {selectedOrderOrigin || 'Any'})</label>
                      <select className="w-full p-2 border rounded-lg" value={tripData.vehicleId} onChange={e => setTripData({...tripData, vehicleId: e.target.value})} required>
                         <option value="">Select Available Vehicle...</option>
                         {availableVehicles.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currentLocation || 'Lahore'})</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                      <select className="w-full p-2 border rounded-lg" value={tripData.vehicleType} onChange={e => {
                          const ord = orders.find(o=>o.id===selectedOrderId); 
                          setTripData({...tripData, vehicleType: e.target.value, freightAmount: e.target.value==='Single' ? ord?.rateSingle : ord?.rateDouble, weight: e.target.value==='Single' ? ord?.weightSingle : ord?.weightDouble});
                      }}>
                         <option>Single</option><option>Double</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-xs font-bold text-slate-500 mb-1">Bilty No</label><input type="text" className="w-full p-2 border rounded-lg" value={tripData.biltyNo} onChange={e => setTripData({...tripData, biltyNo: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-slate-500 mb-1">Ref / CRO</label><input type="text" className="w-full p-2 border rounded-lg bg-slate-100" value={tripData.croNo} readOnly /></div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                   <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-xs font-bold text-blue-700 mb-1">Freight Amount</label><input type="number" className="w-full p-2 border rounded-lg" value={tripData.freightAmount} onChange={e => setTripData({...tripData, freightAmount: e.target.value})} required /></div>
                     <div><label className="block text-xs font-bold text-blue-700 mb-1">Weight (MT)</label><input type="number" className="w-full p-2 border rounded-lg" value={tripData.weight} onChange={e => setTripData({...tripData, weight: e.target.value})} /></div>
                   </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl">
                   <div className="flex justify-between mb-2"><h4 className="text-xs font-bold text-orange-800">Trip Expenses (Initial)</h4><button type="button" onClick={addExpenseRow} className="text-xs bg-white border px-2 rounded">+ Add</button></div>
                   {expenses.map((exp, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                         <input placeholder="Expense Name" className="flex-1 p-2 text-xs border rounded" value={exp.name} onChange={e => updateExpense(idx, 'name', e.target.value)} />
                         <input type="number" placeholder="Amount" className="w-24 p-2 text-xs border rounded" value={exp.amount} onChange={e => updateExpense(idx, 'amount', e.target.value)} />
                      </div>
                   ))}
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">Start Trip</button>
             </form>
           </div>
        )}

        {/* List of Open Trips */}
        {tab === 'open' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openTrips.map(trip => (
                 <div key={trip.id} onClick={() => setEditingTrip(trip)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 cursor-pointer group transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-slate-800">{accounts.find(a=>a.id===trip.vehicleId)?.name}</h3>
                       <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">OPEN</span>
                    </div>
                    <p className="text-sm text-blue-600 font-bold mb-1">{accounts.find(a=>a.id===trip.clientId)?.name}</p>
                    <p className="text-xs text-slate-400 mb-3">{trip.route}</p>
                    <div className="flex justify-between text-xs font-mono bg-slate-50 p-2 rounded">
                       <span>Bilty: {trip.biltyNo || '-'}</span>
                       <span>Fr: {formatCurrency(trip.totalAmount)}</span>
                    </div>
                 </div>
              ))}
              {openTrips.length === 0 && <div className="col-span-full text-center py-10 text-slate-400">No open trips.</div>}
           </div>
        )}
        
        {/* Detention / Extras */}
        {tab === 'detention' && (
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
              <h3 className="font-bold text-lg mb-4 text-red-700">Add Detention / LOLO Charges</h3>
              <form onSubmit={handleDetentionSubmit} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Select Active Trip</label>
                    <select className="w-full p-3 border rounded-xl" value={detentionData.tripId} onChange={e => setDetentionData({...detentionData, tripId: e.target.value})} required>
                       <option value="">Select Vehicle/Trip...</option>
                       {openTrips.map(t => (<option key={t.id} value={t.id}>{accounts.find(a=>a.id===t.vehicleId)?.name} - {t.route}</option>))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Detention</label><input type="number" className="w-full p-3 border rounded-xl" placeholder="0" value={detentionData.amount} onChange={e => setDetentionData({...detentionData, amount: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">LOLO</label><input type="number" className="w-full p-3 border rounded-xl" placeholder="0" value={detentionData.loloAmount} onChange={e => setDetentionData({...detentionData, loloAmount: e.target.value})} /></div>
                 </div>
                 <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">Apply Charges</button>
              </form>
           </div>
        )}

        {/* Closed History */}
        {tab === 'closed' && (
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-100 text-slate-600 text-xs uppercase"><tr><th className="p-3">Date</th><th className="p-3">Vehicle</th><th className="p-3">Client</th><th className="p-3 text-right">Freight</th><th className="p-3 text-right">Expenses</th><th className="p-3 text-right">Net</th></tr></thead>
                 <tbody className="divide-y divide-slate-100">
                    {closedTrips.map(t => {
                       const exp = t.expenseDetails?.reduce((s,e)=>s+Number(e.amount),0)||0;
                       const inc = Number(t.totalAmount) + Number(t.detentionAmount||0) + Number(t.loloAmount||0);
                       return (
                          <tr key={t.id} className="hover:bg-slate-50">
                             <td className="p-3">{formatDate(t.createdAt)}</td>
                             <td className="p-3 font-bold text-slate-700">{accounts.find(a=>a.id===t.vehicleId)?.name}</td>
                             <td className="p-3">{accounts.find(a=>a.id===t.clientId)?.name}</td>
                             <td className="p-3 text-right font-mono">{formatCurrency(inc)}</td>
                             <td className="p-3 text-right font-mono text-red-500">{formatCurrency(exp)}</td>
                             <td className="p-3 text-right font-mono font-bold text-emerald-600">{formatCurrency(inc-exp)}</td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
           </div>
        )}
      </div>
    );
  };
  
  // Re-Render App Components with new context
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
       {isAuthenticated ? (
         <>
           <div className="md:hidden bg-slate-900 p-4 text-white flex justify-between items-center"><span className="font-bold">FleetX</span><button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu/></button></div>
           {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900 z-50 pt-16"><Sidebar mobile /></div>}
           <aside className="hidden md:block h-screen sticky top-0"><Sidebar /></aside>
           <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
             {activeView === 'dashboard' && <Dashboard />}
             {activeView === 'order-manager' && <OrderManager />}
             {activeView === 'trip-manager' && <TripManager />}
             {activeView === 'payments' && <PaymentsManager />}
             {activeView === 'billing' && <BillingView />}
             {activeView === 'accounts' && <AccountManager />}
             {activeView === 'store' && <StoreManager />}
             {activeView === 'reports' && <Reports />}
           </main>
         </>
       ) : (
         <div className="w-full min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
               <div className="text-center mb-6"><Truck size={40} className="mx-auto text-blue-600 mb-2"/><h1 className="text-2xl font-bold">FleetX</h1><p className="text-slate-500">Secure Login</p></div>
               <form onSubmit={handleLogin} className="space-y-4">
                  <input type="text" placeholder="Username" className="w-full p-3 border rounded-xl" value={loginCreds.username} onChange={e=>setLoginCreds({...loginCreds, username:e.target.value})} />
                  <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" value={loginCreds.password} onChange={e=>setLoginCreds({...loginCreds, password:e.target.value})} />
                  {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Login</button>
               </form>
               <p className="text-center text-xs text-slate-400 mt-6">Developer - Waqas Gilani - ERP - FleetX</p>
            </div>
         </div>
       )}
    </div>
  );
}
