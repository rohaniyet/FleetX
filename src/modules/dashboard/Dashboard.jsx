import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getProfitLoss,
  getBalanceSheet,
  getVehiclePerformance,
  getClientAging,
  getVendorAging
} from '../../services/financialService'

const Dashboard = () => {
  const { tenant } = useAuth()

  const [loading, setLoading] = useState(true)
  const [pl, setPL] = useState(null)
  const [balanceSheet, setBalanceSheet] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [vendors, setVendors] = useState([])

  useEffect(() => {
    if (tenant) loadDashboard()
  }, [tenant])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      const tenantId = tenant.tenant_id
      const branchId = tenant.branch_id || tenant.userProfile?.branch_id

      const [
        profitLoss,
        bs,
        vehiclePerf,
        clientAging,
        vendorAging
      ] = await Promise.all([
        getProfitLoss(tenantId, branchId),
        getBalanceSheet(tenantId, branchId),
        getVehiclePerformance(tenantId, branchId),
        getClientAging(tenantId, branchId),
        getVendorAging(tenantId, branchId)
      ])

      setPL(profitLoss)
      setBalanceSheet(bs)
      setVehicles(vehiclePerf)
      setClients(clientAging)
      setVendors(vendorAging)

    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold text-slate-600">
          Loading Financial Dashboard...
        </div>
      </div>
    )
  }

  const totalReceivable =
    clients?.reduce((sum, c) => sum + Number(c.balance || 0), 0) || 0

  const totalPayable =
    vendors?.reduce((sum, v) => sum + Number(v.total_payable || 0), 0) || 0

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Financial Dashboard
        </h1>
        <p className="text-slate-500">
          Real-time ledger-driven analytics
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <KpiCard
          title="Net Profit"
          value={pl?.net_profit || 0}
          icon={TrendingUp}
          positive
        />

        <KpiCard
          title="Receivables"
          value={totalReceivable}
          icon={Users}
        />

        <KpiCard
          title="Payables"
          value={totalPayable}
          icon={AlertTriangle}
        />

        <KpiCard
          title="Vehicles Active"
          value={vehicles?.length || 0}
          icon={Truck}
        />

      </div>

      {/* VEHICLE PERFORMANCE TABLE */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Vehicle Performance</h2>

        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th>Vehicle</th>
              <th>Revenue</th>
              <th>Cost</th>
              <th>Net Profit</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {vehicles?.map(v => (
              <tr key={v.vehicle_id} className="border-b hover:bg-slate-50">
                <td>{v.vehicle_number}</td>
                <td>Rs {Number(v.total_revenue).toLocaleString()}</td>
                <td>Rs {Number(v.total_cost).toLocaleString()}</td>
                <td className="font-semibold">
                  Rs {Number(v.net_profit).toLocaleString()}
                </td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    v.performance_status === 'EXCELLENT'
                      ? 'bg-green-100 text-green-700'
                      : v.performance_status === 'LOSS'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {v.performance_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const KpiCard = ({ title, value, icon: Icon, positive }) => (
  <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className={`text-2xl font-bold ${
        positive ? 'text-green-600' : 'text-slate-800'
      }`}>
        Rs {Number(value).toLocaleString()}
      </h3>
    </div>
    <Icon className="text-slate-400" size={28} />
  </div>
)

export default Dashboard
