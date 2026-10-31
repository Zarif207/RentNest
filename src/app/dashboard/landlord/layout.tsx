import { LandlordStatusBanner } from "@/components/landlord/approval";

export default function LandlordLayout({ children }: LayoutProps<"/dashboard/landlord">) {
  return (
    <>
      <LandlordStatusBanner />
      {children}
    </>
  );
}
