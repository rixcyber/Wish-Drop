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
    <div className="container grid gap-12 py-12 lg:grid-cols-[0.95fr_1fr] lg:items-center lg:py-20">
      <div className="hidden lg:block">
        <Logo />
        <h1 className="mt-8 text-balance font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-forest lg:text-[46px]">
          A small account, a quiet kind of participation.
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-olive">
          WishDrop needs an account so wishes can be edited, contributions can be refunded, and
          reports can be handled by a human. Browsing never requires one.
        </p>
        <div className="mt-8 space-y-3.5">
          {[
            { icon: Lock, text: "Anonymous posting and anonymous support, by design." },
            { icon: ShieldCheck, text: "No addresses, phone numbers or payment details in public." },
            { icon: Sparkles, text: "Saved wishes, notifications and contribution history in one place." },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3.5 text-xs leading-relaxed text-olive">
              <span className="mt-0.5 inline-flex rounded-xl bg-sage/30 p-2 text-forest">
                <item.icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="text-ink/80">{item.text}</span>
            </div>
          ))}
        </div>

        {backendMode === "local-demo" && (
          <div className="mt-10 max-w-md rounded-2xl border border-olive/20 bg-white/75 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coral">Demo accounts</p>
            <p className="mt-2 text-xs leading-relaxed text-olive">
              Password for every demo account:{" "}
              <span className="rounded-md bg-sage/30 px-2 py-0.5 font-mono text-[11px] font-medium text-forest">
                demo1234
              </span>
            </p>
            <div className="mt-3.5 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => useDemoAccount(account.email)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs text-olive transition-colors hover:bg-sage/20 hover:text-forest"
                >
                  <span className="truncate">{account.email}</span>
                  <span className="shrink-0 text-[10.5px] font-semibold text-coral uppercase tracking-wider">use</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="rounded-3xl border border-olive/15 bg-white p-7 shadow-[0_20px_50px_-20px_rgba(23,61,53,0.12)] sm:p-9">
          <div className="flex gap-1.5 rounded-2xl border border-olive/15 bg-ivory p-1.5">
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
                  "flex-1 rounded-xl px-3 py-2 text-center text-xs font-medium transition-all",
                  mode === tab.value
                    ? "bg-forest text-ivory shadow-sm font-semibold"
                    : "text-olive hover:text-forest",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <h2 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-forest">
            {isSignIn ? "Welcome back" : "Make an account"}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-olive">
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
              <p className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs leading-relaxed text-coral">
                {error}
              </p>
            )}

            <Button type="submit" variant="coral" size="lg" className="w-full mt-2" disabled={busy}>
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

          <p className="mt-5 text-center text-xs leading-relaxed text-olive">
            By continuing you agree to the{" "}
            <Link to="/rules" className="text-forest underline underline-offset-4 hover:text-coral">
              platform rules
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-forest underline underline-offset-4 hover:text-coral">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-olive">
          Just looking?{" "}
          <Link to="/explore" className="font-medium text-forest underline underline-offset-4 hover:text-coral">
            Browse wishes without an account
          </Link>
        </p>
      </div>
    </div>
  );
}
