import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("bg-sand/50 animate-pulse-warm rounded-sm", className)}
    />
  );
}
