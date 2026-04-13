"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MiniCart } from "./mini-cart";
import type { Category } from "@/types/database";

export function Header({ categories = [] }: { categories?: Category[] }) {
  const { user, loading, signOut } = useAuth();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-xl font-heading text-charcoal">
            Book<span className="text-terracotta">Shop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/books"
            className="text-warm-brown hover:text-charcoal transition-colors"
          >
            도서 목록
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="text-warm-brown hover:text-charcoal transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-xs">
          <Link
            href="/books"
            className="flex items-center gap-2 w-full px-3 py-1.5 border border-sand rounded-sm text-warm-brown text-sm hover:border-terracotta/50 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>검색...</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Cart */}
          <div className="relative">
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="p-2 text-warm-brown hover:text-charcoal transition-colors relative"
              aria-label="장바구니"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center">
                  {totalItems > 99 ? "99" : totalItems}
                </span>
              )}
            </button>
            {cartOpen && (
              <MiniCart onClose={() => setCartOpen(false)} />
            )}
          </div>

          {/* User Menu */}
          {!loading && (
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 text-warm-brown hover:text-charcoal transition-colors"
                    aria-label="사용자 메뉴"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-beige border border-sand rounded-sm shadow-lg py-1 z-50">
                      <Link
                        href="/mypage"
                        className="block px-4 py-2 text-sm text-warm-brown hover:bg-cream transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        마이페이지
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-warm-brown hover:bg-cream transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        주문 내역
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-warm-brown hover:bg-cream transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm text-warm-brown hover:text-charcoal transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-warm-brown"
            aria-label="메뉴"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-sand px-6 py-4 space-y-3 bg-cream">
          <Link
            href="/books"
            className="block text-warm-brown hover:text-charcoal"
            onClick={() => setMenuOpen(false)}
          >
            도서 목록
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="block text-warm-brown hover:text-charcoal"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
