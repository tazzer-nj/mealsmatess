export const ADMIN_EMAILS = ["tatendamkhwanazi6@gmail.com", "ttmine60@gmail.com"] as const;

export function isHardcodedAdminEmail(emailOrId?: string | null): boolean {
  if (!emailOrId) return false;
  const normalized = emailOrId.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}
