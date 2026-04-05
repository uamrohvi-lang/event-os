"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "var(--color-brand-navy)" }}
            >
              E
            </span>
            <span className="text-xl font-semibold text-[var(--color-text-primary)]">
              Event OS
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl bg-white p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-signal-red)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--color-brand-teal)" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--color-brand-teal)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
