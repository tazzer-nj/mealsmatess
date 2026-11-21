export const FEEDBACK_CATEGORIES = [
  "Bug",
  "Feature suggestion",
  "Incorrect recipe info",
  "AI response issue",
  "Shopping-list classification issue",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = ["received", "in_review", "resolved"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type FeedbackReport = {
  id: string;
  reference_id: string;
  user_id: string;
  user_email?: string | null;
  category: FeedbackCategory;
  title: string;
  description: string;
  route_context?: string | null;
  status: FeedbackStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
};

export function formatFeedbackReference(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = clean.slice(0, 6).padEnd(6, "0");
  return `MM-${suffix}`;
}

export function feedbackStatusLabel(status: string): string {
  switch (status) {
    case "resolved":
      return "Resolved";
    case "in_review":
      return "In review";
    default:
      return "Received";
  }
}
