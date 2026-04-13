"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book } from "@/types/database";

export interface CartItem {
  id?: string; // DB id (present when synced to server)
  book: Book;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setOpen: (open) => set({ isOpen: open }),

      addItem: (book, quantity = 1) => {
        const { items } = get();
        const existing = items.find((item) => item.book.id === book.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.book.id === book.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { book, quantity }] });
        }
      },

      removeItem: (bookId) => {
        set({ items: get().items.filter((item) => item.book.id !== bookId) });
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(bookId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.book.id === bookId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.book.discount_price || item.book.price;
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: "bookshop-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
