import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success(
        "If that email exists we'll send a reset link. Check your email inbox"
      );
      setMessage("If that email exists we'll send a reset link. Check your email inbox");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset link");
      console.error("forgot error", err);
      setError(err?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        {message ? (
          <div className="bg-green-50 text-green-800 p-3 rounded mb-4">
            {message}
          </div>
        ) : (
          <>
            <form onSubmit={submit}>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4"
                required
              />
              {error && <div className="text-red-600 mb-2">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2 rounded"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <div className="mt-4 text-sm text-slate-600">
              Remembered?{" "}
              <Link to="/login" className="text-slate-900">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
