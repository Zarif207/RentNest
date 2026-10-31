// RentNest's public contact details, in one place. These are placeholders:
// edit them here and the contact page, footer and map all update.

export const SITE_CONTACT = {
  email: "support@rentnest.com",
  phone: { display: "+1 (212) 555-0100", href: "tel:+12125550100" },
  address: {
    street: "350 Fifth Avenue",
    city: "New York",
    state: "NY",
    zip: "10118",
  },
  hours: [
    { days: "Monday – Friday", time: "9:00 am – 6:00 pm ET" },
    { days: "Saturday", time: "10:00 am – 2:00 pm ET" },
    { days: "Sunday", time: "Closed" },
  ],
  github: "https://github.com/Zarif207/RentNest",
} as const;

export function formatAddress() {
  const { street, city, state, zip } = SITE_CONTACT.address;
  return `${street}, ${city}, ${state} ${zip}`;
}
