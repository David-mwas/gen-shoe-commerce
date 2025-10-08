import { useState, useEffect } from "react";

import { apiFetch } from "../lib/api";
import { useAuth } from "./useAuth";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
    status: string;
  };
}

export function useCart() {
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
    console.log("cart", { productId, size, color, quantity });
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ productId, size, color, quantity }),
      });
      await loadCart();
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

  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  return {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    refreshCart: loadCart,
  };
}
