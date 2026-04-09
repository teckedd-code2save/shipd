import type { Metadata } from "next";

import "./globals.css";
import { DM_Mono, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Shipd",
  description: "Deployment decision layer for the AI-assisted era."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, dmMono.variable)}>
      <body className="shell" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
