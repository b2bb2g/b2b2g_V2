import type { Metadata } from "next";
import { GlobalUtilityLayer } from "@/components/public/global-utility-layer";
import { getSiteUrl } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "B2BB2G.COM",
  metadataBase: getSiteUrl(),
  title: {
    default: "B2BB2G.COM",
    template: "%s | B2BB2G.COM",
  },
  description:
    "A global B2B network connecting Korean suppliers, industrial projects, buyer requests, and Thailand FDA services.",
  openGraph: {
    description:
      "A global B2B network connecting Korean suppliers, industrial projects, buyer requests, and Thailand FDA services.",
    images: [
      {
        alt: "B2BB2G Global Strategic Network",
        height: 922,
        url: "/b2bb2g-logo.jpg",
        width: 1382,
      },
    ],
    siteName: "B2BB2G.COM",
    title: "B2BB2G.COM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "A global B2B network connecting Korean suppliers, industrial projects, buyer requests, and Thailand FDA services.",
    images: ["/b2bb2g-logo.jpg"],
    title: "B2BB2G.COM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background font-body text-foreground">
        {children}
        <GlobalUtilityLayer />
      </body>
    </html>
  );
}
