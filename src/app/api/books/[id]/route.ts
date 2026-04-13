import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch book
  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Fetch related books (same category, exclude current)
  const { data: relatedBooks } = await supabase
    .from("books")
    .select("id, title, author, price, discount_price, cover_image_url, average_rating")
    .eq("category_id", book.category_id)
    .eq("is_active", true)
    .neq("id", id)
    .limit(6);

  return NextResponse.json({ book, relatedBooks: relatedBooks || [] });
}
