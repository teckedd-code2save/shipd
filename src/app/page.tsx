import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { AuthButton } from "@/components/auth/auth-button";
import { BottomScrollAction } from "@/components/landing/bottom-scroll-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading, Lead } from "@/components/ui/typography";

const JOURNEY_SHOTS = [
  {
    title: "Choose your repo",
    src: "/choose-repo.png",
    alt: "Shipd repository selection view",
    width: 1920,
    height: 1440
  },
  {
    title: "Scan",
    src: "/sit-tight-shipdscanning.png",
    alt: "Shipd scan in progress view",
    width: 1920,
    height: 1080
  },
  {
    title: "See results",
    src: "/see-results.png",
    alt: "Shipd ranked deployment recommendations",
    width: 1920,
    height: 1440
  }
] as const;

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <>
      <div aria-hidden="true" className="landing-ghost">Shipd</div>

      <main className="page relative z-10 flex min-h-screen flex-col">
        <section className="landing-homepage relative z-10 space-y-7 md:space-y-9">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center">
            <Badge variant="secondary" className="px-3 font-mono tracking-[0.14em] uppercase">
              Repo-aware deployment planning
            </Badge>

            <Heading as="h1" size="display" className="landing-homepage-title">
              Choose a repo. Scan the signals. Know where it should ship.
            </Heading>

            <Lead className="max-w-2xl">
              Three steps to a grounded deployment decision, ranked from your repo’s real runtime, infra, and config evidence.
            </Lead>

            {isLoggedIn ? (
              <Button asChild variant="brand" size="lg" className="h-11 rounded-full px-6">
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <AuthButton redirectTo="/dashboard" />
            )}
          </div>

          <div className="space-y-8 md:space-y-10">
            {JOURNEY_SHOTS.map((shot, index) => (
              <section
                key={shot.title}
                className="landing-journey-step space-y-2 md:space-y-3"
                style={{ "--step-index": index } as React.CSSProperties}
              >
                <p className="m-0 text-center font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  Step {index + 1}
                </p>
                <Heading as="h2" size="hero" className="text-center font-semibold text-foreground">
                  {shot.title}
                </Heading>
                <div className="landing-journey-frame overflow-hidden rounded-3xl bg-card/70 shadow-[0_26px_70px_rgba(4,8,20,0.26)]">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    className="landing-journey-image block h-auto w-full"
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 1120px"
                  />
                </div>
              </section>
            ))}
          </div>

          <div className="landing-homepage-footer-note">
            Built by Serendepify · Neutral by design · Grounded in code
          </div>
        </section>
      </main>

      <BottomScrollAction isLoggedIn={isLoggedIn} />
    </>
  );
}
