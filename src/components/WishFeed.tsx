import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { WishCard, WishCardSkeleton } from "./WishCard";
import { Input } from "./ui/input";
import { Select } from "./ui/field";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { filterWishes, sortWishes, type WishSort } from "@/lib/backend";
import { CATEGORIES, type Category, type Profile, type Wish } from "@/lib/types";
import type { Backend } from "@/lib/backend";

const BUDGETS: { value: string; label: string; min?: number; max?: number }[] = [
  { value: "any", label: "Any budget" },
  { value: "under_100", label: "Under 100", max: 100 },
  { value: "100_300", label: "100 – 300", min: 100, max: 300 },
  { value: "300_600", label: "300 – 600", min: 300, max: 600 },
  { value: "over_600", label: "600 and above", min: 600 },
];

interface WishFeedProps {
  wishes: Wish[];
  profiles: Profile[];
  loading?: boolean;
  backendMode: Backend["mode"];
  savedIds: string[];
  onToggleSave: (wishId: string) => void;
  limit?: number;
  showSearch?: boolean;
  showBudget?: boolean;
  showBanner?: boolean;
  emptyHint?: string;
}

export function WishFeed({
  wishes,
  profiles,
  loading,
  backendMode,
  savedIds,
  onToggleSave,
  limit = 9,
  showSearch = true,
  showBudget = true,
  showBanner = true,
  emptyHint,
}: WishFeedProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<WishSort>("newest");
  const [budget, setBudget] = useState("any");
  const [visible, setVisible] = useState(limit);

  const profileMap = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const profile of profiles) map.set(profile.id, profile);
    return map;
  }, [profiles]);

  const results = useMemo(() => {
    const range = BUDGETS.find((item) => item.value === budget) ?? BUDGETS[0];
    return sortWishes(
      filterWishes(wishes, {
        query,
        category,
        sort,
        minBudget: range.min,
        maxBudget: range.max,
      }),
      sort,
    ).filter((wish) => !wish.removed);
  }, [wishes, query, category, sort, budget]);

  const shown = results.slice(0, visible);
  const activeFilters = query !== "" || category !== "all" || budget !== "any" || sort !== "newest";

  function reset() {
    setQuery("");
    setCategory("all");
    setBudget("any");
    setSort("newest");
    setVisible(limit);
  }

  return (
    <div className="space-y-8">
      {showBanner && backendMode === "local-demo" && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-2xl border border-forest/15 bg-sage/35 px-4 py-3 text-[13px] text-forest">
          <Sparkles className="h-4 w-4 text-coral shrink-0" strokeWidth={2} />
          <span className="font-semibold">Demo community</span>
          <span aria-hidden="true" className="text-olive">·</span>
          <span className="text-forest/85">Every wish, supporter and payment here is simulated so you can explore freely.</span>
        </div>
      )}

      <div className="space-y-4">
        {showSearch && (
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive" strokeWidth={1.8} />
              <Input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisible(limit);
                }}
                placeholder="Search wishes, stories, categories…"
                aria-label="Search wishes"
                className="pl-10 rounded-xl border-olive/20 bg-white shadow-sm focus-visible:ring-coral"
              />
            </div>
            <div className="flex gap-3">
              <label className="sr-only" htmlFor="sort-wishes">
                Sort wishes
              </label>
              <Select
                id="sort-wishes"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as WishSort);
                  setVisible(limit);
                }}
                className="min-w-[168px] rounded-xl border-olive/20 bg-white shadow-sm"
              >
                <option value="newest">Newest first</option>
                <option value="nearly_fulfilled">Nearly fulfilled</option>
                <option value="most_supported">Most supported</option>
              </Select>
              {showBudget && (
                <Select
                  aria-label="Filter by budget"
                  value={budget}
                  onChange={(event) => {
                    setBudget(event.target.value);
                    setVisible(limit);
                  }}
                  className="min-w-[148px] rounded-xl border-olive/20 bg-white shadow-sm"
                >
                  {BUDGETS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          </div>
        )}

        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setVisible(limit);
            }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 font-sans text-[11px] font-semibold tracking-wide transition-all",
              category === "all"
                ? "border-forest bg-forest text-ivory shadow-sm"
                : "border-olive/20 bg-white/80 text-olive hover:bg-sage/25 hover:text-forest",
            )}
          >
            All wishes
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setCategory(item.value);
                setVisible(limit);
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 font-sans text-[11px] font-semibold tracking-wide transition-all",
                category === item.value
                  ? "border-forest bg-forest text-ivory shadow-sm"
                  : "border-olive/20 bg-white/80 text-olive hover:bg-sage/25 hover:text-forest",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-[12.5px] text-muted-foreground">
        <p>
          {loading ? "Gathering wishes…" : `${results.length} ${results.length === 1 ? "wish" : "wishes"}`}
          {activeFilters && !loading ? " matching your filters" : ""}
        </p>
        {activeFilters && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/70 transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <WishCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="mb-4 border-2 border-border bg-accent p-3 text-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
            <Search className="h-5 w-5" strokeWidth={1.7} />
          </div>
          <h3 className="text-[15px] font-semibold">No wishes match those filters</h3>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {emptyHint ?? "Try a different category or a wider budget — there is usually something quietly waiting."}
          </p>
          <Button variant="outline" size="sm" className="mt-5" onClick={reset}>
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                author={profileMap.get(wish.authorId)}
                saved={savedIds.includes(wish.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
          {visible < results.length && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisible((value) => value + limit)}>
                Show more wishes
              </Button>
            </div>
          )}
        </>
      )}

      {!loading && results.length > 0 && (
        <p className="pt-1 text-center text-[12px] text-muted-foreground">
          New to WishDrop?{" "}
          <Link to="/how-it-works" className="text-foreground/80 underline-offset-4 hover:underline">
            Read how wishes stay safe
          </Link>
          .
        </p>
      )}
    </div>
  );
}
