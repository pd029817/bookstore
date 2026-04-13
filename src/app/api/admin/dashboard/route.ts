import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Gather stats
  const [ordersResult, usersResult, booksResult, revenueResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, status", { count: "exact" }),
      supabase
        .from("users")
        .select("id", { count: "exact" }),
      supabase
        .from("books")
        .select("id", { count: "exact" }),
      supabase
        .from("orders")
        .select("total_amount")
        .in("status", ["paid", "preparing", "shipping", "delivered"]),
    ]);

  const totalRevenue = (revenueResult.data || []).reduce(
    (sum, o) => sum + o.total_amount,
    0
  );

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    stats: {
      totalOrders: ordersResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalBooks: booksResult.count || 0,
      totalRevenue,
    },
    recentOrders: recentOrders || [],
  });
}
