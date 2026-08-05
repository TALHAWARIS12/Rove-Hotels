"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Shield,
  Database,
  Upload,
  HelpCircle,
  MessageSquare,
  BarChart3,
  QrCode,
  Home,
  Menu,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { href: "/admin",               label: "Overview",         icon: Home,         color: "var(--accent)" },
  { href: "/admin/crud",          label: "KB Tables",        icon: Database,     color: "var(--tertiary-accent)" },
  { href: "/admin/documents",     label: "Documents",        icon: Upload,       color: "#60A5FA" },
  { href: "/admin/unanswered",    label: "Unanswered Queue", icon: HelpCircle,   color: "var(--success)" },
  { href: "/admin/conversations", label: "Conversations",    icon: MessageSquare,color: "#C084FC" },
  { href: "/admin/analytics",     label: "Analytics",        icon: BarChart3,    color: "var(--secondary-accent)" },
];

function NavLink({
  href,
  label,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
      style={{
        color: active ? color : "var(--text-secondary)",
        backgroundColor: active ? "var(--bg-surface-raised)" : "transparent",
        border: active ? `1px solid var(--border-strong)` : "1px solid transparent",
        minHeight: 36,
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Allow login page to render without layout wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state while checking authentication
  if (status === "loading") {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center space-y-3"
        style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
        <p className="eyebrow">Verifying Admin Credentials...</p>
      </div>
    );
  }

  // Redirect unauthenticated users directly to /admin/login
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      router.push("/admin/login");
    }
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center space-y-3"
        style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
      >
        <Shield className="w-8 h-8" style={{ color: "var(--accent)" }} />
        <p className="eyebrow">Redirecting to Admin Login...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
    >
      {/* ── Top Header ────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              R
            </div>
            <div>
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Rove Concierge Admin
              </span>
              <span
                className="block eyebrow text-[10px]"
                style={{ color: "var(--accent)" }}
              >
                {session?.user?.email || "admin@admin.com"}
              </span>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Admin navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={pathname === link.href}
              />
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="/api/qr?format=png"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost hidden xs:flex"
              style={{ fontSize: "0.7rem" }}
              aria-label="Download QR code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download QR</span>
            </a>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="btn-ghost text-xs"
              style={{ minHeight: 36, padding: "0 0.625rem" }}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              className="btn-icon lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden px-4 pb-4 grid grid-cols-2 gap-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={pathname === link.href}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold col-span-2"
              style={{
                backgroundColor: "rgba(232, 146, 124, 0.12)",
                border: "1px solid color-mix(in srgb, var(--secondary-accent) 30%, transparent)",
                color: "var(--secondary-accent)",
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Admin</span>
            </button>
          </div>
        )}
      </header>

      {/* ── Breadcrumb trail ──────────────────────────────── */}
      <div
        className="w-full"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <span className="eyebrow" style={{ color: "var(--text-muted)" }}>
            Admin Portal
          </span>
          {pathname !== "/admin" && (
            <>
              <span style={{ color: "var(--border-strong)" }}>/</span>
              <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
                {NAV_LINKS.find((l) => l.href === pathname)?.label ?? "Page"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Admin Footer ──────────────────────────────────── */}
      <footer
        className="w-full"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col xs:flex-row items-center justify-between gap-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          <p className="font-mono-sm">Rove Concierge Admin — Downtown Dubai Management</p>
          <Link
            href="/"
            className="font-mono-sm transition-colors"
            style={{ color: "var(--accent)" }}
          >
            ← Guest View
          </Link>
        </div>
      </footer>
    </div>
  );
}
