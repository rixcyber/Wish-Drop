import { Loader2, ShieldX } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

/**
 * Protects admin routes. Unlike `ProtectedRoute`, this redirects
 * unauthenticated users to `/admin/login` (not the public sign-in page)
 * and verifies admin role — not just authentication.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-theme grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/admin/login" replace />;
  }

  if (profile.status === "banned") {
    return (
      <div className="admin-theme grid min-h-dvh place-items-center bg-background">
        <div className="mx-auto max-w-sm px-6 text-center">
          <ShieldX className="mx-auto h-10 w-10 text-destructive/70" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Account Suspended</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            This account has been suspended. Contact support if you believe this is a mistake.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Return to WishDrop</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (profile.role !== "admin") {
    return (
      <div className="admin-theme grid min-h-dvh place-items-center bg-background">
        <div className="mx-auto max-w-sm px-6 text-center">
          <ShieldX className="mx-auto h-10 w-10 text-destructive/70" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Access Denied</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            This account is not authorized to access the admin dashboard.
            If you believe this is a mistake, contact a platform administrator.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Back to WishDrop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
