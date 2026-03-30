export const dynamic = "force-dynamic";

import type { Metadata, Viewport } from "next";
import { Inter, Dancing_Script, Amita, Anta, Aoboshi_One, Aref_Ruqaa } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["700"],
});

const amita = Amita({
  variable: "--font-amita",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const anta = Anta({
  variable: "--font-anta",
  subsets: ["latin"],
  weight: ["400"],
});

const aoboshiOne = Aoboshi_One({
  variable: "--font-aoboshi",
  subsets: ["latin"],
  weight: ["400"],
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "myskillspage — Build Your Career Portfolio",
    template: "%s | myskillspage",
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
  authors: [{ name: "myskillspage" }],
  creator: "myskillspage",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "myskillspage",
    title: "myskillspage — Build Your Career Portfolio",
    description:
      "Create a stunning professional portfolio, find your next job, and track applications — all in one place.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "myskillspage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "myskillspage — Build Your Career Portfolio",
    description:
      "Create a stunning professional portfolio, find your next job, and track applications.",
    creator: "@myskillspage",
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
      <body className={`${geistSans.variable} ${dancingScript.variable} ${amita.variable} ${anta.variable} ${aoboshiOne.variable} ${arefRuqaa.variable} font-sans antialiased`}>
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
