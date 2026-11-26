import type { Metadata } from "next";
import { StoreProvider } from "@/lib/store";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

// Absolute base for share links and images. Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build time;
// NEXT_PUBLIC_SITE_URL overrides it (e.g. a custom domain).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://dgix-rho.vercel.app");

const TITLE = "DGIX · Built in Bangladesh. For the world.";
const DESCRIPTION = "DGIX is Daffodil's global innovation exchange. We verify software from Bangladesh, match it to your need, and deliver it under one contract.";
const SHARE_IMAGE = { url: "/og/dgix-og.jpg", width: 1200, height: 630, alt: "DGIX: Built in Bangladesh. For the world.", type: "image/jpeg" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · DGIX" },
  description: DESCRIPTION,
  applicationName: "DGIX",
  // Link previews on WhatsApp, Facebook, Messenger, Discord, LinkedIn, Slack and X
  openGraph: {
    type: "website",
    siteName: "DGIX · Daffodil Global Innovation Exchange",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <StoreProvider>{children}</StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
