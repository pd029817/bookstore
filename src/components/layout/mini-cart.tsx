"use client";

import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MiniCartProps {
  onClose: () => void;
}

export function MiniCart({ onClose }: MiniCartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-80 bg-beige border border-sand rounded-sm shadow-lg z-50"
    >
      <div className="p-4">
        <h3 className="text-sm font-medium text-charcoal mb-3">
          장바구니 ({items.length})
        </h3>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-warm-brown">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">장바구니가 비어있어요</p>
          </div>
        ) : (
          <>
            <div className="max-h-60 overflow-auto space-y-3 mb-4">
              {items.map((item) => {
                const price = item.book.discount_price || item.book.price;
                return (
                  <div key={item.book.id} className="flex gap-2 text-xs">
                    <div className="w-8 h-10 bg-sand/50 rounded-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-charcoal truncate">{item.book.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          className="text-warm-brown hover:text-charcoal"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          className="text-warm-brown hover:text-charcoal"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-terracotta">{formatPrice(price * item.quantity)}</p>
                      <button
                        onClick={() => removeItem(item.book.id)}
                        className="text-warm-brown hover:text-red-500 mt-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-sm font-medium text-charcoal mb-3 pt-3 border-t border-sand">
              <span>합계</span>
              <span className="text-terracotta">{formatPrice(getTotalPrice())}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button variant="primary" size="sm" className="w-full">
                결제하기
              </Button>
            </Link>
          </>
        )}

        <Link
          href="/cart"
          className="block text-center text-sm text-warm-brown hover:text-terracotta mt-2 transition-colors"
          onClick={onClose}
        >
          장바구니 보기
        </Link>
      </div>
    </div>
  );
}
