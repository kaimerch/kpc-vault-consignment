import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "KPC Vault - Premium Consignment Services",
  description: "Professional consignment services for luxury and collectible items. Transparent pricing, digital contracts, and real-time tracking. Start consigning today.",
  keywords: "consignment, luxury items, collectibles, auction, selling, marketplace, professional",
  authors: [{ name: "KPC Vault" }],
  creator: "KPC Vault",
  publisher: "KPC Vault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "KPC Vault - Premium Consignment Services",
    description: "Professional consignment services for luxury and collectible items. Transparent pricing and real-time tracking.",
    url: 'https://kpcvault.vercel.app',
    siteName: 'KPC Vault',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "KPC Vault - Premium Consignment Services",
    description: "Professional consignment services for luxury and collectible items.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
