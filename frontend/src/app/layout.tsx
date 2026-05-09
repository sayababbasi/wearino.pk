import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "WEARINO | Define Your Style",
  description: "Define Your Style, Wear Confidence. Shop the latest fashion trends at wearino.pk",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Load Stripe.js for payment processing */}
        <script
          async
          src="https://js.stripe.com/v3/"
          id="stripe-js"
        />
      </head>
      <body className="font-sans antialiased bg-cream text-charcoal" suppressHydrationWarning>
        <ToastProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
        </ToastProvider>
      </body>
    </html>
  );
}