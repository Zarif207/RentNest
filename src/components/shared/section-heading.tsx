import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  /** Use <SerifAccent> inside for the one upright-serif accent phrase. */
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl leading-[1.02] font-medium tracking-tighter sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && <p className="text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}
