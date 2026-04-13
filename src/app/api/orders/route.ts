import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber, maskName, maskPhone, maskAddress } from "@/lib/utils";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, book:books(id, title, author, cover_image_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mask personal data
  const orders = (data || []).map((order) => ({
    ...order,
    recipient_name: maskName(order.recipient_name),
    recipient_phone: maskPhone(order.recipient_phone),
    shipping_address: maskAddress(order.shipping_address),
    shipping_address_detail: "***",
  }));

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { items, recipient_name, recipient_phone, shipping_address, shipping_address_detail, zip_code } = body;

  if (!items?.length || !recipient_name || !recipient_phone || !shipping_address || !zip_code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify stock and calculate total
  let totalAmount = 0;
  const orderItems: { book_id: string; quantity: number; price: number }[] = [];

  for (const item of items) {
    const { data: book } = await supabase
      .from("books")
      .select("id, price, discount_price, stock, is_active")
      .eq("id", item.book_id)
      .single();

    if (!book || !book.is_active) {
      return NextResponse.json({ error: `Book ${item.book_id} not available` }, { status: 400 });
    }

    if (book.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for book ${item.book_id}` }, { status: 400 });
    }

    const price = book.discount_price || book.price;
    totalAmount += price * item.quantity;
    orderItems.push({ book_id: book.id, quantity: item.quantity, price });
  }

  // Create order
  const orderNumber = generateOrderNumber();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      status: "paid",
      total_amount: totalAmount,
      recipient_name,
      recipient_phone,
      shipping_address,
      shipping_address_detail: shipping_address_detail || null,
      zip_code,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Create order items
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Decrement stock
  for (const item of orderItems) {
    const { data: currentBook } = await supabase
      .from("books")
      .select("stock")
      .eq("id", item.book_id)
      .single();
    if (currentBook) {
      await supabase
        .from("books")
        .update({ stock: currentBook.stock - item.quantity })
        .eq("id", item.book_id);
    }
  }

  // Clear cart items for ordered books
  const bookIds = orderItems.map((item) => item.book_id);
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .in("book_id", bookIds);

  return NextResponse.json({ order }, { status: 201 });
}
