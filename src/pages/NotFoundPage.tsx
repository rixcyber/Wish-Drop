import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full border border-border bg-secondary/40 p-4 text-muted-foreground">
        <Compass className="h-6 w-6" strokeWidth={1.6} />
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">404</p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em]">
        This wish isn't here
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The page may have been moved, fulfilled and archived, or never existed. The feed is still
        full of people quietly hoping for something.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/explore">Explore wishes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
