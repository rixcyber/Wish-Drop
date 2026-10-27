import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Switch } from "@/components/ui/field";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { backendMode } from "@/lib/api";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = [
  { email: "ada@wishdrop.demo", label: "Ada · supporter with saved wishes" },
  { email: "marcus@wishdrop.demo", label: "Marcus · has an open wish" },
  { email: "admin@wishdrop.demo", label: "Admin · moderation dashboard" },
];

export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const { signIn, signUp, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) navigate(next, { replace: true });
  }, [profile, navigate, next]);

  const isSignIn = mode === "signin";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignIn) {
        await signIn(email, password);
        toast.success("Welcome back");
      } else {
        const signedIn = await signUp({ email, password, displayName, anonymous });
        if (!signedIn) {
          toast.success("Check your inbox", {
            description: "Confirm your email, then return here to sign in.",
          });
          navigate(`/signin?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }
        toast.success("Your account is ready", { description: "Post a wish when you feel ready." });
      }
      navigate(next, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not complete that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function useDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
  }

  return (
    <div className="container grid gap-12 py-14 lg:grid-cols-[0.95fr_1fr] lg:items-center lg:py-20">
      <div className="hidden lg:block">
        <Logo />
        <h1 className="mt-8 text-balance text-[38px] font-semibold leading-[1.1] tracking-[-0.03em]">
          A small account, a quiet kind of participation.
        </h1>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          WishDrop needs an account so wishes can be edited, contributions can be refunded, and
          reports can be handled by a human. Browsing never requires one.
        </p>
        <div className="mt-8 space-y-3">
          {[
            { icon: Lock, text: "Anonymous posting and anonymous support, by design." },
            { icon: ShieldCheck, text: "No addresses, phone numbers or payment details in public." },
            { icon: Sparkles, text: "Saved wishes, notifications and contribution history in one place." },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
              <span className="mt-0.5 inline-flex rounded-lg border border-border/70 bg-secondary/30 p-1.5">
                <item.icon className="h-3.5 w-3.5" strokeWidth={1.7} />
              </span>
              {item.text}
            </div>
          ))}
        </div>

        {backendMode === "local-demo" && (
          <div className="mt-10 max-w-md rounded-xl border border-border/70 bg-card/40 p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Demo accounts</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Password for every demo account:{" "}
              <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground/85">
                demo1234
              </span>
            </p>
            <div className="mt-3 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => useDemoAccount(account.email)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <span className="truncate">{account.email}</span>
                  <span className="shrink-0 text-[10.5px] text-muted-foreground/70">use</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-7 lg:hidden">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/50 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,1)] sm:p-8">
          <div className="flex gap-1 rounded-xl border border-border/70 bg-background/40 p-1">
            {(
              [
                { value: "signin", label: "Sign in", href: `/signin?next=${encodeURIComponent(next)}` },
                { value: "signup", label: "Create account", href: `/signup?next=${encodeURIComponent(next)}` },
              ] as const
            ).map((tab) => (
              <Link
                key={tab.value}
                to={tab.href}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-center text-[12.5px] font-medium transition-colors",
                  mode === tab.value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <h2 className="mt-6 text-[20px] font-semibold tracking-[-0.015em]">
            {isSignIn ? "Welcome back" : "Make an account"}
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            {isSignIn
              ? "Sign in to post, save and support wishes."
              : "It takes a minute. You can stay anonymous on everything you post."}
          </p>

          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            {!isSignIn && (
              <Field label="Display name" htmlFor="auth-name" hint="Shown on non-anonymous wishes and thank-yous.">
                <Input
                  id="auth-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                  placeholder="How should the community know you?"
                  required
                />
              </Field>
            )}

            <Field label="Email" htmlFor="auth-email">
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </Field>

            <Field
              label="Password"
              htmlFor="auth-password"
              hint={isSignIn ? undefined : "At least 8 characters. Never reuse a password from another site."}
            >
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Field>

            {!isSignIn && (
              <Switch
                checked={anonymous}
                onChange={setAnonymous}
                label="Keep my profile anonymous"
                description="Your name stays hidden by default on wishes you post. You can change this later."
              />
            )}

            {error && (
              <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[12.5px] text-red-200/90">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignIn ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree to the{" "}
            <Link to="/rules" className="underline underline-offset-4 hover:text-foreground">
              platform rules
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
              privacy policy
            </Link>
            . Payments are simulated in this build.
          </p>
        </div>

        <p className="mt-5 text-center text-[12px] text-muted-foreground">
          Just looking?{" "}
          <Link to="/explore" className="text-foreground/80 underline-offset-4 hover:underline">
            Browse wishes without an account
          </Link>
        </p>
      </div>
    </div>
  );
}
