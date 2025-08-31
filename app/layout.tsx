import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color Mixing Demonstration | Interactive RGB Color Learning Tool",
  description: "An interactive tool for learning and experimenting with RGB color mixing. Perfect for students, designers, and anyone interested in understanding color theory through hands-on experience.",
  keywords: "color mixing, RGB colors, color theory, interactive color tool, color learning, color demonstration",
  openGraph: {
    title: "Color Mixing Demonstration",
    description: "Interactive RGB color mixing demonstration tool",
    url: "https://color-hinter.org",
    siteName: "Color Mixing Demonstration",
    images: [
      {
        url: "https://color-hinter.org/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Color Mixing Demonstration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Mixing Demonstration",
    description: "Interactive RGB color mixing demonstration tool",
    images: ["https://color-hinter.org/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        aria-hidden="true"
      >
        {children}
      </body>
    </html>
  );
}
