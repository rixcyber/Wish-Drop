import { Ghost } from "lucide-react";
import { anonymousHandle, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const TINTS = [
  "bg-amber-400/10 text-amber-200/90 ring-amber-300/15",
  "bg-emerald-400/10 text-emerald-200/90 ring-emerald-300/15",
  "bg-sky-400/10 text-sky-200/90 ring-sky-300/15",
  "bg-rose-400/10 text-rose-200/90 ring-rose-300/15",
  "bg-violet-400/10 text-violet-200/90 ring-violet-300/15",
];

function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 33 + seed.charCodeAt(i)) % 9973;
  return TINTS[hash % TINTS.length];
}

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
};

interface AvatarProps {
  name: string;
  seed?: string;
  anonymous?: boolean;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ name, seed, anonymous, src, size = "md", className }: AvatarProps) {
  const base = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
    SIZES[size],
    className,
  );

  if (anonymous) {
    return (
      <span className={cn(base, "bg-secondary text-muted-foreground ring-border")} aria-hidden="true">
        <Ghost className="h-[45%] w-[45%]" strokeWidth={1.6} />
      </span>
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={cn(base, "object-cover ring-border")}
      />
    );
  }

  return (
    <span
      className={cn(base, "font-medium tracking-wide ring-inset", tintFor(seed ?? name))}
      aria-hidden="true"
    >
      {initialsOf(name) || "?"}
    </span>
  );
}

/** Public identity for a wish author or supporter, honouring anonymity. */
export function publicIdentity(
  profile: Profile | null | undefined,
  fallbackId: string,
  forceAnonymous = false,
): { name: string; anonymous: boolean; avatarUrl: string | null } {
  const anonymous = forceAnonymous || Boolean(profile?.anonymous) || !profile;
  if (anonymous) {
    return { name: anonymousHandle(fallbackId), anonymous: true, avatarUrl: null };
  }
  return { name: profile.displayName, anonymous: false, avatarUrl: profile.avatarUrl };
}
