import type { Metadata } from "next";
import { ProfileView } from "@/components/dashboard/profile-view";

export const metadata: Metadata = { title: "Profile" };

// The same profile page is shared by every role.
export default function ProfilePage() {
  return <ProfileView />;
}
