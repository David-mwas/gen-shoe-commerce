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
