import { format, isValid, parseISO } from "date-fns";

// Shown instead of "NaN", "Invalid Date" or "undefined" when a value is missing.
const PLACEHOLDER = "—";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats USD amounts. Accepts Prisma Decimal strings ("1200") or numbers. */
export function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(amount)) {
    return PLACEHOLDER;
  }
  return currencyFormatter.format(amount);
}

const numberFormatter = new Intl.NumberFormat("en-US");

/** "1450" → "1,450" */
export function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? PLACEHOLDER
    : numberFormatter.format(value);
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/** "Oct 21, 2026" */
export function formatDate(value: string | Date | null | undefined) {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy") : PLACEHOLDER;
}

/** "Oct 21, 2026, 3:36 PM" */
export function formatDateTime(value: string | Date | null | undefined) {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy, h:mm a") : PLACEHOLDER;
}

/** "Nadia Tenant" → "NT", "madonna" → "M" */
export function getInitials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Amenity tags to labels: "air-conditioning" → "Air conditioning", "wifi" → "Wi-Fi". */
export function formatAmenity(value: string) {
  if (value.toLowerCase() === "wifi") return "Wi-Fi";
  const label = value.toLowerCase().replaceAll(/[-_]/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Enum values to labels: "APARTMENT" → "Apartment", "IN_REVIEW" → "In review". */
export function formatEnumLabel(value: string | null | undefined) {
  if (!value) return PLACEHOLDER;
  const label = value.toLowerCase().replaceAll("_", " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
