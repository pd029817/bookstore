"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all reviews (admin would need a dedicated endpoint; using books endpoint as placeholder)
    // In production, create /api/admin/reviews endpoint
    setLoading(false);
  }, []);

  async function handleDelete(reviewId: string) {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
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
          <p className="text-warm-brown text-center py-8">불러오는 중...</p>
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
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-warm-brown">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-sm text-charcoal">{review.content}</p>
                  )}
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
      </div>
    </div>
  );
}
