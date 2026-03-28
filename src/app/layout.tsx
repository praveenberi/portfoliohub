export const dynamic = "force-dynamic";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Showup — Build Your Career Portfolio",
    template: "%s | Showup",
  },
  description:
    "Create a stunning professional portfolio, find your next job, and track applications — all in one place.",
  keywords: [
    "portfolio builder",
    "job search",
    "job tracker",
    "career portfolio",
    "resume builder",
    "job application tracker",
    "professional portfolio",
  ],
  authors: [{ name: "Showup" }],
  creator: "Showup",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Showup",
    title: "Showup — Build Your Career Portfolio",
    description:
      "Create a stunning professional portfolio, find your next job, and track applications — all in one place.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Showup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Showup — Build Your Career Portfolio",
    description:
      "Create a stunning professional portfolio, find your next job, and track applications.",
    creator: "@showup",
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-geist-sans)",
                fontSize: "14px",
                borderRadius: "10px",
                border: "1px solid #e4e4e7",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
