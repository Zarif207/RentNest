import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationNavProps = {
  page: number;
  totalPages: number;
  /** Current URL params; every other param is kept when changing page. */
  params: Record<string, string | string[] | undefined>;
  pathname: string;
};

/** Page numbers with ellipses: 1 … 4 5 6 … 12 */
function pageItems(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  return sorted.flatMap((n, index) =>
    index > 0 && n - sorted[index - 1] > 1 ? (["gap", n] as const) : ([n] as const),
  );
}

export function PaginationNav({ page, totalPages, params, pathname }: PaginationNavProps) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      const single = Array.isArray(value) ? value[0] : value;
      if (single && key !== "page") search.set(key, single);
    }
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const arrowClass = buttonVariants({ variant: "outline", size: "icon" });
  const disabledClass = "pointer-events-none opacity-40";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <Link
        href={href(page - 1)}
        aria-label="Previous page"
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(arrowClass, page <= 1 && disabledClass)}
      >
        <ChevronLeft />
      </Link>

      {pageItems(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={buttonVariants({
              variant: item === page ? "default" : "ghost",
              size: "icon",
            })}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={href(page + 1)}
        aria-label="Next page"
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={cn(arrowClass, page >= totalPages && disabledClass)}
      >
        <ChevronRight />
      </Link>
    </nav>
  );
}
