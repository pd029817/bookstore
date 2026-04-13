import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentKey, orderId, amount } = await request.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify order exists and amount matches
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.total_amount !== amount) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // Call TossPayments confirm API
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId: order.order_number, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Payment confirmation failed" },
        { status: 400 }
      );
    }

    // Update order with payment info
    await supabase
      .from("orders")
      .update({
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
        status: "paid",
      })
      .eq("id", orderId);

    // Clear cart items for the ordered books
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("book_id")
      .eq("order_id", orderId);

    if (orderItems && orderItems.length > 0) {
      const bookIds = orderItems.map((item) => item.book_id);
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .in("book_id", bookIds);
    }

    return NextResponse.json({ success: true, order_number: order.order_number });
  } catch {
    return NextResponse.json({ error: "Payment service error" }, { status: 500 });
  }
}
