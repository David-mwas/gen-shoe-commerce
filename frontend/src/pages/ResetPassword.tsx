import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCOpen, setIsCOpen] = useState(false);


  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link.");
      setError("Invalid reset link.");
    }

    verifyToken();
  }, [token, email]);

  const verifyToken = async () => {
    try {
      await apiFetch("/auth/token/verify", {
        method: "POST",
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      // toast.success("verified!")
    } catch (error: any) {
      // toast.error(error?.message || "Failed to verify token");
      setError(error?.message || "Failed to verify token");
      console.error(error?.message || "Failed tp verify token");
    }
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setMessage(null);
    // regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // regex for password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one letter and one number"
      );
      setError(
        "Password must be at least 8 characters long and contain at least one letter and one number"
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      toast.success("Password changed. Redirecting to login...");
      setMessage("Password changed. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1600);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password");
      console.error("reset error", err);
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  
  const tooglePasswordShow = (value: string) => {
    if (value === "isOpen") {
      setIsOpen((prev) => !prev);
    } else {
      setIsCOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {message ? (
          <div className="bg-green-50 p-3 rounded text-green-800">
            {message}
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                New password
              </label>
              <input
                type={isOpen ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded disabled:cursor-not-allowed"
                required
                disabled={!!error && error === "Invalid or expired token"}
              />
              <div
                className="absolute flex items-center justify-center right-0 top-[50%] px-2 h-[40%]"
                onClick={() => tooglePasswordShow("isOpen")}
              >
                {" "}
                {isOpen ? <EyeIcon /> : <EyeOffIcon />}
              </div>
            </div>
            <div className="relative mt-3">
              {" "}
              <label className="block text-sm font-medium mb-1">
                Confirm password
              </label>
              <input
                type={isCOpen ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded disabled:cursor-not-allowed"
                required
                disabled={!!error && error === "Invalid or expired token"}
              />
              <div
                className="absolute flex items-center justify-center right-0 top-[50%] px-2 h-[40%]"
                onClick={() => tooglePasswordShow("")}
              >
                {" "}
                {isCOpen ? <EyeIcon /> : <EyeOffIcon />}
              </div>
            </div>
            <button
              type="submit"
              disabled={
                loading || (!!error && error === "Invalid or expired token")
              }
              className="w-full bg-slate-900 text-white py-2 rounded disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
          </form>
        )}
        <div className="mt-4 text-sm text-slate-600">
          <Link to="/login" className="text-slate-900">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
