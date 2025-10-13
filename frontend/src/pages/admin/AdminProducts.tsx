import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, CreditCard as Edit, Trash2, Search } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  status: string;
  brand?: { name?: string } | null;
  category?: { name?: string } | null;
}

export function AdminProducts() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/products");
      // normalize id
      const normalized = (data || []).map((p: any) => ({
        ...p,
        id: p.id || p._id,
      }));
      setProducts(normalized);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await apiFetch(`/products/${productId}`, { method: "DELETE" });
      toast.error("Product deleted successfully");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) return null;

  const statusColors: Record<string, string> = {
    in_stock: "bg-green-100 text-green-800",
    out_of_stock: "bg-red-100 text-red-800",
    discontinued: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Manage Products</h1>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mx-auto" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.brand?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      KSh {product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[product.status]
                        }`}
                      >
                        {product.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-600 mb-4">No products found</p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:text-slate-700"
            >
              <Plus className="w-5 h-5" />
              Add your first product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
