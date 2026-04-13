"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

interface ReviewListProps {
  bookId: string;
}

interface ReviewData {
  id: string;
  rating: number;
  content: string | null;
  likes_count: number;
  created_at: string;
  user: { id: string; name: string } | null;
}

export function ReviewList({ bookId }: ReviewListProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?bookId=${bookId}`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [bookId]);

  async function handleSubmitReview(data: { rating: number; content: string }) {
    // For now, we need an order_id. This will be enhanced to auto-detect eligible orders.
    addToast("구매 확정된 주문이 있어야 리뷰를 작성할 수 있습니다.", "info");
  }

  async function handleLike(reviewId: string) {
    if (!user) {
      addToast("로그인이 필요합니다.", "info");
      return;
    }

    const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" });
    if (res.ok) {
      const { liked } = await res.json();
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, likes_count: r.likes_count + (liked ? 1 : -1) }
            : r
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="border border-sand bg-cream rounded-sm p-5 animate-pulse-warm">
            <div className="h-4 bg-sand rounded-sm w-1/4 mb-2" />
            <div className="h-3 bg-sand rounded-sm w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user && (
        <ReviewForm
          bookId={bookId}
          onSubmit={handleSubmitReview}
        />
      )}

      {reviews.length === 0 ? (
        <p className="text-warm-brown text-sm py-4">
          아직 리뷰가 없습니다. 이 책의 첫 번째 리뷰를 작성해 보세요.
        </p>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onLike={handleLike}
          />
        ))
      )}
    </div>
  );
}
