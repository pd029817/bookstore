"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { BookSearch } from "@/components/books/book-search";
import { BookFilters } from "@/components/books/book-filters";
import { BookGrid } from "@/components/books/book-grid";
import { useToast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart-store";
import type { Book } from "@/types/database";

export function BooksPageClient() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [books, setBooks] = useState<Book[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      params.set(key, value);
    }
    return `/api/books?${params.toString()}`;
  }, [searchParams]);

  // Initial load and filter changes
  useEffect(() => {
    setLoading(true);
    fetch(buildUrl())
      .then((r) => r.json())
      .then((data) => {
        setBooks(data.books || []);
        setCursor(data.nextCursor || null);
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [buildUrl]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor && !loadingMore) {
          setLoadingMore(true);
          fetch(`${buildUrl()}&cursor=${cursor}`)
            .then((r) => r.json())
            .then((data) => {
              setBooks((prev) => [...prev, ...(data.books || [])]);
              setCursor(data.nextCursor || null);
            })
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, loadingMore, buildUrl]);

  function handleAddToCart(book: Book) {
    addItem(book);
    addToast(`'${book.title}'을(를) 장바구니에 담았습니다.`, "success");
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      {/* Search */}
      <div className="mb-6">
        <BookSearch />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <BookFilters />
      </div>

      {/* Book Grid */}
      <BookGrid
        books={books}
        loading={loading || loadingMore}
        onAddToCart={handleAddToCart}
      />

      {/* Infinite scroll sentinel */}
      {cursor && <div ref={sentinelRef} className="h-4" />}

      {!cursor && books.length > 0 && (
        <p className="text-center text-warm-brown/50 text-sm py-8">
          모든 도서를 불러왔습니다.
        </p>
      )}
    </div>
  );
}
