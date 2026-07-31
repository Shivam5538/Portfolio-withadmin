import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    template: "%s | Portfolio",
    default: "Shivam Zaware — Full-Stack Developer",
  },
  description:
    "Full-stack developer crafting clean, performant, and beautiful digital experiences. Specializing in React, Next.js, and modern web technologies.",
  keywords: ["developer", "portfolio", "react", "nextjs", "full-stack", "typescript"],
  authors: [{ name: "Shivam Zaware" }],
  creator: "Shivam Zaware",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Shivam Zaware — Full-Stack Developer",
    description:
      "Full-stack developer crafting clean, performant, and beautiful digital experiences.",
    siteName: "Shivam Zaware Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivam Zaware — Full-Stack Developer",
    description:
      "Full-stack developer crafting clean, performant, and beautiful digital experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
