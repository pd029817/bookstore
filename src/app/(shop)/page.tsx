import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FeaturedBooks } from "@/components/books/featured-books";
import type { Book } from "@/types/database";

async function getFeaturedBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export default async function Home() {
  const featuredBooks = await getFeaturedBooks();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <p className="font-accent text-warm-brown text-lg mb-6">
          &ldquo;AI를 오래된 친구로 만들어 보아요.&rdquo;
        </p>
        <h1 className="text-4xl md:text-5xl font-heading text-charcoal mb-6">
          당신만의 서점,<br />
        </h1>
        <p className="text-warm-brown text-lg mb-10 max-w-lg mx-auto">
          AI를 파트너로 삼기 위한 책을 만나보세요.
        </p>
        <Link
          href="/books"
          className="inline-block px-8 py-3 bg-terracotta text-white rounded-sm hover:bg-terracotta-hover transition-colors duration-200 text-lg"
        >
          책 둘러보기
        </Link>
      </section>

      {/* Section: Placeholder for curated books */}
      <section className="max-w-[1080px] mx-auto px-6 pb-20">
        <h2 className="text-2xl font-heading text-charcoal mb-8 text-center">
          이번 주의 책
        </h2>
        <FeaturedBooks books={featuredBooks} />
      </section>
    </main>
  );
}
