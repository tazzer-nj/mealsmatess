import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";
import { enforceRateLimit, auditLog, trackEvent } from "@/lib/security.server";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  formatFeedbackReference,
  type FeedbackReport,
} from "@/lib/feedback";

async function assertAdmin(userId: string, claims?: Record<string, unknown>) {
  const { isAdminAccount } = await loadFirebaseAdmin();
  if (!(await isAdminAccount(userId, claims))) {
    throw new Error("Forbidden");
  }
}

const SubmitFeedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES).default("Bug"),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(2000),
  routeContext: z.string().trim().max(160).optional(),
});

export const submitFeedbackReport = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => SubmitFeedbackSchema.parse(v))
  .handler(async ({ data, context }): Promise<FeedbackReport> => {
    await enforceRateLimit("feedback_submit", context.userId, 10);
    const { firebaseAdmin } = await loadFirebaseAdmin();
    const now = new Date().toISOString();
    const id = crypto.randomUUID().replace(/-/g, "");
    const reference_id = formatFeedbackReference(id);
    const record: FeedbackReport = {
      id,
      reference_id,
      user_id: context.userId,
      user_email: context.email ?? null,
      category: data.category,
      title: data.title,
      description: data.description,
      route_context: data.routeContext ?? null,
      status: "received",
      admin_note: null,
      created_at: now,
      updated_at: now,
    };

    const { error } = await firebaseAdmin.from("feedback_reports").insert(record);
    if (error) throw new Error(error.message);

    void trackEvent({
      user_id: context.userId,
      kind: "support",
      name: "feedback.submitted",
      success: true,
      metadata: { category: data.category, reference_id },
    });

    return record;
  });

export const listMyFeedbackReports = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<FeedbackReport[]> => {
    const { data, error } = await context.firebase
      .from("feedback_reports")
      .select("*")
      .eq("user_id", context.userId)
      .limit(50);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as FeedbackReport[];
    return rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  });

export const adminListFeedbackReports = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<FeedbackReport[]> => {
    await assertAdmin(context.userId, context.claims);
    const { firebaseAdmin } = await loadFirebaseAdmin();
    const { data, error } = await firebaseAdmin.from("feedback_reports").select("*").limit(100);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as FeedbackReport[];
    return rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  });

export const adminUpdateFeedbackStatus = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        reportId: z.string().min(1).max(120),
        status: z.enum(FEEDBACK_STATUSES),
        adminNote: z.string().trim().max(500).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId, context.claims);
    const { firebaseAdmin } = await loadFirebaseAdmin();
    const patch = {
      status: data.status,
      ...(data.adminNote !== undefined ? { admin_note: data.adminNote || null } : {}),
      updated_at: new Date().toISOString(),
    };
    const { error } = await firebaseAdmin
      .from("feedback_reports")
      .update(patch)
      .eq("id", data.reportId);
    if (error) throw new Error(error.message);

    await auditLog({
      actor_id: context.userId,
      action: "feedback.status_updated",
      target_table: "feedback_reports",
      target_id: data.reportId,
      metadata: { status: data.status },
    });
    return { ok: true };
  });
