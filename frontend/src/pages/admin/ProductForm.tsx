// src/pages/admin/ProductForm.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  productId?: string;
}

export const ProductForm: React.FC<Props> = ({ productId }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // product form fields
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    image_url: "",
    images: [] as string[],
    sizes: "" as string, // comma separated input
    colors: "" as string,
    stock_quantity: 0,
    status: "in_stock",
    featured: false,
    category_id: "",
    brand_id: "",
  });

  // files & previews
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadLookups();
    if (productId) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAdmin]);

  const loadLookups = async () => {
    try {
      const [cats, brs] = await Promise.allSettled([
        apiFetch("/categories"),
        apiFetch("/brands"),
      ]);
      if (cats.status === "fulfilled") setCategories(cats.value || []);
      if (brs.status === "fulfilled") setBrands(brs.value || []);
    } catch (err) {
      console.error("Error loading lookups", err);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/products/id/${productId}`);
      if (!data) throw new Error("Product not found");
      setForm((f) => ({
        ...f,
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        price: data.price || 0,
        image_url: data.image_url || "",
        images: data.images || [],
        sizes: (data.sizes || []).join(","),
        colors: (data.colors || []).join(","),
        stock_quantity: data.stock_quantity || 0,
        status: data.status || "in_stock",
        featured: !!data.featured,
        category_id:
          data.category?.id || data.category?._id || data.category_id || "",
        brand_id: data.brand?.id || data.brand?._id || data.brand_id || "",
      }));

      if (data.image_url) setMainPreview(data.image_url);
      if (data.images && data.images.length) setAdditionalPreviews(data.images);
    } catch (err) {
      console.error("Error loading product", err);
      alert("Failed to load product");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  // handle regular form fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleAutoSlug = () =>
    setForm((f) => ({ ...f, slug: slugify(f.name) }));

  // FILE INPUT handlers
  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setMainFile(file);
    if (file) setMainPreview(URL.createObjectURL(file));
    else setMainPreview(form.image_url || null);
  };

  const handleAdditionalFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAdditionalFiles(files);
    setAdditionalPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // upload a single file (returns uploaded url)
  async function uploadFile(
    file: File
  ): Promise<{ url: string; public_id?: string }> {
    // If your apiFetch supports FormData, you can use it. Otherwise use fetch directly.
    const url = `/api/uploads`; // same-origin endpoint
    const fd = new FormData();
    fd.append("file", file);

    // Try to use apiFetch if it supports FormData (preferred)
    try {
      // apiFetch should *not* set Content-Type header when body is FormData.
      // Here we attempt apiFetch, but fall back to fetch if apiFetch fails.
      // If your apiFetch forces JSON, remove this try and use fetch.
      // @ts-ignore
      const result = await apiFetch("/uploads", {
        method: "POST",
        body: fd,
        isForm: true,
      });
      if (result && (result.url || result.secure_url)) {
        return {
          url: result.url || result.secure_url,
          public_id: result.public_id,
        };
      }
    } catch (err) {
      // fallback to fetch
    }

    // fallback direct fetch
    const token = localStorage.getItem("token"); // adjust to your auth storage if different
    // const res = await fetch(url, {
    //   method: "POST",
    //   body: fd,
    //   headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    // });
    // if (!res.ok) {
    //   const text = await res.text();
    //   throw new Error(`Upload failed: ${res.status} ${text}`);
    // }
    // const json = await res.json();
    // return { url: json.url || json.secure_url, public_id: json.public_id };
    const result = await apiFetch("/uploads", {
      method: "POST",
      body: fd,
      isForm: true,
    });
    // result may be { url, transparent_url, public_id, raw }
    if (result && (result.transparent_url || result.url || result.secure_url)) {
      return {
        url: result.transparent_url || result.url || result.secure_url,
        public_id: result.public_id,
      };
    }
  }

  // // uploads all selected files and returns urls
  // const uploadSelectedFiles = async () => {
  //   setUploadingFiles(true);
  //   const uploaded: string[] = [...form.images]; // start with existing images
  //   try {
  //     if (mainFile) {
  //       const r = await uploadFile(mainFile);
  //       setForm((f) => ({ ...f, image_url: r.url }));
  //       setMainPreview(r.url);
  //     }

  //     if (additionalFiles && additionalFiles.length) {
  //       // upload sequentially to avoid rate limits; you can parallelize if desired
  //       for (const f of additionalFiles) {
  //         const r = await uploadFile(f);
  //         uploaded.push(r.url);
  //       }
  //       setForm((f) => ({ ...f, images: uploaded }));
  //       setAdditionalPreviews(uploaded);
  //     }

  //     setUploadingFiles(false);
  //     return uploaded;
  //   } catch (err) {
  //     setUploadingFiles(false);
  //     console.error("File upload error", err);
  //     throw err;
  //   }
  // };

  // const submit = async (e?: React.FormEvent) => {
  //   e?.preventDefault();
  //   setSaving(true);
  //   try {
  //     // If there are any files selected, upload them first
  //     if (mainFile || (additionalFiles && additionalFiles.length)) {
  //       await uploadSelectedFiles();
  //     }
  //     console.log("form before payload", form);
  //     const payload: any = {
  //       name: form.name,
  //       slug: form.slug || slugify(form.name),
  //       description: form.description,
  //       price: Number(form.price) || 0,
  //       image_url: form.image_url,
  //       images: (form.images || []).filter(Boolean),
  //       sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()) : [],
  //       colors: form.colors ? form.colors.split(",").map((s) => s.trim()) : [],
  //       stock_quantity: Number(form.stock_quantity) || 0,
  //       status: form.status,
  //       featured: !!form.featured,
  //       category_id: form.category_id || null,
  //       brand_id: form.brand_id || null,
  //     };

  //     console.log("payload", payload);

  //     if (productId) {
  //       await apiFetch(`/products/${productId}`, {
  //         method: "PUT",
  //         body: payload,
  //       });
  //       alert("Product updated");
  //     } else {
  //       await apiFetch("/products", {
  //         method: "POST",
  //         body: payload,
  //       });

  //       console.log("payload", payload);
  //       alert("Product created");
  //     }

  //     navigate("/admin/products");
  //   } catch (err: any) {
  //     console.error("Save product error", err);
  //     alert(err.message || "Failed to save product");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // --- inside ProductForm.tsx ---

  // uploads all selected files and returns urls
  const uploadSelectedFiles = async (): Promise<{
    mainUrl?: string | null;
    images: string[];
  }> => {
    setUploadingFiles(true);
    // start with existing images in state (don't mutate form.images directly)
    const uploaded: string[] = Array.isArray(form.images)
      ? [...form.images]
      : [];
    let mainUrl: string | null = form.image_url || null;

    try {
      if (mainFile) {
        const r = await uploadFile(mainFile);
        mainUrl = r.url;
        // update state so previews match, but don't rely on this for payload
        setForm((f) => ({ ...f, image_url: r.url }));
        setMainPreview(r.url);
      }

      if (additionalFiles && additionalFiles.length) {
        // upload sequentially to avoid rate limits; you can parallelize if desired
        for (const f of additionalFiles) {
          const r = await uploadFile(f);
          if (r.url) uploaded.push(r.url);
        }
        setForm((f) => ({ ...f, images: uploaded }));
        setAdditionalPreviews(uploaded);
      }

      setUploadingFiles(false);
      return { mainUrl, images: uploaded };
    } catch (err) {
      setUploadingFiles(false);
      console.error("File upload error", err);
      throw err;
    }
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      // If there are any files selected, upload them first and use returned URLs
      let uploadedMain: string | null = form.image_url || null;
      let uploadedImages: string[] = Array.isArray(form.images)
        ? [...form.images]
        : [];

      if (mainFile || (additionalFiles && additionalFiles.length)) {
        const result = await uploadSelectedFiles();
        if (result.mainUrl) uploadedMain = result.mainUrl;
        uploadedImages = result.images || uploadedImages;
      }

      // DEBUG: show what we'll actually send
      console.log("form before payload", form);
      console.log("upload results", { uploadedMain, uploadedImages });

      const payload: any = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        price: Number(form.price) || 0,
        image_url: uploadedMain || "", // use the upload result, not stale state
        images: (uploadedImages || []).filter(Boolean),
        sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()) : [],
        colors: form.colors ? form.colors.split(",").map((s) => s.trim()) : [],
        stock_quantity: Number(form.stock_quantity) || 0,
        status: form.status,
        featured: !!form.featured,
        category_id: form.category_id || null,
        brand_id: form.brand_id || null,
      };

      console.log("payload", payload);

      if (productId) {
        await apiFetch(`/products/${productId}`, {
          method: "PUT",
          body: payload,
        });
        alert("Product updated");
      } else {
        await apiFetch("/products", {
          method: "POST",
          body: payload,
        });
        alert("Product created");
      }

      navigate("/admin/products");
    } catch (err: any) {
      console.error("Save product error", err);
      alert(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) return <div className="p-8">Loading product...</div>;

  return (
    <form
      onSubmit={submit}
      className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-4">
        {productId ? "Edit Product" : "Create Product"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleAutoSlug}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (KSh)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            name="stock_quantity"
            value={form.stock_quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainFileChange}
            className="w-full"
          />
          {mainPreview && (
            <img
              src={mainPreview}
              alt="main preview"
              className="mt-2 w-40 h-40 object-cover rounded-lg border"
            />
          )}
          <p className="text-xs text-slate-500 mt-1">
            You can also paste a URL below to use an existing image.
          </p>
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="Main image URL (optional)"
            className="w-full px-3 py-2 border rounded-lg mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Images
          </label>
          <input
            multiple
            type="file"
            accept="image/*"
            onChange={handleAdditionalFilesChange}
            className="w-full"
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {additionalPreviews.map((p, i) => (
              <img
                key={i}
                src={p}
                alt={`add-${i}`}
                className="w-20 h-20 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Sizes (comma separated)
          </label>
          <input
            name="sizes"
            value={form.sizes}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Colors (comma separated)
          </label>
          <input
            name="colors"
            value={form.colors}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select category --</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            name="brand_id"
            value={form.brand_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select brand --</option>
            {brands.map((b) => (
              <option key={b.id || b._id} value={b.id || b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={!!form.featured}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="featured" className="text-sm">
            Featured
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploadingFiles}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          {saving ? "Saving..." : productId ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="px-4 py-2 rounded-lg border"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
