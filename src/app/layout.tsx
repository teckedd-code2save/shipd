import type { Metadata } from "next";

import "./globals.css";

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
    <html lang="en">
      <body className="shell">{children}</body>
    </html>
  );
}

