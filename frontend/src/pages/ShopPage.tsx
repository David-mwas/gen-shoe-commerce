import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { apiFetch } from "../lib/api";
import { ProductCard } from "../components/products/ProductCard";

import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  status: "in_stock" | "out_of_stock" | "discontinued";
  brand?: {
    name: string;
    id?: string;
    slug?: string;
  };
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  };
  sizes?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();
  const { addToCart } = useCart();

  const selectedCategory = searchParams.get("category");
  const selectedBrand = searchParams.get("brand");
  const selectedSize = searchParams.get("size");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const searchQuery = searchParams.get("search");
  const featured = searchParams.get("featured");

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    selectedBrand,
    selectedSize,
    minPrice,
    maxPrice,
    searchQuery,
    featured,
  ]);

  const loadFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.allSettled([
        apiFetch("/categories"),
        apiFetch("/brands"),
      ]);

      if (categoriesRes.status === "fulfilled")
        setCategories(categoriesRes.value || []);
      else setCategories([]);

      if (brandsRes.status === "fulfilled") setBrands(brandsRes.value || []);
      else setBrands([]);
    } catch (error) {
      console.error("Error loading filters:", error);
      setCategories([]);
      setBrands([]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (searchQuery) params.search = searchQuery;
      if (featured) params.featured = featured;
      // status filter if you want only in_stock
      params.status = "in_stock";

      const qs = new URLSearchParams(params).toString();
      const data = await apiFetch(`/products${qs ? `?${qs}` : ""}`);
      let filteredProducts = (data as Product[]) || [];

      // client side size filter (in case backend doesn't support)
      if (selectedSize) {
        filteredProducts = filteredProducts.filter(
          (p) => p.sizes && p.sizes.includes(selectedSize)
        );
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    if (!user) {
      alert("Please sign in to add items to cart");
      return;
    }
    console.log("Quick add:", { productId });
    const product = products.find((p) => p._id === productId);
    if (!product || !product.sizes || product.sizes.length === 0) {
      alert("Please select a size on the product page");
      return;
    }

    try {
      const defaultSize = (product.sizes && product.sizes[0]) || "M";
      await addToCart(productId, defaultSize);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory || selectedBrand || selectedSize || minPrice || maxPrice;

  const availableSizes = ["6", "7", "8", "9", "10", "11", "12"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : "Shop All Shoes"}
            </h1>
            <p className="text-slate-600">{products.length} products</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 flex-shrink-0 space-y-6`}
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.slug}
                          onChange={() =>
                            updateFilter(
                              "category",
                              selectedCategory === category.slug
                                ? null
                                : category.slug
                            )
                          }
                          className="w-4 h-4 text-slate-900"
                        />
                        <span className="text-sm text-slate-700">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-medium text-slate-900 mb-3">Brand</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="brand"
                          checked={selectedBrand === brand.slug}
                          onChange={() =>
                            updateFilter(
                              "brand",
                              selectedBrand === brand.slug ? null : brand.slug
                            )
                          }
                          className="w-4 h-4 text-slate-900"
                        />
                        <span className="text-sm text-slate-700">
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-medium text-slate-900 mb-3">Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          updateFilter(
                            "size",
                            selectedSize === size ? null : size
                          )
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-medium text-slate-900 mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">
                        Min Price (KSh)
                      </label>
                      <input
                        type="number"
                        value={minPrice || ""}
                        onChange={(e) =>
                          updateFilter("minPrice", e.target.value || null)
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">
                        Max Price (KSh)
                      </label>
                      <input
                        type="number"
                        value={maxPrice || ""}
                        onChange={(e) =>
                          updateFilter("maxPrice", e.target.value || null)
                        }
                        placeholder="10000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-200 rounded-xl h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => handleQuickAdd(product._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-slate-600 mb-4">
                  No products found matching your filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-slate-900 font-semibold hover:text-slate-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
