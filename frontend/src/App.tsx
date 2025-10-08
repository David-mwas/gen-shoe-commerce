import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AuthProvider } from './providers/AuthProvider';
import AdminProductNew from './pages/admin/AdminProductNew';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminCategories from './pages/admin/AdminCategories';
import { OrderPage } from './pages/Order';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header />
          <main className="flex-1">
            <Routes>
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />

              {/* admin product create/edit */}
              <Route path="/admin/products/new" element={<AdminProductNew />} />
              <Route
                path="/admin/products/edit/:id"
                element={<AdminProductEdit />}
              />
              {/* categories management */}
              <Route path="/admin/categories" element={<AdminCategories />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
