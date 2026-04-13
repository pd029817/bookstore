import type { Book } from "@/types/database";

export const bookFixture: Book = {
  id: "book-001",
  title: "테스트 도서",
  author: "테스트 저자",
  publisher: "테스트 출판사",
  published_date: "2024-01-01",
  isbn: "9791234567890",
  description: "테스트용 도서입니다.",
  price: 20000,
  discount_price: 18000,
  stock: 100,
  cover_image_url: "https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/test.jpg",
  category_id: "a1000000-0000-0000-0000-000000000005",
  page_count: 300,
  average_rating: 4.5,
  review_count: 10,
  is_active: true,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

export const bookFixtureNoDiscount: Book = {
  ...bookFixture,
  id: "book-002",
  title: "할인 없는 도서",
  discount_price: null,
};

export const bookFixtureNoImage: Book = {
  ...bookFixture,
  id: "book-003",
  title: "표지 없는 도서",
  cover_image_url: null,
};
