import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shivamzaware.dev";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    template: "%s | Shivam Zaware",
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

// JSON-LD: Person + WebSite schema for Google Rich Results
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Shivam Zaware",
  url: siteUrl,
  jobTitle: "Full-Stack Developer",
  description:
    "Full-stack developer crafting clean, performant, and beautiful digital experiences. Specializing in React, Next.js, and modern web technologies.",
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Full-Stack Development"],
  sameAs: [
    // Add your real social profile URLs here
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Shivam Zaware Portfolio",
  url: siteUrl,
  description: "Personal portfolio of Shivam Zaware, Full-Stack Developer.",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Structured Data — Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {/* Structured Data — WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased">
        {children}

        {/* Google Analytics 4 — only loaded when NEXT_PUBLIC_GA_ID is set */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
