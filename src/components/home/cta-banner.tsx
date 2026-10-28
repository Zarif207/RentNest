import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="relative overflow-hidden rounded-3xl bg-linear-to-br from-sky-from to-sky-to px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Make your dream space <SerifAccent>a reality</SerifAccent>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
            Create a free account to request your next home, or list a property and start
            receiving requests today.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/register">
                Get started <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/properties">Browse properties</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
