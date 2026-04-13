"use client";

import { BookCard } from "@/components/books/book-card";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import type { Book } from "@/types/database";

export function FeaturedBooks({ books }: { books: Book[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();

  function handleAddToCart(book: Book) {
    addItem(book);
    addToast(`'${book.title}'을(를) 장바구니에 담았습니다.`, "success");
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
      ))}
    </div>
  );
}
