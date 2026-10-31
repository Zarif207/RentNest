import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApprovalGate } from "@/components/landlord/approval";
import { PropertyForm } from "@/components/landlord/property-form";

export const metadata: Metadata = { title: "Add property" };

export default function NewPropertyPage() {
  return (
    <ApprovalGate>
      <div className="space-y-6">
        <PageHeader
          title="Add a property"
          description="Fill in the details renters care about. You can edit everything later."
        />
        <PropertyForm />
      </div>
    </ApprovalGate>
  );
}
