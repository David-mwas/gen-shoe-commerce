import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const { cartItems, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "mpesa" as "mpesa" | "stripe",
    mpesaPhone: "",
  });

  if (!user || cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  const total = getTotal();
  const shippingFee = 300;
  const finalTotal = total + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Create order
      const orderPayload = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: finalTotal,
        payment_method: formData.paymentMethod,
        payment_status: "pending",
        status: "pending",
        shipping_address: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        customer_phone: formData.phone,
        customer_email: formData.email,
        // optionally include basic items metadata if your backend expects it
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product.name,
          product_image: item.product.image_url,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      };

      const createdOrder = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      // backend expected to return created order with id
      const orderId = createdOrder?.id || createdOrder?._id;
      if (!orderId) throw new Error("Failed to create order");

      // If M-Pesa, call payment endpoint on backend
      if (formData.paymentMethod === "mpesa") {
        const mpesaPhone = formData.mpesaPhone.replace(/\s/g, "");

        // this uses the API route which should handle MPESA initiation
        const result = await apiFetch("/payments/mpesa", {
          method: "POST",
          body: JSON.stringify({
            orderId,
            phone: mpesaPhone,
            amount: finalTotal,
          }),
        });

        // Save payment details on the order (backend must support)
        await apiFetch(`/orders/${orderId}`, {
          method: "PUT",
          body: JSON.stringify({ payment_details: result }),
        });
      }

      // clear cart
      await clearCart();

      navigate(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0712345678"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-slate-900 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === "mpesa"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">M-Pesa</p>
                      <p className="text-sm text-slate-600">
                        Pay securely with M-Pesa Buy Goods and Services
                      </p>
                    </div>
                  </label>

                  {formData.paymentMethod === "mpesa" && (
                    <div className="ml-7 mt-3">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        M-Pesa Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="mpesaPhone"
                        required
                        value={formData.mpesaPhone}
                        onChange={handleChange}
                        placeholder="254712345678"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Enter phone number in format: 254XXXXXXXXX
                      </p>
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-4 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-slate-900 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      disabled
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        Card Payment
                      </p>
                      <p className="text-sm text-slate-600">Coming Soon</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          Size {item.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          KSh{" "}
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>KSh {shippingFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                  <span>Total</span>
                  <span>KSh {finalTotal.toLocaleString()}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
