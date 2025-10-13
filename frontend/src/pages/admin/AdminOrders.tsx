import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_status: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
}

export function AdminOrders() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/orders");
      const normalized = (data || []).map((o: any) => ({
        ...o,
        id: o.id || o._id,
      }));
      setOrders(normalized);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      toast.success("Order status updated successfully");
      loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  if (!isAdmin) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Manage Orders
        </h1>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mx-auto" />
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {order.order_number}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">
                        {order.customer_email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.customer_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      KSh{" "}
                      {parseFloat(order.total_amount as any).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 capitalize">
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-600">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
