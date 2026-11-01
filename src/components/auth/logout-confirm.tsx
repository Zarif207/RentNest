"use client";

import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLogout } from "@/hooks/use-auth";

/**
 * "Log out of RentNest?" for every logout button. `requestLogout` opens the
 * dialog; render `dialog` once next to the trigger. The automatic logout on
 * an expired session (AuthProvider) skips it and signs out directly.
 */
export function useLogoutConfirm() {
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  // Opened on the next tick, so a closing dropdown or sheet hands focus and
  // pointer events back before the dialog takes them.
  const requestLogout = useCallback(() => {
    setTimeout(() => setOpen(true), 0);
  }, []);

  const dialog = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Log out of RentNest?</AlertDialogTitle>
          <AlertDialogDescription>You&apos;ll need to sign in again to see your dashboard.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Radix focuses Cancel first, so Enter keeps the user signed in. */}
          <AlertDialogCancel>Stay signed in</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={logout}>
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { requestLogout, dialog };
}
