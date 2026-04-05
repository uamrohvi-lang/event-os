"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, org_name: orgName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
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
            Create your workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl bg-white p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
              >
                Your name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
                placeholder="Alex Johnson"
              />
            </div>

            <div>
              <label
                htmlFor="orgName"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
              >
                Organisation name
              </label>
              <input
                id="orgName"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
                placeholder="Acme Events"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
                placeholder="Min. 8 characters"
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--color-brand-teal)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
