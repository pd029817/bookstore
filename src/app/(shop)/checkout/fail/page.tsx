"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
      <XCircle className="w-16 h-16 text-terracotta mx-auto mb-4" />
      <h1 className="text-3xl font-heading text-charcoal mb-4">
        결제에 실패했어요
      </h1>
      {message && (
        <p className="text-warm-brown mb-2">{decodeURIComponent(message)}</p>
      )}
      {code && (
        <p className="text-warm-brown/50 text-sm mb-8">
          에러 코드: {code}
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={() => router.push("/cart")}>
          장바구니로 돌아가기
        </Button>
        <Button onClick={() => router.push("/checkout")}>
          다시 결제하기
        </Button>
      </div>
    </div>
  );
}
