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
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      fontFamily: "var(--font)",
    }}>
      {/* Left — navy hero */}
      <div style={{
        background: "var(--navy)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 48,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 20% 50%, rgba(15,110,86,0.35) 0%, transparent 60%)",
        }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{
            width: 40, height: 40, background: "var(--teal)", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
          }}>EO</div>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#fff", letterSpacing: -0.5 }}>EventOS</span>
        </div>

        {/* Hero copy */}
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>
            Production-first event management
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 300, color: "#fff", lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 20 }}>
            The operating system<br />for <strong style={{ fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>live events</strong>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 380 }}>
            One platform for your entire production team — team coordination, vendor management, live runsheets, and on-site access control.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32, position: "relative" }}>
          {[
            { val: "32", lbl: "Screens across 4 modules" },
            { val: "4",  lbl: "Core modules" },
            { val: "30", lbl: "Week build plan" },
          ].map(({ val, lbl }) => (
            <div key={lbl}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 48, background: "var(--bg)",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: "var(--t1)", letterSpacing: -0.5, marginBottom: 6 }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: "var(--t3)", marginBottom: 32 }}>
            Sign in to your EventOS workspace
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2)", marginBottom: 6, letterSpacing: 0.3 }}>
                Work email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                style={{ borderRadius: 10, padding: "10px 14px", fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", letterSpacing: 0.3 }}>
                  Password
                </label>
                <span style={{ fontSize: 12, color: "var(--teal)", cursor: "pointer" }}>Forgot password?</span>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{ borderRadius: 10, padding: "10px 14px", fontSize: 14 }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 12 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: 11,
                background: "var(--navy)", color: "#fff",
                border: "none", borderRadius: 10,
                fontFamily: "var(--font)", fontSize: 14, fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
                marginTop: 8,
              }}
            >
              {loading ? "Signing in…" : "Sign in to EventOS"}
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: 12, color: "var(--t3)", margin: "20px 0", position: "relative" }}>
            <span style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              height: 1, background: "var(--border)", transform: "translateY(-50%)"
            }} />
            <span style={{ background: "var(--bg)", padding: "0 12px", position: "relative" }}>or</span>
          </div>

          <button
            style={{
              width: "100%", padding: 10,
              background: "var(--surface)", color: "var(--t1)",
              border: "1.5px solid var(--border-md)", borderRadius: 10,
              fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Continue with Google SSO
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--t3)", marginTop: 24 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--navy)", fontWeight: 500, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}