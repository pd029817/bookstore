import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check order exists and is cancellable
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!["paid", "preparing"].includes(order.status)) {
    return NextResponse.json(
      { error: "Order cannot be cancelled in current status" },
      { status: 400 }
    );
  }

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Restore stock
  for (const item of order.order_items) {
    const { data: book } = await supabase
      .from("books")
      .select("stock")
      .eq("id", item.book_id)
      .single();

    if (book) {
      await supabase
        .from("books")
        .update({ stock: book.stock + item.quantity })
        .eq("id", item.book_id);
    }
  }

  // TODO: Call TossPayments cancel API if payment_key exists

  return NextResponse.json({ success: true });
}
