import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const sort = searchParams.get("sort") || "newest";
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const supabase = await createClient();

  let query = supabase
    .from("books")
    .select("*")
    .eq("is_active", true)
    .limit(limit + 1); // Fetch one extra to check if there are more

  // Full-text search
  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }

  // Category filter
  if (category) {
    query = query.eq("category_id", category);
  }

  // Price filter
  if (minPrice) {
    query = query.gte("price", parseInt(minPrice));
  }
  if (maxPrice) {
    query = query.lte("price", parseInt(maxPrice));
  }

  // Rating filter
  if (minRating) {
    query = query.gte("average_rating", parseFloat(minRating));
  }

  // Sorting
  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    case "popular":
      query = query.order("review_count", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Cursor-based pagination
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasMore = data && data.length > limit;
  const books = hasMore ? data.slice(0, limit) : (data || []);
  const nextCursor =
    hasMore && books.length > 0
      ? books[books.length - 1].created_at
      : null;

  return NextResponse.json({ books, nextCursor });
}
