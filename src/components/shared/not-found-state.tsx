import Link from "next/link";
import { House, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundStateProps = {
  title: React.ReactNode;
  description: string;
  /** Replaces the default "Browse properties" + "Go home" buttons. */
  actions?: React.ReactNode;
  /** Extra content above the buttons (e.g. a search box). */
  children?: React.ReactNode;
  className?: string;
};

export function NotFoundState({ title, description, actions, children, className }: NotFoundStateProps) {
  return (
    <div className={cn("mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center", className)}>
      <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Error 404</p>
      <span className="mt-4 grid size-16 place-items-center rounded-full border border-gold/40 bg-gold/15">
        <SearchX className="size-7 text-bronze" aria-hidden />
      </span>
      <h1 className="mt-6 text-4xl font-medium tracking-tighter sm:text-5xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      {children}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {actions ?? (
          <>
            <Button asChild>
              <Link href="/properties">Browse properties</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <House data-icon="inline-start" /> Go home
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
