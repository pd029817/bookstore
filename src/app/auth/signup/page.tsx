"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/auth/login?message=signup-success");
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <>
      <h2 className="text-2xl font-heading text-charcoal mb-6 text-center">
        회원가입
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm text-warm-brown mb-1"
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors"
            placeholder="홍길동"
          />
        </div>
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
            minLength={6}
            className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors"
            placeholder="6자 이상"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm text-warm-brown mb-1"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors"
            placeholder="비밀번호 다시 입력"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-terracotta text-white rounded-sm hover:bg-terracotta-hover transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-sand" />
        <span className="text-sm text-warm-brown">또는</span>
        <div className="flex-1 h-px bg-sand" />
      </div>

      <button
        onClick={handleGoogleSignup}
        className="w-full py-3 border border-sand rounded-sm text-charcoal hover:bg-cream transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google로 가입
      </button>

      <p className="mt-6 text-center text-sm text-warm-brown">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="text-terracotta hover:underline">
          로그인
        </Link>
      </p>
    </>
  );
}
