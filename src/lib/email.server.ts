export type EmailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

export async function sendTransactionalEmail(
  options: EmailOptions,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env["RESEND_API_KEY"] || process.env["EMAIL_API_KEY"] || "";
  const from = options.from || process.env["EMAIL_FROM"] || "MealMate <noreply@mealsmates.site>";

  if (!apiKey) {
    console.log("[Email] Simulation (no RESEND_API_KEY configured):", {
      to: options.to,
      subject: options.subject,
      from,
    });
    return { ok: true, id: `sim_${Math.random().toString(36).slice(2, 9)}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html || options.text,
        text: options.text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Email service error: ${res.status} ${errText}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Email dispatch failed" };
  }
}
