"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const dbOrderId = searchParams.get("dbOrderId");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !dbOrderId) {
      setStatus("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    // Confirm payment on server
    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey,
        orderId: dbOrderId,
        amount: Number(amount),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setOrderNumber(data.order_number || orderId);
          clearCart();
        } else {
          setStatus("error");
          setErrorMessage(data.error || "결제 승인에 실패했습니다.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("결제 승인 중 오류가 발생했습니다.");
      });
  }, [paymentKey, orderId, amount, dbOrderId, clearCart]);

  if (status === "loading") {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-heading text-charcoal mb-2">
          결제를 확인하고 있어요
        </h1>
        <p className="text-warm-brown">잠시만 기다려주세요...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-heading text-charcoal mb-4">
          결제 승인에 실패했어요
        </h1>
        <p className="text-warm-brown mb-8">{errorMessage}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => router.push("/cart")}>
            장바구니로 돌아가기
          </Button>
          <Button onClick={() => router.push("/orders")}>
            주문 내역 확인
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-olive mx-auto mb-4" />
      <h1 className="text-3xl font-heading text-charcoal mb-2">
        주문이 완료되었어요!
      </h1>
      <p className="text-warm-brown mb-2">
        주문번호: <span className="text-charcoal font-medium">{orderNumber}</span>
      </p>
      {amount && (
        <p className="text-terracotta text-lg font-medium mb-8">
          {formatPrice(Number(amount))}
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Button
          variant="secondary"
          onClick={() => router.push(dbOrderId ? `/orders/${dbOrderId}` : "/orders")}
        >
          주문 상세 보기
        </Button>
        <Button onClick={() => router.push("/books")}>
          계속 쇼핑하기
        </Button>
      </div>
    </div>
  );
}
