import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Shipd",
  description:
    "Simple, honest pricing for deployment planning. Start free, upgrade when you need more.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
