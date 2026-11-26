import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { listRecipeRatings, rateRecipe } from "@/lib/engagement.functions";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

type Rating = {
  id: string;
  isMine?: boolean;
  rating: number;
  review: string | null;
  created_at: string;
};

export function RecipeRatings({ recipeId }: { recipeId: string }) {
  const { user } = useSession();
  const qc = useQueryClient();
  const [myRating, setMyRating] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const loadRatings = useServerFn(listRecipeRatings);
  const saveRating = useServerFn(rateRecipe);

  const { data: ratings, isLoading } = useQuery({
    queryKey: ["ratings", recipeId],
    queryFn: async () => (await loadRatings({ data: { recipeId } })).slice(0, 20) as Rating[],
    enabled: !!user,
  });

  const mine = ratings?.find((rating) => rating.isMine);
  useEffect(() => {
    if (mine) {
      setMyRating(mine.rating);
      setReview(mine.review ?? "");
    }
  }, [mine]);

  const count = ratings?.length ?? 0;
  const average =
    count > 0 && ratings
      ? Math.round(
          (ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count) * 10,
        ) / 10
      : null;

  async function submit() {
    if (!user) {
      toast.info("Sign in to rate");
      return;
    }
    if (!myRating) {
      toast.info("Pick 1 to 5 stars");
      return;
    }
    setSaving(true);
    try {
      await saveRating({
        data: { recipeId, rating: myRating, review: review.trim() || undefined },
      });
      toast.success("Thanks for rating!");
      await qc.invalidateQueries({ queryKey: ["ratings", recipeId] });
      await qc.invalidateQueries({ queryKey: ["recipe"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save rating");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl">Ratings & reviews</h2>
        {average !== null && count > 0 && (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            <span>{average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              &middot; {count} {count === 1 ? "review" : "reviews"}
            </span>
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Your rating</p>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMyRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-secondary"
            >
              <Star
                className={`h-6 w-6 ${n <= myRating ? "fill-primary text-primary" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share how it turned out or any tweaks you made (optional)"
          rows={3}
          maxLength={800}
          className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={submit} disabled={saving || !user} className="min-h-11 rounded-xl">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mine ? "Update review" : "Post review"}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading community reviews…</p>
        ) : ratings && ratings.length > 0 ? (
          ratings.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-card/50 p-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                  />
                ))}
                <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.review && <p className="mt-2 text-sm leading-relaxed">{r.review}</p>}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Cook this dish and share an honest note for the community.
          </p>
        )}
      </div>
    </section>
  );
}
