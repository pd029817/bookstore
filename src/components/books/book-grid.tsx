"use client";

import { BookCard } from "./book-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Book } from "@/types/database";

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  onAddToCart?: (book: Book) => void;
}

export function BookGrid({ books, loading, onAddToCart }: BookGridProps) {
  if (books.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-brown text-lg mb-2">
          검색 결과가 없어요
        </p>
        <p className="text-warm-brown/60 text-sm">
          다른 키워드로 검색해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onAddToCart={onAddToCart} />
      ))}
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="border border-sand bg-beige rounded-sm overflow-hidden">
            <Skeleton className="aspect-[3/4]" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
    </div>
  );
}
