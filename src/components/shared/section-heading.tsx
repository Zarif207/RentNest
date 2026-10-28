import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  /** Use <SerifAccent> inside for the one italic phrase. */
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
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && <p className="text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}
