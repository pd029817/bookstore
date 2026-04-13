"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-sand mx-auto mb-4" />
        <h1 className="text-2xl font-heading text-charcoal mb-2">
          장바구니가 비어있어요
        </h1>
        <p className="text-warm-brown mb-8">
          마음에 드는 책을 담아보세요.
        </p>
        <Link href="/books">
          <Button variant="primary" size="lg">
            책 둘러보기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-heading text-charcoal mb-8">장바구니</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.book.discount_price || item.book.price;
            return (
              <div
                key={item.book.id}
                className="flex gap-4 p-4 border border-sand bg-beige rounded-sm"
              >
                {/* Cover placeholder */}
                <div className="w-16 h-20 bg-sand/50 rounded-sm shrink-0" />

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/books/${item.book.id}`}
                    className="text-sm font-heading text-charcoal hover:text-terracotta transition-colors line-clamp-1"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-xs text-warm-brown">{item.book.author}</p>
                  <p className="text-sm text-terracotta font-medium mt-1">
                    {formatPrice(price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateQuantity(item.book.id, item.quantity - 1)
                    }
                    className="p-1 text-warm-brown hover:text-charcoal"
                    aria-label="수량 감소"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.book.id, item.quantity + 1)
                    }
                    className="p-1 text-warm-brown hover:text-charcoal"
                    aria-label="수량 증가"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Total + Delete */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium text-charcoal">
                    {formatPrice(price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.book.id)}
                    className="p-1 text-warm-brown hover:text-red-500 transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-sand bg-beige rounded-sm p-6 sticky top-20">
            <h2 className="text-lg font-heading text-charcoal mb-4">
              주문 요약
            </h2>
            <div className="space-y-2 text-sm mb-4 pb-4 border-b border-sand">
              <div className="flex justify-between text-warm-brown">
                <span>상품 금액</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-warm-brown">
                <span>배송비</span>
                <span>{totalPrice >= 30000 ? "무료" : formatPrice(3000)}</span>
              </div>
            </div>
            <div className="flex justify-between font-medium text-charcoal mb-6">
              <span>총 결제금액</span>
              <span className="text-terracotta text-lg">
                {formatPrice(
                  totalPrice + (totalPrice >= 30000 ? 0 : 3000)
                )}
              </span>
            </div>
            <Link href="/checkout">
              <Button variant="primary" size="lg" className="w-full">
                결제하기
              </Button>
            </Link>
            {totalPrice < 30000 && (
              <p className="text-xs text-warm-brown mt-3 text-center">
                {formatPrice(30000 - totalPrice)} 더 담으면 무료 배송!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
