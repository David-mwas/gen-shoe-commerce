import { useEffect, useState, ReactNode } from "react";
import { API_BASE, apiFetch } from "../lib/api";
import { AuthContext, Profile } from "../contexts/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch("/auth/me");
      console.log("Session data", data);
      setUser({ id: data.user._id, email: data.user.email });
      setProfile({
        id: data.user._id,
        email: data.user.email,
        full_name: data.user.full_name,
        phone: data.user.phone,
        address: data.user.address,
        is_admin: data.user.role === import.meta.env.VITE_USER_ROLE,
      });
    } catch (err) {
      console.error("Session load failed", err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    // optional: listen to storage events to pick token changes across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        loadSession();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data };
      localStorage.setItem("token", data.token);
      await loadSession();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data };
      localStorage.setItem("token", data.token);
      await loadSession();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        isAdmin: profile?.is_admin ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
