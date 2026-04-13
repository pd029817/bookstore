export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-16 border-2 border-sand rounded-sm animate-pulse-warm bg-beige" />
        <p className="text-warm-brown text-sm">책장을 넘기는 중...</p>
      </div>
    </div>
  );
}
