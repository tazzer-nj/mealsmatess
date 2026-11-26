import { lazy, Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, startOfYear, subDays } from "date-fns";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Compass,
  Crown,
  Download,
  Filter,
  Flame,
  Lightbulb,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminInspectInsightUsers,
  getUserInsights,
  logAdminInsightsExport,
} from "@/lib/user-insights.functions";
import {
  buildUserInsightsCsv,
  type CountShare,
  type UserInsightsFilter,
} from "@/lib/user-insights-aggregator";

const AreaTrend = lazy(() =>
  import("@/components/admin/charts").then((m) => ({ default: m.AreaTrend })),
);
const BarBreakdown = lazy(() =>
  import("@/components/admin/charts").then((m) => ({ default: m.BarBreakdown })),
);
const DonutBreakdown = lazy(() =>
  import("@/components/admin/charts").then((m) => ({ default: m.DonutBreakdown })),
);

type DatePreset = "today" | "7d" | "30d" | "90d" | "year" | "custom";

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${mins}m ${rem}s`;
}

function ChartSkeleton() {
  return (
    <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chart…
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--periwinkle-tint)] text-[var(--periwinkle)]">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 font-display text-2xl font-semibold leading-tight tabular-nums text-foreground">
        {value}
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ShareBarList({
  title,
  subtitle,
  items,
  emptyLabel = "No responses recorded yet.",
}: {
  title: string;
  subtitle?: string;
  items: CountShare[];
  emptyLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.name} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium text-foreground">{item.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {item.count.toLocaleString()} ({item.pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-[var(--periwinkle)] transition-all"
                  style={{ width: `${Math.min(100, Math.max(2, item.pct))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function UserInsightsTab() {
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [customRange, setCustomRange] = useState({
    from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const [platform, setPlatform] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("all");
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [inspectSearch, setInspectSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const range = useMemo(() => {
    const now = new Date();
    if (datePreset === "today") {
      return {
        from: startOfDay(now).toISOString(),
        to: now.toISOString(),
      };
    }
    if (datePreset === "7d") {
      return { from: subDays(now, 7).toISOString(), to: now.toISOString() };
    }
    if (datePreset === "30d") {
      return { from: subDays(now, 30).toISOString(), to: now.toISOString() };
    }
    if (datePreset === "90d") {
      return { from: subDays(now, 90).toISOString(), to: now.toISOString() };
    }
    if (datePreset === "year") {
      return { from: startOfYear(now).toISOString(), to: now.toISOString() };
    }
    return {
      from: new Date(customRange.from).toISOString(),
      to: new Date(`${customRange.to}T23:59:59`).toISOString(),
    };
  }, [datePreset, customRange.from, customRange.to]);

  const filters: UserInsightsFilter = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      platform: platform === "all" ? null : platform,
      country: country === "all" ? null : country,
      channel: channel === "all" ? null : channel,
      subscriptionStatus: subscriptionStatus === "all" ? null : subscriptionStatus,
      onboardingCompleted,
    }),
    [range.from, range.to, platform, country, channel, subscriptionStatus, onboardingCompleted],
  );

  const insightsQuery = useQuery({
    queryKey: ["admin-user-insights", filters],
    queryFn: () => getUserInsights({ data: filters }),
    staleTime: 60_000,
  });

  const inspectionQuery = useQuery({
    queryKey: ["admin-user-insights-inspect", inspectSearch],
    queryFn: () => adminInspectInsightUsers({ data: { search: inspectSearch, limit: 25 } }),
    staleTime: 30_000,
  });

  async function handleExportCsv() {
    if (!insightsQuery.data || exporting) return;
    setExporting(true);
    try {
      const csv = buildUserInsightsCsv(insightsQuery.data);
      const lines = csv.split("\n").length - 1;
      await logAdminInsightsExport({ data: { rowCount: Math.max(0, lines) } }).catch(() => null);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mealmate-user-insights-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported privacy-safe User Insights CSV");
    } catch {
      toast.error("Could not export insights CSV");
    } finally {
      setExporting(false);
    }
  }

  const report = insightsQuery.data;

  return (
    <div className="space-y-6">
      {/* Filter & Export Bar */}
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--periwinkle)]" />
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">
                User Insights &amp; Onboarding Analytics
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time Firestore telemetry, personalisation distribution, conversion funnel, and
                cohort retention.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void handleExportCsv()}
            disabled={!report || exporting}
            className="rounded-lg"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 h-3.5 w-3.5" />
            )}
            Export CSV
          </Button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
            <SelectTrigger className="h-9 bg-background text-xs">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="h-9 bg-background text-xs">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {(report?.filterOptions.platforms ?? ["web", "android", "ios"]).map((p) => (
                <SelectItem key={p} value={p}>
                  {p.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-9 bg-background text-xs">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {(report?.filterOptions.countries ?? ["ZA"]).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="h-9 bg-background text-xs">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {(report?.filterOptions.channels ?? []).map((ch) => (
                <SelectItem key={ch} value={ch}>
                  {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
            <SelectTrigger className="h-9 bg-background text-xs">
              <SelectValue placeholder="Subscription" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subscription states</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="active">Active Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={onboardingCompleted}
            onValueChange={(v) => setOnboardingCompleted(v as "all" | "completed" | "incomplete")}
          >
            <SelectTrigger className="h-9 bg-background text-xs">
              <SelectValue placeholder="Onboarding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All onboarding states</SelectItem>
              <SelectItem value="completed">Completed onboarding</SelectItem>
              <SelectItem value="incomplete">Incomplete / dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {datePreset === "custom" && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={customRange.from}
              onChange={(e) => setCustomRange((r) => ({ ...r, from: e.target.value }))}
              className="h-9 w-40 text-xs"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={customRange.to}
              onChange={(e) => setCustomRange((r) => ({ ...r, to: e.target.value }))}
              className="h-9 w-40 text-xs"
            />
          </div>
        )}
      </section>

      {insightsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !report ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Unable to load User Insights right now.
        </div>
      ) : (
        <>
          {/* Section A: Overview KPIs */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section A · Executive Overview
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total users (filtered)"
                value={report.overview.totalUsers.toLocaleString()}
                hint={`${report.overview.newUsersInRange.toLocaleString()} new in range`}
                icon={Users}
              />
              <MetricCard
                label="Onboarding completion"
                value={`${report.overview.onboardingCompletionRatePct.toFixed(1)}%`}
                hint={`${report.overview.onboardingCompletedCount.toLocaleString()} completed · ${report.overview.onboardingDropOffRatePct.toFixed(1)}% drop-off`}
                icon={CheckCircle2}
              />
              <MetricCard
                label="Trials & Paid conversions"
                value={`${report.overview.trialStarts} / ${report.overview.paidConversions}`}
                hint={`${report.overview.paywallViewedUsers} paywall views · ${report.overview.activePaidSubscribers} active`}
                icon={Crown}
              />
              <MetricCard
                label="MRR / ARR (USD)"
                value={`$${report.overview.mrrUsd.toFixed(2)}`}
                hint={`ARR $${report.overview.arrUsd.toFixed(2)} · ${report.overview.activeTrialSubscribers} in trial`}
                icon={TrendingUp}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Recipe activation"
                value={`${report.overview.activationRatePct.toFixed(1)}%`}
                hint={`${report.overview.activatedUsers.toLocaleString()} viewed first recipe`}
                icon={Compass}
              />
              <MetricCard
                label="Cooking completions"
                value={report.overview.mealsCompleted.toLocaleString()}
                hint={`${report.engagement.featureAdoption.plannerUsers} planners active`}
                icon={Flame}
              />
              <MetricCard
                label="Collections created"
                value={report.overview.collectionsCreated.toLocaleString()}
                hint={`${report.engagement.featureAdoption.collectionsUsers} collectors · ${report.engagement.featureAdoption.pantryUsers} pantry cooks`}
                icon={Sparkles}
              />
              <MetricCard
                label="Paywall conversion"
                value={`${report.overview.paywallToPaidConversionPct.toFixed(1)}%`}
                hint={`${report.engagement.featureAdoption.miaUsers} used Mia assistant`}
                icon={Target}
              />
            </div>
          </section>

          {/* Section B & C: Challenges & Goals */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sections B &amp; C · User Challenges, Food Goals &amp; Health Goals
            </h3>
            <div className="grid gap-4 lg:grid-cols-3">
              <ShareBarList
                title="Top everyday challenges"
                subtitle="Page 2 multi-select pain points"
                items={report.challenges}
              />
              <ShareBarList
                title="Primary & multi-selected food goals"
                subtitle="Page 1 onboarding goals"
                items={report.goals.foodGoals}
              />
              <div className="space-y-4">
                <ShareBarList
                  title="Health & fitness goals"
                  subtitle="Page 3 priorities"
                  items={report.goals.healthGoals}
                />
                <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-xs">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-[var(--periwinkle)]" /> Balanced-nutrition
                    safeguard active
                  </span>
                  <span className="font-semibold tabular-nums">
                    {report.goals.balancedSafeguardCount.toLocaleString()} users
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section D: Food Preferences & Aggregate Dietary Restrictions (Privacy-Safe) */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Section D · Meal Enjoyments &amp; Dietary Restrictions
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Privacy policy: individual allergies are strictly excluded from analytics &amp;
                exports
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ShareBarList
                title="Most popular meal styles"
                subtitle="Meals users enjoy eating (Page 5)"
                items={report.preferences.mealEnjoyments}
              />
              <ShareBarList
                title="Aggregate dietary patterns"
                subtitle="Group-level dietary restriction distribution only"
                items={report.preferences.dietaryRestrictions}
              />
            </div>
          </section>

          {/* Section E: Cooking Habits & ZAR Lifestyle */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section E · Eating Habits, Cooking Lifestyle &amp; ZAR Budgets
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ShareBarList title="Eating habits" items={report.habitsAndLifestyle.eatingHabits} />
              <ShareBarList
                title="Cooking frequency"
                items={report.habitsAndLifestyle.cookingFrequency}
              />
              <ShareBarList
                title="Monthly food budget (ZAR)"
                items={report.habitsAndLifestyle.budgetRangesZar}
              />
              <ShareBarList
                title="Available cooking time"
                items={report.habitsAndLifestyle.cookingTimes}
              />
              <ShareBarList
                title="Cooking confidence level"
                items={report.habitsAndLifestyle.cookingLevels}
              />
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Top app features used
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  From real `user_activity` telemetry
                </p>
                {report.engagement.topFeatures.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No activity recorded in range.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {report.engagement.topFeatures.slice(0, 6).map((f) => (
                      <li key={f.name} className="flex items-center justify-between">
                        <span className="font-mono text-foreground">{f.name}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {f.count.toLocaleString()} ({f.pct.toFixed(1)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Section F: Acquisition Attribution */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section F · User Acquisition &amp; Channel Conversion
            </h3>
            <div className="grid gap-4 lg:grid-cols-3">
              <ShareBarList
                title="Self-reported discovery (Page 7)"
                items={report.acquisition.selfReported}
              />
              <ShareBarList
                title="Captured UTM & referrer sources"
                items={report.acquisition.utmChannels}
              />
              <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
                <div className="mb-3 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[var(--periwinkle)]" />
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Channel conversion table
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-left text-[11px] uppercase text-muted-foreground">
                      <tr>
                        <th className="pb-2 pr-2">Channel</th>
                        <th className="pb-2 pr-2 text-right">Users</th>
                        <th className="pb-2 pr-2 text-right">Onb%</th>
                        <th className="pb-2 pr-2 text-right">Trial%</th>
                        <th className="pb-2 text-right">Paid%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.acquisition.channelPerformance.map((row) => (
                        <tr key={row.channel} className="border-t border-border/60">
                          <td className="py-2 pr-2 font-medium text-foreground">{row.channel}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{row.users}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">
                            {row.onboardingCompletedPct.toFixed(1)}%
                          </td>
                          <td className="py-2 pr-2 text-right tabular-nums">
                            {row.trialRatePct.toFixed(1)}%
                          </td>
                          <td className="py-2 text-right tabular-nums font-medium">
                            {row.paidConversionRatePct.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      {report.acquisition.channelPerformance.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            No attribution data yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Section G: Onboarding Page-by-Page Funnel & Drop-off Analysis */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section G · Onboarding Funnel &amp; Drop-off Diagnostics
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      Pages 1–8 Completion &amp; Drop-off
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Avg completion:{" "}
                      <strong className="text-foreground">
                        {formatDuration(report.funnel.avgCompletionDurationSeconds)}
                      </strong>{" "}
                      · Most abandoned:{" "}
                      <strong className="text-foreground">
                        {report.funnel.mostAbandonedPage
                          ? `Page ${report.funnel.mostAbandonedPage}`
                          : "None"}
                      </strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {report.funnel.onboardingPages.map((pg) => (
                    <div
                      key={pg.page}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-foreground">{pg.label}</span>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-foreground">{pg.usersReached} users</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            pg.dropOffPct > 20
                              ? "bg-destructive/10 text-destructive"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          -{pg.dropOffPct.toFixed(1)}% drop
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Signup → Paywall → Paid Milestone Funnel
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Separated cleanly: paywall views never count as conversions.
                </p>
                <Suspense fallback={<ChartSkeleton />}>
                  <BarBreakdown
                    data={report.funnel.milestones.map((m) => ({
                      name: m.step.replace(" ", "\n"),
                      users: m.users,
                    }))}
                    dataKey="users"
                    xKey="name"
                  />
                </Suspense>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  {report.funnel.milestones.map((m) => (
                    <div key={m.step} className="rounded-md border border-border/60 p-2">
                      <div className="truncate text-[11px] text-muted-foreground">{m.step}</div>
                      <div className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {m.users.toLocaleString()} ({m.conversionFromPrevPct.toFixed(1)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section H & I: Subscriptions & Retention */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sections H &amp; I · RevenueCat Subscriptions &amp; Cohort Retention
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard label="DAU" value={report.engagement.dau.toLocaleString()} icon={Flame} />
              <MetricCard
                label="WAU"
                value={report.engagement.wau.toLocaleString()}
                icon={Activity}
              />
              <MetricCard
                label="MAU"
                value={report.engagement.mau.toLocaleString()}
                hint={`Onboarded MAU ${report.engagement.completedVsIncompleteRetention.completedActivePct.toFixed(1)}% vs Incomplete ${report.engagement.completedVsIncompleteRetention.incompleteActivePct.toFixed(1)}%`}
                icon={Users}
              />
              <MetricCard
                label="D1 / D7 / D30 Retention"
                value={`${report.engagement.d1RetentionPct.toFixed(0)}% / ${report.engagement.d7RetentionPct.toFixed(0)}% / ${report.engagement.d30RetentionPct.toFixed(0)}%`}
                icon={Target}
              />
              <MetricCard
                label="Trial → Paid / Churn"
                value={`${report.subscriptions.trialToPaidRatePct.toFixed(1)}% / ${report.subscriptions.cancellationRatePct.toFixed(1)}%`}
                hint={`Range payments $${report.subscriptions.revenueInRangeUsd.toFixed(2)}`}
                icon={BarChart3}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Daily active users &amp; signups
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Computed from real `user_activity` logs in range
                </p>
                <Suspense fallback={<ChartSkeleton />}>
                  <AreaTrend data={report.engagement.dailyTrend} dataKey="activeUsers" />
                </Suspense>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Subscriptions by tier
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">Active and trialing plans</p>
                {report.subscriptions.byTier.length === 0 ? (
                  <p className="py-12 text-center text-xs text-muted-foreground">
                    No active plans in cohort yet.
                  </p>
                ) : (
                  <Suspense fallback={<ChartSkeleton />}>
                    <DonutBreakdown data={report.subscriptions.byTier} dataKey="count" />
                  </Suspense>
                )}
              </div>
            </div>
          </section>

          {/* Section J: Evidence-Based Actionable Insights */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section J · Evidence-Based Product Recommendations
            </h3>
            {report.actionableInsights.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-xs text-muted-foreground">
                Collect more onboarding and activity events in this range to generate product
                insights.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {report.actionableInsights.map((ins) => (
                  <div key={ins.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 shrink-0 text-[var(--periwinkle)]" />
                        <h4 className="font-display text-sm font-semibold text-foreground">
                          {ins.title}
                        </h4>
                      </div>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          ins.severity === "high"
                            ? "bg-destructive/10 text-destructive"
                            : ins.severity === "positive"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-[var(--periwinkle-tint)] text-[var(--periwinkle)]"
                        }`}
                      >
                        {ins.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{ins.evidence}</p>
                    <p className="mt-2 flex items-start gap-1.5 rounded-md bg-secondary/60 px-2.5 py-2 text-xs text-foreground">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--periwinkle)]" />
                      <span>{ins.recommendation}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Privacy-Safe User Inspection Table */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Privacy-Safe User Inspection
            </h3>
            <p className="text-xs text-muted-foreground">
              Masked user IDs only. Emails, tokens, passwords, private chats, and individual
              allergies are never queried or displayed.
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={inspectSearch}
              onChange={(e) => setInspectSearch(e.target.value)}
              placeholder="Search name, goal, or channel"
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {inspectionQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2.5 py-2">Masked ID</th>
                  <th className="px-2.5 py-2">Member</th>
                  <th className="px-2.5 py-2">Platform</th>
                  <th className="px-2.5 py-2">Onboarding</th>
                  <th className="px-2.5 py-2">Primary goal</th>
                  <th className="px-2.5 py-2">ZAR budget</th>
                  <th className="px-2.5 py-2">Channel</th>
                  <th className="px-2.5 py-2">Plan</th>
                </tr>
              </thead>
              <tbody>
                {(inspectionQuery.data?.rows ?? []).map((row) => (
                  <tr
                    key={row.maskedUserId + row.preferredName}
                    className="border-t border-border/60"
                  >
                    <td className="px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                      {row.maskedUserId}
                    </td>
                    <td className="px-2.5 py-2 font-medium text-foreground">{row.preferredName}</td>
                    <td className="px-2.5 py-2 uppercase text-muted-foreground">
                      {row.platform} · {row.country}
                    </td>
                    <td className="px-2.5 py-2">
                      {row.onboardingStatus === "completed"
                        ? "Completed"
                        : `${row.onboardingStatus} (p.${row.currentPage ?? 1})`}
                    </td>
                    <td className="px-2.5 py-2 text-muted-foreground">{row.primaryGoal ?? "—"}</td>
                    <td className="px-2.5 py-2 text-muted-foreground">
                      {row.budgetRangeZar ?? "—"}
                    </td>
                    <td className="px-2.5 py-2 text-muted-foreground">{row.acquisitionChannel}</td>
                    <td className="px-2.5 py-2 capitalize text-foreground">
                      {row.subscriptionStatus}
                    </td>
                  </tr>
                ))}
                {(inspectionQuery.data?.rows ?? []).length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-2.5 py-8 text-center text-muted-foreground">
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
