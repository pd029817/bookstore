"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <>
      <h2 className="text-2xl font-heading text-charcoal mb-6 text-center">
        로그인
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm text-warm-brown mb-1"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm text-warm-brown mb-1"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors"
            placeholder="비밀번호 입력"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-terracotta text-white rounded-sm hover:bg-terracotta-hover transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-warm-brown space-y-2">
        <p>
          계정이 없으신가요?{" "}
          <Link href="/auth/signup" className="text-terracotta hover:underline">
            회원가입
          </Link>
        </p>
        <p>
          <Link
            href="/auth/reset-password"
            className="text-terracotta hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>
      </div>
    </>
  );
}
