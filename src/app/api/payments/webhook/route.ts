import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // TossPayments webhook handler
  const body = await request.json();
  const { eventType, data } = body;

  const supabase = createAdminClient();

  switch (eventType) {
    case "PAYMENT_STATUS_CHANGED": {
      const { paymentKey, status } = data;

      const statusMap: Record<string, string> = {
        DONE: "paid",
        CANCELED: "cancelled",
        PARTIAL_CANCELED: "refunded",
      };

      const newStatus = statusMap[status];
      if (!newStatus) break;

      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("payment_key", paymentKey);

      break;
    }
  }

  return NextResponse.json({ success: true });
}
