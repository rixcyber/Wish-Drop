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
    <header className="sticky top-0 z-40 border-b border-olive/20 bg-[#F8F5EE]/95 backdrop-blur-md transition-colors">
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => {
              const isExplore = link.to.startsWith("/explore");
              const active = location.pathname === (isExplore ? "/explore" : link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "text-[13.5px] font-medium transition-colors",
                    active
                      ? "font-semibold text-forest border-b-2 border-coral pb-0.5"
                      : "text-olive hover:text-forest",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {backendMode === "local-demo" && (
            <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-forest/15 bg-sage/40 px-3 py-1 font-sans text-[10.5px] font-semibold uppercase tracking-wider text-forest md:inline-flex">
              <Sparkles className="h-3 w-3 text-coral" strokeWidth={2} />
              Demo mode
            </span>
          )}

          {profile ? (
            <>
              <Link
                to="/account?tab=notifications"
                aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                className="relative hidden rounded-xl border border-transparent p-2 text-olive transition-colors hover:border-olive/20 hover:bg-sage/20 hover:text-forest sm:block"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-olive/25 bg-white py-1.5 pl-1.5 pr-3 text-[13px] font-medium text-forest shadow-sm transition-all hover:border-forest/40 hover:shadow"
                    aria-label="Account menu"
                  >
                    <Avatar
                      name={profile.displayName}
                      seed={profile.id}
                      anonymous={profile.anonymous}
                      src={profile.avatarUrl}
                      size="xs"
                    />
                    <span className="hidden max-w-[120px] truncate sm:block">
                      {profile.anonymous ? "Anonymous" : profile.displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-olive" strokeWidth={1.8} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-60 animate-fade-in rounded-2xl border border-olive/20 bg-white p-2 text-[13px] shadow-xl shadow-forest/10"
                  >
                    <div className="px-3 py-2.5">
                      <p className="truncate font-semibold text-forest">{profile.displayName}</p>
                      <p className="truncate text-[11.5px] text-olive">{profile.email}</p>
                    </div>
                    <DropdownMenu.Separator className="my-1.5 h-px bg-olive/15" />
                    <Item to="/account">
                      <LayoutDashboard className="h-4 w-4" strokeWidth={1.8} />
                      My dashboard
                    </Item>
                    <Item to="/account?tab=saved">
                      <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                      Saved wishes
                      <span className="ml-auto rounded-full bg-sage/35 px-2 py-0.5 text-[10.5px] font-semibold text-forest">{savedIds.length}</span>
                    </Item>
                    <Item to="/account?tab=settings">
                      <Settings className="h-4 w-4" strokeWidth={1.8} />
                      Profile settings
                    </Item>
                    {profile.role === "admin" && (
                      <Item to="/admin">
                        <ShieldCheck className="h-4 w-4 text-forest" strokeWidth={1.8} />
                        Moderation
                      </Item>
                    )}
                    <DropdownMenu.Separator className="my-1.5 h-px bg-olive/15" />
                    <DropdownMenu.Item
                      onSelect={() => void handleSignOut()}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-olive outline-none transition-colors hover:bg-sage/20 hover:text-forest focus:bg-sage/20 focus:text-forest"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.8} />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <Link
              to="/signin"
              className="hidden font-sans text-[13px] font-medium text-olive transition-colors hover:text-forest sm:block px-2 py-1"
            >
              Sign In
            </Link>
          )}

          <Button asChild size="sm" variant="coral" className="hidden sm:inline-flex">
            <Link to="/post">Make a wish</Link>
          </Button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl border border-olive/25 bg-white p-2.5 text-forest shadow-sm transition-all hover:bg-sage/20 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-olive/15 bg-[#F8F5EE] lg:hidden animate-fade-in">
          <div className="container space-y-1.5 py-5">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-sage/25 hover:text-forest"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-olive/15" />
            {profile ? (
              <>
                <Link
                  to="/account"
                  className="block rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-sage/25 hover:text-forest"
                >
                  My dashboard
                </Link>
                <Link
                  to="/account?tab=notifications"
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-sage/25 hover:text-forest"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-coral px-2 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="block w-full rounded-xl px-3.5 py-2.5 text-left text-[14px] font-medium text-olive transition-colors hover:bg-sage/25 hover:text-forest"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="block rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-sage/25 hover:text-forest"
              >
                Sign In
              </Link>
            )}
            <Button asChild variant="coral" className="mt-4 w-full">
              <Link to="/post">Make a Wish</Link>
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
