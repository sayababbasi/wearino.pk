import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Outfit } from "next/font/google";
import "../styles/globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import ChatWidget from "@/src/components/chat/chat_widget";
import { ToastProvider } from "@/src/components/common/Toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearino.revoticai.com';
const SITE_NAME = 'Wearino.pk';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WEARINO | Define Your Style | RevoticAI eCommerce",
    template: "%s | WEARINO"
  },
  description: "Wearino by RevoticAI is your ultimate eCommerce store for the latest fashion trends. Define Your Style, Wear Confidence. Shop premium clothing and accessories across Pakistan.",
  keywords: ["Wearino", "RevoticAI", "eCommerce store", "fashion", "Pakistan", "clothing", "online shopping", "wearino.pk", "wearino.revoticai.com"],
  authors: [{ name: "RevoticAI", url: "https://revoticai.com" }],
  creator: "RevoticAI",
  publisher: "RevoticAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "WEARINO | Premium eCommerce Fashion Store by RevoticAI",
    description: "Discover Wearino, the top eCommerce store by RevoticAI. Redefining fashion and style in Pakistan. Shop online now.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.jpg", // fallback
        width: 1200,
        height: 630,
        alt: "Wearino | Define Your Style",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WEARINO | Define Your Style",
    description: "Shop the best eCommerce fashion store by RevoticAI.",
    creator: "@WearinoPK",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: "google-site-verification=...", // Placeholder for actual Google console string
  },
};

// ─── JSON-LD Structured Data (Organization & WebSite) ─────────────────
const OrganizationJsonLd = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/icon.png`
        },
        "founder": {
          "@type": "Organization",
          "name": "RevoticAI"
        },
        "sameAs": [
          "https://www.facebook.com/wearino",
          "https://www.instagram.com/wearino"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": SITE_NAME,
        "publisher": {
          "@id": `${SITE_URL}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        {/* Load Stripe.js for payment processing */}
        <script
          async
          src="https://js.stripe.com/v3/"
          id="stripe-js"
        />
      </head>
      <body className="font-sans antialiased bg-cream text-charcoal" suppressHydrationWarning>
        <ToastProvider>
          <Suspense fallback={<div className="h-20" />}>
            <Header />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
        </ToastProvider>
      </body>
    </html>
  );
}