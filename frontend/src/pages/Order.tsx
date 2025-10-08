// src/pages/OrderPage.tsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface OrderItem {
  id?: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
  price?: number;
  quantity: number;
  size?: string;
  color?: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  payment_details?: any;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: any;
  items?: OrderItem[];
  created_at?: string;
}

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // require login
      navigate("/login");
      return;
    }
    if (!id) {
      navigate("/orders");
      return;
    }
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/orders/${id}`);
      setOrder(data);
    } catch (err: any) {
      console.error("Error loading order:", err);
      setError(
        err?.message || (typeof err === "string" ? err : "Failed to load order")
      );
      // If not found or unauthorized, go back to orders
      setTimeout(() => {
        navigate("/orders");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{error || "Order not found"}</p>
          <Link
            to="/orders"
            className="text-slate-900 font-semibold hover:text-slate-700"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const isMpesa = order.payment_method === "mpesa";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order</h1>
          <p className="text-slate-600 mb-4">Details for your order</p>

          <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
            <div className="mb-3">
              <p className="text-sm text-slate-600">Order Number</p>
              <p className="text-xl font-bold text-slate-900">
                {order.order_number}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="font-medium text-slate-900">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Placed</p>
                <p className="font-medium text-slate-900">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                KSh {Number(order.total_amount || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6 text-left">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Items</h2>
            <div className="space-y-4">
              {(order.items || []).map((it, idx) => (
                <div key={it.id || idx} className="flex items-center gap-4">
                  <img
                    src={it.product_image || ""}
                    alt={it.product_name}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-100"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {it.product_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Size: {it.size || "-"} {it.color ? `• ${it.color}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      KSh{" "}
                      {(Number(it.price || 0) * it.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600">Qty: {it.quantity}</p>
                  </div>
                </div>
              ))}

              {(!order.items || order.items.length === 0) && (
                <p className="text-sm text-slate-600">
                  No items listed for this order.
                </p>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6 text-left">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Payment
            </h2>
            <p className="text-sm text-slate-600 mb-2">
              Method:{" "}
              <span className="font-medium text-slate-900">
                {order.payment_method || "N/A"}
              </span>
            </p>

            {isMpesa && order.payment_details && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">
                  M-Pesa Details
                </p>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(order.payment_details, null, 2)}
                </pre>
              </div>
            )}

            {!isMpesa && order.payment_details && (
              <div className="text-sm text-slate-700">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(order.payment_details, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
            >
              Back to Orders
            </Link>
            <Link
              to="/shop"
              className="bg-slate-100 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
