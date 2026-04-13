"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { maskName } from "@/lib/utils";

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

interface EligibleOrder {
  order_id: string;
  order_number: string;
}

export function ReviewList({ bookId }: ReviewListProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);

  useEffect(() => {
    fetch(`/api/reviews?bookId=${bookId}`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [bookId]);

  // Fetch eligible orders when user is logged in
  useEffect(() => {
    if (!user) return;
    fetch(`/api/reviews/eligible?bookId=${bookId}`)
      .then((r) => r.json())
      .then((data) => setEligibleOrders(data.orders || []))
      .catch(() => setEligibleOrders([]));
  }, [user, bookId]);

  async function handleSubmitReview(data: {
    rating: number;
    content: string;
    orderId: string;
  }) {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        order_id: data.orderId,
        rating: data.rating,
        content: data.content || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      if (res.status === 409) {
        addToast("이미 이 주문에 대한 리뷰를 작성하셨습니다.", "info");
      } else {
        addToast(err.error || "리뷰 작성에 실패했습니다.", "error");
      }
      return;
    }

    const { review } = await res.json();
    // Mask the name client-side for immediate display
    const maskedReview = {
      ...review,
      user: review.user
        ? { ...review.user, name: maskName(review.user.name) }
        : null,
    };
    setReviews((prev) => [maskedReview, ...prev]);
    // Remove the used order from eligible list
    setEligibleOrders((prev) =>
      prev.filter((o) => o.order_id !== data.orderId)
    );
    addToast("리뷰가 등록되었습니다.", "success");
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
      {user && eligibleOrders.length > 0 && (
        <ReviewForm
          bookId={bookId}
          eligibleOrders={eligibleOrders}
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
