import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { backendMode } from "@/lib/api";

/**
 * Dedicated admin login page at `/admin/login`.
 * — No signup option
 * — After auth, verifies admin role before redirecting
 * — Shows "not authorized" for non-admin accounts
 */
export function AdminLoginPage() {
  const { signIn, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  // If already authenticated, redirect admins or deny non-admins
  useEffect(() => {
    if (authLoading) return;
    if (!profile) return;
    if (profile.role === "admin" && profile.status === "active") {
      navigate("/admin", { replace: true });
    } else if (profile.role !== "admin") {
      setDenied(true);
    }
  }, [profile, authLoading, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setDenied(false);
    setBusy(true);
    try {
      await signIn(email, password);
      // AuthContext hydrate updates `profile`; the useEffect above handles redirect.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid credentials. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return (
      <div className="admin-theme grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Non-admin who just signed in
  if (denied) {
    return (
      <div className="admin-theme grid min-h-dvh place-items-center bg-background">
        <div className="mx-auto w-full max-w-sm px-6 text-center">
          <div className="inline-flex rounded-full border border-destructive/30 bg-destructive/10 p-4">
            <ShieldX className="h-8 w-8 text-destructive/80" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Not Authorized</h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
            This account is not authorized to access the admin dashboard.
            If you believe this is a mistake, contact a platform administrator.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button asChild variant="outline">
              <Link to="/">Go to WishDrop</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme grid min-h-dvh place-items-center bg-background">
      <div className="mx-auto w-full max-w-sm px-6">
        {/* Logo + badge */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo />
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin Console
            </span>
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-lg font-semibold text-foreground">Sign in to Admin</h1>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">
            Enter your administrator credentials to continue.
          </p>

          <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
            <Field label="Email" htmlFor="admin-email">
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="admin@example.com"
                required
              />
            </Field>
            <Field label="Password" htmlFor="admin-password">
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[12.5px] text-red-300/90">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {backendMode === "local-demo" && (
            <div className="mt-5 rounded-lg border border-border bg-secondary/50 p-3">
              <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                Demo admin account
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@wishdrop.demo");
                  setPassword("demo1234");
                  setError(null);
                }}
                className="mt-2 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span>admin@wishdrop.demo</span>
                <span className="text-[10px] opacity-60">use</span>
              </button>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-[11.5px] text-muted-foreground">
          Not an administrator?{" "}
          <Link to="/" className="text-foreground/80 underline underline-offset-4 hover:text-foreground">
            Return to WishDrop
          </Link>
        </p>
      </div>
    </div>
  );
}
