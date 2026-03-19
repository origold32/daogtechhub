import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClientProviders } from "@/components/providers/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daogtechhub.com"),
  title: {
    default: "DAOG Tech Hub | Buy & Sell Gadgets, Jerseys, Cars & Real Estate in Nigeria",
    template: "%s | DAOG Tech Hub",
  },
  description:
    "Nigeria's #1 premium marketplace for latest gadgets, football jerseys, cars and real estate. Shop iPhone, Samsung, MacBook, jerseys, cars and property listings in Lagos.",
  keywords: [
    "gadgets Nigeria", "buy iPhone Lagos", "Samsung Galaxy Nigeria",
    "football jerseys Nigeria", "buy car Nigeria", "real estate Lagos",
    "DAOG Tech Hub", "online marketplace Nigeria", "buy sell Nigeria",
    "Nigerian e-commerce", "tech gadgets Lagos",
  ],
  authors: [{ name: "DAOG Tech Hub" }],
  creator: "DAOG Tech Hub",
  manifest: "/manifest.json",
  openGraph: {
    title: "DAOG Tech Hub | Nigeria's Premier Marketplace",
    description: "Shop the latest gadgets, jerseys, cars and real estate in Nigeria.",
    type: "website",
    locale: "en_NG",
    siteName: "DAOG Tech Hub",
    images: [{ url: "/images/logo.png", width: 1200, height: 630, alt: "DAOG Tech Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DAOG Tech Hub | Nigeria's Premier Marketplace",
    description: "Shop the latest gadgets, jerseys, cars & real estate in Nigeria",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://daogtechhub.com" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DAOG Tech Hub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#1a0b2e" },
    { media: "(prefers-color-scheme: light)", color: "#f5f0ff" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll_hide overscroll-contain" suppressHydrationWarning>
      <head>
        {/* Critical resource preloads for LCP */}
        <link rel="preload" href="/images/hero_phone.jpg" as="image" />
        <link rel="preload" href="/images/logo.png" as="image" />
        {/* PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={cn(inter.variable, "font-sans overflow-x-hidden")}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
