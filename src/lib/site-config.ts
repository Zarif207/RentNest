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

/**
 * WhatsApp chat number in international format, digits only. This is a demo
 * project, so it defaults to the placeholder support line above (a fictional
 * 555 number); set NEXT_PUBLIC_WHATSAPP_NUMBER to point it at a real one.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || SITE_CONTACT.phone.href.replace(/\D/g, "");

/** A wa.me link that opens a chat with the message already typed. */
export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
