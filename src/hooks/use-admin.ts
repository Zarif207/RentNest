"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { refreshPublicListings } from "@/app/actions/properties";
import { adminService } from "@/lib/api/admin";
import { adminOffersService } from "@/lib/api/offers";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminRentalQuery,
  AdminUserQuery,
  Paginated,
  PropertyQuery,
  PropertyReviewInput,
  PropertyWithRelations,
  ReviewStatus,
  User,
  UserStatus,
} from "@/types";

const ONE = { limit: 1 } as const;
const PENDING_LISTINGS = { ...ONE, reviewStatus: "PENDING" } as const satisfies PropertyQuery;

export const ADMIN_PROPERTIES_PATH = "/dashboard/admin/properties";
/** The Pending tab: also the link in admins' "new listing" notifications. */
export const PENDING_LISTINGS_PATH = `${ADMIN_PROPERTIES_PATH}?review=PENDING`;

/**
 * Platform totals. There's no stats endpoint, so each number is the
 * `meta.total` of a limit=1 list request; they all run in parallel.
 */
export function useAdminStats() {
  const results = useQueries({
    queries: [
      { queryKey: queryKeys.admin.users.list(ONE), queryFn: () => adminService.getUsers(ONE) },
      {
        queryKey: queryKeys.admin.users.list({ ...ONE, role: "TENANT" }),
        queryFn: () => adminService.getUsers({ ...ONE, role: "TENANT" }),
      },
      {
        queryKey: queryKeys.admin.users.list({ ...ONE, role: "LANDLORD" }),
        queryFn: () => adminService.getUsers({ ...ONE, role: "LANDLORD" }),
      },
      {
        queryKey: queryKeys.admin.users.list({ ...ONE, userStatus: "BLOCKED" }),
        queryFn: () => adminService.getUsers({ ...ONE, userStatus: "BLOCKED" }),
      },
      { queryKey: queryKeys.admin.properties.list(ONE), queryFn: () => adminService.getProperties(ONE) },
      {
        queryKey: queryKeys.admin.rentals.list({ ...ONE, status: "PENDING" }),
        queryFn: () => adminService.getRentals({ ...ONE, status: "PENDING" }),
      },
      {
        queryKey: queryKeys.admin.rentals.list({ ...ONE, status: "ACTIVE" }),
        queryFn: () => adminService.getRentals({ ...ONE, status: "ACTIVE" }),
      },
      {
        queryKey: queryKeys.admin.properties.list({ ...ONE, listingType: "SALE" }),
        queryFn: () => adminService.getProperties({ ...ONE, listingType: "SALE" }),
      },
      { queryKey: queryKeys.admin.offers.list(ONE), queryFn: () => adminOffersService.getAll(ONE) },
      {
        queryKey: queryKeys.admin.offers.list({ ...ONE, status: "COMPLETED" }),
        queryFn: () => adminOffersService.getAll({ ...ONE, status: "COMPLETED" }),
      },
      {
        queryKey: queryKeys.admin.properties.list(PENDING_LISTINGS),
        queryFn: () => adminService.getProperties(PENDING_LISTINGS),
      },
    ],
  });

  const [users, tenants, landlords, blocked, properties, pending, active, forSale, offers, sales, pendingListings] =
    results.map((result) => result.data?.meta.total);

  return {
    totals: { users, tenants, landlords, blocked, properties, pending, active, forSale, offers, sales, pendingListings },
    isPending: results.some((result) => result.isPending),
    error: results.find((result) => result.isError)?.error ?? null,
    refetch: () => results.forEach((result) => void result.refetch()),
  };
}

export function useAdminUsers(query: AdminUserQuery) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(query),
    queryFn: () => adminService.getUsers(query),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProperties(query: PropertyQuery) {
  return useQuery({
    queryKey: queryKeys.admin.properties.list(query),
    queryFn: () => adminService.getProperties(query),
    placeholderData: keepPreviousData,
  });
}

export function useAdminRentals(query: AdminRentalQuery) {
  return useQuery({
    queryKey: queryKeys.admin.rentals.list(query),
    queryFn: () => adminService.getRentals(query),
    placeholderData: keepPreviousData,
  });
}

/** How many listings are waiting for review (the Pending tab's count). */
export function usePendingListingCount() {
  const query = useQuery({
    queryKey: queryKeys.admin.properties.list(PENDING_LISTINGS),
    queryFn: () => adminService.getProperties(PENDING_LISTINGS),
  });
  return query.data?.meta.total;
}

type PropertiesSnapshot = [readonly unknown[], Paginated<PropertyWithRelations> | undefined][];

/**
 * Approve or reject a listing. It changes status at once in every cached
 * list (and leaves lists filtered to its old status, so the Pending tab and
 * its count drop it), then rolls back if the API refuses, e.g. 409 when
 * another admin decided first.
 */
export function useReviewProperty() {
  const queryClient = useQueryClient();
  const listKey = queryKeys.admin.properties.all;

  return useMutation({
    mutationFn: ({ property, input }: { property: PropertyWithRelations; input: PropertyReviewInput }) =>
      adminService.reviewProperty(property.id, input),
    onMutate: async ({ property, input }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot: PropertiesSnapshot = queryClient.getQueriesData({ queryKey: listKey });
      const next: ReviewStatus = input.status;
      for (const [key, old] of snapshot) {
        if (!old) continue;
        // queryKeys.admin.properties.list(query) → ["admin", "properties", "list", query]
        const filter = (key[3] as PropertyQuery | undefined)?.reviewStatus;
        const leaves = filter !== undefined && filter !== next && filter === property.reviewStatus;
        queryClient.setQueryData<Paginated<PropertyWithRelations>>(key, {
          ...old,
          data: leaves
            ? old.data.filter((item) => item.id !== property.id)
            : old.data.map((item) =>
                item.id === property.id ? { ...item, reviewStatus: next, reviewNote: input.note ?? null } : item,
              ),
          meta: leaves ? { ...old.meta, total: Math.max(0, old.meta.total - 1) } : old.meta,
        });
      }
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error));
    },
    onSuccess: (property) => {
      // Approved listings go public: expire the cached public pages.
      if (property.reviewStatus === "APPROVED") void refreshPublicListings();
      toast.success(
        property.reviewStatus === "APPROVED"
          ? `“${property.title}” is live`
          : `“${property.title}” was sent back to ${property.owner.name}`,
      );
    },
    // properties.all also covers the preview page's detail query.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
  });
}

/** Pending landlords: `meta.total` is the count, `data` the newest few. */
export function usePendingLandlords(limit = 1) {
  return useAdminUsers({ role: "LANDLORD", landlordStatus: "PENDING", limit, sortBy: "createdAt", sortOrder: "desc" });
}

type UsersSnapshot = [readonly unknown[], Paginated<User> | undefined][];

/** Ban (BLOCKED) / unban (ACTIVE) with an instant badge change and rollback. */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  const usersKey = queryKeys.admin.users.all;

  return useMutation({
    mutationFn: ({ id, userStatus }: { id: string; userStatus: UserStatus }) =>
      adminService.updateUserStatus(id, userStatus),
    onMutate: async ({ id, userStatus }) => {
      await queryClient.cancelQueries({ queryKey: usersKey });
      const snapshot: UsersSnapshot = queryClient.getQueriesData({ queryKey: usersKey });
      queryClient.setQueriesData<Paginated<User>>({ queryKey: usersKey }, (old) =>
        old && {
          ...old,
          data: old.data.map((user) => (user.id === id ? { ...user, userStatus } : user)),
        },
      );
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error));
    },
    onSuccess: (user) => {
      toast.success(
        user.userStatus === "BLOCKED"
          ? `${user.name} has been banned — they can no longer log in`
          : `${user.name} has been unbanned`,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}

/** Approve or reject a landlord: instant badge change, rollback on error. */
export function useUpdateLandlordStatus() {
  const queryClient = useQueryClient();
  const usersKey = queryKeys.admin.users.all;

  return useMutation({
    mutationFn: ({ id, landlordStatus }: { id: string; landlordStatus: "APPROVED" | "REJECTED" }) =>
      adminService.updateLandlordStatus(id, landlordStatus),
    onMutate: async ({ id, landlordStatus }) => {
      await queryClient.cancelQueries({ queryKey: usersKey });
      const snapshot: UsersSnapshot = queryClient.getQueriesData({ queryKey: usersKey });
      queryClient.setQueriesData<Paginated<User>>({ queryKey: usersKey }, (old) =>
        old && {
          ...old,
          data: old.data.map((user) => (user.id === id ? { ...user, landlordStatus } : user)),
        },
      );
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(getErrorMessage(error));
    },
    onSuccess: (user) => {
      toast.success(
        user.landlordStatus === "APPROVED"
          ? `${user.name} is approved and can list properties now`
          : `${user.name}'s landlord application was rejected`,
      );
    },
    // Refetch so the Pending tab and its count drop the decided landlord.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}
