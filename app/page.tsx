"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Shield, Clock, MapPin, ShieldCheck, Expand, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";

const HOTEL_GALLERY = [
  {
    src: "/images/1-1.webp",
    title: "Pool with Burj Khalifa Views",
    subtitle: "Unwind by the rooftop pool with an iconic Burj Khalifa panorama right in front of you",
    category: "Pool & Outdoors",
  },
  {
    src: "/images/1920x1280-48.webp",
    title: "Rover Lounge & Lobby",
    subtitle: "A creative, energetic common space — perfect for remote work or catching up over coffee",
    category: "Social Spaces",
  },
  {
    src: "/images/1920x1280-50.webp",
    title: "Indoor Lifestyle Spaces",
    subtitle: "Distinct Rove personality in every corner — playful design that feels like home",
    category: "Design & Vibe",
  },
  {
    src: "/images/1920x1280-54.webp",
    title: "Outdoor Dining Terrace",
    subtitle: "Al fresco dining with city views — TGI Fridays & The Daily, all under open skies",
    category: "Dining",
  },
];

export default function WelcomePage() {
  const [activeImage, setActiveImage] = useState<typeof HOTEL_GALLERY[0] | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <main
      className="relative min-h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      {/* Background Ambient Hotel Blur */}
      <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            backgroundImage: "url('/images/1920x1280-50.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            backgroundImage: "url('/images/1-1.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 w-full"
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-extrabold text-sm"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              R
            </div>
            <div>
              <span
                className="font-display font-800 tracking-tight text-base sm:text-lg leading-none"
                style={{ color: "var(--text-primary)" }}
              >
                ROVE
              </span>
              <span
                className="block eyebrow mt-0.5"
                style={{ color: "var(--accent)" }}
              >
                Downtown Dubai
              </span>
            </div>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin"
              className="btn-ghost hidden xs:flex"
              style={{ fontSize: "0.7rem" }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column — Text & CTAs */}
          <div className="flex flex-col justify-center animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="eyebrow" style={{ color: "var(--tertiary-accent)" }}>
                DUBAI · DOWNTOWN · YOUR ROVER
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-strong)" }} />
            </div>

            <h1
              className="heading-display text-4xl sm:text-5xl lg:text-6xl mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Your Concierge <br />
              <span style={{ color: "var(--accent)" }}>Never Sleeps.</span>
            </h1>

            <p
              className="text-base sm:text-lg mb-2 max-w-md font-medium"
              style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
            >
              Instant, verified answers on rooms, dining, pool, gym, and everything around Downtown Dubai.
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Ask in any language — English, Arabic, French, Spanish, Hindi, and more.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 mb-8">
              <Link href="/chat" className="btn-primary text-base px-6 py-4" id="start-chat-btn">
                <MessageSquare className="w-5 h-5" />
                <span>Chat with Your Concierge</span>
              </Link>
              <button
                onClick={() => setShowQrModal(true)}
                className="btn-ghost text-sm px-5 py-4 cursor-pointer"
              >
                📱 Scan QR with Mobile
              </button>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap gap-2.5" role="list" aria-label="Trust signals">
              {[
                { icon: ShieldCheck, label: "Verified by hotel team" },
                { icon: Clock, label: "Available 24/7" },
                { icon: MapPin, label: "Downtown Dubai expert" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="badge badge-success" role="listitem">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Animated Hotel Image Showcase Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
            {HOTEL_GALLERY.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImage(img)}
                className="group relative h-40 sm:h-52 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                style={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border)" }}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Image details */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="badge badge-accent mb-1 text-[9px] py-0.5 px-2">
                    {img.category}
                  </span>
                  <p className="font-display font-700 text-sm leading-tight text-white drop-shadow">
                    {img.title}
                  </p>
                </div>

                <button
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Expand photo"
                >
                  <Expand className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Feature Cards Row ─────────────────────────────── */}
      <section className="w-full relative z-10" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                label: "Rooms & Stays",
                desc: "Standard, Premium, Gamer Cave, and Roving Suite details, pricing, and amenities.",
                color: "var(--accent)",
              },
              {
                label: "Dining at TGIF",
                desc: "Breakfast 6:30–10:30 AM, room service, daily menu options, and meal plans.",
                color: "var(--tertiary-accent)",
              },
              {
                label: "Downtown Explorer",
                desc: "Burj Khalifa (2 min walk), Dubai Mall, Dubai Opera, and neighborhood guides.",
                color: "var(--success)",
              },
            ].map(({ label, desc, color }) => (
              <div key={label} className="card p-4 sm:p-5">
                <div className="w-1 h-6 rounded-full mb-3" style={{ backgroundColor: color }} />
                <h3 className="font-display font-700 text-base mb-1.5" style={{ color: "var(--text-primary)" }}>
                  {label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lightbox Image Modal ──────────────────────────── */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-3xl w-full card overflow-hidden rounded-2xl animate-slide-up"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-3 right-3 z-10 btn-icon bg-black/50 text-white border-0"
              aria-label="Close photo"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative h-72 sm:h-96 w-full">
              <img
                src={activeImage.src}
                alt={activeImage.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <span className="badge badge-accent mb-2">{activeImage.category}</span>
              <h3 className="heading-display text-2xl" style={{ color: "var(--text-primary)" }}>
                {activeImage.title}
              </h3>
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {activeImage.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile QR Code Modal ──────────────────────────── */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-md w-full card p-6 rounded-2xl animate-slide-up text-center space-y-4"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 btn-icon text-gray-400 hover:text-white"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="badge badge-gold mb-2">MOBILE QR ENTRY POINT</span>
              <h3 className="heading-display text-2xl" style={{ color: "var(--text-primary)" }}>
                Scan to Test on Mobile
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Scan this QR code with your smartphone camera while connected to the same Wi-Fi network!
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block mx-auto shadow-inner">
              <img
                src={`/api/qr?url=http://${typeof window !== 'undefined' ? window.location.hostname : '192.168.1.6'}:3000/chat&format=png`}
                alt="Rove Mobile QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-left text-xs space-y-1.5 font-mono">
              <p className="text-amber-400 font-bold">💡 How to open on your phone:</p>
              <p className="text-gray-300">1. Connect your phone to your local Wi-Fi.</p>
              <p className="text-gray-300">2. Run: <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">npm run dev:host</code> in terminal.</p>
              <p className="text-gray-300">3. Scan QR code above with your phone camera!</p>
            </div>

            <div className="pt-2">
              <Link
                href="/chat"
                className="btn-primary w-full py-3 text-sm"
                onClick={() => setShowQrModal(false)}
              >
                Open Concierge Web App Directly
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="w-full relative z-10" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)" }}
        >
          <p>© 2026 Rove Hotels. Built for Rovers &amp; Rovesters.</p>
          <p>312 Al Mustaqbal St, Zabeel 2, Dubai, UAE</p>
        </div>
      </footer>
    </main>
  );
}
