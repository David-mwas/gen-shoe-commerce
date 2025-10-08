// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { ArrowRight, TrendingUp, Shield, Truck } from "lucide-react";
// import { ProductCard } from "../components/products/ProductCard";

// import { useCart } from "../hooks/useCart";
// import { useAuth } from "../hooks/useAuth";
// import { apiFetch } from "../lib/api";

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   image_url: string;
//   status: "in_stock" | "out_of_stock" | "discontinued";
//   sizes: string[];
//   colors: string[];
//   stock_quantity: number;
//   featured: boolean;
//   brand?: {
//     name: string;
//   };
// }

// export function HomePage() {
//   const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuth();
//   const { addToCart } = useCart();

//   useEffect(() => {
//     loadFeaturedProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // normalize whatever the API returned into an array of products
//   const normalizeApiProducts = (raw: any): Product[] => {
//     if (!raw) return [];

//     // common shapes: raw is array, or { data: [...] }, or { rows: [...] }, or { result: [...] }
//     let arr: any[] = [];
//     if (Array.isArray(raw)) {
//       arr = raw;
//     } else if (Array.isArray(raw.data)) {
//       arr = raw.data;
//     } else if (Array.isArray(raw.rows)) {
//       arr = raw.rows;
//     } else if (Array.isArray(raw.result)) {
//       arr = raw.result;
//     } else if (Array.isArray(raw.products)) {
//       arr = raw.products;
//     } else {
//       // sometimes API returns an object with keys that are arrays; try to pick the first array
//       const firstArr = Object.values(raw).find((v) => Array.isArray(v));
//       if (firstArr) arr = firstArr;
//       else {
//         // last resort: if raw has a `count` and some payload, just log and return empty
//         console.warn("Unrecognized products response shape:", raw);
//         return [];
//       }
//     }

//     // normalize each product (id/_id, brand shape, ensure arrays)
//     return arr.map((p: any) => ({
//       id:
//         p.id ||
//         p._id ||
//         p._id?.toString() ||
//         p._id?.toString?.() ||
//         p.slug ||
//         JSON.stringify(p).slice(0, 8),
//       name: p.name || p.title || "Untitled",
//       slug: p.slug || (p.name ? slugify(p.name) : ""),
//       price: Number(p.price || 0),
//       image_url: p.image_url || p.image || (p.images && p.images[0]) || "",
//       status: p.status || "in_stock",
//       sizes: Array.isArray(p.sizes)
//         ? p.sizes
//         : typeof p.sizes === "string"
//         ? p.sizes.split(",").map((s: string) => s.trim())
//         : [],
//       colors: Array.isArray(p.colors)
//         ? p.colors
//         : typeof p.colors === "string"
//         ? p.colors.split(",").map((s: string) => s.trim())
//         : [],
//       stock_quantity: Number(p.stock_quantity || p.stock || 0),
//       featured: !!p.featured,
//       brand: p.brand || (p.brand_id ? { name: p.brand_id } : undefined),
//     })) as Product[];
//   };

//   // small slug helper for fallback
//   const slugify = (s: string) =>
//     s
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");

//   const loadFeaturedProducts = async () => {
//     setLoading(true);
//     try {
//       const raw = await apiFetch(
//         "/products?featured=true&status=in_stock&limit=8"
//       );
//       // helpful debug: console the raw response once
//       // remove or comment out later if noisy
//       console.debug("Raw featured products response:", raw);

//       const normalized = normalizeApiProducts(raw);
//       setFeaturedProducts(normalized);
//     } catch (err) {
//       console.error("Error loading featured products:", err);
//       setFeaturedProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuickAdd = async (productId: string) => {
//     if (!user) {
//       alert("Please sign in to add items to cart");
//       return;
//     }

//     const product = featuredProducts.find((p) => p.id === productId);
//     if (!product) return;

//     try {
//       // If sizes are in product already
//       const defaultSize =
//         product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
//       await addToCart(productId, defaultSize);
//       alert("Added to cart!");
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       alert("Failed to add to cart");
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       <section className="relative h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center" />
//         </div>
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
//           <div className="max-w-2xl">
//             <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
//               Step In Style,
//               <br />
//               Walk in Comfort
//             </h1>
//             <p className="text-xl text-slate-300 mb-8">
//               Discover locally made footwear from the heart of Kenya.{" "}
//               <b>Quality</b>, <b>style</b>, and <b>comfort</b> in every step.
//             </p>
//             <Link
//               to="/shop"
//               className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors group"
//             >
//               Shop Now
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 bg-slate-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
//                 <Truck className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-slate-900 mb-2">
//                   Fast Delivery
//                 </h3>
//                 <p className="text-slate-600 text-sm">
//                   Get your shoes delivered within 2-5 business days across Kenya
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
//                 <Shield className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-slate-900 mb-2">
//                   Secure Payment
//                 </h3>
//                 <p className="text-slate-600 text-sm">
//                   Pay securely with M-Pesa or card payment options
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
//                 <TrendingUp className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-slate-900 mb-2">
//                   Authentic Products
//                 </h3>
//                 <p className="text-slate-600 text-sm">
//                   100% genuine products from authorized distributors
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-end justify-between mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-slate-900 mb-2">
//                 Featured Products
//               </h2>
//               <p className="text-slate-600">
//                 Hand-picked selection of our best shoes
//               </p>
//             </div>
//             <Link
//               to="/shop?featured=true"
//               className="text-slate-900 font-semibold hover:text-slate-700 flex items-center gap-2 group"
//             >
//               View All
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="bg-slate-200 rounded-xl h-96 animate-pulse"
//                 />
//               ))}
//             </div>
//           ) : featuredProducts.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {featuredProducts.map((product) => (
//                 <ProductCard
//                   key={product.id}
//                   product={product}
//                   onAddToCart={handleQuickAdd}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <p className="text-slate-600">
//                 No featured products available at the moment.
//               </p>
//             </div>
//           )}
//         </div>
//       </section>

//       <section className="py-16 bg-slate-900 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
//           <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
//             Sign up today and get exclusive access to new arrivals, special
//             offers, and style tips.
//           </p>
//           <Link
//             to="/signup"
//             className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
//           >
//             Create Account
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// }

// src/pages/HomePage.tsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Shield, Truck } from "lucide-react";
import { ProductCard } from "../components/products/ProductCard";

import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import HeroShoe from "../components/HeroShoe";

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

  const heroShoeRef = useRef<HTMLImageElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
    // trigger a one-time confetti burst a bit after mount
    const t = setTimeout(() => burstConfetti(), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // normalize whatever the API returned into an array of products
  const normalizeApiProducts = (raw: any): Product[] => {
    if (!raw) return [];

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
      const firstArr = Object.values(raw).find((v) => Array.isArray(v));
      if (firstArr) arr = firstArr;
      else {
        console.warn("Unrecognized products response shape:", raw);
        return [];
      }
    }

    return arr.map((p: any) => ({
      id:
        p.id ||
        p._id ||
        (p._id && p._id.toString && p._id.toString()) ||
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
      console.debug("Raw featured products response:", raw);
      const normalized = normalizeApiProducts(raw);
      setFeaturedProducts(normalized);
      // small staggered entrance by setting CSS variable on each card later
      requestAnimationFrame(() => {
        document
          .querySelectorAll(".fp-card")
          .forEach((el, i) =>
            (el as HTMLElement).style.setProperty("--index", String(i))
          );
      });
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
      const defaultSize =
        product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
      await addToCart(productId, defaultSize);
      // small micro-animation on add
      pulseCard(productId);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  // pulse the ProductCard element (if it exists)
  function pulseCard(productId: string) {
    const el = document.querySelector(`[data-product-id="${productId}"]`);
    if (!el) return;
    el.classList.add("pulse-on-add");
    setTimeout(() => el.classList.remove("pulse-on-add"), 900);
  }

  // tiny confetti burst (emoji based, small & lightweight)
  function burstConfetti() {
    const emojis = ["🎉", "✨", "🔥", "🎈", "💥"];
    for (let i = 0; i < 18; i++) {
      const span = document.createElement("span");
      span.className = "hp-confetti";
      span.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      const left = Math.random() * 80 + 10;
      span.style.left = `${left}%`;
      span.style.fontSize = `${Math.random() * 18 + 14}px`;
      document.body.appendChild(span);
      setTimeout(() => span.remove(), 3800);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Inline keyframes and a few helper classes so Tailwind purge doesn't remove them */}
      <style>{`
        /* hero floating shoe bob */
           @keyframes slideInLeft {
            0% { opacity: 0; transform: translateX(-100%); }
            100% { opacity: 1; transform: translateX(0); }
          }
         @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(100%); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes floaty {
          0% { transform: translateY(0) rotate(-10deg); opacity: 0.95; }
          50% { transform: translateY(-18px) rotate(-6deg); opacity: 1; }
          100% { transform: translateY(0) rotate(-10deg); opacity: 0.95; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        .hp-hero-gradient {
          background: radial-gradient(1200px 600px at 10% 10%, rgba(255,255,255,0.03), transparent 8%),
                      radial-gradient(800px 500px at 90% 80%, rgba(255,255,255,0.02), transparent 12%);
        }

        .hero-shoe {
          animation: floaty 5s ease-in-out infinite;
          transform-origin: center;
        }

        .marquee-track {
          animation: marquee 30s linear infinite;
        }

        .fade-up {
          animation: fadeUp 600ms cubic-bezier(.16,.84,.4,1) both;
        }

        .fp-card {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeUp 500ms cubic-bezier(.16,.84,.4,1) both;
          animation-delay: calc(var(--index, 0) * 80ms);
        }

        .pulse-on-add { transform: scale(1.06); transition: transform 280ms ease; box-shadow: 0 12px 30px rgba(15,23,42,0.12); }
        
        .hp-confetti {
          position: fixed;
          top: 0;
          z-index: 9999;
          pointer-events: none;
          animation: confettiFall 3.6s ease-in forwards;
          opacity: 0.95;
        }

        .slide-in-left {
          animation: slideInLeft 900ms cubic-bezier(.16,.84,.4,1) both;
        }

      .slide-in-right {
        animation: slideInRight 900ms cubic-bezier(.16,.84,.4,1) both;
      }
      `}</style>

      {/* HERO */}
      <section className="relative h-[640px] overflow-hidden hp-hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center mix-blend-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="w-full lg:w-1/2 text-white z-10 slide-in-left">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">
              Step into <span className="text-amber-300">Style</span>,
              <br />
              Walk with <span className="text-emerald-300">Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-6 max-w-xl">
              Hand-crafted footwear built for comfort and designed to turn
              heads. Fast delivery, secure payments — discover your perfect pair
              today.
            </p>

            <div className="flex gap-4 items-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-full font-semibold shadow-lg transform transition-all hover:scale-105 hover:-translate-y-1"
                aria-label="Shop now"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/shop?featured=true"
                className="inline-flex items-center gap-2 text-white/90 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition"
              >
                Featured Picks
              </Link>
            </div>

            <div className="mt-8 flex gap-4 items-center">
              <div className="bg-white/10 px-3 py-2 rounded-lg text-sm">
                <strong className="text-white">Free</strong> shipping over KSh
                5,000
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-lg text-sm">
                <strong className="text-white">14-day</strong> returns
              </div>
            </div>
          </div>

          {/* floating shoe */}
          <div
            className="hidden lg:block absolute right-8 top-14 w-[420px] h-[420px] pointer-events-none select-none slide-in-right"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400/10 to-rose-400/5 blur-3xl transform -rotate-6" />
              {/* <img
                ref={heroShoeRef}
                src={
                  featuredProducts[0]?.image_url ||
                  "https://images.unsplash.com/photo-1528701800487-276f0c4b1d08?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2e6c4f9d69f2fa5a2d9cba9fbe79d8f2"
                }
                alt="Floating shoe"
                className="hero-shoe w-full h-full object-contain drop-shadow-2xl rounded-md shadow-lg"
                style={{ transform: "rotate(-10deg)" }}
              /> */}

              <HeroShoe imageUrl={featuredProducts[0]?.image_url} alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ICON FEATURES */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 fade-up">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Fast Delivery
                </h3>
                <p className="text-slate-600 text-sm">
                  2–5 business days across Kenya
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Secure Payment
                </h3>
                <p className="text-slate-600 text-sm">M-Pesa & card payments</p>
              </div>
            </div>

            <div
              className="flex items-start gap-4 fade-up"
              style={{ animationDelay: "160ms" }}
            >
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Authentic Products
                </h3>
                <p className="text-slate-600 text-sm">
                  From trusted distributors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS + MARQUEE */}
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

          {/* marquee */}
          <div className="mb-8 overflow-hidden max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 border-t border-b">
            <div
              ref={marqueeRef}
              className="flex gap-6 items-center whitespace-nowrap py-3 marquee-track"
              style={{ willChange: "transform" }}
            >
              {/* duplicate images to create seamless loop */}
              {[...featuredProducts, ...featuredProducts].map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  className="flex-shrink-0  h-28 bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={p.image_url || ""}
                    alt={p.name}
                    className="w-full h-full object-contain p-"
                  />
                </div>
              ))}
            </div>
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
                <div
                  key={product.id}
                  className="fp-card bg-white rounded-xl shadow-sm overflow-hidden transition-transform transform hover:scale-105"
                  data-product-id={product.id}
                >
                  <ProductCard product={product} onAddToCart={handleQuickAdd} />
                </div>
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

      {/* JOIN */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Sign up and get early access to new drops, flash offers, and styling
            tips.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-colors transform hover:-translate-y-1"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
