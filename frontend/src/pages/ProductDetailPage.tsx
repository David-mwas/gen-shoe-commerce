import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { apiFetch } from "../lib/api";

import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  status: string;
  brand: { name: string } | null;
  category: { name: string } | null;
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadProduct = async () => {
    try {
      if (!slug) return;
      const data = await apiFetch(`/products/${slug}`);
      if (!data) {
        navigate("/shop");
        return;
      }
      setProduct(data as Product);
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please sign in to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    setAdding(true);
    try {
      await addToCart(product!.id, selectedSize, selectedColor || null);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  const isAvailable =
    product.status === "in_stock" && product.stock_quantity > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg mb-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm"
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.brand && (
              <p className="text-sm text-slate-600 font-medium uppercase mb-2">
                {product.brand.name}
              </p>
            )}
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-slate-900 mb-6">
              KSh {product.price.toLocaleString()}
            </p>

            {!isAvailable && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 font-medium">
                  {product.status === "out_of_stock"
                    ? "Out of Stock"
                    : "Not Available"}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-900"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Select Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedColor === color
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-900"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || adding}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            {product.category && (
              <div className="mt-6 text-sm text-slate-600">
                <span>Category: </span>
                <span className="font-medium text-slate-900">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
