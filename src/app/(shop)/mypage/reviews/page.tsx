"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Pencil, Trash2, MessageSquarePlus } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface BookInfo {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
}

interface ReviewableItem {
  order_id: string;
  order_number: string;
  order_date: string;
  book_id: string;
  book: BookInfo;
}

interface MyReview {
  id: string;
  book_id: string;
  order_id: string;
  rating: number;
  content: string | null;
  likes_count: number;
  created_at: string;
  book: BookInfo;
}

// Inline review writing form for a specific book+order
function WriteReviewForm({
  item,
  onSubmitted,
}: {
  item: ReviewableItem;
  onSubmitted: (review: MyReview) => void;
}) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(submitRating: number, submitContent: string) {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: item.book_id,
        order_id: item.order_id,
        rating: submitRating,
        content: submitContent || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      addToast(err.error || "리뷰 작성에 실패했습니다.", "error");
      setLoading(false);
      return;
    }

    const { review } = await res.json();
    onSubmitted({ ...review, book: item.book });
    addToast("리뷰가 등록되었습니다.", "success");
    setLoading(false);
  }

  function handleRatingClick(newRating: number) {
    setRating(newRating);
    if (!content.trim()) {
      submit(newRating, "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    submit(rating, content);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-sand">
      <div className="mb-2">
        <StarRating rating={rating} size="lg" interactive onChange={handleRatingClick} />
        {rating === 0 && (
          <p className="text-xs text-warm-brown/50 mt-1">별점을 클릭하면 바로 등록됩니다</p>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="리뷰를 작성해 주세요 (선택사항)"
        rows={3}
        className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal text-sm resize-none focus:outline-none focus:border-terracotta transition-colors mb-2"
      />
      {content.trim() && (
        <Button type="submit" size="sm" loading={loading} disabled={rating === 0}>
          리뷰 등록
        </Button>
      )}
    </form>
  );
}

// Inline edit form for an existing review
function EditReviewForm({
  review,
  onUpdated,
  onCancel,
}: {
  review: MyReview;
  onUpdated: (updated: MyReview) => void;
  onCancel: () => void;
}) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, content: content || null }),
    });

    if (res.ok) {
      const { review: updated } = await res.json();
      onUpdated({ ...review, ...updated });
      addToast("리뷰가 수정되었습니다.", "success");
    } else {
      addToast("리뷰 수정에 실패했습니다.", "error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-sand">
      <div className="mb-2">
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="리뷰를 작성해 주세요 (선택사항)"
        rows={3}
        className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal text-sm resize-none focus:outline-none focus:border-terracotta transition-colors mb-2"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={loading} disabled={rating === 0}>
          수정 완료
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}

function BookCover({ book }: { book: BookInfo }) {
  return (
    <div className="w-16 h-22 bg-sand/30 rounded-sm overflow-hidden shrink-0">
      {book.cover_image_url ? (
        <Image
          src={book.cover_image_url}
          alt={book.title}
          width={64}
          height={88}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-sand/50">
          <span className="text-warm-brown/30 text-[10px] text-center px-1 line-clamp-2">
            {book.title}
          </span>
        </div>
      )}
    </div>
  );
}

export default function MyReviewsPage() {
  const { addToast } = useToast();
  const [reviewable, setReviewable] = useState<ReviewableItem[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWriteId, setOpenWriteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mypage/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviewable(data.reviewable || []);
        setMyReviews(data.myReviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleReviewSubmitted(item: ReviewableItem, review: MyReview) {
    setReviewable((prev) =>
      prev.filter((r) => !(r.book_id === item.book_id && r.order_id === item.order_id))
    );
    setMyReviews((prev) => [review, ...prev]);
    setOpenWriteId(null);
  }

  function handleReviewUpdated(updated: MyReview) {
    setMyReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingId(null);
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("리뷰를 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) {
      setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
      addToast("리뷰가 삭제되었습니다.", "success");
    } else {
      addToast("리뷰 삭제에 실패했습니다.", "error");
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-heading text-charcoal mb-8">내 리뷰</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-sand bg-beige rounded-sm p-6 animate-pulse-warm">
              <div className="h-5 bg-sand rounded-sm w-1/3 mb-2" />
              <div className="h-4 bg-sand rounded-sm w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-heading text-charcoal mb-8">내 리뷰</h1>

      {/* Reviewable items */}
      {reviewable.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-heading text-charcoal mb-4 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-terracotta" />
            리뷰 작성 가능
            <span className="text-sm font-normal text-warm-brown">
              ({reviewable.length})
            </span>
          </h2>
          <div className="space-y-3">
            {reviewable.map((item) => {
              const itemKey = `${item.book_id}:${item.order_id}`;
              const isOpen = openWriteId === itemKey;
              return (
                <div
                  key={itemKey}
                  className="border border-sand bg-beige rounded-sm p-5"
                >
                  <div className="flex gap-4">
                    <BookCover book={item.book} />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/books/${item.book_id}`}
                        className="text-charcoal font-medium text-sm hover:text-terracotta transition-colors line-clamp-1"
                      >
                        {item.book.title}
                      </Link>
                      <p className="text-xs text-warm-brown">{item.book.author}</p>
                      <p className="text-xs text-warm-brown/60 mt-1">
                        주문: {item.order_number} ({formatDate(item.order_date)})
                      </p>
                    </div>
                    <Button
                      variant={isOpen ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => setOpenWriteId(isOpen ? null : itemKey)}
                    >
                      {isOpen ? "닫기" : "리뷰 쓰기"}
                    </Button>
                  </div>
                  {isOpen && (
                    <WriteReviewForm
                      item={item}
                      onSubmitted={(review) => handleReviewSubmitted(item, review)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* My reviews */}
      <section>
        <h2 className="text-lg font-heading text-charcoal mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-terracotta" />
          작성한 리뷰
          <span className="text-sm font-normal text-warm-brown">
            ({myReviews.length})
          </span>
        </h2>

        {myReviews.length === 0 && reviewable.length === 0 ? (
          <div className="border border-sand bg-beige rounded-sm p-10 text-center">
            <Star className="w-12 h-12 text-sand mx-auto mb-3" />
            <p className="text-warm-brown mb-2">아직 작성한 리뷰가 없습니다.</p>
            <p className="text-sm text-warm-brown/60 mb-6">
              배송 완료된 도서에 리뷰를 남겨보세요.
            </p>
            <Link href="/orders">
              <Button variant="secondary">주문 내역 보기</Button>
            </Link>
          </div>
        ) : myReviews.length === 0 ? (
          <p className="text-warm-brown text-sm py-4">
            아직 작성한 리뷰가 없습니다. 위에서 리뷰를 작성해 보세요.
          </p>
        ) : (
          <div className="space-y-3">
            {myReviews.map((review) => (
              <div
                key={review.id}
                className="border border-sand bg-beige rounded-sm p-5"
              >
                <div className="flex gap-4">
                  <BookCover book={review.book} />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/books/${review.book_id}`}
                      className="text-charcoal font-medium text-sm hover:text-terracotta transition-colors line-clamp-1"
                    >
                      {review.book.title}
                    </Link>
                    <p className="text-xs text-warm-brown mb-2">
                      {review.book.author}
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-warm-brown/60">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    {review.content && (
                      <p className="text-sm text-warm-brown leading-relaxed">
                        {review.content}
                      </p>
                    )}
                    {review.likes_count > 0 && (
                      <p className="text-xs text-terracotta mt-1">
                        좋아요 {review.likes_count}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() =>
                        setEditingId(editingId === review.id ? null : review.id)
                      }
                      className="p-1.5 text-warm-brown hover:text-terracotta transition-colors"
                      aria-label="리뷰 수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1.5 text-warm-brown hover:text-red-600 transition-colors"
                      aria-label="리뷰 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingId === review.id && (
                  <EditReviewForm
                    review={review}
                    onUpdated={handleReviewUpdated}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
