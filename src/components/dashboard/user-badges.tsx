import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";
import type { LandlordStatus, UserRole, UserStatus } from "@/types";

const ROLE_VARIANT = {
  ADMIN: "default",
  LANDLORD: "approved",
  TENANT: "secondary",
  OBSERVER: "outline",
} as const satisfies Record<UserRole, string>;

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

const LANDLORD_VARIANT = { PENDING: "pending", APPROVED: "active", REJECTED: "rejected" } as const;

export function LandlordStatusBadge({ status }: { status: LandlordStatus }) {
  return <Badge variant={LANDLORD_VARIANT[status]}>{formatEnumLabel(status)}</Badge>;
}
