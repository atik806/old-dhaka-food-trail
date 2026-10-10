import type { Metadata } from "next";
import { Fraunces, Geist, Noto_Sans_Bengali } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

// Bangla names and the ৳ sign aren't in Geist.
const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "Old Dhaka Food Trail — plan your own walking food tour",
  description:
    "An interactive map of Puran Dhaka's famous food spots — Nanna Biryani, Bakarkhani, Lalbagh and more. Build, optimise and share your own walking food tour.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fraunces.variable} ${bengali.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
