import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminCategories() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [catName, setCatName] = useState("");
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const load = async () => {
    setLoading(true);
    try {
      const [cats, brs] = await Promise.allSettled([
        apiFetch("/categories"),
        apiFetch("/brands"),
      ]);
      if (cats.status === "fulfilled")
        setCategories(
          (cats.value || []).map((c: any) => ({ ...c, id: c.id || c._id }))
        );
      if (brs.status === "fulfilled")
        setBrands(
          (brs.value || []).map((b: any) => ({ ...b, id: b.id || b._id }))
        );
    } catch (err) {
      console.error("Load categories/brands error", err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!catName.trim()) return;
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }),
      });
      setCatName("");
      load();
    } catch (err) {
      console.error("Create category error", err);
      alert("Failed to create category");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete category?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("Delete category error", err);
      alert("Failed to delete category");
    }
  };

  const createBrand = async () => {
    if (!brandName.trim()) return;
    try {
      await apiFetch("/brands", {
        method: "POST",
        body: JSON.stringify({
          name: brandName,
          slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }),
      });
      setBrandName("");
      load();
    } catch (err) {
      console.error("Create brand error", err);
      alert("Failed to create brand");
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Delete brand?")) return;
    try {
      await apiFetch(`/brands/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("Delete brand error", err);
      alert("Failed to delete brand");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Categories & Brands
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold mb-4">Categories</h2>
            <div className="flex gap-2 mb-4">
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="New category name"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={createCategory}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.slug}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="text-red-600 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold mb-4">Brands</h2>
            <div className="flex gap-2 mb-4">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="New brand name"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={createBrand}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-2">
                {brands.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-slate-500">{b.slug}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteBrand(b.id)}
                        className="text-red-600 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
