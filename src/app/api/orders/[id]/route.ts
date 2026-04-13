import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maskName, maskPhone, maskAddress } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*, book:books(id, title, author, cover_image_url, price))")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Mask personal data
  const maskedOrder = {
    ...order,
    recipient_name: maskName(order.recipient_name),
    recipient_phone: maskPhone(order.recipient_phone),
    shipping_address: maskAddress(order.shipping_address),
    shipping_address_detail: "***",
  };

  return NextResponse.json({ order: maskedOrder });
}
