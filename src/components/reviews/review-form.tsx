"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";

interface EligibleOrder {
  order_id: string;
  order_number: string;
}

interface ReviewFormProps {
  bookId: string;
  eligibleOrders: EligibleOrder[];
  onSubmit: (data: { rating: number; content: string; orderId: string }) => Promise<void>;
}

export function ReviewForm({ eligibleOrders, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(
    eligibleOrders.length === 1 ? eligibleOrders[0].order_id : ""
  );
  const [loading, setLoading] = useState(false);

  const canSubmit = rating > 0 && selectedOrder;

  async function submitReview(submitRating: number, submitContent: string) {
    if (!selectedOrder) return;
    setLoading(true);
    await onSubmit({ rating: submitRating, content: submitContent, orderId: selectedOrder });
    setRating(0);
    setContent("");
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await submitReview(rating, content);
  }

  async function handleRatingClick(newRating: number) {
    setRating(newRating);
    if (!content.trim() && selectedOrder) {
      setLoading(true);
      await onSubmit({ rating: newRating, content: "", orderId: selectedOrder });
      setRating(0);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-sand bg-cream rounded-sm p-5">
      <h3 className="text-sm font-medium text-charcoal mb-3">리뷰 작성</h3>

      {eligibleOrders.length > 1 && (
        <div className="mb-3">
          <label className="block text-xs text-warm-brown mb-1">주문 선택</label>
          <select
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
            className="w-full px-3 py-2 border border-sand bg-beige rounded-sm text-charcoal text-sm focus:outline-none focus:border-terracotta transition-colors"
          >
            <option value="">주문을 선택해 주세요</option>
            {eligibleOrders.map((order) => (
              <option key={order.order_id} value={order.order_id}>
                {order.order_number}
              </option>
            ))}
          </select>
        </div>
      )}

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
        <Button type="submit" size="sm" loading={loading} disabled={!canSubmit}>
          리뷰 등록
        </Button>
      )}
    </form>
  );
}
