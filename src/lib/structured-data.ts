import { listingPrice } from "@/lib/listing";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { SITE_CONTACT } from "@/lib/site-config";
import { US_STATES } from "@/lib/us-states";
import type { AvailabilityStatus, PropertyType, PropertyWithRelations } from "@/types";

// schema.org JSON-LD builders. Every value comes from real data; optional
// fields are left out when the data doesn't have them.

const CONTEXT = "https://schema.org";

export function organizationLd() {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon/512"),
    description: SITE_DESCRIPTION,
    email: SITE_CONTACT.email,
    sameAs: [SITE_CONTACT.github],
  };
}

/** The site, with a search box Google can show: /properties?searchTerm=… */
export function websiteLd() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/properties")}?searchTerm={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Breadcrumbs from the home page down: [{ name, path }, …]. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// The building, by property type.
const RESIDENCE_TYPE: Record<PropertyType, string> = {
  APARTMENT: "Apartment",
  STUDIO: "Apartment",
  HOUSE: "SingleFamilyResidence",
  VILLA: "SingleFamilyResidence",
};

const AVAILABILITY: Record<AvailabilityStatus, string> = {
  AVAILABLE: `${CONTEXT}/InStock`,
  RENTED: `${CONTEXT}/SoldOut`,
  UNDER_CONTRACT: `${CONTEXT}/LimitedAvailability`,
  SOLD: `${CONTEXT}/SoldOut`,
};

const stateCode = (name: string) => US_STATES.find((state) => state.name === name)?.code ?? name;

/** A listing: the home itself, its address and location, and its rent or sale price as an Offer. */
export function listingLd(property: PropertyWithRelations) {
  const url = absoluteUrl(`/properties/${property.id}`);
  const price = listingPrice(property);
  const forSale = property.listingType === "SALE";

  return {
    "@context": CONTEXT,
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: property.title,
    description: property.description,
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    image: property.images,
    mainEntity: {
      "@type": RESIDENCE_TYPE[property.propertyType],
      name: property.title,
      numberOfRooms: property.bedrooms,
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "FTK" },
      amenityFeature: property.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
        value: true,
      })),
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        addressLocality: property.city,
        addressRegion: stateCode(property.division),
        addressCountry: "US",
      },
      ...(property.latitude !== null &&
        property.longitude !== null && {
          geo: { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude },
        }),
    },
    ...(price !== null && {
      offers: {
        "@type": "Offer",
        url,
        price: Number(price),
        priceCurrency: "USD",
        availability: AVAILABILITY[property.availabilityStatus],
        businessFunction: `http://purl.org/goodrelations/v1#${forSale ? "Sell" : "LeaseOut"}`,
        // Rent is per month.
        ...(!forSale && {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: Number(price),
            priceCurrency: "USD",
            unitCode: "MON",
          },
        }),
      },
    }),
  };
}
