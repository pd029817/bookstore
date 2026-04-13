import { cn } from "@/lib/utils";

type BadgeVariant = "olive" | "terracotta" | "sand" | "warm-brown";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  olive: "bg-olive/10 text-olive",
  terracotta: "bg-terracotta/10 text-terracotta",
  sand: "bg-sand/50 text-warm-brown",
  "warm-brown": "bg-warm-brown/10 text-warm-brown",
};

export function Badge({ variant = "olive", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
