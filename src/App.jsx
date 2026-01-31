import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Package,
  FileText,
  TrendingUp,
  Menu,
  X,
  AlertCircle,
  Banknote,
  ClipboardList,
  Wallet,
  LogOut
} from "lucide-react";

/* ================= FIREBASE ================= */
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp
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
const formatCurrency = (amt = 0) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(Number(amt || 0));

/* ================= PLACEHOLDER VIEWS (SAFE) ================= */
const Dashboard = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Dashboard</h2>
    <p className="text-slate-500 mt-2">System running stable.</p>
  </div>
);

const OrderManager = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Order Manager</h2>
  </div>
);

const TripManager = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Trip Manager</h2>
  </div>
);

const PaymentsManager = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold flex items-center gap-2">
      <Banknote /> Payments
    </h2>
    <p className="text-slate-500 mt-2">
      Payments module loaded safely.
    </p>
  </div>
);

const BillingView = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Billing / Invoice</h2>
  </div>
);

const AccountManager = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Accounts</h2>
    <p className="text-slate-500 mt-2">
      Chart of Accounts (safe placeholder)
    </p>
  </div>
);

const StoreManager = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Inventory</h2>
  </div>
);

const Reports = () => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="text-2xl font-bold">Reports</h2>
    <p className="text-slate-500 mt-2">
      Ledger / Trial / P&L / Balance Sheet
    </p>
  </div>
);

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

  /* ================= AUTH INIT ================= */
  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  /* ================= LOGIN ================= */
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === "admin" && loginCreds.password === "12345") {
      sessionStorage.setItem("fleetx_auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid Username or Password");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("fleetx_auth");
    setIsAuthenticated(false);
  };

  /* ================= SIDEBAR ================= */
  const Sidebar = ({ mobile }) => (
    <div
      className={`bg-slate-900 text-white ${
        mobile ? "w-full" : "w-64"
      } h-full flex flex-col`}
    >
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
          ["order-manager", ClipboardList, "Orders"],
          ["trip-manager", AlertCircle, "Trips"],
          ["payments", Banknote, "Payments"],
          ["billing", FileText, "Billing"],
          ["accounts", Users, "Accounts"],
          ["store", Package, "Inventory"],
          ["reports", TrendingUp, "Reports"]
        ].map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => {
              setActiveView(id);
              setMobileMenu(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
              activeView === id
                ? "bg-blue-600"
                : "text-slate-400 hover:bg-slate-800"
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

  /* ================= SAFE VIEW RENDERER ================= */
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "order-manager":
        return <OrderManager />;
      case "trip-manager":
        return <TripManager />;
      case "payments":
        return <PaymentsManager />;
      case "billing":
        return <BillingView />;
      case "accounts":
        return <AccountManager />;
      case "store":
        return <StoreManager />;
      case "reports":
        return <Reports />;
      default:
        return (
          <div className="text-red-600 font-bold">
            Unknown view: {activeView}
          </div>
        );
    }
  };

  /* ================= LOGIN SCREEN ================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl w-full max-w-sm"
        >
          <h2 className="text-xl font-bold mb-4 text-center">
            FleetX Secure Login
          </h2>

          <input
            className="w-full p-3 border rounded mb-3"
            placeholder="Username"
            value={loginCreds.username}
            onChange={(e) =>
              setLoginCreds({ ...loginCreds, username: e.target.value })
            }
          />

          <input
            type="password"
            className="w-full p-3 border rounded mb-3"
            placeholder="Password"
            value={loginCreds.password}
            onChange={(e) =>
              setLoginCreds({ ...loginCreds, password: e.target.value })
            }
          />

          {loginError && (
            <div className="text-red-600 text-sm mb-2">{loginError}</div>
          )}

          <button className="w-full bg-blue-600 text-white py-3 rounded font-bold">
            Login
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading System…
      </div>
    );
  }

  /* ================= MAIN LAYOUT ================= */
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <Sidebar mobile />
        </div>
      )}

      <main className="flex-1 p-4 md:p-8">{renderView()}</main>
    </div>
  );
}
