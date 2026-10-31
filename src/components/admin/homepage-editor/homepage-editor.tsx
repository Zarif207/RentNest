"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, House, ImagePlus, Loader2, Plus, Trash2, TriangleAlert } from "lucide-react";
import { BentoCard } from "@/components/dashboard/bento";
import { PageHeader } from "@/components/dashboard/page-header";
import { QueryError } from "@/components/dashboard/query-error";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAdminProperties } from "@/hooks/use-admin";
import { useHomepageConfig, usePropertyStates, useSaveHomepageConfig } from "@/hooks/use-site-settings";
import { formatCurrency, formatDateTime, formatEnumLabel } from "@/lib/format";
import { formatLocation } from "@/lib/us-states";
import { cn } from "@/lib/utils";
import {
  HOMEPAGE_SECTIONS,
  PROPERTY_TYPES,
  type HomepageConfig,
  type HomepageConfigResponse,
  type HomepageSection,
  type PropertyType,
  type PropertyWithRelations,
} from "@/types";
import { PropertyPickerDialog } from "./property-picker-dialog";
import { SortableList } from "./sortable-list";

const LIMITS = { hero: 7, featured: 12, states: 8, latestMin: 4, latestMax: 16 };

const SECTION_LABELS: Record<HomepageSection, string> = {
  statement: "Statement",
  stats: "Live stats",
  featured: "Featured collection",
  states: "Explore by state",
  propertyTypes: "Property types",
  latest: "Latest listings",
  howItWorks: "How it works",
  whyUs: "Why RentNest",
  reviews: "Reviews",
  faq: "FAQ",
};

type SectionRow = { id: HomepageSection; visible: boolean };

/** Visible sections in their saved order, then the hidden ones. */
function toSectionRows(order: HomepageSection[]): SectionRow[] {
  return [
    ...order.map((id) => ({ id, visible: true })),
    ...HOMEPAGE_SECTIONS.filter((id) => !order.includes(id)).map((id) => ({ id, visible: false })),
  ];
}

/** Every type always appears in the editor, keeping any saved image. */
function withAllTypes(items: HomepageConfig["propertyTypes"]["items"]) {
  return PROPERTY_TYPES.map((type) => items.find((item) => item.type === type) ?? { type });
}

/** Same shape the backend stores, so "dirty" compares like for like. */
function normalize(config: HomepageConfig): HomepageConfig {
  const title = config.featured.title?.trim();
  return {
    ...config,
    featured: { ...config.featured, title: title ? title : undefined },
    propertyTypes: {
      ...config.propertyTypes,
      items: config.propertyTypes.items.map((item) => (item.imageUrl ? item : { type: item.type })),
    },
  };
}

function Thumb({ src, className }: { src?: string | null; className?: string }) {
  return (
    <span className={cn("relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted", className)}>
      {src ? (
        <Image src={src} alt="" fill sizes="64px" className="object-cover" />
      ) : (
        <House className="size-5 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}

/** A panel with an optional "show this section" switch in its header. */
function Panel({
  title,
  description,
  enabled,
  onEnabledChange,
  className,
  children,
}: {
  title: string;
  description: string;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <BentoCard
      title={title}
      action={
        onEnabledChange ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {enabled ? "Shown" : "Hidden"}
            <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label={`Show ${title}`} />
          </label>
        ) : undefined
      }
      className={className}
    >
      <p className="-mt-2 text-sm text-muted-foreground">{description}</p>
      <div className={cn("space-y-4", enabled === false && "pointer-events-none opacity-50")} inert={enabled === false}>
        {children}
      </div>
    </BentoCard>
  );
}

/** Picked properties as a reorderable list, with a picker to add or change them. */
function PropertyListField({
  label,
  ids,
  max,
  lookup,
  onChange,
}: {
  label: string;
  ids: string[];
  max: number;
  lookup: Map<string, PropertyWithRelations>;
  onChange: (ids: string[]) => void;
}) {
  const [picking, setPicking] = useState(false);

  return (
    <>
      {ids.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No properties picked yet.
        </p>
      ) : (
        <SortableList
          items={ids}
          getId={(id) => id}
          getLabel={(id) => `Move ${lookup.get(id)?.title ?? "property"}`}
          onReorder={onChange}
          renderItem={(id, index) => {
            const property = lookup.get(id);
            return (
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                <Thumb src={property?.images[0]} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{property?.title ?? "Listing no longer available"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {property
                      ? `${formatLocation(property.city, property.division)} · ${formatCurrency(property.rentAmount)}/mo`
                      : "It won't show on the homepage. Remove it or pick another."}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${property?.title ?? "property"}`}
                  onClick={() => onChange(ids.filter((item) => item !== id))}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          }}
        />
      )}
      <Button variant="outline" onClick={() => setPicking(true)}>
        <Plus data-icon="inline-start" /> {ids.length > 0 ? "Change properties" : "Pick properties"}
        <span className="text-muted-foreground">
          ({ids.length}/{max})
        </span>
      </Button>
      <PropertyPickerDialog
        open={picking}
        onOpenChange={setPicking}
        title={label}
        selected={ids}
        max={max}
        onConfirm={onChange}
      />
    </>
  );
}

/** One image field in a dialog (the full uploader is too big to repeat per row). */
function ImageDialog({
  open,
  onOpenChange,
  title,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value?: string;
  onSave: (url: string | undefined) => void;
}) {
  const [urls, setUrls] = useState<string[]>(value ? [value] : []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Upload a photo or paste an image link. Landscape photos work best.</DialogDescription>
        </DialogHeader>
        <ImageUploader value={urls} onChange={(next) => setUrls(next.slice(-1))} max={1} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(urls[0]);
              onOpenChange(false);
            }}
          >
            Use image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditorForm({ initial }: { initial: HomepageConfigResponse }) {
  const save = useSaveHomepageConfig();
  const properties = useAdminProperties({ limit: 100 });
  const states = usePropertyStates();
  const [saved, setSaved] = useState(() => normalize(initial.config));
  const [draft, setDraft] = useState<HomepageConfig>(() => ({
    ...initial.config,
    propertyTypes: { ...initial.config.propertyTypes, items: withAllTypes(initial.config.propertyTypes.items) },
  }));
  const [sections, setSections] = useState(() => toSectionRows(initial.config.sectionOrder));
  const [stateToAdd, setStateToAdd] = useState("");
  const [imageFor, setImageFor] = useState<{ kind: "state"; state: string } | { kind: "type"; type: PropertyType } | null>(null);

  const lookup = useMemo(
    () => new Map((properties.data?.data ?? []).map((property) => [property.id, property])),
    [properties.data],
  );
  const stateCounts = useMemo(
    () => new Map((states.data ?? []).map((state) => [state.state, state.availableCount])),
    [states.data],
  );

  const current = normalize({ ...draft, sectionOrder: sections.filter((row) => row.visible).map((row) => row.id) });
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  const missingImages = draft.states.items.filter((item) => !item.imageUrl).map((item) => item.state);
  const problems = [
    ...(missingImages.length > 0 ? [`Add an image for ${missingImages.join(", ")}.`] : []),
    ...(sections.every((row) => !row.visible) ? ["Show at least one section."] : []),
  ];

  // Warn before leaving with unsaved changes: closing/reloading the tab, and in-app links.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      const href = link.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href === window.location.pathname) return;
      if (!window.confirm("You have unsaved homepage changes. Leave without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const update = (patch: Partial<HomepageConfig>) => setDraft((value) => ({ ...value, ...patch }));

  const discard = () => {
    setDraft({ ...saved, propertyTypes: { ...saved.propertyTypes, items: withAllTypes(saved.propertyTypes.items) } });
    setSections(toSectionRows(saved.sectionOrder));
  };

  const onSave = () =>
    save.mutate(current, {
      onSuccess: (response) => setSaved(normalize(response.config)),
    });

  const availableStates = (states.data ?? []).filter(
    (state) => !draft.states.items.some((item) => item.state === state.state),
  );

  const imageDialogValue =
    imageFor?.kind === "state"
      ? draft.states.items.find((item) => item.state === imageFor.state)?.imageUrl
      : imageFor?.kind === "type"
        ? draft.propertyTypes.items.find((item) => item.type === imageFor.type)?.imageUrl
        : undefined;

  const saveImage = (url: string | undefined) => {
    if (!imageFor) return;
    if (imageFor.kind === "state") {
      update({
        states: {
          ...draft.states,
          items: draft.states.items.map((item) => (item.state === imageFor.state ? { ...item, imageUrl: url ?? "" } : item)),
        },
      });
    } else {
      update({
        propertyTypes: {
          ...draft.propertyTypes,
          items: draft.propertyTypes.items.map((item) =>
            item.type === imageFor.type ? { type: item.type, ...(url ? { imageUrl: url } : {}) } : item,
          ),
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage"
        description={
          initial.isDefault && !dirty
            ? "Showing the default homepage. Pick what visitors see, then save."
            : `Choose what the homepage shows. Last saved ${initial.updatedAt ? formatDateTime(initial.updatedAt) : "just now"}.`
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/" target="_blank" rel="noreferrer">
              View homepage <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      {/* Two independent columns, so short panels don't stretch to their neighbour. */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <Panel
            title="Hero mosaic"
            description="Up to 7 photos make up the house shape on the hero, biggest piece first: the roof, then the walls, then the smaller pieces. Empty pieces show glass."
          >
            <PropertyListField
              label="Hero homes"
              ids={draft.hero.propertyIds}
              max={LIMITS.hero}
              lookup={lookup}
              onChange={(propertyIds) => update({ hero: { propertyIds } })}
            />
          </Panel>

          <Panel
            title="States"
            description="Tall tiles for “Explore by state”, each with its own photo. Counts and prices are live."
            enabled={draft.states.enabled}
            onEnabledChange={(enabled) => update({ states: { ...draft.states, enabled } })}
          >
            {draft.states.items.length > 0 && (
              <SortableList
                items={draft.states.items}
                getId={(item) => item.state}
                getLabel={(item) => `Move ${item.state}`}
                onReorder={(items) => update({ states: { ...draft.states, items } })}
                renderItem={(item) => (
                  <div className="flex items-center gap-3">
                    <Thumb src={item.imageUrl || null} className={cn(!item.imageUrl && "ring-2 ring-destructive/60")} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.state}</p>
                      <p className={cn("truncate text-xs", item.imageUrl ? "text-muted-foreground" : "text-destructive")}>
                        {item.imageUrl
                          ? `${stateCounts.get(item.state) ?? 0} available now`
                          : "Needs an image before saving"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setImageFor({ kind: "state", state: item.state })}>
                      <ImagePlus data-icon="inline-start" /> Image
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${item.state}`}
                      onClick={() =>
                        update({ states: { ...draft.states, items: draft.states.items.filter((other) => other.state !== item.state) } })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              />
            )}
            <div className="flex gap-2">
              <Select value={stateToAdd} onValueChange={setStateToAdd} disabled={draft.states.items.length >= LIMITS.states}>
                <SelectTrigger aria-label="State to add" className="flex-1">
                  <SelectValue
                    placeholder={draft.states.items.length >= LIMITS.states ? `Up to ${LIMITS.states} states` : "Add a state…"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((state) => (
                    <SelectItem key={state.state} value={state.state}>
                      {state.state} · {state.propertyCount} {state.propertyCount === 1 ? "home" : "homes"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!stateToAdd || draft.states.items.length >= LIMITS.states}
                onClick={() => {
                  update({ states: { ...draft.states, items: [...draft.states.items, { state: stateToAdd, imageUrl: "" }] } });
                  setImageFor({ kind: "state", state: stateToAdd });
                  setStateToAdd("");
                }}
              >
                <Plus data-icon="inline-start" /> Add
              </Button>
            </div>
          </Panel>

          <Panel
            title="Latest listings"
            description="The newest homes in a moving strip."
            enabled={draft.latest.enabled}
            onEnabledChange={(enabled) => update({ latest: { ...draft.latest, enabled } })}
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[draft.latest.count]}
                min={LIMITS.latestMin}
                max={LIMITS.latestMax}
                step={1}
                onValueChange={([count]) => update({ latest: { ...draft.latest, count } })}
                aria-label="Number of latest listings"
                className="flex-1"
              />
              <span className="w-24 text-right text-sm font-medium tabular-nums">{draft.latest.count} homes</span>
            </div>
          </Panel>

        </div>
        <div className="min-w-0 space-y-4">
          <Panel
            title="Featured collection"
            description="The pinned horizontal gallery. Drag to reorder."
            enabled={draft.featured.enabled}
            onEnabledChange={(enabled) => update({ featured: { ...draft.featured, enabled } })}
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">
                Title <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <Input
                value={draft.featured.title ?? ""}
                maxLength={80}
                placeholder="Homes worth the move"
                onChange={(event) => update({ featured: { ...draft.featured, title: event.target.value } })}
              />
            </label>
            <PropertyListField
              label="Featured collection"
              ids={draft.featured.propertyIds}
              max={LIMITS.featured}
              lookup={lookup}
              onChange={(propertyIds) => update({ featured: { ...draft.featured, propertyIds } })}
            />
          </Panel>

          <Panel
            title="Property types"
            description="One tile per type. Without an image, a photo of a listing of that type is used."
            enabled={draft.propertyTypes.enabled}
            onEnabledChange={(enabled) => update({ propertyTypes: { ...draft.propertyTypes, enabled } })}
          >
            <ul className="grid gap-2 sm:grid-cols-2">
              {draft.propertyTypes.items.map((item) => (
                <li key={item.type} className="flex items-center gap-3 rounded-2xl border border-border p-2">
                  <Thumb src={item.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{formatEnumLabel(item.type)}</p>
                    <p className="text-xs text-muted-foreground">{item.imageUrl ? "Custom image" : "Listing photo"}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label={`Change ${formatEnumLabel(item.type)} image`} onClick={() => setImageFor({ kind: "type", type: item.type })}>
                    <ImagePlus />
                  </Button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Section order" description="Drag to reorder. Hidden sections stay in the list but don't show.">
            <SortableList
              items={sections}
              getId={(row) => row.id}
              getLabel={(row) => `Move ${SECTION_LABELS[row.id]}`}
              onReorder={setSections}
              renderItem={(row) => (
                <label className="flex items-center justify-between gap-3 pr-2">
                  <span className={cn("text-sm font-medium", !row.visible && "text-muted-foreground line-through")}>
                    {SECTION_LABELS[row.id]}
                  </span>
                  <Switch
                    checked={row.visible}
                    onCheckedChange={(visible) =>
                      setSections((rows) => rows.map((other) => (other.id === row.id ? { ...other, visible } : other)))
                    }
                    aria-label={`Show ${SECTION_LABELS[row.id]}`}
                  />
                </label>
              )}
            />
          </Panel>
        </div>
      </div>

      {/* Sticky save bar (above the mobile tab bar). */}
      <div className="sticky bottom-24 z-20 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card/90 py-2 pr-2 pl-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:rounded-full md:bottom-4">
        <p className={cn("flex items-center gap-2 text-sm", problems.length > 0 ? "text-destructive" : "text-muted-foreground")}>
          {problems.length > 0 && <TriangleAlert className="size-4 shrink-0" aria-hidden />}
          {problems.length > 0 ? problems.join(" ") : dirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" disabled={!dirty || save.isPending} onClick={discard}>
            Discard
          </Button>
          <Button disabled={!dirty || problems.length > 0 || save.isPending} onClick={onSave}>
            {save.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Keyed per target so it opens with that state's/type's current image. */}
      <ImageDialog
        key={imageFor ? (imageFor.kind === "state" ? imageFor.state : imageFor.type) : "none"}
        open={imageFor !== null}
        onOpenChange={(open) => !open && setImageFor(null)}
        title={
          imageFor?.kind === "state"
            ? `Image for ${imageFor.state}`
            : imageFor?.kind === "type"
              ? `Image for ${formatEnumLabel(imageFor.type)}`
              : "Image"
        }
        value={imageDialogValue || undefined}
        onSave={saveImage}
      />
    </div>
  );
}

/** /dashboard/admin/homepage: the admin's editor for what the homepage shows. */
export function HomepageEditor() {
  const config = useHomepageConfig();

  if (config.isError) return <QueryError error={config.error} onRetry={() => void config.refetch()} />;
  if (config.isPending) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }
  // Re-key on save time so the form restarts from the server's copy if it changes.
  return <EditorForm key={config.data.updatedAt ?? "default"} initial={config.data} />;
}
