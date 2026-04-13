import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from("review_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("review_id", reviewId)
    .single();

  if (existing) {
    // Unlike
    await supabase
      .from("review_likes")
      .delete()
      .eq("id", existing.id);
    return NextResponse.json({ liked: false });
  }

  // Like
  const { error } = await supabase
    .from("review_likes")
    .insert({ user_id: user.id, review_id: reviewId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: true });
}
