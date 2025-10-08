import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Shield, Truck } from "lucide-react";
import { ProductCard } from "../components/products/ProductCard";

import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  status: "in_stock" | "out_of_stock" | "discontinued";
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  featured: boolean;
  brand?: {
    name: string;
  };
}

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    loadFeaturedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // normalize whatever the API returned into an array of products
  const normalizeApiProducts = (raw: any): Product[] => {
    if (!raw) return [];

    // common shapes: raw is array, or { data: [...] }, or { rows: [...] }, or { result: [...] }
    let arr: any[] = [];
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (Array.isArray(raw.data)) {
      arr = raw.data;
    } else if (Array.isArray(raw.rows)) {
      arr = raw.rows;
    } else if (Array.isArray(raw.result)) {
      arr = raw.result;
    } else if (Array.isArray(raw.products)) {
      arr = raw.products;
    } else {
      // sometimes API returns an object with keys that are arrays; try to pick the first array
      const firstArr = Object.values(raw).find((v) => Array.isArray(v));
      if (firstArr) arr = firstArr;
      else {
        // last resort: if raw has a `count` and some payload, just log and return empty
        console.warn("Unrecognized products response shape:", raw);
        return [];
      }
    }

    // normalize each product (id/_id, brand shape, ensure arrays)
    return arr.map((p: any) => ({
      id:
        p.id ||
        p._id ||
        p._id?.toString() ||
        p._id?.toString?.() ||
        p.slug ||
        JSON.stringify(p).slice(0, 8),
      name: p.name || p.title || "Untitled",
      slug: p.slug || (p.name ? slugify(p.name) : ""),
      price: Number(p.price || 0),
      image_url: p.image_url || p.image || (p.images && p.images[0]) || "",
      status: p.status || "in_stock",
      sizes: Array.isArray(p.sizes)
        ? p.sizes
        : typeof p.sizes === "string"
        ? p.sizes.split(",").map((s: string) => s.trim())
        : [],
      colors: Array.isArray(p.colors)
        ? p.colors
        : typeof p.colors === "string"
        ? p.colors.split(",").map((s: string) => s.trim())
        : [],
      stock_quantity: Number(p.stock_quantity || p.stock || 0),
      featured: !!p.featured,
      brand: p.brand || (p.brand_id ? { name: p.brand_id } : undefined),
    })) as Product[];
  };

  // small slug helper for fallback
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const loadFeaturedProducts = async () => {
    setLoading(true);
    try {
      const raw = await apiFetch(
        "/products?featured=true&status=in_stock&limit=8"
      );
      // helpful debug: console the raw response once
      // remove or comment out later if noisy
      console.debug("Raw featured products response:", raw);

      const normalized = normalizeApiProducts(raw);
      setFeaturedProducts(normalized);
    } catch (err) {
      console.error("Error loading featured products:", err);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    if (!user) {
      alert("Please sign in to add items to cart");
      return;
    }

    const product = featuredProducts.find((p) => p.id === productId);
    if (!product) return;

    try {
      // If sizes are in product already
      const defaultSize =
        product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
      await addToCart(productId, defaultSize);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Step In Style,
              <br />
              Walk in Comfort
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Discover locally made footwear from the heart of Kenya.{" "}
              <b>Quality</b>, <b>style</b>, and <b>comfort</b> in every step.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors group"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Fast Delivery
                </h3>
                <p className="text-slate-600 text-sm">
                  Get your shoes delivered within 2-5 business days across Kenya
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Secure Payment
                </h3>
                <p className="text-slate-600 text-sm">
                  Pay securely with M-Pesa or card payment options
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Authentic Products
                </h3>
                <p className="text-slate-600 text-sm">
                  100% genuine products from authorized distributors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Featured Products
              </h2>
              <p className="text-slate-600">
                Hand-picked selection of our best shoes
              </p>
            </div>
            <Link
              to="/shop?featured=true"
              className="text-slate-900 font-semibold hover:text-slate-700 flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-200 rounded-xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleQuickAdd}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">
                No featured products available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Sign up today and get exclusive access to new arrivals, special
            offers, and style tips.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
