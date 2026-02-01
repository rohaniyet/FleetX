import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, Truck, Users, Package, FileText, TrendingUp,
  Menu, X, Banknote, ClipboardList, AlertCircle, LogOut, Plus,
  Edit2, Trash2, CheckSquare
} from "lucide-react";

/* ================= FIREBASE ================= */
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, collection, addDoc, query, onSnapshot, orderBy,
  serverTimestamp, doc, updateDoc, deleteDoc, increment
} from "firebase/firestore";

/* ================= CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAA4mTxBvsy71nE46Qj1UDYjDOU76O1aes",
  authDomain: "fleetx-wg.firebaseapp.com",
  projectId: "fleetx-wg",
  storageBucket: "fleetx-wg.firebasestorage.app",
  messagingSenderId: "155966676723",
  appId: "1:155966676723:web:f4b6fb2c7778d56ecaa186"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = "fleetx_v1";

/* ================= UTILS ================= */
const formatCurrency = (n = 0) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(Number(n || 0));

const formatDate = (d) =>
  d?.seconds ? new Date(d.seconds * 1000).toLocaleDateString("en-GB") : "";

/* ================= MAIN APP ================= */
export default function FleetXApp() {
  /* ---------- AUTH ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("fleetx_auth") === "true"
  );
  const [loginCreds, setLoginCreds] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- UI ---------- */
  const [activeView, setActiveView] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  /* ---------- DATA ---------- */
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  /* ---------- SYSTEM INIT ---------- */
  const systemInitRef = useRef(false);

  /* ================= AUTH INIT ================= */
  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  /* ================= DATA LISTENERS ================= */
  useEffect(() => {
    if (!user) return;
    const base = ["artifacts", APP_ID, "public", "data"];

    const unsubs = [
      onSnapshot(
        query(collection(db, ...base, "accounts")),
        (s) => setAccounts(s.docs.map(d => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(
        query(collection(db, ...base, "transactions"), orderBy("createdAt", "desc")),
        (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(
        query(collection(db, ...base, "orders"), orderBy("createdAt", "desc")),
        (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(
        query(collection(db, ...base, "inventory")),
        (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() })))
      )
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  /* ================= SYSTEM ACCOUNTS (FIXED) ================= */
  const SYSTEM_ACCOUNTS = [
    { code: "CASH", name: "Cash", category: "Cash", type: "Asset" },
    { code: "VEH_INCOME", name: "Vehicle Income", category: "Income", type: "Income" },
    { code: "TRIP_EXP", name: "Trip Expense", category: "Expense", type: "Expense" },
    { code: "GEN_INCOME", name: "Income", category: "Income", type: "Income" }
  ];

  useEffect(() => {
    if (!user || systemInitRef.current || accounts.length === 0) return;
    (async () => {
      for (const acc of SYSTEM_ACCOUNTS) {
        if (!accounts.find(a => a.code === acc.code)) {
          await addDoc(
            collection(db, "artifacts", APP_ID, "public", "data", "accounts"),
            { ...acc, createdAt: serverTimestamp() }
          );
        }
      }
      systemInitRef.current = true;
    })();
  }, [user, accounts]);

  const getAccountByCode = (code) =>
    accounts.find(a => a.code === code)?.id || null;

  /* ================= BALANCES ================= */
  const balances = useMemo(() => {
    const b = {};
    accounts.forEach(a => (b[a.id] = 0));
    transactions.forEach(t =>
      t.entries?.forEach(e => {
        b[e.accountId] =
          (b[e.accountId] || 0) +
          (e.type === "debit" ? Number(e.amount) : -Number(e.amount));
      })
    );
    return b;
  }, [accounts, transactions]);

  /* ================= LOGIN ================= */
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === "admin" && loginCreds.password === "12345") {
      sessionStorage.setItem("fleetx_auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else setLoginError("Invalid Username or Password");
  };

  const logout = () => {
    sessionStorage.removeItem("fleetx_auth");
    setIsAuthenticated(false);
  };

  /* ================= SIDEBAR ================= */
  const Sidebar = ({ mobile }) => (
    <div className={`bg-slate-900 text-white ${mobile ? "w-full" : "w-64"} h-full flex flex-col`}>
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Truck size={20} />
          <span className="font-bold text-xl">FleetX</span>
        </div>
        <p className="text-xs text-slate-400">Azam Afridi Goods Transport</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {[
          ["dashboard", LayoutDashboard, "Dashboard"],
          ["orders", ClipboardList, "Orders"],
          ["trips", AlertCircle, "Trips"],
          ["payments", Banknote, "Payments"],
          ["accounts", Users, "Accounts"],
          ["inventory", Package, "Inventory"],
          ["reports", TrendingUp, "Reports"]
        ].map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => { setActiveView(id); setMobileMenu(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl ${
              activeView === id ? "bg-blue-600" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        className="m-4 p-3 rounded-xl text-red-400 hover:bg-red-900/30 flex items-center gap-2"
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );

  /* ================= MODULES ================= */

  /* ---- DASHBOARD ---- */
  const Dashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl shadow">
        <p className="text-xs text-slate-500">Cash Balance</p>
        <h3 className="text-2xl font-bold">
          {formatCurrency(balances[getAccountByCode("CASH")] || 0)}
        </h3>
      </div>
      <div className="bg-white p-5 rounded-xl shadow">
        <p className="text-xs text-slate-500">Total Orders</p>
        <h3 className="text-2xl font-bold">{orders.length}</h3>
      </div>
      <div className="bg-white p-5 rounded-xl shadow">
        <p className="text-xs text-slate-500">Transactions</p>
        <h3 className="text-2xl font-bold">{transactions.length}</h3>
      </div>
    </div>
  );

  /* ---- ORDERS ---- */
  const Orders = () => {
    const [client, setClient] = useState("");
    const [route, setRoute] = useState("");
    const addOrder = async () => {
      if (!client || !route) return;
      await addDoc(
        collection(db, "artifacts", APP_ID, "public", "data", "orders"),
        { client, route, status: "Open", createdAt: serverTimestamp() }
      );
      setClient(""); setRoute("");
    };
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow flex gap-2">
          <input className="border p-2 flex-1" placeholder="Client"
            value={client} onChange={e => setClient(e.target.value)} />
          <input className="border p-2 flex-1" placeholder="Route"
            value={route} onChange={e => setRoute(e.target.value)} />
          <button onClick={addOrder} className="bg-blue-600 text-white px-4 rounded">
            <Plus />
          </button>
        </div>
        {orders.map(o => (
          <div key={o.id} className="bg-white p-4 rounded shadow">
            <b>{o.client}</b> — {o.route}
          </div>
        ))}
      </div>
    );
  };

  /* ---- PAYMENTS ---- */
  const Payments = () => {
    const [amount, setAmount] = useState("");
    const addPayment = async () => {
      const cashId = getAccountByCode("CASH");
      const incomeId = getAccountByCode("GEN_INCOME");
      if (!cashId || !incomeId || !amount) return;
      await addDoc(
        collection(db, "artifacts", APP_ID, "public", "data", "transactions"),
        {
          description: "Payment",
          entries: [
            { accountId: cashId, type: "debit", amount: Number(amount) },
            { accountId: incomeId, type: "credit", amount: Number(amount) }
          ],
          createdAt: serverTimestamp()
        }
      );
      setAmount("");
    };
    return (
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <input className="border p-2 w-full" placeholder="Amount"
          value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={addPayment}
          className="bg-green-600 text-white px-4 py-2 rounded">
          Add Payment
        </button>
      </div>
    );
  };

  /* ---- ACCOUNTS ---- */
  const Accounts = () => (
    <div className="bg-white rounded-xl shadow">
      {accounts.map(a => (
        <div key={a.id} className="p-3 border-b flex justify-between">
          <span>{a.name}</span>
          <b>{formatCurrency(balances[a.id] || 0)}</b>
        </div>
      ))}
    </div>
  );

  /* ---- INVENTORY ---- */
  const Inventory = () => {
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
    const addItem = async () => {
      if (!name || !qty) return;
      await addDoc(
        collection(db, "artifacts", APP_ID, "public", "data", "inventory"),
        { name, qty: Number(qty), createdAt: serverTimestamp() }
      );
      setName(""); setQty("");
    };
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow flex gap-2">
          <input className="border p-2 flex-1" placeholder="Item"
            value={name} onChange={e => setName(e.target.value)} />
          <input className="border p-2 w-24" placeholder="Qty"
            value={qty} onChange={e => setQty(e.target.value)} />
          <button onClick={addItem} className="bg-blue-600 text-white px-4 rounded">
            <Plus />
          </button>
        </div>
        {inventory.map(i => (
          <div key={i.id} className="bg-white p-3 rounded shadow">
            {i.name} — {i.qty}
          </div>
        ))}
      </div>
    );
  };

  /* ---- REPORTS ---- */
  const Reports = () => (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-bold mb-2">Ledger</h3>
      {transactions.map(t => (
        <div key={t.id} className="text-sm border-b py-1">
          {formatDate(t.createdAt)} — {t.description}
        </div>
      ))}
    </div>
  );

  /* ================= VIEW ROUTER ================= */
  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <Dashboard />;
      case "orders": return <Orders />;
      case "trips": return <div className="bg-white p-4 rounded">Trips module (can extend)</div>;
      case "payments": return <Payments />;
      case "accounts": return <Accounts />;
      case "inventory": return <Inventory />;
      case "reports": return <Reports />;
      default: return <Dashboard />;
    }
  };

  /* ================= LOGIN SCREEN ================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">FleetX Login</h2>
          <input className="w-full p-3 border rounded mb-3"
            placeholder="Username"
            value={loginCreds.username}
            onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })} />
          <input type="password" className="w-full p-3 border rounded mb-3"
            placeholder="Password"
            value={loginCreds.password}
            onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })} />
          {loginError && <div className="text-red-600 text-sm mb-2">{loginError}</div>}
          <button className="w-full bg-blue-600 text-white py-3 rounded font-bold">
            Login
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  /* ================= MAIN LAYOUT ================= */
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:block"><Sidebar /></aside>
      {mobileMenu && <div className="fixed inset-0 z-50 md:hidden"><Sidebar mobile /></div>}
      <main className="flex-1 p-4 md:p-8">{renderView()}</main>
    </div>
  );
}
