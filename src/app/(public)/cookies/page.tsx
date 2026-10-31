import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookies",
  description:
    "The cookies and browser storage RentNest uses, and how to change your choice.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      updated="October 31, 2026"
      sections={[
        {
          heading: "rn_token (essential)",
          body: "Keeps you signed in. It holds your session token, expires when the session does, and is removed when you log out. RentNest can't work without it, so it's always on.",
        },
        {
          heading: "rn_consent (essential)",
          body: "Remembers your cookie choice (analytics and marketing on or off, and when you chose) for six months, so we don't ask on every visit.",
        },
        {
          heading: "Theme and display preferences",
          body: "Your light or dark theme, whether you've seen the intro animation and whether you closed the chat greeting are kept in your browser's storage, not in cookies. They never leave your device.",
        },
        {
          heading: "Analytics and marketing",
          body: "RentNest doesn't load any analytics or marketing scripts today. If it ever does, they will only run if you've allowed that category.",
        },
        {
          heading: "Changing your choice",
          body: "Use \"Cookie settings\" at the bottom of any page to turn optional cookies on or off. Clearing your browser's cookies also resets it, and we'll ask again.",
        },
      ]}
    />
  );
}
