import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maskName } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select("*, user:users(id, name)")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasMore = data && data.length > limit;
  const sliced = hasMore ? data.slice(0, limit) : (data || []);

  // Mask reviewer names
  const reviews = sliced.map((review) => ({
    ...review,
    user: review.user
      ? { ...review.user, name: maskName(review.user.name) }
      : null,
  }));

  const nextCursor =
    hasMore && reviews.length > 0
      ? reviews[reviews.length - 1].created_at
      : null;

  const response = NextResponse.json({ reviews, nextCursor });
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=120"
  );
  return response;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { book_id, order_id, rating, content } = await request.json();

  if (!book_id || !order_id || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  // Verify user has a delivered order with this book
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id, order:orders(id, user_id, status)")
    .eq("book_id", book_id)
    .eq("order_id", order_id)
    .single();

  if (
    !orderItem?.order ||
    (orderItem.order as any).user_id !== user.id ||
    (orderItem.order as any).status !== "delivered"
  ) {
    return NextResponse.json(
      { error: "Can only review books from delivered orders" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      book_id,
      order_id,
      rating,
      content: content || null,
    })
    .select("*, user:users(id, name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You already reviewed this book for this order" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
