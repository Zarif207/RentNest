import { cn } from "@/lib/utils";

const WIDTHS = {
  default: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  narrow: "mx-auto w-full max-w-3xl px-4 sm:px-6",
  // For pages that lay out their own containers (e.g. a full-bleed gallery).
  full: "w-full",
};

/**
 * Wrapper for every public page except the home page (whose hero runs under
 * the header). The compact navbar ends 70px from the top, so content starts
 * at 112px (128px from sm); from 1024px the roof-peak bar ends at 128px, so
 * content starts at 168px. The gap before the footer is always the same. Owning the offset per page means nothing can slide under the
 * navbar, whatever else is in the DOM.
 */
export function PageShell({
  width = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & { width?: keyof typeof WIDTHS }) {
  return <div className={cn("pt-28 pb-24 sm:pt-32 sm:pb-28 lg:pt-42", WIDTHS[width], className)} {...props} />;
}
