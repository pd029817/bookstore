"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/books", icon: BookOpen, label: "상품 관리" },
  { href: "/admin/orders", icon: Package, label: "주문 관리" },
  { href: "/admin/users", icon: Users, label: "회원 관리" },
  { href: "/admin/reviews", icon: MessageSquare, label: "리뷰 관리" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-sand bg-beige min-h-screen p-4">
      <Link href="/admin/dashboard" className="block mb-6">
        <span className="text-lg font-heading text-charcoal">
          Book<span className="text-terracotta">Shop</span>
        </span>
        <span className="block text-xs text-warm-brown">관리자</span>
      </Link>
      <nav className="space-y-1">
        {adminNav.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
                active
                  ? "bg-terracotta/10 text-terracotta font-medium"
                  : "text-warm-brown hover:bg-cream"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-4 border-t border-sand">
        <Link
          href="/"
          className="text-xs text-warm-brown hover:text-terracotta transition-colors"
        >
          ← 서점으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
