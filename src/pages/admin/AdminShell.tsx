import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ExternalLink,
  Flag,
  Gift,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/admin/reports", label: "Reports", icon: Flag, end: false },
  { to: "/admin/wishes", label: "Wishes", icon: Gift, end: false },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
  { to: "/admin/activity", label: "Activity", icon: Activity, end: false },
];

/**
 * Admin dashboard layout shell with sidebar navigation (desktop)
 * and collapsible top-nav (mobile). Renders admin sub-pages via `<Outlet />`.
 */
export function AdminShell() {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out of admin console.");
    navigate("/admin/login");
  }

  return (
    <div className="admin-theme flex min-h-dvh bg-background">
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-card/50 lg:flex">
        {/* Brand */}
        <div className="flex h-[64px] items-center gap-3 border-b border-border px-5">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo />
            <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={1.7} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Back to WishDrop
          </Link>
          {profile && (
            <div className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2">
              <Avatar
                name={profile.displayName}
                seed={profile.id}
                anonymous={profile.anonymous}
                src={profile.avatarUrl}
                size="xs"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground">
                  {profile.displayName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-[56px] items-center justify-between border-b border-border bg-card/50 px-4 lg:hidden">
          <Link to="/admin" className="flex items-center gap-2.5">
            <Logo />
            <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded-md border border-border p-2 text-foreground transition-colors hover:bg-secondary"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </header>

        {/* Mobile dropdown nav */}
        {sidebarOpen && (
          <div className="border-b border-border bg-card/80 px-4 py-3 lg:hidden">
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.7} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-2 space-y-0.5 border-t border-border pt-2">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Back to WishDrop
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
