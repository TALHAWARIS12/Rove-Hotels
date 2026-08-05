"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Shield, ArrowRight, Key, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeProvider";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please verify credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const autofillCredentials = () => {
    setEmail("admin@admin.com");
    setPassword("rovehotels1234@");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main
      className="relative min-h-dvh flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
    >
      {/* Background ambient luxury blur */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{
            backgroundImage: "url('/images/1-1.webp')",
            backgroundSize: "cover",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{
            backgroundImage: "url('/images/1920x1280-50.webp')",
            backgroundSize: "cover",
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)", fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            R
          </div>
          <div>
            <span className="font-display font-800 tracking-tight text-base" style={{ color: "var(--text-primary)" }}>
              ROVE
            </span>
            <span className="block eyebrow text-[10px]" style={{ color: "var(--accent)" }}>
              Downtown Dubai
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Login Card Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md card p-6 sm:p-8 space-y-6 animate-slide-up"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Header icon + titles */}
          <div className="flex flex-col items-center text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
                boxShadow: "0 8px 24px var(--accent-glow)",
              }}
            >
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="heading-display text-2xl sm:text-3xl" style={{ color: "var(--text-primary)" }}>
              Admin Portal Login
            </h1>
            <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--text-muted)" }}>
              Official management dashboard for Rove Downtown Dubai AI Concierge
            </p>
          </div>

          {/* Quick Credential Auto-Fill Chip */}


          {/* Error Message */}
          {error && (
            <div
              className="p-3.5 rounded-xl text-xs font-semibold text-center animate-fade-in"
              style={{
                backgroundColor: "rgba(232, 146, 124, 0.12)",
                color: "var(--secondary-accent)",
                border: "1px solid color-mix(in srgb, var(--secondary-accent) 30%, transparent)",
              }}
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}

                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5" style={{ color: "var(--text-muted)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}

                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg"
            >
              <span>{loading ? "Authenticating..." : "Log In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        <p className="font-mono-sm">Rove Downtown Dubai Concierge System • 2026</p>
      </footer>
    </main>
  );
}
