"use client";

import { useCallback, useState } from "react";
import { Ban, Check, Flag, Search, ShieldCheck, UserRound, Users, X } from "lucide-react";
import { FilterPill } from "@/components/dashboard/bento";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { LandlordStatusBadge, RoleBadge, UserStatusBadge } from "@/components/dashboard/user-badges";
import { DebouncedInput } from "@/components/shared/debounced-input";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers, usePendingLandlords, useUpdateLandlordStatus, useUpdateUserStatus } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatDate, formatEnumLabel, formatNumber } from "@/lib/format";
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
    // The "Pending landlords" tab (also the link in admins' notifications).
    landlordStatus: params.get("landlordStatus") === "PENDING" ? "PENDING" : undefined,
    sortBy: sortBy && SORTABLE.includes(sortBy) ? sortBy : "createdAt",
    sortOrder: params.get("sortOrder") === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function UsersView() {
  const { searchParams, pathname, setParams, clear } = useUrlParams();
  const query = readQuery(searchParams);
  const { user: currentUser } = useAuth();

  const users = useAdminUsers({ ...query, limit: PAGE_SIZE });
  const updateStatus = useUpdateUserStatus();
  const updateLandlord = useUpdateLandlordStatus();
  const pendingLandlords = usePendingLandlords();
  const pendingCount = pendingLandlords.data?.meta.total ?? 0;
  const [target, setTarget] = useState<User | null>(null);
  const [decision, setDecision] = useState<{ user: User; landlordStatus: "APPROVED" | "REJECTED" } | null>(null);

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
    {
      key: "landlordStatus",
      header: "Landlord status",
      cell: (user) =>
        user.role === "LANDLORD" && user.landlordStatus ? (
          <LandlordStatusBadge status={user.landlordStatus} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "joined", header: "Joined", sort: sortFor("createdAt"), cell: (user) => formatDate(user.createdAt) },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (user) => {
        const banned = user.userStatus === "BLOCKED";
        const busy = updateStatus.isPending && updateStatus.variables?.id === user.id;
        const deciding = updateLandlord.isPending && updateLandlord.variables?.id === user.id;
        const landlordStatus = user.role === "LANDLORD" ? user.landlordStatus : null;
        return (
          <div className="flex flex-wrap justify-end gap-2">
            {(landlordStatus === "PENDING" || landlordStatus === "REJECTED") && (
              <Button size="sm" disabled={deciding} onClick={() => setDecision({ user, landlordStatus: "APPROVED" })}>
                <Check data-icon="inline-start" /> Approve
              </Button>
            )}
            {landlordStatus === "PENDING" && (
              <Button
                size="sm"
                variant="outline"
                disabled={deciding}
                onClick={() => setDecision({ user, landlordStatus: "REJECTED" })}
              >
                <X data-icon="inline-start" /> Reject
              </Button>
            )}
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

  const toolbar = (
    <>
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <DebouncedInput
          type="search"
          aria-label="Search users by name or email"
          placeholder="Search by name or email…"
          className="h-10 rounded-full bg-card pl-10"
          value={query.searchTerm ?? ""}
          onCommit={commitSearch}
        />
      </div>
      <FilterPill
        icon={UserRound}
        label="Filter by role"
        value={query.role ?? ANY}
        onValueChange={(value) => setParams({ role: value === ANY ? null : value })}
        options={[{ value: ANY, label: "All roles" }, ...USER_ROLES.map((role) => ({ value: role, label: formatEnumLabel(role) }))]}
      />
      <FilterPill
        icon={Flag}
        label="Filter by status"
        value={query.userStatus ?? ANY}
        onValueChange={(value) => setParams({ userStatus: value === ANY ? null : value })}
        options={[
          { value: ANY, label: "All statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "BLOCKED", label: "Banned" },
        ]}
      />
    </>
  );

  const approving = decision?.landlordStatus === "APPROVED";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search everyone on RentNest, approve new landlords and ban or unban accounts."
      />

      <Tabs
        value={query.landlordStatus === "PENDING" ? "pending" : "all"}
        onValueChange={(value) => setParams({ landlordStatus: value === "pending" ? "PENDING" : null })}
      >
        <TabsList>
          <TabsTrigger value="all">All users</TabsTrigger>
          <TabsTrigger value="pending">
            Pending landlords
            {pendingCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-gold-foreground">
                {formatNumber(pendingCount)}
                <span className="sr-only"> waiting</span>
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {users.isError ? (
        <QueryError error={users.error} onRetry={() => void users.refetch()} />
      ) : (
        <div className={users.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <DataTable
            label="Users"
            toolbar={toolbar}
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
              title: query.landlordStatus === "PENDING" ? "No landlords waiting" : "No users match",
              description:
                query.landlordStatus === "PENDING"
                  ? "New landlord sign-ups show up here for approval."
                  : "Try a different name or email, or clear the role and status filters.",
              action: (
                <Button variant="outline" onClick={clear}>
                  {query.landlordStatus === "PENDING" ? "Show all users" : "Clear filters"}
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

      <ConfirmDialog
        open={Boolean(decision)}
        onOpenChange={(open) => !open && setDecision(null)}
        title={approving ? `Approve ${decision?.user.name}?` : `Reject ${decision?.user.name}?`}
        description={
          approving
            ? "They'll be able to list properties and manage rental requests right away."
            : "They won't be able to list properties or manage requests. You can approve them later."
        }
        confirmLabel={approving ? "Approve landlord" : "Reject landlord"}
        destructive={!approving}
        onConfirm={() => {
          if (decision) updateLandlord.mutate({ id: decision.user.id, landlordStatus: decision.landlordStatus });
          setDecision(null);
        }}
      />
    </div>
  );
}
