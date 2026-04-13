"use client";

import { ThumbsUp } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate, cn } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    content: string | null;
    likes_count: number;
    created_at: string;
    user: { id: string; name: string } | null;
  };
  onLike?: (reviewId: string) => void;
  isLiking?: boolean;
}

export function ReviewCard({ review, onLike, isLiking }: ReviewCardProps) {
  return (
    <div className="border border-sand bg-cream rounded-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm text-warm-brown">
            {review.user?.name || "익명"}
          </span>
        </div>
        <span className="text-xs text-warm-brown/60">
          {formatDate(review.created_at)}
        </span>
      </div>
      {review.content && (
        <p className="font-accent text-warm-brown text-sm leading-relaxed mb-3">
          {review.content}
        </p>
      )}
      <button
        onClick={() => onLike?.(review.id)}
        disabled={isLiking}
        className={cn(
          "flex items-center gap-1 text-xs transition-colors",
          review.likes_count > 0
            ? "text-terracotta"
            : "text-warm-brown/50 hover:text-terracotta"
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span>{review.likes_count > 0 ? review.likes_count : "도움이 됐어요"}</span>
      </button>
    </div>
  );
}
