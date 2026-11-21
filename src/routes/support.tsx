import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, Loader2, Mail, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEEDBACK_CATEGORIES, feedbackStatusLabel, type FeedbackCategory } from "@/lib/feedback";
import { listMyFeedbackReports, submitFeedbackReport } from "@/lib/feedback.functions";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Support · MealMate" },
      { property: "og:description", content: "Help, customer feedback, and support for MealMate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Support · MealMate" },
      { name: "description", content: "Help, customer feedback, and support for MealMate." },
    ],
  }),
  component: SupportPage,
});

const FAQ = [
  {
    q: "How do dietary restrictions and allergies stay saved?",
    a: "Your dietary preferences, allergies, intolerances, and favourite cuisines save automatically to your MealMate account and apply across recipe discovery, Mia AI, and meal planning.",
  },
  {
    q: "How do I fix a shopping-list aisle category?",
    a: "Tap the edit icon on any grocery item to change its category or quantity. MealMate remembers your override for future additions, and you can customise aisle order under Aisles.",
  },
  {
    q: "How does the AI Kitchen Scanner work?",
    a: "Open Scan, point your camera at ingredients or a fridge shelf, and MealMate suggests recipes matching what you already have.",
  },
  {
    q: "How do I upgrade or restore MealMate Premium?",
    a: "Visit the Premium page to see live subscription pricing in ZAR. Previously purchased subscriptions can be restored from Settings → Restore purchases.",
  },
  {
    q: "How do I cancel Premium?",
    a: "Manage your subscription anytime in the Play Store, App Store, or account billing settings. Access continues until the end of your paid period.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → Delete account or email support@mealsmates.site from your account email.",
  },
];

function SupportPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<FeedbackCategory>("Bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastRef, setLastRef] = useState<string | null>(null);

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["feedback-reports", user?.id],
    queryFn: () => listMyFeedbackReports(),
    enabled: !!user,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const saved = await submitFeedbackReport({
        data: {
          category,
          title: title.trim(),
          description: description.trim(),
          routeContext: "/support",
        },
      });
      setLastRef(saved.reference_id);
      setTitle("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["feedback-reports"] });
      toast.success(`Feedback submitted (${saved.reference_id})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit feedback right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 pb-24 text-foreground">
      <Link
        to={user ? "/settings" : "/auth"}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {user ? "Back to settings" : "Back to sign in"}
      </Link>
      <h1 className="mt-4 font-display text-4xl">Help &amp; Feedback</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Answers to common questions, plus direct issue reporting with tracking by Taz Technologies.
      </p>

      {/* Submit Feedback Form */}
      <section className="mt-7 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <MessageSquareWarning className="h-5 w-5 text-[var(--periwinkle)]" />
          <h2 className="text-lg font-medium text-foreground">Send feedback or report an issue</h2>
        </div>
        {!user ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Please{" "}
            <Link to="/auth" className="font-medium text-primary underline">
              sign in
            </Link>{" "}
            to submit tracked feedback or email support below.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
                <SelectTrigger className="h-11 rounded-xl border-border bg-secondary text-xs text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary (e.g. Wrong aisle for oats)"
                maxLength={160}
                required
                className="h-11 rounded-xl border-border bg-secondary text-sm text-foreground"
              />
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include steps to reproduce, recipe name, or suggestion details…"
              maxLength={2000}
              required
              className="w-full rounded-xl border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--periwinkle)] focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              {lastRef ? (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved under reference <span className="font-mono">{lastRef}</span>
                </p>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Every report receives a tracking ID.
                </span>
              )}
              <Button
                type="submit"
                disabled={submitting || title.trim().length < 3 || description.trim().length < 5}
                className="h-11 rounded-xl bg-foreground px-5 text-background hover:opacity-90"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit report"}
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* My Submitted Reports */}
      {user && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-medium text-foreground">My submitted reports</h2>
          {reportsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              You haven&apos;t submitted any reports yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {reports.map((rep) => (
                <li key={rep.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{rep.title}</p>
                    <span className="text-xs font-medium text-[var(--periwinkle)]">
                      {feedbackStatusLabel(rep.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{rep.reference_id}</span> · {rep.category} ·{" "}
                    {new Date(rep.created_at).toLocaleDateString()}
                  </p>
                  {rep.admin_note && (
                    <p className="mt-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs text-foreground">
                      Note: {rep.admin_note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* FAQs */}
      <div className="mt-8 space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card px-4 py-3 open:pb-4"
          >
            <summary className="cursor-pointer list-none text-sm font-medium">{item.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>

      <a
        href="mailto:support@mealsmates.site"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        <Mail className="h-4 w-4" />
        Email support@mealsmates.site
      </a>
    </main>
  );
}
