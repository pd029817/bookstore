"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressSearch } from "@/components/ui/address-search";
import { formatPrice } from "@/lib/utils";
import { getTossPayments, generateRandomString } from "@/lib/toss-payments";
import type { Address } from "@/types/database";

export default function CheckoutPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 30000 ? 0 : 3000;
  const finalAmount = totalPrice + shippingFee;

  const [form, setForm] = useState({
    recipient_name: "",
    recipient_phone: "",
    zip_code: "",
    shipping_address: "",
    shipping_address_detail: "",
  });
  const [loading, setLoading] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        const addrs: Address[] = data.addresses || [];
        setSavedAddresses(addrs);
        // 기본 배송지 자동 입력
        const def = addrs.find((a) => a.is_default) ?? addrs[0];
        if (def) {
          setForm({
            recipient_name: def.recipient_name,
            recipient_phone: def.phone,
            zip_code: def.zip_code,
            shipping_address: def.address,
            shipping_address_detail: def.address_detail || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  // TossPayments widget refs
  const widgetsRef = useRef<any>(null);
  const paymentMethodWidgetRef = useRef<any>(null);
  const agreementWidgetRef = useRef<any>(null);

  // Initialize TossPayments widget
  useEffect(() => {
    if (items.length === 0 || !user || widgetError) return;

    let mounted = true;

    async function initWidget() {
      try {
        const tossPayments = await getTossPayments();
        const customerKey = user!.id;

        const widgets = tossPayments.widgets({ customerKey });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: "KRW", value: finalAmount });

        if (!mounted) return;

        const paymentMethodWidget = await widgets.renderPaymentMethods({
          selector: "#payment-methods",
        });
        paymentMethodWidgetRef.current = paymentMethodWidget;

        const agreementWidget = await widgets.renderAgreement({
          selector: "#agreement",
        });
        agreementWidgetRef.current = agreementWidget;

        if (mounted) setWidgetReady(true);
      } catch {
        if (mounted) setWidgetError(true);
      }
    }

    initWidget();

    return () => {
      mounted = false;
    };
  }, [user, items.length > 0 ? "has-items" : "no-items", widgetError]);

  // Update amount when price changes
  useEffect(() => {
    if (widgetsRef.current && finalAmount > 0) {
      widgetsRef.current.setAmount({
        currency: "KRW",
        value: finalAmount,
      });
    }
  }, [finalAmount]);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      addToast("장바구니가 비어있습니다.", "error");
      return;
    }

    if (!form.recipient_name || !form.recipient_phone || !form.shipping_address || !form.zip_code) {
      addToast("배송 정보를 모두 입력해주세요.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order first (status: pending payment)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            book_id: item.book.id,
            quantity: item.quantity,
          })),
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "주문 생성에 실패했습니다.", "error");
        setLoading(false);
        return;
      }

      const orderId = data.order.order_number;
      const orderName =
        items.length === 1
          ? items[0].book.title
          : `${items[0].book.title} 외 ${items.length - 1}건`;

      // 2. Request payment via TossPayments widget
      if (widgetsRef.current && !widgetError) {
        await widgetsRef.current.requestPayment({
          orderId,
          orderName,
          successUrl: `${window.location.origin}/checkout/success?dbOrderId=${data.order.id}`,
          failUrl: `${window.location.origin}/checkout/fail?dbOrderId=${data.order.id}`,
          customerEmail: user?.email || undefined,
          customerName: form.recipient_name,
          customerMobilePhone: form.recipient_phone.replace(/-/g, ""),
        });
      } else {
        // 위젯 미사용 시 주문 완료 처리 (개발/테스트 모드)
        clearCart();
        addToast("주문이 완료되었습니다!", "success");
        router.push(`/orders/${data.order.id}`);
      }
    } catch (err: any) {
      // User cancelled payment or error occurred
      if (err?.code === "USER_CANCEL") {
        addToast("결제가 취소되었습니다.", "info");
      } else {
        addToast("결제 중 오류가 발생했습니다.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-heading text-charcoal mb-4">
          주문할 상품이 없습니다
        </h1>
        <p className="text-warm-brown mb-8">장바구니에 상품을 담아주세요.</p>
        <Button onClick={() => router.push("/books")}>책 둘러보기</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-heading text-charcoal mb-8">주문/결제</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items Summary */}
            <section className="border border-sand bg-beige rounded-sm p-6">
              <h2 className="text-lg font-heading text-charcoal mb-4">
                주문 상품 ({items.length}종)
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.book.id} className="flex gap-3 text-sm">
                    <div className="w-10 h-12 bg-sand/50 rounded-sm shrink-0" />
                    <div className="flex-1">
                      <p className="text-charcoal">{item.book.title}</p>
                      <p className="text-warm-brown text-xs">
                        {item.quantity}권 ·{" "}
                        {formatPrice(
                          (item.book.discount_price || item.book.price) *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping Info */}
            <section className="border border-sand bg-beige rounded-sm p-6">
              <h2 className="text-lg font-heading text-charcoal mb-4">
                배송 정보
              </h2>

              {/* 저장된 배송지 선택 */}
              {savedAddresses.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm text-warm-brown mb-2">저장된 배송지</p>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className="flex items-start gap-3 border border-sand rounded-sm p-3 cursor-pointer hover:border-terracotta/50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="saved_address"
                          className="mt-0.5 accent-terracotta"
                          checked={
                            form.zip_code === addr.zip_code &&
                            form.shipping_address === addr.address &&
                            form.recipient_name === addr.recipient_name
                          }
                          onChange={() =>
                            setForm({
                              recipient_name: addr.recipient_name,
                              recipient_phone: addr.phone,
                              zip_code: addr.zip_code,
                              shipping_address: addr.address,
                              shipping_address_detail: addr.address_detail || "",
                            })
                          }
                        />
                        <div className="text-sm">
                          <span className="font-medium text-charcoal">{addr.recipient_name}</span>
                          <span className="text-warm-brown/60 ml-2">{addr.phone}</span>
                          {addr.is_default && (
                            <span className="ml-2 text-xs bg-terracotta/10 text-terracotta px-1.5 py-0.5 rounded-sm">기본</span>
                          )}
                          <p className="text-warm-brown mt-0.5">
                            [{addr.zip_code}] {addr.address} {addr.address_detail}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-sand pt-3">
                    <p className="text-sm text-warm-brown mb-2">직접 입력</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  id="recipient_name"
                  label="수령인"
                  value={form.recipient_name}
                  onChange={(e) => updateForm("recipient_name", e.target.value)}
                  required
                  placeholder="홍길동"
                />
                <Input
                  id="recipient_phone"
                  label="연락처"
                  value={form.recipient_phone}
                  onChange={(e) => updateForm("recipient_phone", e.target.value)}
                  required
                  placeholder="010-1234-5678"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="zip_code"
                      label="우편번호"
                      value={form.zip_code}
                      readOnly
                      required
                      placeholder="주소 검색 버튼을 눌러주세요"
                    />
                  </div>
                  <AddressSearch
                    onSelect={({ zipCode, address }) => {
                      updateForm("zip_code", zipCode);
                      updateForm("shipping_address", address);
                    }}
                  />
                </div>
                <Input
                  id="shipping_address"
                  label="주소"
                  value={form.shipping_address}
                  readOnly
                  required
                  placeholder="주소 검색 후 자동 입력됩니다"
                />
                <Input
                  id="shipping_address_detail"
                  label="상세 주소"
                  value={form.shipping_address_detail}
                  onChange={(e) =>
                    updateForm("shipping_address_detail", e.target.value)
                  }
                  placeholder="아파트 동/호수"
                />
              </div>
            </section>

            {/* TossPayments Payment Methods Widget */}
            {!widgetError && (
              <section className="border border-sand bg-beige rounded-sm p-6">
                <h2 className="text-lg font-heading text-charcoal mb-4">
                  결제 수단
                </h2>
                <div id="payment-methods" className="min-h-[200px]">
                  {!widgetReady && (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-warm-brown text-sm animate-pulse-warm">
                        결제 위젯을 불러오는 중...
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TossPayments Agreement Widget */}
            {!widgetError && (
              <section className="border border-sand bg-beige rounded-sm p-6">
                <div id="agreement" />
              </section>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-sand bg-beige rounded-sm p-6 sticky top-20">
              <h2 className="text-lg font-heading text-charcoal mb-4">
                결제 금액
              </h2>
              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-sand">
                <div className="flex justify-between text-warm-brown">
                  <span>상품 금액</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-warm-brown">
                  <span>배송비</span>
                  <span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
                </div>
              </div>
              <div className="flex justify-between font-medium text-charcoal mb-6">
                <span>총 결제금액</span>
                <span className="text-terracotta text-xl">
                  {formatPrice(finalAmount)}
                </span>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {formatPrice(finalAmount)} 결제하기
              </Button>
              {totalPrice < 30000 && (
                <p className="text-xs text-warm-brown mt-3 text-center">
                  {formatPrice(30000 - totalPrice)} 더 담으면 무료 배송!
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
