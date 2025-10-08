import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import { apiFetch } from "../lib/api";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_details: any;
  customer_email: string;
  created_at: string;
}

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrder = async () => {
    try {
      if (!orderId) return;
      const data = await apiFetch(`/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
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
          <p className="text-slate-600 mb-4">Order not found</p>
          <Link
            to="/shop"
            className="text-slate-900 font-semibold hover:text-slate-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-slate-600 mb-8">Thank you for your purchase</p>

          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-slate-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold text-slate-900 mb-4">
              {order.order_number}
            </p>
            <p className="text-sm text-slate-600 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-slate-900">
              KSh {parseFloat(order.total_amount as any).toLocaleString()}
            </p>
          </div>

          {order.payment_method === "mpesa" && order.payment_details && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900 mb-2">
                    M-Pesa Payment Instructions
                  </p>
                  <p className="text-sm text-slate-700 mb-4">
                    {order.payment_details.instructions}
                  </p>
                  {order.payment_details.tillNumber && (
                    <p className="text-sm font-medium text-slate-900">
                      {order.payment_details.tillNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <p className="text-slate-600">
              A confirmation email has been sent to{" "}
              <span className="font-medium text-slate-900">
                {order.customer_email}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              You can track your order status in the Orders page
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              View Orders
            </Link>
            <Link
              to="/shop"
              className="bg-slate-100 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
