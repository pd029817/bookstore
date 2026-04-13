import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `카테고리`,
    description: `카테고리별 도서 목록`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  // Redirect to books page with category filter
  redirect(`/books?category=${id}`);
}
