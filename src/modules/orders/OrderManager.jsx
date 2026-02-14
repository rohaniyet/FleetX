import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const OrderManager = () => {
  const { tenant } = useAuth();

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    client_id: "",
    from_location: "",
    to_location: "",
    weight: "",
    container_type: "",
    single: 0,
    double: 0,
    order_type: "local",
    billing_type: "company",
    rate: ""
  });

  useEffect(() => {
    if (tenant) {
      loadData();
    }
  }, [tenant]);

  const loadData = async () => {
    setLoading(true);

    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

    const { data: clientData } = await supabase
      .from("clients")
      .select("id,name")
      .eq("tenant_id", tenant.id);

    setOrders(orderData || []);
    setClients(clientData || []);
    setLoading(false);
  };

  const handleCreateOrder = async () => {
    if (!form.client_id || !form.rate) {
      toast.error("Client and Rate required");
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
    setForm({
      client_id: "",
      from_location: "",
      to_location: "",
      weight: "",
      container_type: "",
      single: 0,
      double: 0,
      order_type: "local",
      billing_type: "company",
      rate: ""
    });

    loadData();
  };

  const confirmOrder = async (id) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Order Confirmed");
    loadData();
  };

  if (loading) return <div>Loading Orders...</div>;

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">Orders</h1>

      {/* Create Order Form */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <h2 className="text-lg font-semibold">Create Order</h2>

        <select
          value={form.client_id}
          onChange={(e) =>
            setForm({ ...form, client_id: e.target.value })
          }
          className="border p-2 w-full"
        >
          <option value="">Select Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="From"
          value={form.from_location}
          onChange={(e) =>
            setForm({ ...form, from_location: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="To"
          value={form.to_location}
          onChange={(e) =>
            setForm({ ...form, to_location: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Weight"
          value={form.weight}
          onChange={(e) =>
            setForm({ ...form, weight: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Container Type"
          value={form.container_type}
          onChange={(e) =>
            setForm({ ...form, container_type: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Single Vehicles"
          type="number"
          value={form.single}
          onChange={(e) =>
            setForm({ ...form, single: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Double Vehicles"
          type="number"
          value={form.double}
          onChange={(e) =>
            setForm({ ...form, double: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Rate"
          type="number"
          value={form.rate}
          onChange={(e) =>
            setForm({ ...form, rate: e.target.value })
          }
          className="border p-2 w-full"
        />

        <button
          onClick={handleCreateOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Order
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Order List</h2>

        {orders.length === 0 && <p>No Orders Found</p>}

        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{o.from_location} → {o.to_location}</p>
              <p>Rate: Rs {o.rate}</p>
              <p>Status: {o.status}</p>
            </div>

            {o.status === "draft" && (
              <button
                onClick={() => confirmOrder(o.id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Confirm
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default OrderManager;
