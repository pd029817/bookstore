import type { Metadata } from "next";
import { BookDetailClient } from "./book-detail-client";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("title, author, description, cover_image_url")
    .eq("id", id)
    .single();

  if (!book) return { title: "도서를 찾을 수 없습니다" };

  return {
    title: book.title,
    description: book.description?.slice(0, 160) || `${book.title} - ${book.author}`,
    openGraph: {
      title: book.title,
      description: book.description?.slice(0, 160) || undefined,
      images: book.cover_image_url ? [book.cover_image_url] : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!book) notFound();

  const { data: relatedBooks } = await supabase
    .from("books")
    .select("id, title, author, price, discount_price, cover_image_url, average_rating, review_count")
    .eq("category_id", book.category_id)
    .eq("is_active", true)
    .neq("id", id)
    .limit(6);

  return (
    <BookDetailClient
      book={book}
      relatedBooks={relatedBooks || []}
    />
  );
}
