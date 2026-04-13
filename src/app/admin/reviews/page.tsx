"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface AdminReview {
  id: string;
  rating: number;
  content: string | null;
  likes_count: number;
  created_at: string;
  user: { id: string; name: string; email: string } | null;
  book: { id: string; title: string } | null;
}

export default function AdminReviewsPage() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reviews?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(reviewId: string) {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;

    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      addToast("리뷰가 삭제되었습니다.", "success");
    } else {
      addToast("리뷰 삭제에 실패했습니다.", "error");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading text-charcoal">리뷰 관리</h1>

      <div className="border border-sand bg-beige rounded-sm p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-sand bg-cream rounded-sm animate-pulse-warm">
                <div className="h-4 bg-sand rounded-sm w-1/3 mb-2" />
                <div className="h-3 bg-sand rounded-sm w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-warm-brown text-center py-8">
            등록된 리뷰가 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-4 p-4 border border-sand bg-cream rounded-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-warm-brown">
                      {review.user?.name || "익명"}
                    </span>
                    <span className="text-xs text-warm-brown/50">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.book && (
                    <p className="text-xs text-terracotta mb-1 truncate">
                      {review.book.title}
                    </p>
                  )}
                  {review.content && (
                    <p className="text-sm text-charcoal">{review.content}</p>
                  )}
                  <span className="text-xs text-warm-brown/50 mt-1 inline-block">
                    좋아요 {review.likes_count}
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(review.id)}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-sand">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>
            <span className="text-sm text-warm-brown">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
