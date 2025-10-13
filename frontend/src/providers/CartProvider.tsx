import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CartContext, CartItem, ContextShape } from "../contexts/CartContext";
import { apiFetch } from "../lib/api";

import { toast } from "react-toastify";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data: CartItem[] = await apiFetch("/cart");
      setCartItems(data || []);
      setCartCount(data?.reduce((s, i) => s + i.quantity, 0) || 0);
    } catch (err) {
      console.error("Error loading cart", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    productId: string,
    size: string,
    color: string | null = null,
    quantity: number = 1
  ) => {
    if (!user) throw new Error("Must be logged in to add items to cart");
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ productId, size, color, quantity }),
      });
      // keep UI snappy: re-load the cart (single source)
      await loadCart();
      toast.success("Item added to cart");
    } catch (err) {
      console.error("Error adding to cart", err);
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;
    try {
      await apiFetch(`/cart/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      await loadCart();
    } catch (err) {
      console.error("Error updating quantity", err);
      throw err;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;
    try {
      await apiFetch(`/cart/${cartItemId}`, { method: "DELETE" });
      await loadCart();
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Error removing from cart", err);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await apiFetch("/cart", { method: "DELETE" });
      await loadCart();
    } catch (err) {
      console.error("Error clearing cart", err);
      throw err;
    }
  };
//   get total price of items in cart
  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const ctx: ContextShape = {
    cartItems,
    cartCount,
    loading,
    refreshCart: loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
  };

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>;
}
