"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Book } from "@/types/database";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/books?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setBooks(data.books || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  async function toggleActive(book: Book) {
    await fetch(`/api/admin/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !book.is_active }),
    });
    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id ? { ...b, is_active: !b.is_active } : b
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading text-charcoal">상품 관리</h1>
        <Link href="/admin/books/new">
          <Button size="sm">
            <Plus className="w-4 h-4" /> 도서 등록
          </Button>
        </Link>
      </div>

      <div className="border border-sand bg-beige rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand text-warm-brown text-left bg-cream">
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">저자</th>
                <th className="px-4 py-3 font-medium">가격</th>
                <th className="px-4 py-3 font-medium">재고</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-warm-brown">
                    불러오는 중...
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="border-b border-sand/50">
                    <td className="px-4 py-3 text-charcoal max-w-[200px] truncate">
                      {book.title}
                    </td>
                    <td className="px-4 py-3 text-warm-brown">{book.author}</td>
                    <td className="px-4 py-3 text-charcoal">
                      {formatPrice(book.discount_price || book.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          book.stock <= 5 ? "text-red-600 font-medium" : "text-charcoal"
                        }
                      >
                        {book.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(book)}>
                        <Badge variant={book.is_active ? "olive" : "terracotta"}>
                          {book.is_active ? "활성" : "비활성"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/books/${book.id}`}
                        className="text-terracotta text-xs hover:underline"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-warm-brown">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
