import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";
import type { UserRole, UserStatus } from "@/types";

const ROLE_VARIANT = { ADMIN: "default", LANDLORD: "approved", TENANT: "secondary" } as const;

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={ROLE_VARIANT[role]}>{formatEnumLabel(role)}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "active" : "rejected"}>
      {status === "ACTIVE" ? "Active" : "Banned"}
    </Badge>
  );
}
