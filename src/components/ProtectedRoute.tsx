import { Loader2, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/signin?next=${next}`} replace />;
  }

  if (profile.status === "banned") {
    return <AccessNotice title="This account is suspended" body="Contact moderation@wishdrop.demo if you believe this is a mistake." />;
  }

  if (adminOnly && profile.role !== "admin") {
    return (
      <AccessNotice
        title="Moderation access only"
        body="This area is limited to moderators. If you need to flag something, use the report button on any wish."
      />
    );
  }

  return <>{children}</>;
}

function AccessNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 rounded-full border border-border bg-secondary/50 p-3.5 text-muted-foreground">
        <Lock className="h-5 w-5" strokeWidth={1.7} />
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Back to the feed</Link>
      </Button>
    </div>
  );
}
