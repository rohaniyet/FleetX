import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Truck,
  CreditCard,
  BarChart3,
  Users,
  Package,
} from "lucide-react";

const menu = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Orders", icon: FileText },
  { path: "/trips", label: "Trips", icon: Truck },
  { path: "/billing", label: "Billing", icon: CreditCard },
  { path: "/accounts", label: "Accounts", icon: Users },
  { path: "/store", label: "Store", icon: Package },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl p-6">
      <h1 className="text-2xl font-bold mb-8 tracking-wide">
        FleetX ERP
      </h1>

      <nav className="space-y-3">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 shadow-lg"
                    : "hover:bg-slate-700"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
