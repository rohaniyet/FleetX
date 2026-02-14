import React, { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Truck,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dbService } from "../../services/supabase/client";

const Dashboard = () => {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenue: 0,
    expense: 0,
    profit: 0,
    receivable: 0,
    vehicles: 0,
    taxPayable: 0
  });

  useEffect(() => {
    if (tenant) loadData();
  }, [tenant]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: pl } = await dbService
        .from("branch_profit_loss_summary_view")
        .select("*")
        .eq("tenant_id", tenant.tenant_id)
        .eq("branch_id", tenant.branch_id)
        .single();

      const { data: receivable } = await dbService
        .from("client_risk_classification_view")
        .select("balance")
        .eq("tenant_id", tenant.tenant_id)
        .eq("branch_id", tenant.branch_id);

      const { data: vehiclePerf } = await dbService
        .from("vehicle_performance_view")
        .select("*")
        .eq("tenant_id", tenant.tenant_id)
        .eq("branch_id", tenant.branch_id);

      const { data: tax } = await dbService
        .from("balance_sheet_view")
        .select("balance")
        .eq("tenant_id", tenant.tenant_id)
        .eq("branch_id", tenant.branch_id)
        .eq("account_name", "Sales Tax Payable")
        .single();

      const totalReceivable =
        receivable?.reduce((sum, r) => sum + Number(r.balance), 0) || 0;

      setData({
        revenue: pl?.total_income || 0,
        expense: pl?.total_expense || 0,
        profit: pl?.net_profit || 0,
        receivable: totalReceivable,
        vehicles: vehiclePerf?.length || 0,
        taxPayable: tax?.balance || 0
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-70">{title}</p>
          <h2 className="text-2xl font-bold mt-2">
            Rs {Number(value).toLocaleString()}
          </h2>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-600`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-blue-500" size={30} />
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Financial Overview
        </h1>
        <p className="text-slate-500">
          Real-time accounting & operational intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
        <Card title="Total Revenue" value={data.revenue} icon={TrendingUp} color="emerald" />
        <Card title="Total Expense" value={data.expense} icon={AlertTriangle} color="red" />
        <Card title="Net Profit" value={data.profit} icon={DollarSign} color="blue" />
        <Card title="Client Receivables" value={data.receivable} icon={DollarSign} color="purple" />
        <Card title="Vehicles Active" value={data.vehicles} icon={Truck} color="orange" />
        <Card title="Sales Tax Payable" value={Math.abs(data.taxPayable)} icon={DollarSign} color="pink" />
      </div>
    </div>
  );
};

export default Dashboard;
