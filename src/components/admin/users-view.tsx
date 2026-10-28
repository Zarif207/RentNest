"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Ban, Search, ShieldCheck, Users } from "lucide-react";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/user-badges";
import { DebouncedInput } from "@/components/shared/debounced-input";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatEnumLabel } from "@/lib/format";
import { USER_ROLES, USER_STATUSES, type AdminUserQuery, type User, type UserRole, type UserStatus } from "@/types";

const ANY = "any";
const PAGE_SIZE = 10;
const SORTABLE = ["createdAt", "name", "email"] as const;
type SortBy = (typeof SORTABLE)[number];

/** Reads the users query from the URL, dropping invalid values. */
function readQuery(params: URLSearchParams): Required<Pick<AdminUserQuery, "page" | "sortBy" | "sortOrder">> & AdminUserQuery {
  const role = params.get("role") as UserRole | null;
  const userStatus = params.get("userStatus") as UserStatus | null;
  const sortBy = params.get("sortBy") as SortBy | null;
  const page = Number.parseInt(params.get("page") ?? "", 10);

  return {
    searchTerm: params.get("searchTerm")?.trim() || undefined,
    role: role && USER_ROLES.includes(role) ? role : undefined,
    userStatus: userStatus && USER_STATUSES.includes(userStatus) ? userStatus : undefined,
    sortBy: sortBy && SORTABLE.includes(sortBy) ? sortBy : "createdAt",
    sortOrder: params.get("sortOrder") === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function UsersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = readQuery(searchParams);
  const { user: currentUser } = useAuth();

  const users = useAdminUsers({ ...query, limit: PAGE_SIZE });
  const updateStatus = useUpdateUserStatus();
  const [target, setTarget] = useState<User | null>(null);

  /** Updates URL params; any filter change goes back to page 1. */
  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (!("page" in updates)) params.delete("page");
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const commitSearch = useCallback((value: string) => setParams({ searchTerm: value }), [setParams]);

  const sortFor = (column: SortBy) => ({
    direction: query.sortBy === column ? query.sortOrder : null,
    onToggle: () =>
      setParams({
        sortBy: column,
        // First click: A→Z for text, newest first for dates; then flip.
        sortOrder:
          query.sortBy === column
            ? query.sortOrder === "asc" ? "desc" : "asc"
            : column === "createdAt" ? "desc" : "asc",
      }),
  });

  /** Admins can't be banned, and nobody can ban themselves (the API refuses too). */
  const canChange = (user: User) => user.role !== "ADMIN" && user.id !== currentUser?.id;

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "Name",
      sort: sortFor("name"),
      hideOnMobile: true,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} className="size-9" />
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", sort: sortFor("email"), cell: (user) => <span className="break-all">{user.email}</span> },
    { key: "phone", header: "Phone", cell: (user) => user.phone ?? <span className="text-muted-foreground">—</span> },
    { key: "role", header: "Role", cell: (user) => <RoleBadge role={user.role} /> },
    { key: "status", header: "Status", cell: (user) => <UserStatusBadge status={user.userStatus} /> },
    { key: "joined", header: "Joined", sort: sortFor("createdAt"), cell: (user) => formatDate(user.createdAt) },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (user) => {
        const banned = user.userStatus === "BLOCKED";
        const busy = updateStatus.isPending && updateStatus.variables?.id === user.id;
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant={banned ? "outline" : "destructive"}
              disabled={!canChange(user) || busy}
              title={!canChange(user) ? (user.role === "ADMIN" ? "Admins can't be banned" : "You can't ban yourself") : undefined}
              onClick={() => setTarget(user)}
            >
              {banned ? <ShieldCheck data-icon="inline-start" /> : <Ban data-icon="inline-start" />}
              {banned ? "Unban" : "Ban"}
            </Button>
          </div>
        );
      },
    },
  ];

  const targetBanned = target?.userStatus === "BLOCKED";

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Search everyone on RentNest and ban or unban accounts." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <DebouncedInput
            type="search"
            aria-label="Search users by name or email"
            placeholder="Search by name or email…"
            className="bg-card pl-9"
            value={query.searchTerm ?? ""}
            onCommit={commitSearch}
          />
        </div>
        <Select value={query.role ?? ANY} onValueChange={(value) => setParams({ role: value === ANY ? null : value })}>
          <SelectTrigger aria-label="Filter by role" className="w-full bg-card sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All roles</SelectItem>
            {USER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {formatEnumLabel(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={query.userStatus ?? ANY}
          onValueChange={(value) => setParams({ userStatus: value === ANY ? null : value })}
        >
          <SelectTrigger aria-label="Filter by status" className="w-full bg-card sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="BLOCKED">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users.isError ? (
        <QueryError error={users.error} onRetry={() => void users.refetch()} />
      ) : (
        <div className={users.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="Users"
            columns={columns}
            rows={users.data?.data}
            getRowKey={(user) => user.id}
            isLoading={users.isPending}
            mobileTitle={(user) => (
              <div className="flex items-center gap-3">
                <UserAvatar name={user.name} className="size-9" />
                <span className="font-medium">{user.name}</span>
              </div>
            )}
            empty={{
              icon: Users,
              title: "No users match",
              description: "Try a different name or email, or clear the role and status filters.",
              action: (
                <Button variant="outline" onClick={() => router.replace(pathname)}>
                  Clear filters
                </Button>
              ),
            }}
          />
        </div>
      )}

      {users.data && (
        <PaginationNav
          page={users.data.meta.page}
          totalPages={users.data.meta.totalPage}
          params={Object.fromEntries(searchParams.entries())}
          pathname={pathname}
        />
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title={targetBanned ? `Unban ${target?.name}?` : `Ban ${target?.name}?`}
        description={
          targetBanned
            ? "They'll be able to log in and use RentNest again."
            : "They'll be logged out of every request and can't log in until you unban them."
        }
        confirmLabel={targetBanned ? "Unban user" : "Ban user"}
        destructive={!targetBanned}
        onConfirm={() => {
          if (target) {
            updateStatus.mutate({ id: target.id, userStatus: targetBanned ? "ACTIVE" : "BLOCKED" });
          }
          setTarget(null);
        }}
      />
    </div>
  );
}
