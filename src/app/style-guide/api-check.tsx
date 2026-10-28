import { isApiError } from "@/lib/api/client";
import { propertiesService } from "@/lib/api/properties";
import { formatCurrency, formatEnumLabel } from "@/lib/format";

async function loadProperties() {
  try {
    return { result: await propertiesService.getAll({ limit: 3 }) };
  } catch (error) {
    return {
      error: isApiError(error) ? `${error.status} ${error.message}` : "Unknown error",
    };
  }
}

// Temporary server-side smoke test for the API client (step 3).
export async function ApiCheck() {
  const { result, error } = await loadProperties();

  if (!result) {
    return <p className="text-sm text-destructive">API error: {error}</p>;
  }

  const { data, meta } = result;
  console.log("[api-check] GET /properties", {
    meta,
    titles: data.map((property) => property.title),
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        GET /properties returned {meta.total} properties (showing {data.length}).
      </p>
      <ul className="space-y-2">
        {data.map((property) => (
          <li key={property.id} className="rounded-2xl border p-4">
            <p className="font-medium">{property.title}</p>
            <p className="text-sm text-muted-foreground">
              {property.city} · {formatEnumLabel(property.propertyType)} ·{" "}
              <span className="font-bold text-foreground italic">
                {formatCurrency(property.rentAmount)}
              </span>{" "}
              /mo
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
