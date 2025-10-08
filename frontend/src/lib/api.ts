// export const API_BASE =
//   import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// export async function apiFetch(path: string, opts: RequestInit = {}) {
//   const token = localStorage.getItem("token");
//   const headers = opts.headers
//     ? new Headers(opts.headers as HeadersInit)
//     : new Headers();
//   headers.set("Content-Type", "application/json");
//   if (token) headers.set("Authorization", `Bearer ${token}`);
//   const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
//   const text = await res.text();
//   const data = text ? JSON.parse(text) : null;
//   if (!res.ok) throw { status: res.status, ...data };
//   return data;
// }

// src/lib/api.ts
// export async function apiFetch(
//   path: string,
//   opts: RequestInit & { body?: any; isForm?: boolean } = {}
// ) {
//   const url = `${import.meta.env.VITE_API_URL || ""}/api${path}`;
//   const headers: Record<string, string> = {};
//   const token = localStorage.getItem("token");
//   if (token) headers["Authorization"] = `Bearer ${token}`;

//   let body = opts.body;

//   // If isForm flag set, leave body as-is and DON'T set Content-Type
//   if (!opts.isForm) {
//     if (body && typeof body !== "string") {
//       headers["Content-Type"] = "application/json";
//       body = JSON.stringify(body);
//     }
//   }

//   const res = await fetch(url, {
//     ...opts,
//     headers: { ...headers, ...(opts.headers || {}) } as any,
//     body,
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     let err;
//     try {
//       err = JSON.parse(text);
//     } catch {
//       err = text;
//     }
//     throw err;
//   }

//   // try json
//   const contentType = res.headers.get("content-type") || "";
//   if (contentType.includes("application/json")) return res.json();
//   return res.text();
// }

// src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export async function apiFetch(
  path: string,
  opts: RequestInit & { body?: any; isForm?: boolean } = {}
) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body = opts.body;

  // If isForm flag set, leave body as-is and DON'T set Content-Type
  if (!opts.isForm) {
    if (body && typeof body !== "string") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    } else if (body && typeof body === "string") {
      // If caller already passed a string, check if it looks like JSON and set header
      const s = body.trim();
      if (s.startsWith("{") || s.startsWith("[")) {
        headers["Content-Type"] = "application/json";
      }
    }
  }

  const res = await fetch(url, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) } as any,
    body,
  });

  // helpful debug when something returns HTML
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      err = text;
    }
    throw err;
  }

  if (contentType.includes("application/json")) return res.json();
  // If the server returned HTML, throw helpful error
  const txt = await res.text();
  throw new Error(`Expected JSON response but received: ${txt.slice(0, 400)}`);
}
