"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-heading text-charcoal mb-3">
          문제가 발생했어요
        </h1>
        <p className="text-warm-brown mb-8">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-terracotta text-white rounded-sm hover:bg-terracotta-hover transition-colors duration-200"
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
