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

// Data Path ID
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
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (error) { setFirebaseError('Auth Error: ' + error.message); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); if (!currentUser && !firebaseError) {} else { setLoading(false); } });
    return () => unsubscribe();
  }, [firebaseError]);

  useEffect(() => {
    if (!user) return;
    const unsubAccounts = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'accounts')), (s) => setAccounts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTrans = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), orderBy('createdAt', 'desc')), (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubInv = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'inventory')), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubOrders = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderBy('createdAt', 'desc')), (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubAccounts(); unsubTrans(); unsubInv(); unsubOrders(); };
  }, [user]);

  // Login Handlers
  const handleLogin = (e) => { e.preventDefault(); if (loginCreds.username === 'admin' && loginCreds.password === '12345') { setIsAuthenticated(true); sessionStorage.setItem('fleetx_auth', 'true'); setLoginError(''); } else { setLoginError('Invalid Credentials'); } };
  const handleLogout = () => { setIsAuthenticated(false); sessionStorage.removeItem('fleetx_auth'); setLoginCreds({ username: '', password: '' }); };

  // --- Helpers ---
  const getAccountId = (nameLike) => {
    const found = accounts.find(a => a.name.toLowerCase().includes(nameLike.toLowerCase()));
    return found ? found.id : null;
  };

  // Helper to ensure system accounts exist
  const ensureSystemAccounts = async () => {
    const required = [
      { name: 'Vehicle Income', category: 'Income', type: 'Income' },
      { name: 'Trip Expense', category: 'Expense', type: 'Expense' },
      { name: 'Inventory Profit', category: 'Income', type: 'Income' },
      { name: 'Store Inventory', category: 'Asset', type: 'Asset' },
      { name: 'Cash', category: 'Cash', type: 'Asset' },
      { name: 'Income', category: 'Income', type: 'Income' }
    ];
    for (let req of required) {
      const exists = accounts.find(a => a.name.toLowerCase() === req.name.toLowerCase());
      if (!exists && user) {
         try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'), { ...req, createdAt: serverTimestamp() }); } catch (e) { console.error(e); }
      }
    }
  };
  useEffect(() => { if(accounts.length > 0 && user) ensureSystemAccounts(); }, [accounts.length, user]);

  // Calculations
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

  const pnlStats = useMemo(() => {
    let totalIncome = 0; let totalExpense = 0;
    const incomeAccounts = accounts.filter(a => a.type === 'Income');
    const expenseAccounts = accounts.filter(a => a.type === 'Expense');
    expenseAccounts.forEach(acc => totalExpense += (accountBalances[acc.id] || 0));
    incomeAccounts.forEach(acc => totalIncome += Math.abs(accountBalances[acc.id] || 0));
    return { income: totalIncome, expense: totalExpense, profit: totalIncome - totalExpense };
  }, [transactions, accounts, accountBalances]);

  // --- COMPONENT VIEWS ---

  // 1. DASHBOARD
  const Dashboard = () => {
    const receivables = accounts.filter(a => a.category === 'Client').reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0);
    const payables = Math.abs(accounts.filter(a => a.category === 'Vendor').reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0));
    const cashInHand = accounts.filter(a => a.category === 'Cash').reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0);
    const openTripsCount = transactions.filter(t => t.type === 'Trip' && t.status === 'Open').length;
    
    // Filtered lists
    const listData = dashboardFilter === 'receivables' ? accounts.filter(a => a.category === 'Client' && accountBalances[a.id] > 0)
                   : dashboardFilter === 'payables' ? accounts.filter(a => a.category === 'Vendor' && accountBalances[a.id] < 0)
                   : accounts.filter(a => a.category === 'Vehicle' && a.currentLocation && a.currentLocation !== 'Lahore');

    if (dashboardFilter) {
      return (
        <div className="animate-fade-in space-y-4">
          <button onClick={() => setDashboardFilter(null)} className="flex items-center text-slate-500 hover:text-slate-800"><ArrowRight className="rotate-180 mr-1" size={16}/> Back to Dashboard</button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-lg capitalize">{dashboardFilter} Details</div>
            <div className="divide-y divide-slate-100">
              {listData.map(acc => (
                <div key={acc.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                   <div>
                     <span className="font-medium text-slate-800 block">{acc.name}</span>
                     {dashboardFilter === 'outstation' && <span className="text-xs text-slate-500"><MapPin size={12} className="inline"/> {acc.currentLocation}</span>}
                   </div>
                   {dashboardFilter !== 'outstation' && <span className="font-mono font-bold text-slate-600">{formatCurrency(Math.abs(accountBalances[acc.id]))}</span>}
                </div>
              ))}
              {listData.length === 0 && <div className="p-8 text-center text-slate-400">No records found.</div>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <button onClick={() => setDashboardFilter('receivables')} className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg text-left"><p className="text-blue-100 text-xs uppercase font-bold">Receivables</p><h3 className="text-2xl font-bold mt-1">{formatCurrency(receivables)}</h3></button>
           <button onClick={() => setDashboardFilter('payables')} className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm text-left"><p className="text-slate-500 text-xs uppercase font-bold">Payables</p><h3 className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(payables)}</h3></button>
           <button onClick={() => setActiveView('trip-manager')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left"><p className="text-slate-500 text-xs uppercase font-bold">Active Trips</p><h3 className="text-2xl font-bold mt-1 text-slate-800">{openTripsCount}</h3></button>
           <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100"><p className="text-emerald-700 text-xs uppercase font-bold">Cash in Hand</p><h3 className="text-2xl font-bold mt-1 text-emerald-800">{formatCurrency(cashInHand)}</h3></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-64 overflow-y-auto">
             <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><CreditCard size={18}/> Bank Accounts</h4>
             {accounts.filter(a => a.category === 'Bank').map(acc => (
               <div key={acc.id} className="flex justify-between py-2 border-b border-slate-100 last:border-0"><span className="text-sm text-slate-600">{acc.name}</span><span className="font-mono text-sm font-bold">{formatCurrency(accountBalances[acc.id] || 0)}</span></div>
             ))}
           </div>
           <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
             <h4 className="font-bold text-slate-800 mb-3">Recent Activity</h4>
             <div className="space-y-2">
               {transactions.slice(0, 5).map(t => (
                 <div key={t.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                    <div><p className="font-medium text-sm text-slate-800">{t.description}</p><p className="text-xs text-slate-500">{formatDate(t.createdAt)}</p></div>
                    <span className="font-mono text-sm font-bold">{formatCurrency(t.totalAmount || t.entries?.[0]?.amount)}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    );
  };

  // 2. TRIP MANAGER (UPDATED LOGIC)
  const TripManager = () => {
    const [tab, setTab] = useState('open'); 
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [tripData, setTripData] = useState({ vehicleId: '', clientId: '', route: '', biltyNo: '', croNo: '', status: 'Open', freightAmount: '', weight: '', description: '', vehicleType: 'Single' });
    const [expenses, setExpenses] = useState([{ name: '', amount: '' }]);
    const [detentionData, setDetentionData] = useState({ orderId: '', tripId: '', amount: '', loloAmount: '', remarks: '' });

    const openTrips = transactions.filter(t => t.type === 'Trip' && t.status === 'Open');
    const closedTrips = transactions.filter(t => t.type === 'Trip' && t.status === 'Closed');
    
    // Determine available vehicles (Not on open trip)
    const busyVehicleIds = new Set(openTrips.map(t => t.vehicleId));
    
    // Filter by Order Location (Smart Match)
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
      setTab('open');
    };
    
    // --- MANAGE TRIP MODAL ---
    if (editingTrip) {
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
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Wallet size={18}/> Trip Expenses</h4>
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
                                    setEditingTrip({...editingTrip, expenseDetails: newExpenses}); // Update UI
                                    e.target.reset();
                                    alert("Expense Added (Pending Posting)");
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
