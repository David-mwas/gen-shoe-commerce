// src/contexts/CartContext.tsx
import { createContext } from "react";

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

export type ContextShape = {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (
    productId: string,
    size: string,
    color?: string | null,
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
    getTotal: () => number;
};

export const CartContext = createContext<ContextShape | undefined>(undefined);
