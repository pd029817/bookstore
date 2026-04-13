import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-3xl font-heading text-charcoal">
            Book<span className="text-terracotta">Shop</span>
          </h1>
          <p className="text-warm-brown text-sm mt-1 font-accent">
            당신의 독립 서점
          </p>
        </Link>
        <div className="border border-sand bg-beige rounded-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
