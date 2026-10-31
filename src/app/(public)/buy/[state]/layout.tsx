import { notFound } from "next/navigation";
import { stateFromSlug } from "@/lib/us-states";

// The proxy already 404s unknown states; this keeps the route safe on its own.
export default async function BuyStateLayout({ children, params }: LayoutProps<"/buy/[state]">) {
  if (!stateFromSlug((await params).state)) notFound();
  return children;
}
