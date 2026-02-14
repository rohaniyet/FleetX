import React, { useState, useEffect } from "react";
import { Plus, Search, Truck, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const OrderManager = () => {
  const { tenant } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    from_location: "",
    to_location: "",
    weight: "",
    container_type: "20ft",
    single: 1,
    double: 0,
    order_type: "Export",
    billing_type: "per_trip",
    rate: ""
  });

  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (tenant) {
      loadOrders();
      loadClients();
    }
  }, [tenant]);

  const loadOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*, clients(name)")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  const loadClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id,name")
      .eq("tenant_id", tenant.id);

    setClients(data || []);
  };

  const handleCreateOrder = async () => {
    if (!form.client_id || !form.from_location || !form.to_location || !form.rate) {
      toast.error("Fill all required fields");
      return;
    }

    const { data, error } = await supabase.rpc("create_order", {
      p_tenant_id: tenant.id,
      p_branch_id: tenant.branch_id,
      p_client_id: form.client_id,
      p_from: form.from_location,
      p_to: form.to_location,
      p_weight: Number(form.weight),
      p_container_type: form.container_type,
      p_double: Number(form.double),
      p_single: Number(form.single),
      p_order_type: form.order_type,
      p_billing_type: form.billing_type,
      p_rate: Number(form.rate)
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Order Created");
    setShowModal(false);
    loadOrders();
  };

  const filtered = orders.filter((o) =>
    o.clients?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading Orders...</div>;

  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Manager</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <input
        placeholder="Search client..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-3 rounded-lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between mb-3">
              <div>
                <h2 className="font-bold text-lg">
                  {order.clients?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {order.from_location} → {order.to_location}
                </p>
              </div>
              <div className="text-right font-bold text-blue-600">
                Rs {order.rate}
              </div>
            </div>

            <div className="text-sm text-gray-600 flex gap-4">
              <div className="flex items-center gap-1">
                <Truck size={14} /> S:{order.single_vehicle_count}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} /> {order.order_type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4">

            <h2 className="text-xl font-bold">Create Order</h2>

            <select
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full border p-3 rounded"
            >
              <option>Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input
              placeholder="From Location"
              onChange={(e) => setForm({ ...form, from_location: e.target.value })}
              className="w-full border p-3 rounded"
            />

            <input
              placeholder="To Location"
              onChange={(e) => setForm({ ...form, to_location: e.target.value })}
              className="w-full border p-3 rounded"
            />

            <input
              placeholder="Weight"
              type="number"
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full border p-3 rounded"
            />

            <input
              placeholder="Rate"
              type="number"
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              className="w-full border p-3 rounded"
            />

            <div className="flex gap-3">
              <button
                onClick={handleCreateOrder}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManager;
