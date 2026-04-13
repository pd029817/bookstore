import type { Metadata } from "next";
import { BooksPageClient } from "./books-client";

export const metadata: Metadata = {
  title: "도서 목록",
  description: "AIBookStore의 다양한 책을 검색하고 둘러보세요.",
};

export default function BooksPage() {
  return <BooksPageClient />;
}
