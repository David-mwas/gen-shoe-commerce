import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ShoppingBag, Users, DollarSign, Plus } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";


export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // fetch products and orders (admin endpoint returns all orders)
      const [products, orders] = await Promise.allSettled([
        apiFetch("/products"),
        apiFetch("/orders"),
      ]);

      const prodList =
        products.status === "fulfilled" ? products.value || [] : [];
      const orderList = orders.status === "fulfilled" ? orders.value || [] : [];

      const normalizedOrders = orderList.map((o: any) => ({
        ...o,
        id: o.id || o._id,
      }));

      const totalRevenue =
        normalizedOrders.reduce((sum: number, order: any) => {
          if (order.status !== "cancelled") {
            const amt = parseFloat(order.total_amount as any) || 0;
            return sum + amt;
          }
          return sum;
        }, 0) || 0;

      const pendingOrders =
        normalizedOrders.filter((o: any) => o.status === "pending").length || 0;

      setStats({
        totalProducts: Array.isArray(prodList) ? prodList.length : 0,
        totalOrders: normalizedOrders.length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(normalizedOrders.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-slate-600" />
              <span className="text-2xl font-bold text-slate-900">
                {stats.totalProducts}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Total Products</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">
                {stats.totalOrders}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Total Orders</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">
                {stats.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Total Revenue (KSh)</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-slate-900">
                {stats.pendingOrders}
              </span>
            </div>
            <p className="text-slate-600 text-sm">Pending Orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/admin/products"
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <p className="font-semibold text-slate-900">Manage Products</p>
                <p className="text-sm text-slate-600">
                  Add, edit, or remove products
                </p>
              </Link>
              <Link
                to="/admin/orders"
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <p className="font-semibold text-slate-900">View Orders</p>
                <p className="text-sm text-slate-600">
                  Process and manage customer orders
                </p>
              </Link>
              <Link
                to="/admin/categories"
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <p className="font-semibold text-slate-900">
                  Manage Categories & Brands
                </p>
                <p className="text-sm text-slate-600">
                  Organize your product catalog
                </p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-slate-600 hover:text-slate-900 text-sm"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">
                        {order.order_number}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {order.customer_email}
                      </span>
                      <span className="font-semibold text-slate-900">
                        KSh{" "}
                        {parseFloat(order.total_amount as any).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-600 text-sm text-center py-8">
                  No orders yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
