import type { Metadata } from "next";
import { HomepageEditor } from "@/components/admin/homepage-editor/homepage-editor";

export const metadata: Metadata = { title: "Homepage" };

export default function AdminHomepagePage() {
  return <HomepageEditor />;
}
