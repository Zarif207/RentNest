import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersView } from "@/components/admin/users-view";
import Loading from "../../loading";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  // The view reads its filters from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={<Loading />}>
      <UsersView />
    </Suspense>
  );
}
