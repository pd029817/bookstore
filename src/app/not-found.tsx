import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-heading text-terracotta mb-4">404</h1>
        <h2 className="text-2xl font-heading text-charcoal mb-3">
          페이지를 찾을 수 없어요
        </h2>
        <p className="text-warm-brown mb-8">
          찾으시는 페이지가 사라졌거나, 주소가 변경되었을 수 있어요.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-terracotta text-white rounded-sm hover:bg-terracotta-hover transition-colors duration-200"
        >
          서점으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
