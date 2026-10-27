import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/SectionHeading";
import { WishFeed } from "@/components/WishFeed";
import { useCommunity, useWishSave } from "@/hooks/useCommunity";
import { useAuth } from "@/context/AuthContext";
import { backendMode } from "@/lib/api";

export function ExplorePage() {
  const { wishes, profiles, loading } = useCommunity();
  const { savedIds } = useAuth();
  const onToggleSave = useWishSave();

  return (
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow="Explore"
        title="Every wish here belongs to a real story."
        description="Filter by what you care about, or read until something catches. You can browse everything without an account."
        actions={
          <Button asChild variant="coral">
            <Link to="/post">
              <Plus className="h-4 w-4" />
              Post a wish
            </Link>
          </Button>
        }
      />
      <div className="mt-9">
        <WishFeed
          wishes={wishes}
          profiles={profiles}
          loading={loading}
          backendMode={backendMode}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
          limit={9}
        />
      </div>
    </div>
  );
}
