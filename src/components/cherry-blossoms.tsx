"use client";

import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  swayAmount: number;
  rotation: number;
}

export function CherryBlossoms() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const count = 30;
    const generated: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 10 + Math.random() * 14,
      opacity: 0.4 + Math.random() * 0.4,
      swayAmount: 30 + Math.random() * 60,
      rotation: Math.random() * 360,
    }));
    setPetals(generated);
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      <style>{`
        @keyframes petal-fall {
          0% {
            transform: translateY(-10%) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(22vh) translateX(var(--sway)) rotate(90deg);
          }
          50% {
            transform: translateY(48vh) translateX(calc(var(--sway) * -0.5)) rotate(200deg);
          }
          75% {
            transform: translateY(72vh) translateX(var(--sway)) rotate(290deg);
          }
          100% {
            transform: translateY(105vh) translateX(calc(var(--sway) * -0.3)) rotate(380deg);
          }
        }
      `}</style>
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={
            {
              left: `${p.left}%`,
              top: "-20px",
              "--sway": `${p.swayAmount}px`,
              animation: `petal-fall ${p.duration}s ease-in-out ${p.delay}s infinite`,
              opacity: p.opacity,
            } as React.CSSProperties
          }
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 32 32"
            style={{ transform: `rotate(${p.rotation}deg)` }}
          >
            <ellipse
              cx="16"
              cy="10"
              rx="6"
              ry="10"
              fill="#f8b4c8"
              transform="rotate(-15 16 16)"
            />
            <ellipse
              cx="16"
              cy="10"
              rx="6"
              ry="10"
              fill="#f9c4d4"
              transform="rotate(15 16 16)"
            />
            <circle cx="16" cy="14" r="2" fill="#f4899a" opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
}
