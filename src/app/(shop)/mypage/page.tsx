"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { User, Package, MapPin, Star } from "lucide-react";
import { maskEmail, maskName } from "@/lib/utils";

export default function MyPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <div className="animate-pulse-warm space-y-4">
          <div className="h-8 bg-sand rounded-sm w-1/4" />
          <div className="h-4 bg-sand rounded-sm w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-heading text-charcoal mb-8">마이페이지</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="border border-sand bg-beige rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-terracotta" />
            <h2 className="text-lg font-heading text-charcoal">내 정보</h2>
          </div>
          <div className="space-y-2 text-sm text-warm-brown">
            <p>이메일: {user?.email ? maskEmail(user.email) : "-"}</p>
            <p>이름: {user?.user_metadata?.name ? maskName(user.user_metadata.name) : "미설정"}</p>
          </div>
        </div>

        {/* Orders */}
        <Link
          href="/orders"
          className="border border-sand bg-beige rounded-sm p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-terracotta" />
            <h2 className="text-lg font-heading text-charcoal">주문 내역</h2>
          </div>
          <p className="text-sm text-warm-brown">
            주문 현황을 확인하고 배송을 추적하세요.
          </p>
        </Link>

        {/* Reviews */}
        <Link
          href="/mypage/reviews"
          className="border border-sand bg-beige rounded-sm p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-terracotta" />
            <h2 className="text-lg font-heading text-charcoal">내 리뷰</h2>
          </div>
          <p className="text-sm text-warm-brown">
            구매한 도서에 리뷰를 작성하고 관리하세요.
          </p>
        </Link>

        {/* Addresses */}
        <Link
          href="/mypage/addresses"
          className="border border-sand bg-beige rounded-sm p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-terracotta" />
            <h2 className="text-lg font-heading text-charcoal">배송지 관리</h2>
          </div>
          <p className="text-sm text-warm-brown">
            배송지를 추가하고 기본 배송지를 설정하세요.
          </p>
        </Link>
      </div>
    </div>
  );
}
