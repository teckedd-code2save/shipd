import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ChartIcon } from "@/components/ui/icons";

export function CtaLink({ href, label }: { href: Route; label: string }) {
  return (
    <Button asChild variant="brand" size="lg" className="h-11 rounded-full px-5">
      <Link href={href}>
        <ChartIcon size={16} />
        {label}
      </Link>
    </Button>
  );
}
