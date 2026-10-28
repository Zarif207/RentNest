"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 rounded-3xl border bg-card p-5 sm:p-6 lg:grid-cols-[14rem_1fr]">
      <div className="space-y-1">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
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
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FormAlert message={errors.root?.server?.message} />

      <Section title="Basic info" description="What renters see first in search results.">
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

      <Section title="Location" description="Listings are US-only. Renters filter by city and state.">
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

      <Section title="Details" description="Monthly rent in US dollars and the size of the home.">
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

      <Section title="Amenities" description="Press Enter or comma to add. Pick from the suggestions to save typing.">
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

      <Section title="Photos" description="Up to 8 photos. The first one is the cover in search results.">
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

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t bg-background/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border">
        <Button asChild variant="outline" disabled={isPending}>
          <Link href={LANDLORD_PROPERTIES_PATH}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
        </Button>
      </div>
    </form>
  );
}
