import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const OrderManager = () => {
  const { tenant } = useAuth();

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    rate: "",
    cro_no: ""
  });

  useEffect(() => {
    if (tenant) {
      loadOrders();
      loadClients();
    }
  }, [tenant]);

  const loadOrders = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("orders")
      .select("*, clients(name)")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

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
    if (
      !form.client_id ||
      !form.from_location ||
      !form.to_location ||
      !form.rate
    ) {
      toast.error("Fill required fields");
      return;
    }

    const { error } = await supabase.rpc("create_order", {
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Order
        </button>
      </div>

      {/* Orders List */}
      <div className="grid md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded shadow">
            <div className="font-bold">{order.clients?.name}</div>
            <div>{order.from_location} → {order.to_location}</div>
            <div>Type: {order.order_type}</div>
            <div>Container: {order.container_type}</div>
            <div>Single: {order.single_vehicle_count}</div>
            <div>Double: {order.double_vehicle_count}</div>
            <div className="font-bold text-blue-600">
              Rs {order.rate}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-full max-w-2xl space-y-4">

            <h2 className="text-xl font-bold">Create Order</h2>

            <select
              className="w-full border p-2"
              onChange={(e) =>
                setForm({ ...form, client_id: e.target.value })
              }
            >
              <option>Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="From"
                className="border p-2"
                onChange={(e) =>
                  setForm({ ...form, from_location: e.target.value })
                }
              />
              <input
                placeholder="To"
                className="border p-2"
                onChange={(e) =>
                  setForm({ ...form, to_location: e.target.value })
                }
              />
            </div>

            <input
              type="number"
              placeholder="Weight (Tons)"
              className="w-full border p-2"
              onChange={(e) =>
                setForm({ ...form, weight: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className="border p-2"
                onChange={(e) =>
                  setForm({ ...form, container_type: e.target.value })
                }
              >
                <option value="20ft">20ft</option>
                <option value="40ft">40ft</option>
              </select>

              <select
                className="border p-2"
                onChange={(e) =>
                  setForm({ ...form, order_type: e.target.value })
                }
              >
                <option>Export</option>
                <option>Import</option>
                <option>Shifting</option>
                <option>Open</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Single Vehicles"
                className="border p-2"
                onChange={(e) =>
                  setForm({ ...form, single: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Double Vehicles"
                className="border p-2"
                onChange={(e) =>
                  setForm({ ...form, double: e.target.value })
                }
              />
            </div>

            <input
              type="number"
              placeholder="Rate"
              className="w-full border p-2"
              onChange={(e) =>
                setForm({ ...form, rate: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={handleCreateOrder}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Save Order
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
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
