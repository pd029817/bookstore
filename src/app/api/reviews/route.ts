import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maskName } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:users(id, name)")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mask reviewer names
  const reviews = (data || []).map((review) => ({
    ...review,
    user: review.user
      ? { ...review.user, name: maskName(review.user.name) }
      : null,
  }));

  return NextResponse.json({ reviews });
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
