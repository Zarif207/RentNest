import Link from "next/link";
import { SearchX } from "lucide-react";
import { SerifAccent } from "@/components/shared/serif-accent";
import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary">
        <SearchX className="size-7 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        This home isn&apos;t <SerifAccent>on the market</SerifAccent>
      </h1>
      <p className="mt-3 text-muted-foreground">
        The listing may have been removed, or the link is incorrect.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/properties">Browse properties</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
