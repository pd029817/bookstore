import type { Review, ReviewWithUser } from "@/types/database";

export const reviewFixture: Review = {
  id: "review-001",
  user_id: "user-001",
  book_id: "book-001",
  order_id: "order-001",
  rating: 4,
  content: "정말 좋은 책입니다.",
  likes_count: 3,
  created_at: "2024-06-01T00:00:00.000Z",
  updated_at: "2024-06-01T00:00:00.000Z",
};

export const reviewFixtureNoContent: Review = {
  ...reviewFixture,
  id: "review-002",
  user_id: "user-002",
  order_id: "order-002",
  rating: 5,
  content: null,
  likes_count: 0,
};

export const reviewWithUserFixture: ReviewWithUser = {
  ...reviewFixture,
  user: { id: "user-001", name: "홍길동" },
};

export const reviewWithUserFixtureSecond: ReviewWithUser = {
  ...reviewFixtureNoContent,
  user: { id: "user-002", name: "김철수" },
};
