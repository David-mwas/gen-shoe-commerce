import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { MainLayout } from "./components/layout/MainLayout";
import { AuthLayout } from "./components/layout/AuthLayout";

import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";

import { AuthProvider } from "./providers/AuthProvider";

import AdminProductNew from "./pages/admin/AdminProductNew";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminCategories from "./pages/admin/AdminCategories";
import { OrderPage } from "./pages/Order";
import { ArrowLeft } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "./providers/CartProvider";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastContainer position="top-right" />
          <Routes>
            {/* Routes that use header/footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route
                path="/order-confirmation/:orderId"
                element={<OrderConfirmationPage />}
              />
              <Route path="/order/:id" element={<OrderPage />} />

              {/* admin (inside main layout so header/footer appear) */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products/new" element={<AdminProductNew />} />
              <Route
                path="/admin/products/edit/:id"
                element={<AdminProductEdit />}
              />
              <Route path="/admin/categories" element={<AdminCategories />} />
            </Route>

            {/* Auth routes — no header/footer */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Fallback route (optional) */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center flex-col w-screen h-[calc(100vh-124px)] p-4">
                  <h2 className="text-4xl font-bold text-center mt-20">
                    404 - Page Not Found
                  </h2>
                  <p className="text-center mt-4">
                    Sorry, the page you are looking for does not exist.
                  </p>
                  <p className="text-center mt-2">
                    <Link to="/" className="text-blue-500 hover:underline">
                      <ArrowLeft className="inline w-4 h-4 mr-1" />
                      Go back to Home
                    </Link>
                  </p>
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
