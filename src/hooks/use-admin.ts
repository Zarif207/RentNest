"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/lib/api/admin";
import { adminOffersService } from "@/lib/api/offers";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminRentalQuery,
  AdminUserQuery,
  Paginated,
  PropertyQuery,
  User,
  UserStatus,
} from "@/types";

const ONE = { limit: 1 } as const;

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
    ],
  });

  const [users, tenants, landlords, blocked, properties, pending, active, forSale, offers, sales] = results.map(
    (result) => result.data?.meta.total,
  );

  return {
    totals: { users, tenants, landlords, blocked, properties, pending, active, forSale, offers, sales },
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
