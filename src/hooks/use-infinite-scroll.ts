"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/types/database";

interface UseInfiniteScrollOptions {
  initialBooks: Book[];
  initialCursor: string | null;
  fetchUrl: string;
}

export function useInfiniteScroll({
  initialBooks,
  initialCursor,
  fetchUrl,
}: UseInfiniteScrollOptions) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);

    try {
      const separator = fetchUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${fetchUrl}${separator}cursor=${cursor}`);
      const data = await res.json();
      setBooks((prev) => [...prev, ...data.books]);
      setCursor(data.nextCursor);
    } catch {
      // Silently fail on load more
    } finally {
      setLoading(false);
    }
  }, [cursor, fetchUrl, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset when fetchUrl changes (e.g., filters change)
  useEffect(() => {
    setBooks(initialBooks);
    setCursor(initialCursor);
  }, [initialBooks, initialCursor]);

  return { books, loading, hasMore: !!cursor, sentinelRef };
}
