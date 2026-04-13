"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "rating", label: "평점순" },
];

const priceRanges = [
  { label: "전체", min: "", max: "" },
  { label: "~10,000원", min: "", max: "10000" },
  { label: "10,000~20,000원", min: "10000", max: "20000" },
  { label: "20,000원~", min: "20000", max: "" },
];

export function BookFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`/books?${params.toString()}`);
    },
    [router, searchParams]
  );

  const updatePriceRange = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");
      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
      router.replace(`/books?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort */}
      <select
        value={searchParams.get("sort") || "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="px-3 py-2 border border-sand bg-cream rounded-sm text-sm text-charcoal focus:outline-none focus:border-terracotta"
      >
        {sortOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Price Range */}
      <select
        value={`${searchParams.get("minPrice") || ""}-${searchParams.get("maxPrice") || ""}`}
        onChange={(e) => {
          const [min, max] = e.target.value.split("-");
          updatePriceRange(min, max);
        }}
        className="px-3 py-2 border border-sand bg-cream rounded-sm text-sm text-charcoal focus:outline-none focus:border-terracotta"
      >
        {priceRanges.map(({ label, min, max }) => (
          <option key={label} value={`${min}-${max}`}>
            {label}
          </option>
        ))}
      </select>

      {/* Rating Filter */}
      <select
        value={searchParams.get("minRating") || ""}
        onChange={(e) => updateParam("minRating", e.target.value)}
        className="px-3 py-2 border border-sand bg-cream rounded-sm text-sm text-charcoal focus:outline-none focus:border-terracotta"
      >
        <option value="">평점 전체</option>
        <option value="4">4점 이상</option>
        <option value="3">3점 이상</option>
      </select>
    </div>
  );
}
