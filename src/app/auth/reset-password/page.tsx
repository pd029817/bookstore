"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-heading text-charcoal mb-4">
          이메일을 확인해주세요
        </h2>
        <p className="text-warm-brown mb-6">
          <strong>{email}</strong>으로 비밀번호 재설정 링크를 보냈습니다.
        </p>
        <Link
          href="/auth/login"
          className="text-terracotta hover:underline text-sm"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-heading text-charcoal mb-2 text-center">
        비밀번호 재설정
      </h2>
      <p className="text-warm-brown text-sm text-center mb-6">
        가입한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
      </p>

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
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-terracotta text-white rounded-sm hover:bg-terracotta-hover transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "전송 중..." : "재설정 링크 보내기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-warm-brown">
        <Link href="/auth/login" className="text-terracotta hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </>
  );
}
