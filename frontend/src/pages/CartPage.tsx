import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useCartContext } from '../hooks/useCart';


export function CartPage() {
  const { cartItems, loading, updateQuantity, removeFromCart, getTotal } = useCartContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your cart</h2>
          <p className="text-slate-600 mb-6">Please sign in to add items to your cart</p>
          <Link
            to="/login"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Start shopping to add items to your cart</p>
          <Link
            to="/shop"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex gap-4">
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-slate-700 mb-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 mb-2">
                      Size: {item.size}
                      {item.color && ` • Color: ${item.color}`}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      KSh {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block text-center text-slate-700 hover:text-slate-900 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
