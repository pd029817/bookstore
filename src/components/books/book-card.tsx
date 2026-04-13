"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { formatPrice, formatDiscount } from "@/lib/utils";
import type { Book } from "@/types/database";

const COVER_COLORS = [
  ["#1e3a5f", "#2563eb"], // navy → blue
  ["#1a1a2e", "#6366f1"], // dark → indigo
  ["#064e3b", "#10b981"], // dark green → emerald
  ["#4c1d95", "#8b5cf6"], // deep purple → violet
  ["#7c2d12", "#ea580c"], // brown → orange
  ["#1e293b", "#0ea5e9"], // slate → sky
  ["#3b0764", "#c026d3"], // purple → fuchsia
  ["#134e4a", "#2dd4bf"], // teal dark → teal
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
      className="w-full h-full flex flex-col justify-between p-5 group-hover:scale-[1.03] transition-transform duration-300"
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
    >
      <div className="flex-1 flex items-center">
        <h4 className="text-white font-bold text-base leading-snug line-clamp-4 drop-shadow-sm">
          {title}
        </h4>
      </div>
      <div className="border-t border-white/20 pt-2 mt-2">
        <p className="text-white/70 text-xs truncate">{author}</p>
      </div>
    </div>
  );
}

interface BookCardProps {
  book: Book;
  onAddToCart?: (book: Book) => void;
}

export function BookCard({ book, onAddToCart }: BookCardProps) {
  const hasDiscount = book.discount_price && book.discount_price < book.price;
  const displayPrice = hasDiscount ? book.discount_price! : book.price;

  return (
    <div className="group border border-sand bg-beige rounded-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link href={`/books/${book.id}`} className="block relative aspect-[3/4] overflow-hidden">
        {book.cover_image_url ? (
          <Image
            src={book.cover_image_url}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <BookCoverPlaceholder title={book.title} author={book.author} />
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-olive text-white text-xs px-2 py-0.5 rounded-sm">
            {formatDiscount(book.price, book.discount_price!)}% OFF
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link href={`/books/${book.id}`}>
          <h3 className="font-heading text-charcoal text-sm leading-tight mb-1 line-clamp-2 hover:text-terracotta transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-warm-brown text-xs mb-2">{book.author}</p>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={book.average_rating} size="sm" />
          {book.review_count > 0 && (
            <span className="text-xs text-warm-brown">({book.review_count})</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount && (
              <span className="text-xs text-warm-brown line-through mr-1">
                {formatPrice(book.price)}
              </span>
            )}
            <span className="text-terracotta font-medium text-sm">
              {formatPrice(displayPrice)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(book);
            }}
            className="p-2 text-warm-brown hover:text-terracotta hover:bg-terracotta/10 rounded-sm transition-colors"
            aria-label="장바구니에 담기"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
