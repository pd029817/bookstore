"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

let tossPaymentsPromise: ReturnType<typeof loadTossPayments> | null = null;

export function getTossPayments() {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY is not set");
  }

  if (!tossPaymentsPromise) {
    tossPaymentsPromise = loadTossPayments(clientKey);
  }

  return tossPaymentsPromise;
}

export function generateRandomString(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
