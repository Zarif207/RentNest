"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/user-badges";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { getErrorMessage, isApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { applyServerErrors } from "@/lib/forms";
import { profileChanges, profileSchema, toProfileValues, type ProfileValues } from "@/schemas/profile";
import type { User } from "@/types";

function ProfileForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileValues(user),
  });
  const { errors, isDirty } = form.formState;

  const onSubmit = (values: ProfileValues) => {
    // The API can change a phone number but not remove it.
    if (user.phone && !values.phone) {
      form.setError("phone", { type: "manual", message: "A saved phone can be changed, not removed" });
      return;
    }

    const changes = profileChanges(user, values);
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateProfile.mutate(changes, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError, ["name", "email", "phone"])) return;
        if (isApiError(error) && error.status === 409) {
          form.setError("email", { type: "server", message: error.message }, { shouldFocus: true });
          return;
        }
        form.setError("root.server", { type: "server", message: getErrorMessage(error) });
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6 rounded-3xl border border-border bg-card p-5 sm:p-8">
      <div>
        <h2 className="text-lg font-medium tracking-tight">Personal details</h2>
        <p className="text-sm text-muted-foreground">Landlords and tenants see your name and contact details on requests.</p>
      </div>

      <FormAlert message={errors.root?.server?.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="profile-name" error={errors.name}>
          <Input id="profile-name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...form.register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="profile-email" error={errors.email}>
          <Input id="profile-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...form.register("email")} />
        </FormField>
        <FormField
          label="Phone"
          htmlFor="profile-phone"
          error={errors.phone}
          description="Digits only, with an optional + country code."
        >
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+12125550101"
            aria-invalid={Boolean(errors.phone)}
            {...form.register("phone")}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" disabled={!isDirty || updateProfile.isPending} onClick={() => form.reset()}>
          Discard
        </Button>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

/** Shared /dashboard/<role>/profile page. */
export function ProfileView() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account details on RentNest." />

      {!user ? (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]" aria-busy="true">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr] lg:items-start">
          <section className="flex flex-col gap-8 rounded-3xl bg-[#12100e] p-6 text-white sm:p-8">
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <UserAvatar name={user.name} className="size-20" fallbackClassName="bg-gold text-2xl text-gold-foreground" />
              <div className="min-w-0 space-y-2">
                <p className="truncate text-2xl font-medium tracking-tight">{user.name}</p>
                <p className="truncate text-sm text-white/60">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <UserStatusBadge status={user.userStatus} />
                </div>
              </div>
            </div>
            <dl className="grid gap-3 border-t border-white/15 pt-6 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-white/60">
                  <CalendarDays className="size-4" aria-hidden /> Member since
                </dt>
                <dd className="font-medium">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-white/60">
                  <ShieldCheck className="size-4" aria-hidden /> Account
                </dt>
                <dd className="font-medium">{user.userStatus === "ACTIVE" ? "In good standing" : "Banned"}</dd>
              </div>
            </dl>
          </section>

          {/* key: start from the saved values again after each successful save */}
          <ProfileForm key={user.updatedAt} user={user} />
        </div>
      )}
    </div>
  );
}
