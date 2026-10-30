"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { ImageUploader } from "@/components/shared/image-uploader";
import { TagInput } from "@/components/shared/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import {
  LANDLORD_PROPERTIES_PATH,
  useCreateProperty,
  useUpdateProperty,
} from "@/hooks/use-landlord-properties";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { formatAmenity, formatEnumLabel } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { COMMON_AMENITIES } from "@/lib/property-filters";
import { US_STATES } from "@/lib/us-states";
import {
  changedFields,
  PROPERTY_FIELDS,
  propertySchema,
  toPropertyValues,
  type PropertyValues,
} from "@/schemas/property";
import { PROPERTY_TYPES, type PropertyWithRelations } from "@/types";

const normalizeAmenity = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, "-");

type StepId = "basic" | "location" | "details" | "amenities" | "photos";

const STEPS: { id: StepId; title: string; fields: (keyof PropertyValues)[] }[] = [
  { id: "basic", title: "Basic info", fields: ["title", "description", "propertyType", "categoryId"] },
  { id: "location", title: "Location", fields: ["address", "city", "division"] },
  { id: "details", title: "Details", fields: ["rentAmount", "bedrooms", "bathrooms", "area"] },
  { id: "amenities", title: "Amenities", fields: ["amenities"] },
  { id: "photos", title: "Photos", fields: ["images"] },
];

/** A step is done when all its fields have a value and none shows an error. */
function stepDone(step: (typeof STEPS)[number], values: Partial<PropertyValues>, errors: FieldErrors<PropertyValues>) {
  return step.fields.every((field) => {
    const value = values[field];
    const filled = Array.isArray(value)
      ? value.length > 0
      : typeof value === "number"
        ? Number.isFinite(value)
        : Boolean(value && String(value).trim());
    return filled && !errors[field];
  });
}

function Section({
  id,
  index,
  title,
  description,
  children,
}: {
  id: StepId;
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`step-${id}`} className="scroll-mt-28 space-y-6 rounded-3xl border border-border bg-card p-5 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="font-serif text-4xl leading-none text-bronze">{String(index + 1).padStart(2, "0")}</span>
        <div className="space-y-1">
          <h2 className="text-xl font-medium tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

/** Create (no `property`) or edit (with `property`) a listing. */
export function PropertyForm({ property }: { property?: PropertyWithRelations }) {
  const router = useRouter();
  const categories = useCategories();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const isEdit = Boolean(property);
  const initial = property ? toPropertyValues(property) : undefined;

  const form = useForm<PropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initial ?? {
      title: "",
      description: "",
      categoryId: "",
      address: "",
      city: "",
      amenities: [],
      images: [],
    },
  });
  const { errors } = form.formState;
  const isPending = createProperty.isPending || updateProperty.isPending;
  const values = useWatch({ control: form.control }) as Partial<PropertyValues>;
  const done = STEPS.map((step) => stepDone(step, values, errors));
  const doneCount = done.filter(Boolean).length;

  const handleError = (error: unknown) => {
    if (applyServerErrors(error, form.setError, PROPERTY_FIELDS)) return;
    if (isApiError(error) && error.message === "Category not found") {
      form.setError("categoryId", { type: "server", message: "That category no longer exists" });
      return;
    }
    form.setError("root.server", { type: "server", message: getErrorMessage(error) });
  };

  const onSubmit = (values: PropertyValues) => {
    const done = { onSuccess: () => router.push(LANDLORD_PROPERTIES_PATH), onError: handleError };

    if (!property || !initial) {
      createProperty.mutate(values, done);
      return;
    }

    const changes = changedFields(initial, values);
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateProperty.mutate({ id: property.id, input: changes }, done);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-[15rem_1fr] lg:items-start">
      {/* Stepper: jump to a section; checks fill in as sections are completed. */}
      <nav aria-label="Form sections" className="rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-28">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground tabular-nums">
            {doneCount}/{STEPS.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/8">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500"
            style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
          />
        </div>
        <ol className="mt-5 hidden space-y-1 lg:block">
          {STEPS.map((step, index) => (
            <li key={step.id}>
              <a
                href={`#step-${step.id}`}
                className="flex items-center gap-3 rounded-2xl px-2 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-medium transition-colors",
                    done[index] ? "border-transparent bg-foreground text-background" : "border-border text-muted-foreground",
                  )}
                >
                  {done[index] ? <Check className="size-3.5" aria-hidden /> : index + 1}
                </span>
                <span className={done[index] ? "font-medium" : "text-muted-foreground"}>{step.title}</span>
                <span className="sr-only">{done[index] ? "(complete)" : "(incomplete)"}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-w-0 space-y-4">
        <FormAlert message={errors.root?.server?.message} />

        <Section id="basic" index={0} title="Basic info" description="What renters see first in search results.">
          <FormField label="Title" htmlFor="title" error={errors.title}>
            <Input id="title" placeholder="Sunny 2-bed apartment near Central Park" aria-invalid={Boolean(errors.title)} {...form.register("title")} />
          </FormField>
          <FormField label="Description" htmlFor="description" error={errors.description}>
            <Textarea
              id="description"
              rows={5}
              placeholder="Light, layout, neighborhood, what's included…"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Property type" htmlFor="propertyType" error={errors.propertyType}>
              <Controller
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="propertyType" className="w-full" aria-invalid={Boolean(errors.propertyType)}>
                      <SelectValue placeholder="Choose a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatEnumLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Category" htmlFor="categoryId" error={errors.categoryId}>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange} disabled={categories.isPending}>
                    <SelectTrigger id="categoryId" className="w-full" aria-invalid={Boolean(errors.categoryId)}>
                      <SelectValue placeholder={categories.isError ? "Couldn't load categories" : "Choose a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.data?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
        </Section>

        <Section id="location" index={1} title="Location" description="Listings are US-only. Renters filter by city and state.">
          <FormField label="Street address" htmlFor="address" error={errors.address}>
            <Input id="address" placeholder="245 W 52nd St" autoComplete="street-address" aria-invalid={Boolean(errors.address)} {...form.register("address")} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="City" htmlFor="city" error={errors.city}>
              <Input id="city" placeholder="New York" autoComplete="address-level2" aria-invalid={Boolean(errors.city)} {...form.register("city")} />
            </FormField>
            <FormField label="State" htmlFor="division" error={errors.division}>
              <Controller
                control={form.control}
                name="division"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="division" className="w-full" aria-invalid={Boolean(errors.division)}>
                      <SelectValue placeholder="Choose a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
        </Section>

        <Section id="details" index={2} title="Details" description="Monthly rent in US dollars and the size of the home.">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <FormField label="Monthly rent ($)" htmlFor="rentAmount" error={errors.rentAmount}>
              <Input id="rentAmount" type="number" inputMode="decimal" min={1} step="any" placeholder="2400" aria-invalid={Boolean(errors.rentAmount)} {...form.register("rentAmount", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Bedrooms" htmlFor="bedrooms" error={errors.bedrooms}>
              <Input id="bedrooms" type="number" inputMode="numeric" min={0} step={1} placeholder="2" aria-invalid={Boolean(errors.bedrooms)} {...form.register("bedrooms", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Bathrooms" htmlFor="bathrooms" error={errors.bathrooms}>
              <Input id="bathrooms" type="number" inputMode="numeric" min={0} step={1} placeholder="1" aria-invalid={Boolean(errors.bathrooms)} {...form.register("bathrooms", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Area (sq ft)" htmlFor="area" error={errors.area}>
              <Input id="area" type="number" inputMode="numeric" min={1} step={1} placeholder="950" aria-invalid={Boolean(errors.area)} {...form.register("area", { valueAsNumber: true })} />
            </FormField>
          </div>
        </Section>

        <Section id="amenities" index={3} title="Amenities" description="Press Enter or comma to add. Pick from the suggestions to save typing.">
          <FormField label="Amenities" htmlFor="amenities" error={errors.amenities}>
            <Controller
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <TagInput
                  id="amenities"
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={COMMON_AMENITIES}
                  normalize={normalizeAmenity}
                  format={formatAmenity}
                  placeholder="e.g. wifi, parking, balcony"
                  invalid={Boolean(errors.amenities)}
                />
              )}
            />
          </FormField>
        </Section>

        <Section id="photos" index={4} title="Photos" description="Up to 8 photos. The first one is the cover in search results.">
          <FormField label="Photos" htmlFor="images" error={errors.images}>
            <Controller
              control={form.control}
              name="images"
              render={({ field }) => (
                <ImageUploader id="images" value={field.value} onChange={field.onChange} invalid={Boolean(errors.images)} />
              )}
            />
          </FormField>
        </Section>

        {/* Sticky save bar (sits above the mobile tab bar). */}
        <div className="sticky bottom-24 z-20 flex items-center justify-between gap-3 rounded-full border border-border bg-card/85 py-2 pr-2 pl-5 shadow-2xl shadow-black/10 backdrop-blur-xl md:bottom-4">
          <p className="hidden text-sm text-muted-foreground sm:block">
            {doneCount === STEPS.length ? "All sections complete" : `${doneCount} of ${STEPS.length} sections complete`}
          </p>
          <div className="ml-auto flex gap-2">
            <Button asChild variant="outline" disabled={isPending}>
              <Link href={LANDLORD_PROPERTIES_PATH}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" aria-hidden />}
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
