"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, formatDate, maskName, maskPhone, maskAddress } from "@/lib/utils";

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!confirm("주문을 취소하시겠습니까?")) return;
    setCancelling(true);

    const res = await fetch(`/api/orders/${id}/cancel`, { method: "PATCH" });
    if (res.ok) {
      addToast("주문이 취소되었습니다.", "success");
      setOrder((prev: any) => ({ ...prev, status: "cancelled" }));
    } else {
      addToast("주문 취소에 실패했습니다.", "error");
    }
    setCancelling(false);
  }

  function handleReorder() {
    if (!order?.order_items) return;
    for (const item of order.order_items) {
      if (item.book) {
        addItem(item.book, item.quantity);
      }
    }
    addToast("상품이 장바구니에 담겼습니다.", "success");
    router.push("/checkout");
  }

  if (loading) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <div className="animate-pulse-warm space-y-4">
          <div className="h-8 bg-sand rounded-sm w-1/3" />
          <div className="h-4 bg-sand rounded-sm w-1/2" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-heading text-charcoal">
          주문을 찾을 수 없습니다
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-heading text-charcoal mb-2">주문 상세</h1>
      <p className="text-warm-brown text-sm mb-8">
        주문번호: {order.order_number}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <section className="border border-sand bg-beige rounded-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading text-charcoal mb-1">
                  주문 상태
                </h2>
                <p className="text-sm text-warm-brown">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <Badge variant={statusVariants[order.status] || "sand"}>
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>
          </section>

          {/* Items */}
          <section className="border border-sand bg-beige rounded-sm p-6">
            <h2 className="text-lg font-heading text-charcoal mb-4">
              주문 상품
            </h2>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-16 bg-sand/50 rounded-sm shrink-0" />
                  <div className="flex-1">
                    <p className="text-charcoal">{item.book?.title || "삭제된 도서"}</p>
                    <p className="text-warm-brown text-xs">
                      {item.book?.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-charcoal">{item.quantity}권</p>
                    <p className="text-terracotta text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping */}
          <section className="border border-sand bg-beige rounded-sm p-6">
            <h2 className="text-lg font-heading text-charcoal mb-4">
              배송 정보
            </h2>
            <div className="text-sm space-y-1 text-warm-brown">
              <p>수령인: {maskName(order.recipient_name)}</p>
              <p>연락처: {maskPhone(order.recipient_phone)}</p>
              <p>
                주소: [{order.zip_code}] {maskAddress(order.shipping_address)}{" "}
                {order.shipping_address_detail}
              </p>
            </div>
          </section>
        </div>

        {/* Right: Summary + Actions */}
        <div className="lg:col-span-1">
          <div className="border border-sand bg-beige rounded-sm p-6 sticky top-20 space-y-4">
            <div className="flex justify-between font-medium text-charcoal">
              <span>총 결제금액</span>
              <span className="text-terracotta text-xl">
                {formatPrice(order.total_amount)}
              </span>
            </div>

            {["paid", "preparing"].includes(order.status) && (
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={handleCancel}
                loading={cancelling}
              >
                주문 취소
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={handleReorder}
            >
              다시 주문하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
