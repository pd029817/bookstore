"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { Book } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export function BookSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    fetch(`/api/books?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
      .then((r) => r.json())
      .then((data) => setResults(data.books || []))
      .catch(() => setResults([]));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/books?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-brown" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="제목, 저자로 검색..."
          className="w-full pl-9 pr-8 py-2.5 border border-sand bg-cream rounded-sm text-charcoal text-sm focus:outline-none focus:border-terracotta transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-brown hover:text-charcoal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-beige border border-sand rounded-sm shadow-lg z-50 max-h-80 overflow-auto">
          {results.map((book) => (
            <button
              key={book.id}
              onClick={() => {
                router.push(`/books/${book.id}`);
                setOpen(false);
                setQuery("");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream transition-colors text-left"
            >
              <div className="w-8 h-10 bg-sand/50 rounded-sm shrink-0 relative overflow-hidden">
                {book.cover_image_url && (
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-charcoal truncate">{book.title}</p>
                <p className="text-xs text-warm-brown">
                  {book.author} · {formatPrice(book.discount_price || book.price)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
