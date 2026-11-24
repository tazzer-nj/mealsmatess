import { createFileRoute } from "@tanstack/react-router";
import { getFirebaseClientConfigStatus } from "@/lib/firebase";
import { getFirebaseAdminConfigStatus } from "@/server/firebase-admin";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const client = getFirebaseClientConfigStatus();
        const admin = getFirebaseAdminConfigStatus();
        const isVercelProd = process.env["VERCEL_ENV"] === "production";
        const healthy =
          client.configured &&
          (!isVercelProd ||
            (admin.configured &&
              !admin.usesPreviewDatabaseFallback &&
              !client.usingPreviewFallback));

        const payload = {
          ok: healthy,
          status: healthy ? "ok" : "misconfigured",
          environment:
            process.env["VERCEL_ENV"]?.trim() ||
            (process.env["VERCEL"] === "1" ? "vercel" : "local"),
          commitSha: process.env["VERCEL_GIT_COMMIT_SHA"]?.trim() || null,
          firebase: {
            clientConfigured: client.configured,
            adminConfigured: admin.configured,
            databaseIdConfigured: admin.databaseIdConfigured,
            databaseIdSource: admin.databaseIdSource,
            usesPreviewDatabaseFallback:
              client.usingPreviewFallback || admin.usesPreviewDatabaseFallback,
            error: client.error || admin.error || null,
          },
        };

        return new Response(JSON.stringify(payload), {
          status: healthy ? 200 : 503,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
