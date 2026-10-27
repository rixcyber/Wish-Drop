import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Sparkles, X } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { backendMode } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LINKS = [
  { to: "/explore", label: "Explore Wishes" },
  { to: "/how-it-works", label: "How It Works" },
];

export function SiteHeader() {
  const { profile, unreadCount, signOut, savedIds } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out. Your saved wishes stay on this device.");
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/95 backdrop-blur">
      <div className="container flex h-[68px] items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            {LINKS.map((link) => {
              const isExplore = link.to.startsWith("/explore");
              const active = location.pathname === (isExplore ? "/explore" : link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "text-[13px] transition-colors",
                    active ? "font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4" : "font-meta text-[11px] text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {backendMode === "local-demo" && (
            <span className="mr-1 hidden items-center gap-1.5 border-2 border-border bg-accent px-2 py-1 font-meta text-[9px] font-bold uppercase md:inline-flex">
              <Sparkles className="h-3 w-3" strokeWidth={1.8} />
              Demo mode
            </span>
          )}

          {profile ? (
            <>
              <Link
                to="/account?tab=notifications"
                aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                className="relative hidden border-2 border-transparent p-2 text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground sm:block"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.7} />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 border-2 border-border bg-card py-1 pl-1 pr-2.5 text-[12.5px] text-foreground/85 shadow-[2px_2px_0_hsl(var(--foreground))] transition-colors hover:bg-accent"
                    aria-label="Account menu"
                  >
                    <Avatar
                      name={profile.displayName}
                      seed={profile.id}
                      anonymous={profile.anonymous}
                      src={profile.avatarUrl}
                      size="xs"
                    />
                    <span className="hidden max-w-[110px] truncate sm:block">
                      {profile.anonymous ? "Anonymous" : profile.displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-56 animate-fade-in border-2 border-border bg-popover p-1.5 text-[13px] shadow-[5px_5px_0_hsl(var(--foreground))]"
                  >
                    <div className="px-2.5 py-2">
                      <p className="truncate font-medium">{profile.displayName}</p>
                      <p className="truncate text-[11.5px] text-muted-foreground">{profile.email}</p>
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-border/70" />
                    <Item to="/account">
                      <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.8} />
                      My dashboard
                    </Item>
                    <Item to="/account?tab=saved">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Saved wishes
                      <span className="ml-auto text-[11px] text-muted-foreground">{savedIds.length}</span>
                    </Item>
                    <Item to="/account?tab=settings">
                      <Settings className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Profile settings
                    </Item>
                    {profile.role === "admin" && (
                      <Item to="/admin">
                        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Moderation
                      </Item>
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-border/70" />
                    <DropdownMenu.Item
                      onSelect={() => void handleSignOut()}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground"
                    >
                      <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <Link
              to="/signin"
              className="hidden font-meta text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign In
            </Link>
          )}

          <Button asChild size="sm" className="hidden h-9 px-4 text-[13px] sm:inline-flex">
            <Link to="/post">Make a wish</Link>
          </Button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="border-2 border-border bg-card p-2 text-foreground shadow-[2px_2px_0_hsl(var(--foreground))] transition-colors hover:bg-accent lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t-2 border-border bg-background lg:hidden">
          <div className="container space-y-1 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-lg px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border/70" />
            {profile ? (
              <>
                <Link
                  to="/account"
                  className="block rounded-lg px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  My dashboard
                </Link>
                <Link
                  to="/account?tab=notifications"
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="block w-full rounded-lg px-2 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="block rounded-lg px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign In
              </Link>
            )}
            <Button asChild className="mt-3 w-full">
              <Link to="/post">Post a Wish</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Item({ to, children }: { to: string; children: ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        to={to}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground"
      >
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}
