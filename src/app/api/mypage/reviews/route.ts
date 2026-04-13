import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Returns two lists for the authenticated user:
// 1. reviewable: delivered order items that haven't been reviewed yet
// 2. myReviews: reviews already written by the user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get user's delivered order items with book info
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, created_at, order_items(id, book_id, book:books(id, title, author, cover_image_url))")
    .eq("user_id", user.id)
    .eq("status", "delivered")
    .order("created_at", { ascending: false });

  // 2. Get user's existing reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, book:books(id, title, author, cover_image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const existingReviews = reviews || [];
  const reviewedKeys = new Set(
    existingReviews.map((r) => `${r.book_id}:${r.order_id}`)
  );

  // 3. Build reviewable items list
  const reviewable: Array<{
    order_id: string;
    order_number: string;
    order_date: string;
    book_id: string;
    book: { id: string; title: string; author: string; cover_image_url: string | null };
  }> = [];

  for (const order of orders || []) {
    for (const item of (order as any).order_items || []) {
      const book = item.book;
      if (!book) continue;
      const key = `${book.id}:${order.id}`;
      if (!reviewedKeys.has(key)) {
        reviewable.push({
          order_id: order.id,
          order_number: order.order_number,
          order_date: order.created_at,
          book_id: book.id,
          book,
        });
      }
    }
  }

  return NextResponse.json({ reviewable, myReviews: existingReviews });
}
