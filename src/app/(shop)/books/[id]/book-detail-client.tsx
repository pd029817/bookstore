"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Zap, Minus, Plus } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart-store";
import { ReviewList } from "@/components/reviews/review-list";
import { formatPrice, formatDiscount, formatDate } from "@/lib/utils";
import type { Book } from "@/types/database";

const COVER_COLORS = [
  ["#1e3a5f", "#2563eb"],
  ["#1a1a2e", "#6366f1"],
  ["#064e3b", "#10b981"],
  ["#4c1d95", "#8b5cf6"],
  ["#7c2d12", "#ea580c"],
  ["#1e293b", "#0ea5e9"],
  ["#3b0764", "#c026d3"],
  ["#134e4a", "#2dd4bf"],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function BookCoverPlaceholder({ title, author }: { title: string; author: string }) {
  const colorIndex = hashString(title) % COVER_COLORS.length;
  const [from, to] = COVER_COLORS[colorIndex];

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-8"
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
    >
      <div className="flex-1 flex items-center">
        <h4 className="text-white font-bold text-2xl leading-snug drop-shadow-sm">
          {title}
        </h4>
      </div>
      <div className="border-t border-white/20 pt-3 mt-3">
        <p className="text-white/70 text-sm">{author}</p>
      </div>
    </div>
  );
}

interface BookDetailClientProps {
  book: Book;
  relatedBooks: Partial<Book>[];
}

export function BookDetailClient({ book, relatedBooks }: BookDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const hasDiscount = book.discount_price && book.discount_price < book.price;
  const displayPrice = hasDiscount ? book.discount_price! : book.price;

  function handleAddToCart() {
    addItem(book, quantity);
    addToast(`'${book.title}'을(를) 장바구니에 담았습니다.`, "success");
  }

  function handleBuyNow() {
    addItem(book, quantity);
    window.location.href = "/checkout";
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      {/* Book Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-beige border border-sand rounded-sm overflow-hidden">
          {book.cover_image_url ? (
            <Image
              src={book.cover_image_url}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <BookCoverPlaceholder title={book.title} author={book.author} />
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-heading text-charcoal mb-2">
            {book.title}
          </h1>
          <p className="text-lg text-warm-brown mb-4">{book.author}</p>

          <div className="flex items-center gap-2 mb-6">
            <StarRating rating={book.average_rating} size="md" />
            <span className="text-sm text-warm-brown">
              {book.average_rating.toFixed(1)} ({book.review_count}개 리뷰)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-sand">
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="olive">
                  {formatDiscount(book.price, book.discount_price!)}% 할인
                </Badge>
                <span className="text-warm-brown line-through text-sm">
                  {formatPrice(book.price)}
                </span>
              </div>
            )}
            <span className="text-2xl font-medium text-terracotta">
              {formatPrice(displayPrice)}
            </span>
          </div>

          {/* Book Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-6 pb-6 border-b border-sand">
            {book.publisher && (
              <div>
                <span className="text-warm-brown">출판사</span>
                <p className="text-charcoal">{book.publisher}</p>
              </div>
            )}
            {book.published_date && (
              <div>
                <span className="text-warm-brown">출판일</span>
                <p className="text-charcoal">{formatDate(book.published_date)}</p>
              </div>
            )}
            {book.isbn && (
              <div>
                <span className="text-warm-brown">ISBN</span>
                <p className="text-charcoal">{book.isbn}</p>
              </div>
            )}
            {book.page_count && (
              <div>
                <span className="text-warm-brown">페이지</span>
                <p className="text-charcoal">{book.page_count}쪽</p>
              </div>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-sand rounded-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-warm-brown hover:text-charcoal"
                aria-label="수량 감소"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm text-charcoal">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                className="p-2 text-warm-brown hover:text-charcoal"
                aria-label="수량 증가"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button variant="secondary" onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="w-4 h-4" />
              장바구니
            </Button>
            <Button variant="primary" onClick={handleBuyNow} className="flex-1">
              <Zap className="w-4 h-4" />
              바로 구매
            </Button>
          </div>

          {book.stock <= 5 && book.stock > 0 && (
            <p className="text-sm text-terracotta">
              남은 수량: {book.stock}권
            </p>
          )}
          {book.stock === 0 && (
            <p className="text-sm text-red-600 font-medium">품절</p>
          )}
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <section className="mb-16">
          <h2 className="text-xl font-heading text-charcoal mb-4">책 소개</h2>
          <div className="border-l-2 border-terracotta/30 pl-6 py-2">
            <p className="font-accent text-warm-brown leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="text-xl font-heading text-charcoal mb-4">
          리뷰 ({book.review_count})
        </h2>
        <ReviewList bookId={book.id} />
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section>
          <h2 className="text-xl font-heading text-charcoal mb-6">
            같은 카테고리의 다른 책
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedBooks.map((rb) => (
              <Link
                key={rb.id}
                href={`/books/${rb.id}`}
                className="group border border-sand bg-beige rounded-sm overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="aspect-[3/4] bg-sand/30 relative overflow-hidden">
                  {rb.cover_image_url ? (
                    <Image
                      src={rb.cover_image_url}
                      alt={rb.title || ""}
                      fill
                      sizes="(max-width: 640px) 50vw, 16vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-warm-brown/30 text-xs text-center px-2">
                        {rb.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-charcoal line-clamp-1">{rb.title}</p>
                  <p className="text-xs text-warm-brown">{rb.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
