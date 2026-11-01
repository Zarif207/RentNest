import { z } from "zod";
import { US_STATES } from "@/lib/us-states";
import { LISTING_TYPES, PROPERTY_TYPES, type PropertyInput, type PropertyWithRelations } from "@/types";

const STATE_NAMES = US_STATES.map((state) => state.name) as [string, ...string[]];

const priceField = (label: string) =>
  z.number({ error: `Enter the ${label}` }).positive(`The ${label} must be greater than 0`).optional();

// Mirrors the backend's createPropertyValidationSchema; `division` holds the
// US state name. Only the price for the listing type is required (and sent).
export const propertySchema = z
  .object({
    listingType: z.enum(LISTING_TYPES),
    title: z.string().trim().min(1, "Title is required").max(120, "Keep the title under 120 characters"),
    description: z.string().trim().min(1, "Description is required"),
    propertyType: z.enum(PROPERTY_TYPES, { error: "Choose a property type" }),
    categoryId: z.uuid({ error: "Choose a category" }),
    address: z.string().trim().min(1, "Street address is required"),
    city: z.string().trim().min(1, "City is required"),
    division: z.enum(STATE_NAMES, { error: "Choose a state" }),
    rentAmount: priceField("monthly rent"),
    salePrice: priceField("asking price"),
    bedrooms: z.number({ error: "Enter the number of bedrooms" }).int("Use a whole number").min(0, "Can't be negative"),
    bathrooms: z.number({ error: "Enter the number of bathrooms" }).int("Use a whole number").min(0, "Can't be negative"),
    area: z.number({ error: "Enter the area" }).int("Use a whole number").positive("Area must be greater than 0"),
    amenities: z.array(z.string().min(1)).min(1, "Add at least one amenity"),
    images: z.array(z.url()).min(1, "Add at least one photo"),
    // Optional map pin; both or neither (the picker always sets them together).
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.listingType === "RENT" && values.rentAmount === undefined) {
      ctx.addIssue({ code: "custom", path: ["rentAmount"], message: "Enter the monthly rent" });
    }
    if (values.listingType === "SALE" && values.salePrice === undefined) {
      ctx.addIssue({ code: "custom", path: ["salePrice"], message: "Enter the asking price" });
    }
  });

export type PropertyValues = z.infer<typeof propertySchema>;

export const PROPERTY_FIELDS = Object.keys(propertySchema.shape) as (keyof PropertyValues)[];

/** Drops the price that doesn't apply to the listing type, so it's never sent. */
export function forListingType(values: PropertyValues): PropertyValues {
  return values.listingType === "SALE"
    ? { ...values, rentAmount: undefined }
    : { ...values, salePrice: undefined };
}

/** Form values for editing an existing listing. */
export function toPropertyValues(property: PropertyWithRelations): PropertyValues {
  return {
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    categoryId: property.categoryId ?? "",
    address: property.address,
    city: property.city,
    division: property.division,
    listingType: property.listingType,
    rentAmount: property.rentAmount === null ? undefined : Number(property.rentAmount),
    salePrice: property.salePrice === null ? undefined : Number(property.salePrice),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    amenities: property.amenities,
    images: property.images,
    latitude: property.latitude ?? undefined,
    longitude: property.longitude ?? undefined,
  };
}

/** Only the fields that differ from the original (edit sends a partial update). */
export function changedFields(initial: PropertyValues, values: PropertyValues): Partial<PropertyInput> {
  const changes: Record<string, unknown> = {};
  for (const key of PROPERTY_FIELDS) {
    if (JSON.stringify(initial[key]) !== JSON.stringify(values[key])) changes[key] = values[key];
  }
  // Switching type needs the new type's price, even if it was typed before.
  if ("listingType" in changes) {
    if (values.listingType === "SALE") changes.salePrice = values.salePrice;
    else changes.rentAmount = values.rentAmount;
  }
  // The backend takes a pin only as a pair.
  if ("latitude" in changes || "longitude" in changes) {
    changes.latitude = values.latitude;
    changes.longitude = values.longitude;
  }
  return changes as Partial<PropertyInput>;
}

// Mirrors the backend's review note rules (trimmed, 3–500 characters).
export const rejectListingSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, "Tell the landlord what to fix (at least 3 characters)")
    .max(500, "Keep the reason under 500 characters"),
});

export type RejectListingValues = z.infer<typeof rejectListingSchema>;
