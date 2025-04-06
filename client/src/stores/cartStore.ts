import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

type CartItem = Product & { quantity: number };

type CartState = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId)
      })),
      incrementQuantity: (productId) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      })),
      decrementQuantity: (productId) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        )
      })),
      clearCart: () => set({ cart: [] }),
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
