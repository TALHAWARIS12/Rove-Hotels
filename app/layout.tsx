import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Rove Downtown Dubai — AI Concierge",
  description:
    "Instant answers, anytime. Ask your concierge anything about Rove Downtown Dubai — rooms, dining, pool, gym, and local attractions.",
  keywords: ["Rove Hotels", "Dubai", "AI Concierge", "Downtown Dubai", "Hotel"],
  openGraph: {
    title: "Rove Downtown Dubai — AI Concierge",
    description: "Your 24/7 Rover Concierge, powered by verified hotel knowledge.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#18122A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inline script — runs before first paint, prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('rove_theme');
                var os = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                var theme = stored || os;
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-dvh"
        style={{
          backgroundColor: "var(--bg-page)",
          color: "var(--text-primary)",
        }}
      >
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
