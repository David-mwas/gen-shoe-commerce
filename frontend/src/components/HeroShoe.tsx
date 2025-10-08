import { useEffect, useMemo, useState } from "react";

interface Props {
  imageUrl?: string; // full-size image (cloudinary secure_url)
  fallbackUrl?: string; // small fallback if image fails
  preload?: boolean; // whether to add <link rel="preload"> for the full image
  className?: string;
  alt?: string;
}

/**
 * If the imageUrl is a Cloudinary URL, create a tiny blurred LQIP variant.
 * If not Cloudinary, return null (component will fall back to a simple colored placeholder).
 */
function makeLqipUrl(imageUrl?: string) {
  if (!imageUrl) return null;
  try {
    // crude detection: cloudinary upload path contains "/upload/"
    // Insert transforms after "/upload/" like: "w_80,q_auto:low,e_blur:200"
    const idx = imageUrl.indexOf("/upload/");
    if (idx === -1) return null;
    const before = imageUrl.slice(0, idx + 8); // includes "/upload/"
    const after = imageUrl.slice(idx + 8);
    // tiny width + blur + low quality
    return `${before}w_80,q_auto:low,e_blur:200/${after}`;
  } catch {
    return null;
  }
}

export default function HeroShoe({
  imageUrl,
  fallbackUrl,
  preload = true,
  className = "",
  alt = "Product image",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const lqip = useMemo(() => makeLqipUrl(imageUrl), [imageUrl]);
  const effectiveFallback =
    fallbackUrl ||
    "https://images.unsplash.com/photo-1528701800487-276f0c4b1d08?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2e6c4f9d69f2fa5a2d9cba9fbe79d8f2";

  // Preload the full image (helps reduce the flash)
  useEffect(() => {
    if (!preload || !imageUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imageUrl;
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        console.error("Error removing preload link:", e);
      }
    };
  }, [imageUrl, preload]);

  // Programmatic image preload - robust way to know when it's cached/loaded
  useEffect(() => {
    if (!imageUrl) return;
    setLoaded(false);
    setErrored(false);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
    img.onerror = () => setErrored(true);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  // Styling notes:
  // - The wrapper reserves space via aspect-ratio to avoid layout shift.
  // - The lqip is blurred and slightly scaled to look nice while loading.
  // - The full image fades in.
  return (
    <div
      className={`hero-shoe-wrap relative w-[420px] h-[420px] ${className}`}
      aria-hidden={false}
      // keep an explicit ratio to avoid CLS - change as needed
      style={{ aspectRatio: "1 / 1" }}
    >
      <style>
        {`
         @keyframes floaty {
          0% { transform: translateY(0) rotate(-10deg); opacity: 0.95; }
          50% { transform: translateY(-18px) rotate(-6deg); opacity: 1; }
          100% { transform: translateY(0) rotate(-10deg); opacity: 0.95; }
        }
        .hero-shoe {
          animation: floaty 5s ease-in-out infinite;
          transform-origin: center;
        }

        `}
      </style>

      {/* LQIP / placeholder (visible until loaded) */}
      {lqip ? (
        // <img
        //   src={lqip}
        //   aria-hidden={true}
        //   alt=""
        //   className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-out transform ${
        //     loaded ? "opacity-0 scale-105" : "opacity-100 scale-105"
        //   } filter`}
        //   style={{ filter: "blur(8px)" }}
        // />
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-300/8 to-rose-300/6 transition-opacity duration-500 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : (
        // fallback colored placeholder (keeps visual stable)
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-300/8 to-rose-300/6 transition-opacity duration-500 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Actual hero image */}
      {imageUrl && (
        <img
          src={errored ? effectiveFallback : imageUrl || effectiveFallback}
          alt={alt}
          className={`relative w-full h-full hero-shoe drop-shadow-2xl object-contain transition-opacity duration-600 ease-out rounded-md shadow-lg ${
            loaded && !errored ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          loading={preload ? "eager" : "lazy"}
          style={{ transform: "rotate(-10deg)" }}
        />
      )}

      {/* small decorative shadow/overlay (keeps "pop" consistent while loading) */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl" />
    </div>
  );
}
