"use client";

import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { Button } from "@/components/ui/button";
import { useCategories, useCategoryUsage, useDeleteCategory } from "@/hooks/use-categories";
import { formatDate, formatNumber } from "@/lib/format";
import type { Category } from "@/types";

type Editing = { category: Category | null } | null;

export function CategoriesView() {
  const categories = useCategories();
  const usage = useCategoryUsage(categories.data ?? []);
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const columns: DataTableColumn<Category>[] = [
    { key: "name", header: "Name", cell: (category) => <span className="font-medium">{category.name}</span> },
    {
      key: "listings",
      header: "Listings",
      cell: (category) => {
        const count = usage.get(category.id);
        return count === undefined ? "—" : `${formatNumber(count)} ${count === 1 ? "listing" : "listings"}`;
      },
    },
    { key: "created", header: "Created", cell: (category) => formatDate(category.createdAt) },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (category) => {
        const inUse = (usage.get(category.id) ?? 0) > 0;
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing({ category })}>
              <Pencil data-icon="inline-start" /> Rename
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={inUse || (remove.isPending && remove.variables?.id === category.id)}
              title={inUse ? "Used by listings, so it can't be deleted" : undefined}
              onClick={() => setDeleting(category)}
            >
              <Trash2 data-icon="inline-start" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="The categories landlords choose from. Categories used by listings can't be deleted."
        actions={
          <Button onClick={() => setEditing({ category: null })}>
            <Plus data-icon="inline-start" /> New category
          </Button>
        }
      />

      {categories.isError ? (
        <QueryError error={categories.error} onRetry={() => void categories.refetch()} />
      ) : (
        <DataTable
          label="Categories"
          columns={columns}
          rows={categories.data}
          getRowKey={(category) => category.id}
          isLoading={categories.isPending}
          skeletonRows={4}
          empty={{
            icon: Tags,
            title: "No categories yet",
            description: "Create the first category so landlords can classify their listings.",
            action: (
              <Button onClick={() => setEditing({ category: null })}>
                <Plus data-icon="inline-start" /> New category
              </Button>
            ),
          }}
        />
      )}

      {editing && (
        <CategoryDialog
          key={editing.category?.id ?? "new"}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          category={editing.category}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description="Landlords won't be able to choose it any more. This can't be undone."
        confirmLabel="Delete category"
        destructive
        isPending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting, { onSettled: () => setDeleting(null) })}
      />
    </div>
  );
}
