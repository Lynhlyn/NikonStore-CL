import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/styles/globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ReduxProvider } from "@/lib/store/Provider";
import CartInitializer from "@/common/components/cart/CartInitializer";
import GoogleMapsScript from "@/components/GoogleMapsScript";
import VNPayRedirectHandler from "@/common/components/VNPayRedirectHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nikon Store",
  description: "Nikon Store Client Application",
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
      >
        <ReduxProvider>
          <GoogleMapsScript />
          <CartInitializer />
          <VNPayRedirectHandler />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}

