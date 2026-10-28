import { PropertyGrid } from "@/components/properties/property-grid";
import { getErrorMessage } from "@/lib/api/client";
import { propertiesService } from "@/lib/api/properties";

async function loadProperties() {
  try {
    return { properties: (await propertiesService.getAll({ limit: 6 })).data };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

// Temporary: renders real seeded properties with the shared card (step 8).
export async function PropertyPreview() {
  const { properties, error } = await loadProperties();

  if (!properties) {
    return <p className="text-sm text-destructive">API error: {error}</p>;
  }

  return <PropertyGrid properties={properties} />;
}
