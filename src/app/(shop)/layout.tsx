import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

async function getTopCategories(): Promise<Category[]> {
  const supabase = await createClient();

  // 책이 있는 category_id 목록 조회
  const { data: bookCats } = await supabase
    .from("books")
    .select("category_id")
    .eq("is_active", true);

  const categoryIds = [...new Set((bookCats ?? []).map((b) => b.category_id).filter(Boolean))];
  if (categoryIds.length === 0) return [];

  const { data } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .in("id", categoryIds)
    .order("sort_order");

  return data ?? [];
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getTopCategories();

  return (
    <ToastProvider>
      <Header categories={categories} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer categories={categories} />
      <MobileNav />
    </ToastProvider>
  );
}
