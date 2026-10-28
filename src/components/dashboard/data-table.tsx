import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { EmptyState, type EmptyStateProps } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Leave out of the stacked mobile card (e.g. when it's in the card title). */
  hideOnMobile?: boolean;
  /** Makes the header a sort toggle; `direction` is null when sorted by another column. */
  sort?: { direction: "asc" | "desc" | null; onToggle: () => void };
};

function SortableHeader<T>({ column }: { column: DataTableColumn<T> }) {
  const sort = column.sort;
  if (!sort) return column.header;
  const Icon = sort.direction === "asc" ? ArrowUp : sort.direction === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={sort.onToggle}
      className="-mx-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {column.header}
      <Icon className={cn("size-3.5", !sort.direction && "opacity-50")} aria-hidden />
    </button>
  );
}

function ariaSort<T>(column: DataTableColumn<T>) {
  if (!column.sort) return undefined;
  if (column.sort.direction === "asc") return "ascending" as const;
  if (column.sort.direction === "desc") return "descending" as const;
  return "none" as const;
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  empty: EmptyStateProps;
  /** Heading of each mobile card (e.g. property thumbnail + title). */
  mobileTitle?: (row: T) => React.ReactNode;
  /** Accessible name for the table. */
  label: string;
};

/** A table from md up; stacked cards on small screens. */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading,
  skeletonRows = 5,
  empty,
  mobileTitle,
  label,
}: DataTableProps<T>) {
  if (!isLoading && rows && rows.length === 0) {
    return <EmptyState {...empty} className={cn("bg-card", empty.className)} />;
  }

  const mobileColumns = columns.filter((column) => !column.hideOnMobile);
  const skeletons = Array.from({ length: skeletonRows }, (_, index) => index);

  return (
    <div aria-busy={isLoading || undefined}>
      <div className="hidden overflow-hidden rounded-3xl border bg-card md:block">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  aria-sort={ariaSort(column)}
                  className={cn("h-12 px-4", column.className)}
                >
                  <SortableHeader column={column} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? skeletons.map((index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    {columns.map((column) => (
                      <TableCell key={column.key} className="px-4 py-4">
                        <Skeleton className="h-5 w-full max-w-36" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows?.map((row) => (
                  <TableRow key={getRowKey(row)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={cn("px-4 py-3", column.className)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label={label}>
        {isLoading
          ? skeletons.slice(0, 3).map((index) => (
              <li key={index} className="space-y-3 rounded-3xl border bg-card p-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </li>
            ))
          : rows?.map((row) => (
              <li key={getRowKey(row)} className="space-y-3 rounded-3xl border bg-card p-4">
                {mobileTitle?.(row)}
                <dl className="space-y-2 text-sm">
                  {mobileColumns.map((column) => (
                    <div key={column.key} className="flex items-start justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">{column.header}</dt>
                      <dd className="min-w-0 text-right">{column.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
      </ul>
    </div>
  );
}
