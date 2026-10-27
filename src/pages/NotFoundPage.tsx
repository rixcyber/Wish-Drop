import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-3xl bg-sage/25 p-4 text-forest">
        <Compass className="h-7 w-7" strokeWidth={1.8} />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">404</p>
      <h1 className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
        This wish isn't here
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-olive">
        The page may have been moved, fulfilled and archived, or never existed. The feed is still
        full of people quietly hoping for something.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="coral">
          <Link to="/explore">Explore wishes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
