"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  bookId: string;
  orderId?: string;
  onSubmit: (data: { rating: number; content: string }) => Promise<void>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    await onSubmit({ rating, content });
    setRating(0);
    setContent("");
    setLoading(false);
  }

  // Allow 1-click rating submission
  async function handleRatingClick(newRating: number) {
    setRating(newRating);
    if (!content.trim()) {
      // Auto-submit with just rating
      setLoading(true);
      await onSubmit({ rating: newRating, content: "" });
      setRating(0);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-sand bg-cream rounded-sm p-5">
      <h3 className="text-sm font-medium text-charcoal mb-3">리뷰 작성</h3>
      <div className="mb-3">
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={handleRatingClick}
        />
        {rating === 0 && (
          <p className="text-xs text-warm-brown/50 mt-1">
            별점을 클릭하면 바로 등록됩니다
          </p>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="리뷰를 작성해 주세요 (선택사항)"
        rows={3}
        className="w-full px-3 py-2 border border-sand bg-beige rounded-sm text-charcoal text-sm resize-none focus:outline-none focus:border-terracotta transition-colors mb-3"
      />
      {content.trim() && (
        <Button type="submit" size="sm" loading={loading} disabled={rating === 0}>
          리뷰 등록
        </Button>
      )}
    </form>
  );
}
