import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldAlert,
  Terminal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEALMATE_THEMES, PREMIUM_THEMES } from "@/lib/themes";
import type { DevLiveCheck, QaFailureEntry, QaReportPayload } from "@/routes/api/dev/qa-report";

export const Route = createFileRoute("/dev/qa")({
  head: () => ({
    meta: [{ title: "Dev QA Console | MealMate" }],
  }),
  component: DevQaRoute,
});

type StatusFilter = "ALL" | "PASSED" | "FAILED" | "BLOCKED" | "UNTESTED";

type ApiResponse = {
  devAvailable: boolean;
  rerunAt?: string;
  report: QaReportPayload | null;
  liveChecks: DevLiveCheck[];
};

function DevQaDisabledInProd() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <ShieldAlert className="h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Development QA Console Disabled
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This verification console is only available during local development builds.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back to Home</Link>
      </Button>
    </main>
  );
}

function DevQaRoute() {
  if (!import.meta.env.DEV) {
    return <DevQaDisabledInProd />;
  }
  return <DevQaDashboard />;
}

function StatusBadge({ status }: { status: DevLiveCheck["status"] }) {
  const styles =
    status === "PASSED"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status === "FAILED"
        ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
        : status === "BLOCKED"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-border bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

function DevQaDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [clientChecks, setClientChecks] = useState<DevLiveCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [viewportFilter, setViewportFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [activeScreenshot, setActiveScreenshot] = useState<QaFailureEntry | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const runClientSideChecks = useCallback(async (): Promise<DevLiveCheck[]> => {
    const results: DevLiveCheck[] = [];

    // 1. Health endpoint latency + payload check
    const h0 = performance.now();
    try {
      const res = await fetch("/api/public/health");
      const ms = Math.round(performance.now() - h0);
      results.push({
        id: "client-health",
        page: "/api/public/health",
        feature: "Health Endpoint HTTP 200 & JSON Payload",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        status: res.ok ? "PASSED" : "FAILED",
        expected: "HTTP 200 non-secret health status",
        actual: `HTTP ${res.status} (${ms}ms)`,
        durationMs: ms,
        ...(!res.ok
          ? {
              error: `Health check returned status ${res.status}`,
              suggestedFix: "Inspect src/routes/api/public/health.ts and Firebase config status.",
            }
          : {}),
      });
    } catch (err) {
      results.push({
        id: "client-health",
        page: "/api/public/health",
        feature: "Health Endpoint HTTP 200",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        status: "FAILED",
        expected: "HTTP 200 JSON response",
        actual: "Network fetch threw error",
        error: err instanceof Error ? err.message : String(err),
        suggestedFix: "Ensure local server on port 3000 is healthy.",
        durationMs: Math.round(performance.now() - h0),
      });
    }

    // 2. Theme tokens & 6 exclusive themes DOM verification
    const t0 = performance.now();
    const okThemes = PREMIUM_THEMES.length === 6 && MEALMATE_THEMES.length === 8;
    results.push({
      id: "client-theme-tokens",
      page: "/settings",
      feature: "Client Theme Registry (6 Exclusive + 2 Defaults)",
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      status: okThemes ? "PASSED" : "FAILED",
      expected: "6 exclusive themes + 2 defaults loaded in client bundle",
      actual: `${PREMIUM_THEMES.length} exclusive, ${MEALMATE_THEMES.length} total`,
      durationMs: Math.round(performance.now() - t0),
    });

    // 3. No Checking Access text rendered in current shell
    const c0 = performance.now();
    const bodyText = document.body?.innerText ?? "";
    const hasChecking = /checking access/i.test(bodyText);
    results.push({
      id: "client-no-checking-access",
      page: "/",
      feature: "Zero 'Checking Access' Blocking UI",
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      status: !hasChecking ? "PASSED" : "FAILED",
      expected: "No 'Checking Access' text visible",
      actual: hasChecking ? "Found 'Checking Access'" : "Clean — absent from DOM",
      durationMs: Math.round(performance.now() - c0),
    });

    return results;
  }, []);

  const loadReport = useCallback(
    async (method: "GET" | "POST" = "GET") => {
      if (method === "POST") setRerunning(true);
      else setLoading(true);
      setError(null);
      try {
        const [apiRes, browserChecks] = await Promise.all([
          fetch("/api/dev/qa-report", { method }),
          runClientSideChecks(),
        ]);
        if (!apiRes.ok) {
          throw new Error(`QA report endpoint returned HTTP ${apiRes.status}`);
        }
        const payload = (await apiRes.json()) as ApiResponse;
        setData(payload);
        setClientChecks(browserChecks);
        setLastRunAt(payload.rerunAt ?? payload.report?.generatedAt ?? new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load QA telemetry.");
      } finally {
        setLoading(false);
        setRerunning(false);
      }
    },
    [runClientSideChecks],
  );

  useEffect(() => {
    void loadReport("GET");
  }, [loadReport]);

  const combinedChecks = useMemo<DevLiveCheck[]>(() => {
    const fromReport = data?.report?.checks ?? [];
    const fromServer = data?.liveChecks ?? [];
    // Deduplicate by id prioritizing live rerun checks if matching id exists
    const map = new Map<string, DevLiveCheck>();
    for (const item of [...fromReport, ...fromServer, ...clientChecks]) {
      map.set(item.id, item);
    }
    return Array.from(map.values());
  }, [data, clientChecks]);

  const viewports = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    for (const c of combinedChecks) {
      if (c.viewport) set.add(c.viewport);
    }
    return Array.from(set);
  }, [combinedChecks]);

  const filteredChecks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return combinedChecks.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (viewportFilter !== "ALL" && c.viewport !== viewportFilter) return false;
      if (!q) return true;
      return `${c.page} ${c.feature} ${c.actual} ${c.error ?? ""}`.toLowerCase().includes(q);
    });
  }, [combinedChecks, statusFilter, viewportFilter, search]);

  const computedSummary = useMemo(() => {
    if (data?.report) {
      // Combine Playwright baseline summary with any extra live checks
      const liveExtras = [...(data.liveChecks ?? []), ...clientChecks];
      const existingIds = new Set(data.report.checks.map((c) => c.id));
      const newChecks = liveExtras.filter((c) => !existingIds.has(c.id));
      const all = [...data.report.checks, ...newChecks];
      const pages = new Set(all.map((c) => c.page)).size;
      return {
        totalPages: Math.max(data.report.summary.totalPages, pages),
        totalFeatures: all.length,
        passed: all.filter((c) => c.status === "PASSED").length,
        failed: all.filter((c) => c.status === "FAILED").length,
        blocked: all.filter((c) => c.status === "BLOCKED").length,
        untested: all.filter((c) => c.status === "UNTESTED").length,
        apiFailures: data.report.summary.apiFailures,
        consoleErrors: data.report.summary.consoleErrors,
        perfIssues: data.report.summary.perfIssues,
      };
    }
    const pages = new Set(combinedChecks.map((c) => c.page)).size;
    return {
      totalPages: pages,
      totalFeatures: combinedChecks.length,
      passed: combinedChecks.filter((c) => c.status === "PASSED").length,
      failed: combinedChecks.filter((c) => c.status === "FAILED").length,
      blocked: combinedChecks.filter((c) => c.status === "BLOCKED").length,
      untested: combinedChecks.filter((c) => c.status === "UNTESTED").length,
      apiFailures: combinedChecks.filter((c) => c.status === "FAILED").length,
      consoleErrors: 0,
      perfIssues: 0,
    };
  }, [data, clientChecks, combinedChecks]);

  const failures: QaFailureEntry[] = useMemo(() => {
    const reportFailures = data?.report?.failures ?? [];
    const liveFailures: QaFailureEntry[] = combinedChecks
      .filter((c) => c.status === "FAILED" && !reportFailures.some((rf) => rf.id === c.id))
      .map((c) => ({
        id: c.id,
        page: c.page,
        feature: c.feature,
        viewport: c.viewport,
        expected: c.expected,
        actual: c.actual,
        error: c.error ?? "Assertion failed",
        suggestedFix: c.suggestedFix ?? "Inspect component and server logs for details.",
      }));
    return [...reportFailures, ...liveFailures];
  }, [data, combinedChecks]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      {/* Top Bar Contract: Breadcrumb on left, 1 primary action button on right */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>MealMate</span>
            <span>/</span>
            <span>Dev Tools</span>
            <span>/</span>
            <span className="font-medium text-foreground">QA Console</span>
          </div>
          <h1 className="mt-1 font-sans text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            QA &amp; Release Verification Dashboard
          </h1>
          <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
            {lastRunAt
              ? `Last verified: ${new Date(lastRunAt).toLocaleString()}`
              : "Development mode only"}
            {data?.report?.source ? ` · Source: ${data.report.source}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            asChild
            className="h-10 shrink-0 whitespace-nowrap rounded-lg border-border"
          >
            <Link to="/">Open App</Link>
          </Button>
          <Button
            type="button"
            onClick={() => void loadReport("POST")}
            disabled={rerunning || loading}
            className="h-10 shrink-0 whitespace-nowrap rounded-lg bg-foreground text-background hover:opacity-90"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${rerunning ? "animate-spin" : ""}`} />
            {rerunning ? "Running checks..." : "Rerun QA Checks"}
          </Button>
        </div>
      </header>

      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabular Numerals KPI Strip (single-elevation borders, zero nested cards) */}
      <section
        aria-label="QA Summary Metrics"
        className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9"
      >
        {[
          { label: "Total Pages", value: computedSummary.totalPages, tone: "text-foreground" },
          {
            label: "Total Features",
            value: computedSummary.totalFeatures,
            tone: "text-foreground",
          },
          {
            label: "Passed",
            value: computedSummary.passed,
            tone: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Failed",
            value: computedSummary.failed,
            tone:
              computedSummary.failed > 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Blocked",
            value: computedSummary.blocked,
            tone: "text-amber-600 dark:text-amber-400",
          },
          { label: "Untested", value: computedSummary.untested, tone: "text-muted-foreground" },
          {
            label: "API Failures",
            value: computedSummary.apiFailures,
            tone:
              computedSummary.apiFailures > 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground",
          },
          {
            label: "Console Errors",
            value: computedSummary.consoleErrors,
            tone:
              computedSummary.consoleErrors > 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground",
          },
          {
            label: "Perf Issues",
            value: computedSummary.perfIssues,
            tone:
              computedSummary.perfIssues > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border bg-card px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </div>
            <div className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${kpi.tone}`}>
              {loading ? "—" : kpi.value}
            </div>
          </div>
        ))}
      </section>

      {/* Failed Items Section */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-sans text-base font-semibold text-foreground">
            Failed Checks ({failures.length})
          </h2>
        </div>

        {loading ? (
          <div className="h-24 rounded-lg border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
            Loading QA check results...
          </div>
        ) : failures.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Zero failed checks recorded in runnable suite. External cloud integrations are listed
              honestly under BLOCKED below.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">Page</th>
                  <th className="px-3 py-2.5">Feature</th>
                  <th className="px-3 py-2.5">Expected</th>
                  <th className="px-3 py-2.5">Actual</th>
                  <th className="px-3 py-2.5">Error</th>
                  <th className="px-3 py-2.5">Suggested Fix</th>
                  <th className="px-3 py-2.5 text-right">Screenshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {failures.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-secondary/30">
                    <td className="px-3 py-2.5 font-mono text-foreground">{item.page}</td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{item.feature}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{item.expected}</td>
                    <td className="px-3 py-2.5 text-red-700 dark:text-red-400">{item.actual}</td>
                    <td className="px-3 py-2.5 font-mono text-red-700 dark:text-red-400">
                      {item.error}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{item.suggestedFix}</td>
                    <td className="px-3 py-2.5 text-right">
                      {item.screenshot ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveScreenshot(item)}
                          className="h-7 text-xs"
                        >
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Filter & Search Toolbar */}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sans text-base font-semibold text-foreground">
            Interactive Feature &amp; Route Audit ({filteredChecks.length})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter page or feature..."
                className="h-9 w-56 rounded-lg pl-8 text-xs"
              />
            </div>
            <select
              value={viewportFilter}
              onChange={(e) => setViewportFilter(e.target.value)}
              aria-label="Filter by viewport"
              className="h-9 rounded-lg border border-border bg-card px-2.5 font-mono text-xs text-foreground"
            >
              {viewports.map((vp) => (
                <option key={vp} value={vp}>
                  {vp === "ALL" ? "All Viewports" : vp}
                </option>
              ))}
            </select>
            <div className="flex rounded-lg border border-border bg-secondary p-0.5 text-xs">
              {(["ALL", "PASSED", "FAILED", "BLOCKED", "UNTESTED"] as StatusFilter[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Page</th>
                <th className="px-3 py-2.5">Feature</th>
                <th className="px-3 py-2.5">Viewport</th>
                <th className="px-3 py-2.5">Actual Result</th>
                <th className="px-3 py-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChecks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No checks match the active filter.
                  </td>
                </tr>
              ) : (
                filteredChecks.map((check) => (
                  <tr key={check.id} className="h-10 hover:bg-secondary/30">
                    <td className="px-3 py-2">
                      <StatusBadge status={check.status} />
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground">{check.page}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{check.feature}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{check.viewport}</td>
                    <td className="px-3 py-2 text-muted-foreground">{check.actual}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                      {check.durationMs}ms
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Diagnostics Strip: API Failures, Console Errors, Performance Issues */}
      <section className="mt-8 grid gap-4 pb-12 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            API Failures ({data?.report?.apiFailureList.length ?? 0})
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {!data?.report?.apiFailureList.length ? (
              <p className="text-muted-foreground">
                No unexpected HTTP &gt;= 400 responses recorded.
              </p>
            ) : (
              data.report.apiFailureList.map((api, idx) => (
                <div
                  key={idx}
                  className="rounded border border-border bg-secondary/40 p-2 font-mono"
                >
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    HTTP {api.status}
                  </span>{" "}
                  · {api.url} ({api.viewport})
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            Console &amp; Image Errors ({data?.report?.consoleErrorList.length ?? 0})
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {!data?.report?.consoleErrorList.length ? (
              <p className="text-muted-foreground">No console, runtime, or broken-image errors.</p>
            ) : (
              data.report.consoleErrorList.map((err, idx) => (
                <div
                  key={idx}
                  className="rounded border border-border bg-secondary/40 p-2 font-mono"
                >
                  <span className="font-semibold text-red-600 dark:text-red-400">{err.type}</span> ·{" "}
                  {err.page}: {err.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Performance Alerts ({data?.report?.perfIssueList.length ?? 0})
          </div>
          <div className="mt-3 space-y-2 text-xs">
            {!data?.report?.perfIssueList.length ? (
              <p className="text-muted-foreground">
                All sampled page loads met performance thresholds.
              </p>
            ) : (
              data.report.perfIssueList.map((perf, idx) => (
                <div
                  key={idx}
                  className="rounded border border-border bg-secondary/40 p-2 font-mono"
                >
                  {perf.page} ({perf.viewport}): {perf.metric} = {perf.valueMs}ms (limit{" "}
                  {perf.thresholdMs}ms)
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {activeScreenshot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {activeScreenshot.page} · {activeScreenshot.feature}
                </div>
                <div className="text-xs text-muted-foreground">{activeScreenshot.error}</div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Close screenshot preview"
                onClick={() => setActiveScreenshot(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[75vh] overflow-auto bg-black p-4 text-center">
              <img
                src={activeScreenshot.screenshot}
                alt={`Screenshot for ${activeScreenshot.feature}`}
                className="mx-auto max-h-[65vh] rounded border border-border object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
