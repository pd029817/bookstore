import Link from "next/link";
import type { Category } from "@/types/database";

export function Footer({ categories = [] }: { categories?: Category[] }) {
  return (
    <footer className="border-t border-sand mt-auto">
      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-heading text-charcoal mb-2">
              Book<span className="text-terracotta">Shop</span>
            </h3>
            <p className="font-accent text-warm-brown text-sm">
              &ldquo;책 한 권이 세상을 바꿀 수 있다고 믿습니다.&rdquo;
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-3">둘러보기</h4>
            <div className="space-y-2 text-sm">
              <Link
                href="/books"
                className="block text-warm-brown hover:text-terracotta transition-colors"
              >
                전체 도서
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="block text-warm-brown hover:text-terracotta transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium text-charcoal mb-3">고객 지원</h4>
            <div className="space-y-2 text-sm text-warm-brown">
              <p>평일 10:00 - 18:00</p>
              <p>help@bookshop.kr</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sand text-center text-sm text-warm-brown">
          &copy; {new Date().getFullYear()} BookShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
