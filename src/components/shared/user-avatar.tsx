import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-foreground text-sm font-medium text-background">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
