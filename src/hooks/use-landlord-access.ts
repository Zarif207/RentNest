"use client";

import { useAuth } from "@/hooks/use-auth";
import type { LandlordStatus } from "@/types";

const BLOCKED_REASON: Record<Exclude<LandlordStatus, "APPROVED">, string> = {
  PENDING: "Waiting for admin approval",
  REJECTED: "Your landlord application was rejected",
};

/**
 * Whether the signed-in landlord may add, edit or delete listings and decide
 * requests. Only APPROVED landlords can (the backend enforces it too); a
 * missing status (an older session object) is treated as approved, since the
 * backend has the final say.
 */
export function useLandlordAccess() {
  const { user } = useAuth();
  const status = user?.role === "LANDLORD" ? (user.landlordStatus ?? "APPROVED") : null;
  const blocked = status === "PENDING" || status === "REJECTED";
  return {
    status,
    canWrite: !blocked,
    reason: blocked ? BLOCKED_REASON[status] : null,
  };
}
