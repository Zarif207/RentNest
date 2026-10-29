import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium tracking-[0.02em] whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-foreground/15 text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "border-gold/40 bg-gold/15 text-bronze",
        // Rental status tones, muted to suit the palette (same meanings):
        // PENDING ochre, APPROVED slate blue, REJECTED brick, ACTIVE sage,
        // COMPLETED stone, CANCELLED stone outline. All >= 5:1 contrast.
        pending:
          "bg-[#f1e6cf] text-[#7a5a1e] dark:bg-[#c2a878]/15 dark:text-[#dcc69d]",
        approved:
          "bg-[#e3e7ec] text-[#3e5068] dark:bg-[#8fa3bc]/15 dark:text-[#b4c4d6]",
        rejected:
          "bg-[#f2e1dc] text-[#8c3a2b] dark:bg-[#e07a6a]/15 dark:text-[#e9a497]",
        active:
          "bg-[#e2e8dc] text-[#4a5f3c] dark:bg-[#9db48a]/15 dark:text-[#bccfab]",
        completed:
          "bg-[#e9e4dc] text-[#5e574e] dark:bg-white/8 dark:text-[#b5ada2]",
        cancelled:
          "border-foreground/15 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
