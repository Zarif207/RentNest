import { z } from "zod";
import { US_STATES } from "@/lib/us-states";
import { PROPERTY_TYPES, type PropertyInput, type PropertyWithRelations } from "@/types";

const STATE_NAMES = US_STATES.map((state) => state.name) as [string, ...string[]];

// Mirrors the backend's createPropertyValidationSchema; `division` holds the
// US state name.
export const propertySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Keep the title under 120 characters"),
  description: z.string().trim().min(1, "Description is required"),
  propertyType: z.enum(PROPERTY_TYPES, { error: "Choose a property type" }),
  categoryId: z.uuid({ error: "Choose a category" }),
  address: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  division: z.enum(STATE_NAMES, { error: "Choose a state" }),
  rentAmount: z.number({ error: "Enter the monthly rent" }).positive("Rent must be greater than 0"),
  bedrooms: z.number({ error: "Enter the number of bedrooms" }).int("Use a whole number").min(0, "Can't be negative"),
  bathrooms: z.number({ error: "Enter the number of bathrooms" }).int("Use a whole number").min(0, "Can't be negative"),
  area: z.number({ error: "Enter the area" }).int("Use a whole number").positive("Area must be greater than 0"),
  amenities: z.array(z.string().min(1)).min(1, "Add at least one amenity"),
  images: z.array(z.url()).min(1, "Add at least one photo"),
  // Optional map pin; both or neither (the picker always sets them together).
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type PropertyValues = z.infer<typeof propertySchema>;

export const PROPERTY_FIELDS = Object.keys(propertySchema.shape) as (keyof PropertyValues)[];

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
    rentAmount: Number(property.rentAmount),
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
  // The backend takes a pin only as a pair.
  if ("latitude" in changes || "longitude" in changes) {
    changes.latitude = values.latitude;
    changes.longitude = values.longitude;
  }
  return changes as Partial<PropertyInput>;
}
