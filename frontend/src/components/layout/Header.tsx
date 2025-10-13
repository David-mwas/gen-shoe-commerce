import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useCartContext } from "../../hooks/useCart";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCartContext();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-slate-900">
                ShoeStore
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/shop"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/shop?featured=true"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Featured
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/orders"
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              to="/cart"
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </form>

            <Link
              to="/shop"
              className="block py-2 text-slate-700 hover:text-slate-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/shop?featured=true"
              className="block py-2 text-slate-700 hover:text-slate-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Featured
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/orders"
                  className="block py-2 text-slate-700 hover:text-slate-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-slate-700 hover:text-slate-900 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-slate-700 hover:text-slate-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
