import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  className,
  fallbackClassName,
}: {
  name: string;
  className?: string;
  /** Override the initials circle colors (e.g. on a dark card). */
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarFallback className={cn("bg-foreground text-sm font-medium text-background", fallbackClassName)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
