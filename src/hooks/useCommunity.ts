import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";

export function useCommunity() {
  const { data, loading, error, reload } = useQuery(async () => {
    const [wishes, profiles] = await Promise.all([api.listWishes(), api.listProfiles()]);
    return { wishes, profiles };
  }, []);

  return {
    wishes: data?.wishes ?? [],
    profiles: data?.profiles ?? [],
    loading,
    error,
    reload,
  };
}

/** Bookmarking that routes guests through sign-in instead of failing silently. */
export function useWishSave() {
  const { profile, toggleSave } = useAuth();
  const navigate = useNavigate();

  return useCallback(
    async (wishId: string) => {
      if (!profile) {
        toast("Sign in to save wishes", {
          description: "Your saved wishes stay with your account.",
        });
        navigate(`/signin?next=${encodeURIComponent(`/wishes/${wishId}`)}`);
        return;
      }
      try {
        const saved = await toggleSave(wishId);
        toast.success(saved ? "Saved to your list" : "Removed from saved wishes");
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : "Could not update your saved wishes.");
      }
    },
    [profile, navigate, toggleSave],
  );
}

export function requireAuthMessage(action: string) {
  toast(`Sign in to ${action}`, {
    description: "Browsing is open to everyone — posting and supporting needs an account.",
  });
}
