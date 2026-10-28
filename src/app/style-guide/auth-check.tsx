"use client";

import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth, useLogin, useLogout } from "@/hooks/use-auth";
import { authService } from "@/lib/api/auth";
import { TOKEN_COOKIE } from "@/lib/api/client";
import { roleHome } from "@/lib/auth";
import { formatEnumLabel } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";

// Seeded demo accounts (backend prisma/seed.ts).
const DEMO_PASSWORD = "Password@123";

// Temporary session test panel (step 4); removed with the style guide.
export function AuthCheck() {
  const { user, status } = useAuth();
  const login = useLogin();
  const logout = useLogout();

  // Swaps in a token the backend rejects, then makes an authenticated call.
  const simulateExpiredSession = () => {
    Cookies.set(TOKEN_COOKIE, "invalid-token", { path: "/" });
    useAuthStore.setState({ token: "invalid-token" });
    void authService.getMe().catch(() => undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Status:</span>
        <Badge variant="outline">{status}</Badge>
        {user && (
          <>
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground">{user.email}</span>
            <Badge>{formatEnumLabel(user.role)}</Badge>
            <span className="text-muted-foreground">→ {roleHome(user.role)}</span>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {["tenant1", "landlord1"].map((account) => (
          <Button
            key={account}
            variant="outline"
            size="sm"
            disabled={login.isPending}
            onClick={() =>
              login.mutate({ email: `${account}@rentnest.com`, password: DEMO_PASSWORD })
            }
          >
            Log in as {account}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            login.mutate({ email: "tenant1@rentnest.com", password: "wrong-password" })
          }
        >
          Wrong password
        </Button>
        <Button variant="outline" size="sm" disabled={!user} onClick={simulateExpiredSession}>
          Simulate expired session
        </Button>
        <Button size="sm" disabled={!user} onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
