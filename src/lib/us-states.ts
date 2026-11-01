// The backend's `division` field holds the full US state name ("Texas").

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

const CODE_BY_NAME = new Map<string, string>(
  US_STATES.map(({ code, name }) => [name.toLowerCase(), code]),
);

/** "New York" → "new-york" (state landing page URLs). */
export function stateSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

/** "new-york" → "New York"; null when the slug isn't a US state. */
export function stateFromSlug(slug: string) {
  return US_STATES.find((state) => stateSlug(state.name) === slug.toLowerCase())?.name ?? null;
}

/** "texas" or "TX" → "Texas"; null when the text isn't a US state. */
export function matchUsState(text: string) {
  const key = text.trim().toLowerCase();
  return US_STATES.find((state) => state.name.toLowerCase() === key || state.code.toLowerCase() === key)?.name ?? null;
}

/** "Austin", "Texas" → "Austin, TX" (falls back to the stored value). */
export function formatLocation(city: string, division: string) {
  const state = CODE_BY_NAME.get(division.trim().toLowerCase()) ?? division;
  return [city, state].filter(Boolean).join(", ");
}

/**
 * The state a stored `division` names, whatever its form ("Florida",
 * "FL", "Florida, FL"); null when none of it is a US state.
 */
export function normalizeUsState(division: string) {
  return matchUsState(division) ?? division.split(",").map(matchUsState).find(Boolean) ?? null;
}
