"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";
import { usersService } from "@/lib/api/users";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/auth-store";

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.updateMe,
    onSuccess: (user) => {
      // The header, sidebar and avatar menu read this, so they update at once.
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
