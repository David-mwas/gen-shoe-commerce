import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCOpen, setIsCOpen] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // if (password.length < 6) {
    //   toast.error("Password must be at least 6 characters");
    //   setError("Password must be at least 6 characters");
    //   setLoading(false);
    //   return;
    // }

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
    // regex for full name validation (only letters and spaces)
    const fullNameRegex = /^[A-Za-z\s]+$/;
    if (!fullNameRegex.test(fullName) || fullName.trim().length < 2) {
      toast.error("Please enter a valid full name (only letters and spaces)");
      setError("Please enter a valid full name (only letters and spaces)");
      setLoading(false);
      return;
    }
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message || "Failed to create account");
        setError(error.message || "Failed to create account");
      } else {
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
      setError(err.message || "An error occurred");
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py- px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Create Account
            </h2>
            <p className="text-slate-600">Join ShoeStore today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type={isOpen ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Min. 8 characters"
              />
              <div
                className="absolute flex items-center justify-center right-0 top-[50%] px-2 h-[40%]"
                onClick={() => tooglePasswordShow("isOpen")}
              >
                {" "}
                {isOpen ? <EyeIcon /> : <EyeOffIcon />}
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={isCOpen ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="confirm password"
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
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-slate-900 font-semibold hover:text-slate-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
