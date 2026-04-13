"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order } from "@/types/database";

const statusLabels: Record<string, string> = {
  paid: "결제완료",
  preparing: "배송준비",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소됨",
  refunded: "환불됨",
};

const statusVariants: Record<string, "olive" | "terracotta" | "sand" | "warm-brown"> = {
  paid: "olive",
  preparing: "warm-brown",
  shipping: "warm-brown",
  delivered: "olive",
  cancelled: "terracotta",
  refunded: "terracotta",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-heading text-charcoal mb-8">주문 내역</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-sand bg-beige rounded-sm p-6 animate-pulse-warm">
              <div className="h-5 bg-sand rounded-sm w-1/3 mb-2" />
              <div className="h-4 bg-sand rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <Package className="w-16 h-16 text-sand mx-auto mb-4" />
        <h1 className="text-2xl font-heading text-charcoal mb-2">
          주문 내역이 없어요
        </h1>
        <p className="text-warm-brown mb-8">첫 번째 주문을 해보세요!</p>
        <Link href="/books">
          <Button>책 둘러보기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-heading text-charcoal mb-8">주문 내역</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block border border-sand bg-beige rounded-sm p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-warm-brown">
                {formatDate(order.created_at)}
              </span>
              <Badge variant={statusVariants[order.status] || "sand"}>
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">
                주문번호: {order.order_number}
              </span>
              <span className="text-terracotta font-medium">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
