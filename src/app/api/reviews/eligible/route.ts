import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Returns delivered orders for the current user that contain the given book
// and haven't been reviewed yet for that book.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ orders: [] });
  }

  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  // Find delivered orders that contain this book
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, order:orders(id, order_number, user_id, status)")
    .eq("book_id", bookId);

  if (!orderItems || orderItems.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  // Filter to user's delivered orders
  const deliveredOrders = orderItems.filter((item) => {
    const order = item.order as any;
    return order && order.user_id === user.id && order.status === "delivered";
  });

  if (deliveredOrders.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  // Find existing reviews by this user for this book
  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("order_id")
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  const reviewedOrderIds = new Set(
    (existingReviews || []).map((r) => r.order_id)
  );

  // Return only orders that haven't been reviewed yet
  const eligible = deliveredOrders
    .filter((item) => !reviewedOrderIds.has(item.order_id))
    .map((item) => ({
      order_id: (item.order as any).id,
      order_number: (item.order as any).order_number,
    }));

  return NextResponse.json({ orders: eligible });
}
