import { createFileRoute } from "@tanstack/react-router";
import { sendTransactionalEmail } from "@/lib/email.server";

export const Route = createFileRoute("/api/email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            to?: string;
            subject?: string;
            html?: string;
            text?: string;
          };
          if (!body.to || !body.subject) {
            return new Response(JSON.stringify({ error: "Missing 'to' or 'subject' field" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          const result = await sendTransactionalEmail({
            to: body.to,
            subject: body.subject,
            html: body.html,
            text: body.text,
          });
          if (!result.ok) {
            return new Response(JSON.stringify({ error: result.error }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ success: true, id: result.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Bad request" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
